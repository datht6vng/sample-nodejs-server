package rtsp_client_service

import (
	"fmt"
	"io"
	"os"
	"path/filepath"
	"strings"
	"sync"
	"sync/atomic"
	"time"

	"github.com/aler9/gortsplib/v2"
	"github.com/aler9/gortsplib/v2/pkg/format"
	"github.com/aler9/gortsplib/v2/pkg/media"
	"github.com/aler9/gortsplib/v2/pkg/url"
	"github.com/dathuynh1108/hcmut-thexis/rtsp-sender/apps/rtsp_sender/entity"
	"github.com/dathuynh1108/hcmut-thexis/rtsp-sender/pkg/logger"
	gst "github.com/dathuynh1108/hcmut-thexis/rtsp-sender/pkg/rtsp_to_webrtc"
	"github.com/dathuynh1108/hcmut-thexis/rtsp-sender/pkg/sdk"
	jujuErr "github.com/juju/errors"
	"github.com/pion/interceptor/pkg/cc"
	"github.com/pion/webrtc/v3"
)

const maxRetry = 5

type Client struct {
	mu               sync.RWMutex
	clientID         string
	clientAddress    string
	rtspRelayAddress string
	username         string
	password         string
	sfuAddress       string
	sessionName      string

	enableAudio     bool
	enableRTSPRelay bool

	enableRecord bool

	connector *sdk.Connector

	codecs         []format.Format
	pipeline       atomic.Value
	closed         chan bool
	onCloseHandler atomic.Value

	retryCount atomic.Int32
	retryTimer *time.Timer
	metadata   *entity.Metadata
}

