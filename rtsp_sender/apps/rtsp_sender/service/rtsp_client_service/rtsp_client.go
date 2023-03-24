package rtsp_client_service

import (
	"fmt"
	"io"
	"strings"
	"sync"
	"sync/atomic"
	"time"

	"github.com/datht6vng/hcmut-thexis/rtsp-sender/pkg/logger"
	gst "github.com/datht6vng/hcmut-thexis/rtsp-sender/pkg/rtsp_to_webrtc"
	"github.com/datht6vng/hcmut-thexis/rtsp-sender/pkg/sdk"
	"github.com/deepch/vdk/av"
	"github.com/deepch/vdk/format/rtspv2"
	"github.com/pion/webrtc/v3"
)

type Client struct {
	mu               sync.RWMutex
	clientAddress    string
	rtspRelayAddress string
	username         string
	password         string
	sfuAddress       string
	sessionName      string

	enableAudio     bool
	enableRTSPRelay bool

	connector *sdk.Connector

	audioTrack, videoTrack *webrtc.TrackLocalStaticSample
	codecs                 []av.CodecData
	pipeline               gst.Pipeline
	closed                 chan bool
	onCloseHandler         atomic.Value
}

func NewClient(clientAddress, rtspRelayAddress, username, password, sfuAddress, sessionName string, enableAudio bool, enableRTSPRelay bool) *Client {
	return &Client{
		clientAddress:    clientAddress,
		rtspRelayAddress: rtspRelayAddress,
		username:         username,
		password:         password,
		sfuAddress:       sfuAddress,
		sessionName:      sessionName,
		enableAudio:      enableAudio,
		enableRTSPRelay:  enableRTSPRelay,
	}
}

func formatRTSPURL(url, username, password string) string {
	if username == "" && password == "" {
		return url
	}
	parts := strings.Split(url, "://")
	return parts[0] + "://" + username + ":" + password + "@" + parts[len(parts)-1]
}

