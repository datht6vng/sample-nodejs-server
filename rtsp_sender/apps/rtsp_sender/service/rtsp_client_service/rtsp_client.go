package rtsp_client_service

import (
	"fmt"
	"io"
	"strings"
	"sync"
	"time"

	"github.com/aler9/gortsplib/v2/pkg/url"

	"github.com/aler9/gortsplib/v2"
	"github.com/aler9/gortsplib/v2/pkg/format"
	"github.com/aler9/gortsplib/v2/pkg/media"
	"github.com/datht6vng/hcmut-thexis/rtsp-sender/pkg/logger"
	"github.com/datht6vng/hcmut-thexis/rtsp-sender/pkg/sdk"
	gst "github.com/datht6vng/hcmut-thexis/rtsp-sender/pkg/sdk/rtsp_to_webrtc"
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
	rtc       *sdk.RTC

	// audioTrack, videoTrack map[string]*webrtc.TrackLocalStaticSample
	codecs   []format.Format
	pipeline *gst.Pipeline
	closed   chan bool
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
	parts := strings.Split(url, "://")
	return parts[0] + "://" + username + ":" + password + "@" + parts[len(parts)-1]
}

func (c *Client) Connect() error {
	c.mu.Lock()
	defer c.mu.Unlock()

	var err error
	fmt.Println(formatRTSPURL(c.clientAddress, c.username, c.password))

	u, err := url.Parse(formatRTSPURL(c.clientAddress, c.username, c.password))
	if err != nil {
		panic(err)
	}

	rtspClient := &gortsplib.Client{
		// the stream transport (UDP, Multicast or TCP). If nil, it is chosen automatically
		Transport: nil,
		// timeout of read operations
		ReadTimeout: 10 * time.Second,
		// timeout of write operations
		WriteTimeout: 10 * time.Second,
	}
	// connect to the server
	err = rtspClient.Start(u.Scheme, u.Host)
	if err != nil {
		return err
	}

	audioOnly := true
	// setup all medias
	medias, _, _, err := rtspClient.Describe(u)
	if err != nil {
		return err
	}
	for _, m := range medias {
		if m.Type == media.TypeAudio {
			audioOnly = false
		}
		c.codecs = append(c.codecs, m.Formats...)
	}

	rtspClient.Close()

	var videoCodec, audioCodec string
	var videoDepay, audioDepay string
	var videoDecoder, audioDecoder string

	for _, codec := range c.codecs {
		switch codec.(type) {
		case *format.H264:
			videoCodec = webrtc.MimeTypeH264
			videoDepay = "rtph264depay"
			videoDecoder = "avdec_h264"
		case *format.VP8:
			videoCodec = webrtc.MimeTypeVP8
			videoDepay = "rtpvp8depay"
			videoDecoder = "avdec_vp8"
		case *format.Opus:
			audioCodec = webrtc.MimeTypeOpus
			audioDepay = "rtpopusdepay"
			audioDecoder = "avdec_opus"
		}
	}

	logger.Infof("[%v] Audio Only: %v, Video Codec: %v, Audio Codec: %v", c.clientAddress, audioOnly, videoCodec, audioCodec)

	rtspSrc := fmt.Sprintf("rtspsrc location=\"%v\" user-id=\"%v\" user-pw=\"%v\" name=demux", c.clientAddress, c.username, c.password)

	videoSrc := fmt.Sprintf(" demux. ! queue ! application/x-rtp ! %v ! %v ! videoconvert ", videoDepay, videoDecoder)
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

	if c.connector, err = sdk.NewConnector(c.sfuAddress); err != nil {
		return err
	}

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
	videoTracks := map[string]*webrtc.TrackLocalStaticSample{}
	// Choose track codec here
	// Publish 3 track to SFU
	/*
	* Q: Quarter resolution
	* H: Half resolution
	* F: Full resolution
	 */
	videoTrackQ, err := webrtc.NewTrackLocalStaticSample(webrtc.RTPCodecCapability{MimeType: videoCodec}, "video", c.clientAddress, webrtc.WithRTPStreamID("q"))
	if err != nil {
		return err
	}

	publishTrack = append(publishTrack, videoTrackQ)
	videoTracks["q"] = videoTrackQ

	videoTrackH, err := webrtc.NewTrackLocalStaticSample(webrtc.RTPCodecCapability{MimeType: videoCodec}, "video", c.clientAddress, webrtc.WithRTPStreamID("h"))
	if err != nil {
		return err
	}
	publishTrack = append(publishTrack, videoTrackH)
	videoTracks["h"] = videoTrackH

	videoTrackF, err := webrtc.NewTrackLocalStaticSample(webrtc.RTPCodecCapability{MimeType: videoCodec}, "video", c.clientAddress, webrtc.WithRTPStreamID("f"))
	if err != nil {
		return err
	}
	publishTrack = append(publishTrack, videoTrackF)
	videoTracks["f"] = videoTrackF

	var audioTrack *webrtc.TrackLocalStaticSample
	if !audioOnly {
		audioTrack, err := webrtc.NewTrackLocalStaticSample(webrtc.RTPCodecCapability{MimeType: audioCodec}, "audio", c.clientAddress)
		if err != nil {
			return err
		}
		publishTrack = append(publishTrack, audioTrack)
	}

	c.pipeline = gst.CreatePipeline(
		rtspSrc,
		audioSrc, videoSrc,
		audioCodec, videoCodec,
		audioTrack, videoTracks,
		c.enableRTSPRelay,
		c.rtspRelayAddress,
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
			return
		default:
			close(c.closed)
		}
	}

	c.rtc.Close()
	c.connector.Close()
	c.pipeline.Stop()
}
