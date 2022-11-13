package client

import (
	"github.com/datht6vng/hcmut-thexis/rtsp-sender/pkg/logger"
	"github.com/datht6vng/hcmut-thexis/rtsp-sender/pkg/sdk"
	"github.com/pion/webrtc/v3"
)

type Client struct {
	sfuAddress  string
	sessionName string
	codec       string
	connector   *sdk.Connector
	rtc         *sdk.RTC

	audioTrack, videoTrack *webrtc.TrackLocalStaticSample
}

func NewClient(sfuAddress, sessionName string) *Client {
	return &Client{sfuAddress: sfuAddress, sessionName: sessionName}
}
func (c *Client) Connect() error {
	var err error
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

	if err := c.rtc.Join(c.sessionName, sdk.RandomKey(4)); err != nil {
		return err
	}
	c.rtc.GetPubTransport().GetPeerConnection().OnICEConnectionStateChange(func(state webrtc.ICEConnectionState) {
		logger.Infof("Connection state changed: %v", state)
	})
	c.rtc.OnTrack = func(track *webrtc.TrackRemote, receiver *webrtc.RTPReceiver) {
		// go func() {
		// 	for {
		// 		_, _, _ = track.ReadRTP()
		// 	}
		// }()

		// Always Read RTCP to ensure interceptor do their job
		go func() {
			for {
				_, _, _ = receiver.ReadRTCP()
			}
		}()
	}
	// videoTrack, err := webrtc.NewTrackLocalStaticSample(webrtc.RTPCodecCapability{MimeType: sdk.MimeTypeH264}, "video", "TEST_STREAM")
	// if err != nil {
	// 	return err
	// }

	// audioTrack, err := webrtc.NewTrackLocalStaticSample(webrtc.RTPCodecCapability{MimeType: sdk.MimeTypeH264}, "audio", "TEST_STREAM")
	// if err != nil {
	// 	return err
	// }

	// c.videoTrack = videoTrack
	// c.audioTrack = audioTrack

	// if err != nil {
	// 	return err
	// }
	// _, _ = c.rtc.Publish(c.videoTrack, c.audioTrack)
	c.rtc.PublishFile("./a.webm", true, true)
	return nil
}

// func (c *Client) startSenderLoop() {
// 	ticker := time.NewTicker(100 * time.Millisecond)
// 	for range ticker.C {
// 		c.videoTrack.WriteSample(media.Sample{})
// 		c.audioTrack.WriteSample(media.Sample{})
// 	}
// }