func (c *Client) Connect() error {
	c.mu.Lock()
	defer c.mu.Unlock()

	var err error
	fmt.Println(formatRTSPURL(c.clientAddress, c.username, c.password))
	rtspClient, err := rtspv2.Dial(rtspv2.RTSPClientOptions{URL: formatRTSPURL(c.clientAddress, c.username, c.password), DisableAudio: !c.enableAudio, DialTimeout: 10 * time.Second, ReadWriteTimeout: 3 * time.Second, Debug: false})
	if err != nil {
		return err
	}

	c.codecs = rtspClient.CodecData
	go rtspClient.Close()

	audioOnly := true

	var videoCodec, audioCodec string
	var videoDepay, audioDepay string
	var videoDecoder, audioDecoder string

	for _, codec := range c.codecs {
		if codec.Type().IsAudio() {
			audioOnly = false
		}
		switch codec.Type() {
		case av.H264:
			videoCodec = webrtc.MimeTypeH264
			videoDepay = "rtph264depay"
			videoDecoder = "avdec_h264"
		case av.VP8:
			videoCodec = webrtc.MimeTypeVP8
			videoDepay = "rtpvp8depay"
			videoDecoder = "avdec_vp8"
		case av.OPUS:
			audioCodec = webrtc.MimeTypeOpus
			audioDepay = "rtpopusdepay"
			audioDecoder = "avdec_opus"
		}
	}

	logger.Infof("[%v] Audio Only: %v, Video Codec: %v, Audio Codec: %v", c.clientAddress, audioOnly, videoCodec, audioCodec)

	rtspSrc := fmt.Sprintf("rtspsrc location=\"%v\" user-id=\"%v\" user-pw=\"%v\" name=%v", c.clientAddress, c.username, c.password, gst.SrcName)

	videoSrc := fmt.Sprintf(" %v. ! queue ! application/x-rtp ! %v ! %v ! videoconvert ! videoscale ", gst.SrcName, videoDepay, videoDecoder)
	audioSrc := fmt.Sprintf(" %v. ! queue ! application/x-rtp ! %v ! %v ! audioconvert ! audioresample ", gst.SrcName, audioDepay, audioDecoder)

	config := sdk.RTCConfig{
		WebRTC: sdk.WebRTCTransportConfig{
			Configuration: webrtc.Configuration{
				ICEServers: []webrtc.ICEServer{
					{
						URLs: []string{
							"stun:stun.l.google.com:19302",
							"stun:stun.stunprotocol.org:3478",
						},
					},
				},
			},
		},
	}

	connector, err := sdk.NewConnector(c.sfuAddress)
	if err != nil {
		return err
	}

	rtc, err := sdk.NewRTC(connector, config)
	if err != nil {
		return err
	}

	if err := rtc.Join(c.sessionName, fmt.Sprintf("camera:%v", c.sessionName), sdk.NewJoinConfig().SetNoSubscribe().SetNoAutoSubscribe()); err != nil {
		return err
	}

	rtc.GetPubTransport().GetPeerConnection().OnICEConnectionStateChange(func(state webrtc.ICEConnectionState) {
		logger.Infof("ICE connection state changed: %v", state)
	})
	rtc.GetPubTransport().GetPeerConnection().OnConnectionStateChange(func(state webrtc.PeerConnectionState) {
		logger.Infof("Peer connection state changed: %v", state)
	})

	publishTrack := []webrtc.TrackLocal{}

	// Choose track codec here
	videoTrack, err := webrtc.NewTrackLocalStaticSample(webrtc.RTPCodecCapability{MimeType: videoCodec}, "video", c.clientAddress)
	if err != nil {
		return err
	}
	c.videoTrack = videoTrack
	publishTrack = append(publishTrack, c.videoTrack)

	if !audioOnly {
		audioTrack, err := webrtc.NewTrackLocalStaticSample(webrtc.RTPCodecCapability{MimeType: audioCodec}, "audio", c.clientAddress)
		if err != nil {
			return err
		}
		c.audioTrack = audioTrack
		publishTrack = append(publishTrack, c.audioTrack)
	}
	var wg sync.WaitGroup

	var pipelineErr error
	wg.Add(1)
	go func() {
		defer wg.Done()
		pipeline, err := gst.CreatePipeline(
			rtspSrc,
			audioSrc, videoSrc,
			audioCodec, videoCodec,
			c.audioTrack, c.videoTrack,
			c.enableRTSPRelay,
			c.rtspRelayAddress,
		)
		if err != nil {
			pipelineErr = err
			return
		}

		if audioCodec != "" {
			pipeline.OnAudioSample(c.audioTrack.WriteSample)
			if err := pipeline.EmitAudioSample(); err != nil {
				pipelineErr = err
				return
			}
		}

		if videoCodec != "" {
			pipeline.OnVideoSample(c.videoTrack.WriteSample)
			if err := pipeline.EmitVideoSample(); err != nil {
				pipelineErr = err
				return
			}
		}
		pipeline.Start()
		c.pipeline = pipeline
	}()

	wg.Add(1)
	go func() {
		defer wg.Done()
		if len(publishTrack) > 0 {
			// Read RTCP from each track to make sure the interceptors work
			rtcpReaderList, _ := rtc.Publish(publishTrack...)
			for _, rtcpReader := range rtcpReaderList {
				c.startRTCPHandler(rtcpReader)
			}
		}
	}()
	wg.Wait()
	if pipelineErr != nil {
		return pipelineErr
	}
	c.connector = connector
	return nil
}

func (c *Client) startRTCPHandler(rtcpReader *webrtc.RTPSender) {
	go func(rtcpReader *webrtc.RTPSender) {
		for {
			rtcpReader.SetReadDeadline(time.Now().Add(5 * time.Second))
			if _, _, err := rtcpReader.ReadRTCP(); err != nil {
				if err == io.EOF {
					return
				}
				if c.IsClosed() {
					return
				}
			}
		}
	}(rtcpReader)
}

func (c *Client) IsClosed() bool {
	c.mu.RLock()
	defer c.mu.RUnlock()

	select {
	case <-c.closed:
		return true
	default:
		return false
	}
}

func (c *Client) Close() {
	c.mu.Lock()
	defer c.mu.Unlock()

	if c.closed != nil {
		select {
		case <-c.closed:
			return
		default:
			close(c.closed)
		}
	}

	c.connector.Close()
	c.pipeline.Stop()
	c.onClose()
}

func (c *Client) onClose() {
	if handler, ok := c.onCloseHandler.Load().(func()); ok {
		handler()
	}
}

func (c *Client) OnClose(f func()) {
	c.onCloseHandler.Store(f)
}
