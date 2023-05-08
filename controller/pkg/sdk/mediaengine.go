package sdk

import (
	"github.com/dathuynh1108/hcmut-thexis/controller/pkg/config"
	"github.com/juju/errors"
	"github.com/pion/interceptor"
	"github.com/pion/interceptor/pkg/cc"
	"github.com/pion/interceptor/pkg/gcc"
	"github.com/pion/interceptor/pkg/nack"
	"github.com/pion/interceptor/pkg/twcc"
	"github.com/pion/sdp/v3"
	"github.com/pion/webrtc/v3"
)

const (
	MimeTypeH264 = "video/H264"
	MimeTypeOpus = "audio/opus"
	MimeTypeVP8  = "video/VP8"
	MimeTypeVP9  = "video/VP9"
)

var (
	videoRTCPFeedback = []webrtc.RTCPFeedback{
		{Type: webrtc.TypeRTCPFBTransportCC, Parameter: ""},
		{Type: webrtc.TypeRTCPFBGoogREMB, Parameter: ""},
		{Type: webrtc.TypeRTCPFBCCM, Parameter: "fir"},
		{Type: webrtc.TypeRTCPFBNACK, Parameter: ""},
		{Type: webrtc.TypeRTCPFBNACK, Parameter: "pli"},
	}
	videoRTPCodecParameters = []webrtc.RTPCodecParameters{
		{
			RTPCodecCapability: webrtc.RTPCodecCapability{MimeType: MimeTypeH264, ClockRate: 90000, SDPFmtpLine: "level-asymmetry-allowed=1;packetization-mode=1;profile-level-id=42e01f", RTCPFeedback: videoRTCPFeedback},
			PayloadType:        125,
		},
		{
			RTPCodecCapability: webrtc.RTPCodecCapability{MimeType: MimeTypeH264, ClockRate: 90000, SDPFmtpLine: "level-asymmetry-allowed=1;packetization-mode=1;profile-level-id=640032", RTCPFeedback: videoRTCPFeedback},
			PayloadType:        123,
		},
		{
			RTPCodecCapability: webrtc.RTPCodecCapability{MimeType: MimeTypeH264, ClockRate: 90000, SDPFmtpLine: "level-asymmetry-allowed=1;packetization-mode=0;profile-level-id=42001f", RTCPFeedback: videoRTCPFeedback},
			PayloadType:        127,
		},
		{
			RTPCodecCapability: webrtc.RTPCodecCapability{MimeType: MimeTypeH264, ClockRate: 90000, SDPFmtpLine: "level-asymmetry-allowed=1;packetization-mode=0;profile-level-id=42e01f", RTCPFeedback: videoRTCPFeedback},
			PayloadType:        108,
		},
		{
			RTPCodecCapability: webrtc.RTPCodecCapability{MimeType: MimeTypeVP8, ClockRate: 90000, RTCPFeedback: nil},
			PayloadType:        96,
		},
		{
			RTPCodecCapability: webrtc.RTPCodecCapability{MimeType: MimeTypeVP9, ClockRate: 90000, SDPFmtpLine: "profile-id=0", RTCPFeedback: videoRTCPFeedback},
			PayloadType:        98,
		},
		{
			RTPCodecCapability: webrtc.RTPCodecCapability{MimeType: MimeTypeVP9, ClockRate: 90000, SDPFmtpLine: "profile-id=1", RTCPFeedback: videoRTCPFeedback},
			PayloadType:        100,
		},
	}
)

const frameMarking = "urn:ietf:params:rtp-hdrext:framemarking"

func getPublisherMediaEngine(mime string) (*webrtc.MediaEngine, error) {
	me := &webrtc.MediaEngine{}
	if err := me.RegisterCodec(webrtc.RTPCodecParameters{
		RTPCodecCapability: webrtc.RTPCodecCapability{MimeType: MimeTypeOpus, ClockRate: 48000, Channels: 2, SDPFmtpLine: "minptime=10;useinbandfec=1", RTCPFeedback: nil},
		PayloadType:        111,
	}, webrtc.RTPCodecTypeAudio); err != nil {
		return nil, err
	}

	for _, codec := range videoRTPCodecParameters {
		// register all if mime == ""
		if mime == "" {
			if err := me.RegisterCodec(codec, webrtc.RTPCodecTypeVideo); err != nil {
				return nil, err
			}
			continue
		}
		// register the chosen mime
		if codec.RTPCodecCapability.MimeType == mime {
			if err := me.RegisterCodec(codec, webrtc.RTPCodecTypeVideo); err != nil {
				return nil, err
			}
		}
	}

	for _, extension := range []string{
		sdp.SDESMidURI,
		sdp.SDESRTPStreamIDURI,
		frameMarking,
		sdp.TransportCCURI,
	} {
		if err := me.RegisterHeaderExtension(webrtc.RTPHeaderExtensionCapability{URI: extension}, webrtc.RTPCodecTypeVideo); err != nil {
			return nil, err
		}
	}
	for _, extension := range []string{
		sdp.SDESMidURI,
		sdp.SDESRTPStreamIDURI,
		sdp.AudioLevelURI,
	} {
		if err := me.RegisterHeaderExtension(webrtc.RTPHeaderExtensionCapability{URI: extension}, webrtc.RTPCodecTypeAudio); err != nil {
			return nil, err
		}
	}

	return me, nil
}

