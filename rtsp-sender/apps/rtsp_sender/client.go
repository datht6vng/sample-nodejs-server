package rtsp_sender

import (
	"bytes"
	"time"

	"github.com/datht6vng/hcmut-thexis/rtsp-sender/pkg/logger"
	"github.com/datht6vng/hcmut-thexis/rtsp-sender/pkg/sdk"
	"github.com/deepch/vdk/av"
	"github.com/deepch/vdk/codec/h264parser"
	"github.com/deepch/vdk/format/rtspv2"
	"github.com/pion/webrtc/v3"
	"github.com/pion/webrtc/v3/pkg/media"
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
	var AudioOnly bool
	if len(rtspClient.CodecData) == 1 && rtspClient.CodecData[0].Type().IsAudio() {
		AudioOnly = true
	}
	c.codecs = rtspClient.CodecData
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
	videoTrack, err := webrtc.NewTrackLocalStaticSample(webrtc.RTPCodecCapability{MimeType: sdk.MimeTypeH264}, "video", "TEST_STREAM")
	if err != nil {
		return err
	}
	c.videoTrack = videoTrack
	publishTrack = append(publishTrack, c.videoTrack)

	if !AudioOnly {
		audioTrack, err := webrtc.NewTrackLocalStaticSample(webrtc.RTPCodecCapability{MimeType: sdk.MimeTypeH264}, "audio", "TEST_STREAM")
		if err != nil {
			return err
		}
		c.audioTrack = audioTrack
		publishTrack = append(publishTrack, c.audioTrack)

	}

	if len(publishTrack) > 0 {
		rtcpReaderList, _ := c.rtc.Publish(c.videoTrack, c.audioTrack)
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

	keyTest := time.NewTimer(20 * time.Second)
	go func() {
		for {
			select {
			case <-keyTest.C:
				return
			case signals := <-rtspClient.Signals:
				switch signals {
				case rtspv2.SignalCodecUpdate:
					c.codecs = rtspClient.CodecData
				case rtspv2.SignalStreamRTPStop:
					return
				}
			case packetAV := <-rtspClient.OutgoingPacketQueue:
				if AudioOnly || packetAV.IsKeyFrame {
					keyTest.Reset(20 * time.Second)
				}
				c.WritePacket(packetAV)
			}
		}
	}()

	c.rtc.PublishFile("./a.webm", true, true)

	return nil
}

func (c *Client) WritePacket(pkt *av.Packet) (err error) {
	//log.Println("WritePacket", pkt.Time, element.stop, webrtc.ICEConnectionStateConnected, pkt.Idx, element.streams[pkt.Idx])
	packetCodec := c.codecs[pkt.Idx]
	switch packetCodec.Type() {
	case av.H264:
		nalus, _ := h264parser.SplitNALUs(pkt.Data)
		for _, nalu := range nalus {
			naltype := nalu[0] & 0x1f
			if naltype == 5 {
				codec := packetCodec.(h264parser.CodecData)
				err = c.videoTrack.WriteSample(media.Sample{Data: append([]byte{0, 0, 0, 1}, bytes.Join([][]byte{codec.SPS(), codec.PPS(), nalu}, []byte{0, 0, 0, 1})...), Duration: pkt.Duration})

			} else if naltype == 1 {
				err = c.videoTrack.WriteSample(media.Sample{Data: append([]byte{0, 0, 0, 1}, nalu...), Duration: pkt.Duration})
			}
			if err != nil {
				return err
			}
		}
		return
		/*

			if pkt.IsKeyFrame {
				pkt.Data = append([]byte{0, 0, 0, 1}, bytes.Join([][]byte{codec.SPS(), codec.PPS(), pkt.Data[4:]}, []byte{0, 0, 0, 1})...)
			} else {
				pkt.Data = pkt.Data[4:]
			}

		*/
	case av.PCM_ALAW:
	case av.OPUS:
		return c.audioTrack.WriteSample(media.Sample{Data: pkt.Data, Duration: pkt.Duration})
	case av.PCM_MULAW:
	case av.AAC:
		//TODO: NEED ADD DECODER AND ENCODER
		return webrtc.ErrUnsupportedCodec
	case av.PCM:
		//TODO: NEED ADD ENCODER
		return webrtc.ErrUnsupportedCodec
	default:
		return webrtc.ErrUnsupportedCodec
	}
	return nil
}

func (c *Client) Close() {
	c.rtc.Close()
	c.connector.Close()
}
