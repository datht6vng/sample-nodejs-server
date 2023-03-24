// Package gst provides an easy API to create an appsink pipeline
package gst

import (
	"fmt"
	"time"

	"github.com/datht6vng/hcmut-thexis/rtsp-sender/pkg/logger"
	"github.com/pion/webrtc/v3"
	"github.com/pion/webrtc/v3/pkg/media"
)

const (
	MaxAliveTime  = 2 * time.Hour
	SrcName       = "demux"
	encoderName   = "encoder"
	audioSinkName = "audiosink"
	videoSinkName = "videosink"

	videoClockRate = 90000
	audioClockRate = 48000
	pcmClockRate   = 8000
)

type Pipeline interface {
	// Start starts the GStreamer Pipeline1
	Start()
	// Pause()
	// Resume()
	// StartBlockingPipeline()
	// Stop stops the GStreamer Pipeline1
	Stop()
	EmitAudioSample() error
	EmitVideoSample() error
	OnAudioSample(func(media.Sample) error)
	OnVideoSample(func(media.Sample) error)
	ChangeEncoderBitrate(bitrate int) error
}

// CreatePipeline creates a GStreamer Pipeline
func CreatePipeline(
	rtspSrc string,
	audioSrc, videoSrc string,
	audioCodec, videoCodec string,
	audioTrack, videoTrack *webrtc.TrackLocalStaticSample,
	enableRTSPRelay bool,
	rtspRelayAddress string,
) (Pipeline, error) {
	//var clockRate float32

	pipelineStr := rtspSrc
	if audioCodec != "" {
		audioSink := " ! appsink name=audiosink sync=false"
		switch audioCodec {
		case webrtc.MimeTypeOpus:
			pipelineStr += audioSrc + " ! opusenc " + audioSink
			//clockRate = audioClockRate
		default:
			return nil, webrtc.ErrCodecNotFound
		}
	}

	if videoCodec != "" {
		videoSink := fmt.Sprintf(" ! appsink name=%v sync=false", videoSinkName)
		if enableRTSPRelay {
			videoSink = fmt.Sprintf(" ! tee name=video_tee ! queue ! appsink name=%v sync=false video_tee. ! queue ! rtspclientsink location=%v", videoSinkName, rtspRelayAddress)
		}

		switch videoCodec {
		case webrtc.MimeTypeVP8:
			pipelineStr += videoSrc + fmt.Sprintf(" ! vp8enc error-resilient=partitions keyframe-max-dist=10 auto-alt-ref=true cpu-used=5 deadline=1 name=%v ", encoderName) + videoSink
			//clockRate = videoClockRate

		case webrtc.MimeTypeVP9:
			pipelineStr += videoSrc + fmt.Sprintf(" ! vp9enc name=%v ", encoderName) + videoSink
			//clockRate = videoClockRate

		case webrtc.MimeTypeH264:
			pipelineStr += videoSrc + fmt.Sprintf(" ! x264enc bitrate=1024 speed-preset=ultrafast tune=zerolatency name=%v ! video/x-h264,stream-format=byte-stream ", encoderName) + videoSink
			//clockRate = videoClockRate

		default:
			return nil, webrtc.ErrCodecNotFound
		}
	}
	logger.Infof("Create pipeline: %v", pipelineStr)
	pipeline, err := CreatePipeline2(pipelineStr)
	if err != nil {
		return nil, err
	}
	return pipeline, nil
}

// CreatePipeline creates a GStreamer Pipeline
// func CreatePipeline(
// 	rtspSrc string,
// 	audioSrc, videoSrc string,
// 	audioCodec, videoCodec string,
// 	audioTrack, videoTrack *webrtc.TrackLocalStaticSample,
// 	enableRTSPRelay bool,
// 	rtspRelayAddress string,
// ) (Pipeline, error) {
// 	var clockRate float32

// 	pipelineStr := rtspSrc
// 	if audioCodec != "" {
// 		audioSink := " ! appsink name=audiosink "
// 		switch audioCodec {
// 		case webrtc.MimeTypeOpus:
// 			pipelineStr += audioSrc + " ! opusenc " + audioSink
// 			clockRate = audioClockRate
// 		default:
// 			return nil, webrtc.ErrCodecNotFound
// 		}
// 	}

// 	if videoCodec != "" {
// 		videoSink := " ! appsink name=videosink "
// 		if enableRTSPRelay {
// 			videoSink = fmt.Sprintf(" ! tee name=video_tee ! queue ! appsink name=videosink video_tee. ! queue ! rtspclientsink location=%v", rtspRelayAddress)
// 		}

// 		switch videoCodec {
// 		case webrtc.MimeTypeVP8:
// 			pipelineStr += videoSrc + " ! vp8enc error-resilient=partitions keyframe-max-dist=10 auto-alt-ref=true cpu-used=5 deadline=1 " + videoSink
// 			clockRate = videoClockRate

// 		case webrtc.MimeTypeVP9:
// 			pipelineStr += videoSrc + " ! vp9enc ! " + videoSink
// 			clockRate = videoClockRate

// 		case webrtc.MimeTypeH264:
// 			pipelineStr += videoSrc + " ! x264enc speed-preset=ultrafast tune=zerolatency ! video/x-h264,stream-format=byte-stream " + videoSink
// 			clockRate = videoClockRate

// 		default:
// 			return nil, webrtc.ErrCodecNotFound
// 		}
// 	}

// 	logger.Infof("Create pipeline: %v", pipelineStr)
// 	pipelineStrUnsafe := C.CString(pipelineStr)
// 	defer C.free(unsafe.Pointer(pipelineStrUnsafe))

// 	pipelinesLock.Lock()
// 	defer pipelinesLock.Unlock()

// 	pipeline := &Pipeline1{
// 		Pipeline:   C.gstreamer_send_create_pipeline(pipelineStrUnsafe),
// 		audioTrack: audioTrack,
// 		videoTrack: videoTrack,
// 		audioCodec: audioCodec,
// 		videoCodec: videoCodec,
// 		id:         len(pipelines),
// 		clockRate:  clockRate,
// 	}

// 	pipelines[pipeline.id] = pipeline
// 	return pipeline, nil
// }