func getSubscriberMediaEngine() (*webrtc.MediaEngine, error) {
	me := &webrtc.MediaEngine{}
	_ = me.RegisterDefaultCodecs()
	return me, nil
}

func ConfigureTWCC(mediaEngine *webrtc.MediaEngine, interceptorRegistry *interceptor.Registry, networkConfig config.NetworkConfig) error {
	extension, err := twcc.NewHeaderExtensionInterceptor()
	if err != nil {
		return err
	}
	interceptorRegistry.Add(extension)
	return nil
}

func ConfigureNACK(mediaEngine *webrtc.MediaEngine, interceptorRegistry *interceptor.Registry) error {
	generator, err := nack.NewGeneratorInterceptor()
	if err != nil {
		return err
	}

	responder, err := nack.NewResponderInterceptor()
	if err != nil {
		return err
	}
	interceptorRegistry.Add(responder)
	interceptorRegistry.Add(generator)
	return nil
}

func ConfigureGoogleCongestionControl(mediaEngine *webrtc.MediaEngine, interceptorRegistry *interceptor.Registry, rtcConfig *RTCConfig, networkConfig config.NetworkConfig) error {
	var maxBitrate, minBitrate int
	if networkConfig.MaxBitrate == 0 {
		maxBitrate = 500 * 1000
	} else {
		maxBitrate = networkConfig.MaxBitrate * 1000
	}
	if networkConfig.MinBitrate == 0 {
		minBitrate = 50 * 1000
	} else {
		minBitrate = networkConfig.MinBitrate * 1000
	}
	gccInterceptor, err := cc.NewInterceptor(func() (cc.BandwidthEstimator, error) {
		return gcc.NewSendSideBWE(
			gcc.SendSideBWEInitialBitrate((minBitrate+maxBitrate)/2),
			gcc.SendSideBWEMaxBitrate(maxBitrate),
			gcc.SendSideBWEMinBitrate(minBitrate),
			gcc.SendSideBWEPacer(gcc.NewNoOpPacer()), // Send engine
		)
	})
	if err != nil {
		return err
	}
	gccInterceptor.OnNewPeerConnection(func(id string, estimator cc.BandwidthEstimator) {
		rtcConfig.WebRTC.OnBWE(estimator)
	})
	interceptorRegistry.Add(gccInterceptor)
	return nil
}

func RegisterInterceptors(mediaEngine *webrtc.MediaEngine, interceptorRegistry *interceptor.Registry, role Target, rtcConfig *RTCConfig, networkConfig config.NetworkConfig) error {
	// Not neccessary to register report
	// if err := webrtc.ConfigureRTCPReports(interceptorRegistry); err != nil {
	// 	return err
	// }
	if role == Target_PUBLISHER {
		// GCC - This Congestion Control is not completed - Use later
		if err := ConfigureGoogleCongestionControl(mediaEngine, interceptorRegistry, rtcConfig, networkConfig); err != nil {
			return err
		}

		if err := ConfigureTWCC(mediaEngine, interceptorRegistry, networkConfig); err != nil {
			return err
		}
		if err := ConfigureNACK(mediaEngine, interceptorRegistry); err != nil {
			return err
		}
	}
	return nil
}

func NewInterceptorRegistry(mediaEngine *webrtc.MediaEngine, role Target, rtcConfig *RTCConfig, networkConfig config.NetworkConfig) (*interceptor.Registry, error) {
	interceptorRegistry := &interceptor.Registry{}

	if err := RegisterInterceptors(mediaEngine, interceptorRegistry, role, rtcConfig, networkConfig); err != nil {
		return nil, errors.Annotatef(err, "registering interceptors")
	}

	return interceptorRegistry, nil
}
