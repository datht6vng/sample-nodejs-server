package rtsp_client_service

import (
	"fmt"
	"io"
	"sync"
	"time"

	"github.com/datht6vng/hcmut-thexis/rtsp-sender/pkg/logger"
	"github.com/datht6vng/hcmut-thexis/rtsp-sender/pkg/sdk"
	gst "github.com/datht6vng/hcmut-thexis/rtsp-sender/pkg/sdk/rtsp_to_webrtc"
	"github.com/deepch/vdk/av"
	"github.com/deepch/vdk/format/rtspv2"
	"github.com/pion/webrtc/v3"
)

type Client struct {
	mu            sync.RWMutex
	clientAddress string
	sfuAddress    string
	sessionName   string
	enableAudio   bool
	connector     *sdk.Connector
	rtc           *sdk.RTC

	audioTrack, videoTrack *webrtc.TrackLocalStaticSample
	codecs                 []av.CodecData
	pipeline               *gst.Pipeline
	closed                 chan bool
}

func NewClient(clientAddress, sfuAddress, sessionName string, enableAudio bool) *Client {
	return &Client{
		clientAddress: clientAddress,
		sfuAddress:    sfuAddress,
		sessionName:   sessionName,
		enableAudio:   enableAudio,
	}
}
func (c *Client) Connect() error {
	c.mu.Lock()
	defer c.mu.Unlock()

	var err error
	rtspClient, err := rtspv2.Dial(rtspv2.RTSPClientOptions{URL: c.clientAddress, DisableAudio: !c.enableAudio, DialTimeout: 10 * time.Second, ReadWriteTimeout: 3 * time.Second, Debug: false})
	if err != nil {
		return err
	}

	c.codecs = rtspClient.CodecData
	rtspClient.Close()

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

	logger.Infof("[%v] Audio Only: %v, Video Codec: %v, Audio Codec: %v", c.clientAddress, videoCodec, audioCodec)

	rtspSrc := fmt.Sprintf("rtspsrc location=%v name=demux", c.clientAddress)

	videoSrc := fmt.Sprintf(" demux. ! queue ! application/x-rtp ! %v ! %v ! videoconvert ! videoscale ", videoDepay, videoDecoder)
	audioSrc := fmt.Sprintf(" demux. ! queue ! application/x-rtp ! %v ! %v ! audioconvert ! audioresample ", audioDepay, audioDecoder)

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
	c.connector = sdk.NewConnector(c.sfuAddress)

	if c.rtc, err = sdk.NewRTC(c.connector, config); err != nil {
		return err
	}

	if err := c.rtc.Join(c.sessionName, sdk.RandomKey(4), sdk.NewJoinConfig().SetNoAutoSubscribe()); err != nil {
		return err
	}

	c.rtc.GetPubTransport().GetPeerConnection().OnICEConnectionStateChange(func(state webrtc.ICEConnectionState) {
		logger.Infof("ICE connection state changed: %v", state)
	})
	c.rtc.GetPubTransport().GetPeerConnection().OnConnectionStateChange(func(state webrtc.PeerConnectionState) {
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

	c.pipeline = gst.CreatePipeline(
		rtspSrc,
		audioSrc, videoSrc,
		audioCodec, videoCodec,
		c.audioTrack, c.videoTrack,
	)
	c.pipeline.Start()

	if len(publishTrack) > 0 {
		// Read RTCP from each track to make sure the interceptors work
		rtcpReaderList, _ := c.rtc.Publish(publishTrack...)
		for _, rtcpReader := range rtcpReaderList {
			c.startRTCPHandler(rtcpReader)
		}
	}
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
		default:
			close(c.closed)
		}
	}

	c.rtc.Close()
	c.connector.Close()
	c.pipeline.Stop()
}
