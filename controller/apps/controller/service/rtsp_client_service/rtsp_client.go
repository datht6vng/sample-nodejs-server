package rtsp_client_service

import (
	"fmt"
	"io"
	"math/rand"
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
	"github.com/cenkalti/backoff/v4"
	"github.com/dathuynh1108/hcmut-thesis/controller/apps/controller/entity"
	"github.com/dathuynh1108/hcmut-thesis/controller/pkg/logger"
	"github.com/dathuynh1108/hcmut-thesis/controller/pkg/node"
	gst "github.com/dathuynh1108/hcmut-thesis/controller/pkg/rtsp_to_webrtc"
	"github.com/dathuynh1108/hcmut-thesis/controller/pkg/sdk"
	jujuErr "github.com/juju/errors"
	"github.com/pion/interceptor/pkg/cc"
	"github.com/pion/webrtc/v3"
	"github.com/redis/go-redis/v9"
)

const maxRetry = 5

type Client struct {
	mu               sync.RWMutex
	clientID         string
	clientAddress    string
	rtspRelayAddress string
	username         string
	password         string
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
	r          *redis.Client
}

func NewClient(r *redis.Client, clientID, clientAddress, rtspRelayAddress, username, password, sessionName string, enableAudio bool, enableRTSPRelay bool, enableRecord bool) *Client {
	return &Client{
		r:                r,
		clientID:         clientID,
		clientAddress:    clientAddress,
		rtspRelayAddress: rtspRelayAddress,
		username:         username,
		password:         password,
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
		videoSrc := fmt.Sprintf(" %v. ! queue max-size-time=0 max-size-buffers=1024 max-size-bytes=0 leaky=2 ! application/x-rtp ! %v ! %v ! videoconvert ! videoscale ! video/x-raw,format=I420,colorimetry=bt709,chroma-site=mpeg2,pixel-aspect-ratio=1/1,is-live=true ", gst.SrcName, videoDepay, videoDecoder)
		audioSrc := fmt.Sprintf(" %v. ! queue max-size-time=0 max-size-buffers=1024 max-size-bytes=0 leaky=2 ! application/x-rtp ! %v ! %v ! audioconvert ! audioresample ! audio/x-raw,is-live=true ", gst.SrcName, audioDepay, audioDecoder)

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
							},
						},
					},
				},
				OnBWE: func(estimator cc.BandwidthEstimator) {
					bwe = estimator
				},
			},
		}
		sfuAddress, err := node.SetOrGetSFUAddressForRoom(c.r, c.sessionName)
		if err != nil {
			rtcErr = err
			return
		}
		connector, err := sdk.NewConnector(c.r, sfuAddress)
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
		if p != nil {
			p.Stop()
		}
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
			go func() {
				currentFile := filepath.Join(sessionDir, fmt.Sprintf("record_%v.mp4", index))
				c.metadata.PushRecord(
					currentFile,
					time.Now(),
				)
				c.metadata.Write()
			}()
		})
	}

	pipeline.Start()

	pipeline.OnClose(func(err error) {
		// Backoff connection if pipeline is stopped by error
		select {
		case <-c.closed:
			logger.Infof("Client is closed, dismiss error: %v", err)
			return
		default:
			if err != nil {
				if c.retryTimer != nil {
					c.retryTimer.Stop()
				}

				retryCount := c.retryCount.Add(1)
				sleepTime := time.Duration(retryCount) * time.Second
				sleepTime = time.Duration(rand.Float64()*float64(sleepTime) + float64(sleepTime))
				logger.Infof("[Pipeline Error] Pipeline is closed with error: %v, backoff pipeline after: %v", err, sleepTime)

				time.Sleep(sleepTime)
				backoffType := backoff.NewExponentialBackOff()
				backoffOP := func() error {
					select {
					case <-c.closed:
						return nil
					default:
						pipeline, err := c.createPipelineWithRetry(
							rtspSrc,
							audioSrc, videoSrc,
							audioCodec, videoCodec,
							audioTrack, videoTrack,
							enableRTSPRelay,
							rtspRelayAddress,
							enableRecord,
							sessionDir,
						)
						if err != nil {
							logger.Errorf("Recreate pipeline error: %v", err)
							return err
						}
						c.pipeline.Store(pipeline)
						c.retryTimer = time.AfterFunc(30*time.Second, func() {
							logger.Infof("Retried connection is stable, restart penalty time")
							c.retryCount.Store(0)
						})
						return nil
					}
				}
				if err := backoff.Retry(backoffOP, backoffType); err != nil {
					logger.Errorf("[Pipeline Error] Cannot backoff pipeline: %v", err)
				}
			}
		}
	})
	return pipeline, nil
}