func NewClient(clientID, clientAddress, rtspRelayAddress, username, password, sfuAddress, sessionName string, enableAudio bool, enableRTSPRelay bool, enableRecord bool) *Client {
	return &Client{
		clientID:         clientID,
		clientAddress:    clientAddress,
		rtspRelayAddress: rtspRelayAddress,
		username:         username,
		password:         password,
		sfuAddress:       sfuAddress,
		sessionName:      sessionName,
		enableAudio:      enableAudio,
		enableRTSPRelay:  enableRTSPRelay,
		enableRecord:     enableRecord,
		closed:           make(chan bool),
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

	formatRTSPURL := formatRTSPURL(c.clientAddress, c.username, c.password)
	logger.Infof("[%v] RTSP URL: %s", c.clientAddress, formatRTSPURL)

	u, err := url.Parse(formatRTSPURL)
	if err != nil {
		return err
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

	go rtspClient.Close()

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

	publishTrack := []webrtc.TrackLocal{}

	// Choose track codec here
	videoTrack, err := webrtc.NewTrackLocalStaticSample(webrtc.RTPCodecCapability{MimeType: videoCodec}, "video", c.clientAddress)
	if err != nil {
		return err
	}
	publishTrack = append(publishTrack, videoTrack)

	var audioTrack *webrtc.TrackLocalStaticSample
	if !audioOnly {
		audioTrack, err := webrtc.NewTrackLocalStaticSample(webrtc.RTPCodecCapability{MimeType: audioCodec}, "audio", c.clientAddress)
		if err != nil {
			return err
		}
		publishTrack = append(publishTrack, audioTrack)
	}

	var wg sync.WaitGroup

	// Start pipeline and join SFU, run parallel

	var pipelineErr error
	wg.Add(1)
	go func() {
		defer wg.Done()

		rtspSrc := fmt.Sprintf("rtspsrc location=\"%v\" user-id=\"%v\" user-pw=\"%v\" name=%v is-live=true add-reference-timestamp-meta=true latency=10000 max-rtcp-rtp-time-diff=-1 ntp-sync=true onvif-mode=true", c.clientAddress, c.username, c.password, gst.SrcName)
		videoSrc := fmt.Sprintf(" %v. ! application/x-rtp ! %v ! %v ! videoconvert ! videoscale ! video/x-raw,is-live=true ", gst.SrcName, videoDepay, videoDecoder)
		audioSrc := fmt.Sprintf(" %v. ! application/x-rtp ! %v ! %v ! audioconvert ! audioresample ! audio/x-raw,is-live=true ", gst.SrcName, audioDepay, audioDecoder)

		clientDir := filepath.Join("/videos", c.clientID)
		sessionDir := filepath.Join(clientDir, fmt.Sprintf("%v", time.Now().UnixNano()))
		if c.enableRecord {
			os.Mkdir(clientDir, 0777)
			os.Mkdir(sessionDir, 0777)
		}
		pipeline, err := c.createPipelineWithRetry(
			rtspSrc,
			audioSrc, videoSrc,
			audioCodec, videoCodec,
			audioTrack, videoTrack,
			c.enableRTSPRelay,
			c.rtspRelayAddress,
			c.enableRecord,
			sessionDir,
		)
		if err != nil {
			pipelineErr = err
			return
		}
		c.pipeline.Store(pipeline)
	}()

	var bwe cc.BandwidthEstimator
	var rtcErr error
	wg.Add(1)

	go func() {
		defer wg.Done()
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
				OnBWE: func(estimator cc.BandwidthEstimator) {
					bwe = estimator
				},
			},
		}
		connector, err := sdk.NewConnector(c.sfuAddress)
		if err != nil {
			rtcErr = err
			return
		}

		rtc, err := sdk.NewRTC(connector, config)
		if err != nil {
			rtcErr = err
			return
		}

		if err := rtc.Join(c.sessionName, fmt.Sprintf("camera:%v", c.sessionName), sdk.NewJoinConfig().SetNoAutoSubscribe()); err != nil {
			rtcErr = err
			return
		}

		rtc.GetPubTransport().GetPeerConnection().OnICEConnectionStateChange(func(state webrtc.ICEConnectionState) {
			logger.Infof("ICE connection state changed: %v", state)
		})
		rtc.GetPubTransport().GetPeerConnection().OnConnectionStateChange(func(state webrtc.PeerConnectionState) {
			logger.Infof("Peer connection state changed: %v", state)
		})

		if len(publishTrack) > 0 {
			// Read RTCP from each track to make sure the interceptors work
			rtcpReaderList, _ := rtc.Publish(publishTrack...)
			for _, rtcpReader := range rtcpReaderList {
				c.startRTCPHandler(rtcpReader)
			}
		}
		c.connector = connector
	}()

	wg.Wait()

	if pipelineErr != nil {
		c.close()
		return jujuErr.Annotate(pipelineErr, "pipeline error")
	}

	if rtcErr != nil {
		c.close()
		return jujuErr.Annotate(rtcErr, "rtc error")
	}

	bwe.OnTargetBitrateChange(func(bitrate int) {
		if p, ok := c.pipeline.Load().(gst.Pipeline); ok {
			p.ChangeEncoderBitrate(int(bitrate / 2000))
		}
	})

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

func (c *Client) close() {
	if c.closed != nil {
		select {
		case <-c.closed:
			return
		default:
			close(c.closed)
		}
	}
	if c.connector != nil {
		c.connector.Close()
	}
	if p, ok := c.pipeline.Load().(gst.Pipeline); ok {
		p.Stop()
	}
	c.onClose()
}

func (c *Client) Close() {
	c.mu.Lock()
	defer c.mu.Unlock()
	c.close()
}

func (c *Client) onClose() {
	if handler, ok := c.onCloseHandler.Load().(func()); ok {
		handler()
	}
}

func (c *Client) OnClose(f func()) {
	c.onCloseHandler.Store(f)
}

func (c *Client) createPipelineWithRetry(
	rtspSrc string,
	audioSrc, videoSrc string,
	audioCodec, videoCodec string,
	audioTrack, videoTrack *webrtc.TrackLocalStaticSample,
	enableRTSPRelay bool,
	rtspRelayAddress string,
	enableRecord bool,
	sessionDir string,
) (gst.Pipeline, error) {

	pipeline, err := gst.CreatePipeline(
		rtspSrc,
		audioSrc, videoSrc,
		audioCodec, videoCodec,
		audioTrack, videoTrack,
		c.enableRTSPRelay,
		c.rtspRelayAddress,
		c.enableRecord,
		sessionDir,
	)
	if err != nil {
		return nil, err
	}

	if audioCodec != "" {
		pipeline.OnAudioSample(audioTrack.WriteSample)
		if err := pipeline.EmitAudioSample(); err != nil {
			return nil, err
		}
	}

	if videoCodec != "" {
		pipeline.OnVideoSample(videoTrack.WriteSample)
		if err := pipeline.EmitVideoSample(); err != nil {
			return nil, err
		}
	}

	if enableRecord && c.metadata == nil {
		c.metadata = &entity.Metadata{
			Filename:       filepath.Join(sessionDir, "metadata.json"),
			Session:        sessionDir,
			RecordMetadata: []entity.RecordMetadata{},
		}
		c.metadata.Write()
	}

	if enableRecord {
		pipeline.Connect(gst.SplitMuxSinkName, "format-location", func(mux any, index uint) {
			currentFile := filepath.Join(sessionDir, fmt.Sprintf("record_%v.mp4", index))
			c.metadata.PushRecord(
				currentFile,
				time.Now(),
			)
			c.metadata.Write()
		})
	}

	pipeline.Start()

	pipeline.OnClose(func(err error) {
		if c.retryTimer != nil {
			c.retryTimer.Stop()
		}

		if err != nil {
			retryCount := c.retryCount.Load()
			if c.retryCount.Load() == maxRetry {
				logger.Errorf("Pipeline retry count exceeded: %v times, stop retrying", retryCount)
				c.close()
				return
			}
			sleep := time.Duration(retryCount) * time.Second
			logger.Errorf("Retry count: %v, sleep: %v and continue to retry", retryCount, sleep)
			c.retryCount.Add(1)
			time.Sleep(sleep)
			c.createPipelineWithRetry(
				rtspSrc,
				audioSrc, videoSrc,
				audioCodec, videoCodec,
				audioTrack, videoTrack,
				c.enableRTSPRelay,
				c.rtspRelayAddress,
				c.enableRecord,
				c.clientID,
			)
			c.retryTimer = time.AfterFunc(10*time.Second, func() {
				// If not failed, reset in 10s
				c.retryCount.Store(0)
			})
		}
	})
	return pipeline, nil
}
