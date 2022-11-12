package client

import (
	"github.com/datht6vng/hcmut-thexis/rtsp-sender/pkg/logger"
	sdk "github.com/pion/ion-sdk-go"
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
	config := sdk.RTCConfig{
		WebRTC: sdk.WebRTCTransportConfig{
			VideoMime: sdk.MimeTypeH264, // Fuck this! use sdk.MimeTypeH264 = "video/h264" because webrtc.MimeTypeH264 = "video/H264"
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
	c.rtc = sdk.NewRTC(c.connector, config)

	if err := c.rtc.Join(c.sessionName, sdk.RandomKey(4)); err != nil {
		return err
	}
	c.rtc.GetPubTransport().GetPeerConnection().OnICEConnectionStateChange(func(state webrtc.ICEConnectionState) {
		logger.Infof("Connection state changed: %v", state)
	})

	videoTrack, err := webrtc.NewTrackLocalStaticSample(webrtc.RTPCodecCapability{MimeType: sdk.MimeTypeH264}, "video", "TEST_STREAM")
	if err != nil {
		return err
	}

	audioTrack, err := webrtc.NewTrackLocalStaticSample(webrtc.RTPCodecCapability{MimeType: sdk.MimeTypeH264}, "audio", "TEST_STREAM")
	if err != nil {
		return err
	}

	c.videoTrack = videoTrack
	c.audioTrack = audioTrack

	if err != nil {
		return err
	}
	_, _ = c.rtc.Publish(c.videoTrack, c.audioTrack)
	return nil
}
