// Package gst provides an easy API to create an appsink pipeline
package gst

import (
	"fmt"
	"path/filepath"
	"time"

	"github.com/dathuynh1108/hcmut-thesis/controller/pkg/config"
	"github.com/dathuynh1108/hcmut-thesis/controller/pkg/logger"
	"github.com/dathuynh1108/hcmut-thesis/controller/pkg/util"
	"github.com/pion/webrtc/v3"
	"github.com/pion/webrtc/v3/pkg/media"
)

const (
	MaxAliveTime     = 2 * time.Hour
	SrcName          = "demux"
	encoderName      = "encoder"
	audioSinkName    = "audiosink"
	videoSinkName    = "videosink"
	SplitMuxSinkName = "splitmuxsink"
	videoClockRate   = 90000
	audioClockRate   = 48000
	pcmClockRate     = 8000
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
	Connect(string, string, any) error
	ChangeEncoderBitrate(bitrate int) error
	OnClose(func(error))
}

// CreatePipeline creates a GStreamer Pipeline
func CreatePipeline(
	rtspSrc string,
	audioSrc, videoSrc string,
	audioCodec, videoCodec string,
	audioTrack, videoTrack *webrtc.TrackLocalStaticSample,
	enableRTSPRelay bool,
	rtspRelayAddress string,
	enableRecord bool,
	sessionDir string,
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
		var videoEncoder, caps, parser string
		switch videoCodec {
		case webrtc.MimeTypeVP8:
			videoEncoder = fmt.Sprintf(" ! vp8enc target-bitrate=1024 error-resilient=partitions keyframe-max-dist=10 auto-alt-ref=true cpu-used=5 deadline=1 name=%v", encoderName)
			caps = "video/x-vp8,stream-format=byte-stream"
			parser = "video/x-vp8"

		case webrtc.MimeTypeVP9:
			videoEncoder = fmt.Sprintf(" ! vp9enc bitrate=1024 name=%v", encoderName)
			caps = "video/x-vp9,stream-format=byte-stream"
			parser = "vp9parse"

		case webrtc.MimeTypeH264:
			videoEncoder = fmt.Sprintf(" ! x264enc speed-preset=ultrafast key-int-max=20 byte-stream=true name=%v ! h264parse ", encoderName)
			caps = "video/x-h264,stream-format=byte-stream"
			parser = "h264parse"

		default:
			return nil, webrtc.ErrCodecNotFound
		}
		var videoSink string

		if enableRTSPRelay {
			videoSink = fmt.Sprintf(" ! tee name=video_tee ! queue max-size-time=0 max-size-buffers=1024 max-size-bytes=0 leaky=2 ! %v ! appsink name=%v sync=false video_tee. ! queue max-size-time=0 max-size-buffers=1024 max-size-bytes=0 leaky=2 ! rtspclientsink location=%v", caps, videoSinkName, rtspRelayAddress)
			if enableRecord {
				RecordFileDuration := int64(time.Duration(config.Config.RecorderConfig.RecordFileDuration) * time.Second)
				path := `"` + filepath.Join(sessionDir, "record_%d.mp4") + `"`
				index, err := util.GetIndex(sessionDir)
				if err != nil {
					return nil, err
				}
				videoSink = fmt.Sprintf(" ! tee name=video_tee ! queue max-size-time=0 max-size-buffers=1024 max-size-bytes=0 leaky=2 ! %v ! appsink name=%v sync=false video_tee. ! queue max-size-time=0 ! tee name=video_tee_2 ! queue max-size-time=0 max-size-buffers=1024 max-size-bytes=0 leaky=2 ! rtspclientsink location=%v latency=10000 video_tee_2. ! queue max-size-time=0 max-size-buffers=1024 max-size-bytes=0 leaky=2 ! %v ! splitmuxsink name=%v muxer-factory=matroskamux muxer=matroskamux location=%v max-size-time=%v max-files=%v start-index=%v async-finalize=true", caps, videoSinkName, rtspRelayAddress, parser, SplitMuxSinkName, path, RecordFileDuration, config.Config.RecorderConfig.MaxRecordFiles, index)
			}
		} else if enableRecord {
			RecordFileDuration := int64(time.Duration(config.Config.RecorderConfig.RecordFileDuration) * time.Second)
			path := `"` + filepath.Join(sessionDir, "record_%d.mp4") + `"`
			index, err := util.GetIndex(sessionDir)
			if err != nil {
				return nil, err
			}
			videoSink = fmt.Sprintf(" ! tee name=video_tee ! queue max-size-time=0 max-size-buffers=1024 max-size-bytes=0 leaky=2 ! %v ! appsink name=%v sync=false video_tee. ! queue max-size-time=0 max-size-buffers=1024 max-size-bytes=0 leaky=2 ! %v ! splitmuxsink name=%v muxer-factory=matroskamux muxer=matroskamux location=%v max-size-time=%v max-files=%v start-index=%v async-finalize=true", caps, videoSinkName, parser, SplitMuxSinkName, path, RecordFileDuration, config.Config.RecorderConfig.MaxRecordFiles, index)
		} else {
			videoSink = fmt.Sprintf(" ! queue max-size-time=0 max-size-buffers=1024 max-size-bytes = 0 ! %v ! appsink name=%v sync=false", caps, videoSinkName)
		}

		pipelineStr += videoSrc + videoEncoder + videoSink
	}

	logger.Infof("Create pipeline: %v, enable record: %v, enable relay: %v", pipelineStr, enableRecord, enableRTSPRelay)

	pipeline, err := CreatePipeline2(pipelineStr)
	if err != nil {
		return nil, err
	}
	pipeline.videoCodec = videoCodec
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
