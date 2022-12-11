package rtsp_sender

import (
	"fmt"
	"time"

	"github.com/datht6vng/hcmut-thexis/rtsp-sender/pkg/logger"
	"github.com/datht6vng/hcmut-thexis/rtsp-sender/pkg/sdk"
	gst "github.com/datht6vng/hcmut-thexis/rtsp-sender/pkg/sdk/rtsp-to-webrtc"
	"github.com/deepch/vdk/av"
	"github.com/deepch/vdk/format/rtspv2"
	"github.com/pion/webrtc/v3"
)

type Client struct {
	clientAddress string
	sfuAddress    string
	sessionName   string
	codec         string
	enableAudio   bool
	connector     *sdk.Connector
	rtc           *sdk.RTC

	audioTrack, videoTrack *webrtc.TrackLocalStaticSample
	codecs                 []av.CodecData
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
	logger.Infof("Audio only %v", audioOnly)
	rtspSrc := fmt.Sprintf("rtspsrc location=%v name=demux", c.clientAddress)

	videoSrc := fmt.Sprintf(" demux. ! queue ! application/x-rtp ! %v ! %v ! videoconvert ! videoscale ", videoDepay, videoDecoder)
	// Need mux here
	audioSrc := fmt.Sprintf(" demux. ! queue ! application/x-rtp ! %v ! %v ! audioconvert ! audioresample ", audioDepay, audioDecoder)
	// keyTest := time.NewTimer(20 * time.Second)
	// go func() {
	// 	for {
	// 		select {
	// 		case <-keyTest.C:
	// 			return
	// 		case signals := <-rtspClient.Signals:
	// 			switch signals {
	// 			case rtspv2.SignalCodecUpdate:
	// 				c.codecs = rtspClient.CodecData
	// 			case rtspv2.SignalStreamRTPStop:
	// 				return
	// 			}
	// 		case packetAV := <-rtspClient.OutgoingPacketQueue:
	// 			if AudioOnly || packetAV.IsKeyFrame {
	// 				keyTest.Reset(20 * time.Second)
	// 			}
	// 			c.WritePacket(packetAV)
	// 		}
	// 	}
	// }()

	config := sdk.RTCConfig{
		WebRTC: sdk.WebRTCTransportConfig{
			Configuration: webrtc.Configuration{
				ICEServers: []webrtc.ICEServer{
					{
						URLs: []string{"stun:stun.stunprotocol.org:3478", "stun:stun.l.google.com:19302"},
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
		logger.Infof("Connection state changed: %v", state)
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

	gst.CreatePipeline(
		rtspSrc,
		audioSrc, videoSrc,
		audioCodec, videoCodec,
		c.audioTrack, c.videoTrack,
	).Start()

	if len(publishTrack) > 0 {
		rtcpReaderList, _ := c.rtc.Publish(publishTrack...)
		for _, rtcpReader := range rtcpReaderList {
			go func(rtcpReader *webrtc.RTPSender) {
				for {
					if _, _, err = rtcpReader.ReadRTCP(); err != nil {
						return
					}
				}
			}(rtcpReader)
		}
	}
	return nil
}

// func (c *Client) WritePacket(pkt *av.Packet) (err error) {
// 	//log.Println("WritePacket", pkt.Time, element.stop, webrtc.ICEConnectionStateConnected, pkt.Idx, element.streams[pkt.Idx])
// 	packetCodec := c.codecs[pkt.Idx]
// 	switch packetCodec.Type() {
// 	case av.H264:
// 		nalus, _ := h264parser.SplitNALUs(pkt.Data)
// 		for _, nalu := range nalus {
// 			naltype := nalu[0] & 0x1f
// 			if naltype == 5 {
// 				codec := packetCodec.(h264parser.CodecData)
// 				err = c.videoTrack.WriteSample(media.Sample{Data: append([]byte{0, 0, 0, 1}, bytes.Join([][]byte{codec.SPS(), codec.PPS(), nalu}, []byte{0, 0, 0, 1})...), Duration: pkt.Duration})
// 				if err != nil {
// 					return err
// 				}
// 			} else if naltype == 1 {
// 				err = c.videoTrack.WriteSample(media.Sample{Data: append([]byte{0, 0, 0, 1}, nalu...), Duration: pkt.Duration})
// 				if err != nil {
// 					return err
// 				}
// 			}
// 		}
// 		return
// 		/*

// 			if pkt.IsKeyFrame {
// 				pkt.Data = append([]byte{0, 0, 0, 1}, bytes.Join([][]byte{codec.SPS(), codec.PPS(), pkt.Data[4:]}, []byte{0, 0, 0, 1})...)
// 			} else {
// 				pkt.Data = pkt.Data[4:]
// 			}

// 		*/
// 	case av.PCM_ALAW:
// 	case av.OPUS:
// 		return c.audioTrack.WriteSample(media.Sample{Data: pkt.Data, Duration: pkt.Duration})
// 	case av.PCM_MULAW:
// 	case av.AAC:
// 		//TODO: NEED ADD DECODER AND ENCODER
// 		return webrtc.ErrUnsupportedCodec
// 	case av.PCM:
// 		//TODO: NEED ADD ENCODER
// 		return webrtc.ErrUnsupportedCodec
// 	default:
// 		return webrtc.ErrUnsupportedCodec
// 	}
// 	return nil
// }

func (c *Client) Close() {
	c.rtc.Close()
	c.connector.Close()
}
