// Package gst provides an easy API to create an appsink pipeline
package gst

/*
#cgo pkg-config: gstreamer-1.0 gstreamer-app-1.0

#include "gst.h"
#include <stdio.h>
#include <stdbool.h>

*/
import "C"
import (
	"fmt"
	"sync"
	"time"
	"unsafe"

	"github.com/datht6vng/hcmut-thexis/rtsp-sender/pkg/logger"
	"github.com/pion/webrtc/v3"
	"github.com/pion/webrtc/v3/pkg/media"
)

func init() {
	go C.gstreamer_send_start_mainloop()
}

// Pipeline is a wrapper for a GStreamer Pipeline
type Pipeline struct {
	Pipeline               *C.GstElement
	audioTrack, videoTrack *webrtc.TrackLocalStaticSample
	id                     int
	audioCodec, videoCodec string
	clockRate              float32
	tracks                 []*webrtc.TrackLocalStaticSample
}

var pipelines = make(map[int]*Pipeline)
var pipelinesLock sync.Mutex

const (
	videoClockRate = 90000
	audioClockRate = 48000
	pcmClockRate   = 8000
)

// CreatePipeline creates a GStreamer Pipeline
func CreatePipeline(
	rtspSrc string,
	audioSrc, videoSrc string,
	audioCodec, videoCodec string,
	audioTrack, videoTrack *webrtc.TrackLocalStaticSample,
	enableRTSPRelay bool,
	rtspRelayAddress string,
) *Pipeline {
	var clockRate float32

	pipelineStr := rtspSrc
	if audioCodec != "" {
		audioSink := " ! appsink name=audiosink "
		switch audioCodec {
		case webrtc.MimeTypeOpus:
			pipelineStr += audioSrc + " ! opusenc " + audioSink
			clockRate = audioClockRate
		default:
			panic("Unhandled codec " + audioCodec)
		}
	}

	if videoCodec != "" {
		videoSink := " ! appsink name=videosink "
		if enableRTSPRelay {
			videoSink = fmt.Sprintf(" ! tee name=video_tee ! queue ! appsink name=videosink video_tee. ! queue ! rtspclientsink location=%v", rtspRelayAddress)
		}

		switch videoCodec {
		case webrtc.MimeTypeVP8:
			pipelineStr += videoSrc + " ! vp8enc error-resilient=partitions keyframe-max-dist=10 auto-alt-ref=true cpu-used=5 deadline=1 " + videoSink
			clockRate = videoClockRate

		case webrtc.MimeTypeVP9:
			pipelineStr += videoSrc + " ! vp9enc ! " + videoSink
			clockRate = videoClockRate

		case webrtc.MimeTypeH264:
			pipelineStr += videoSrc + " ! x264enc speed-preset=ultrafast tune=zerolatency ! video/x-h264,stream-format=byte-stream " + videoSink
			clockRate = videoClockRate

		default:
			panic("Unhandled codec " + videoCodec)
		}
	}

	logger.Infof("Create pipeline: %v", pipelineStr)
	pipelineStrUnsafe := C.CString(pipelineStr)
	defer C.free(unsafe.Pointer(pipelineStrUnsafe))

	pipelinesLock.Lock()
	defer pipelinesLock.Unlock()

	pipeline := &Pipeline{
		Pipeline:   C.gstreamer_send_create_pipeline(pipelineStrUnsafe),
		audioTrack: audioTrack,
		videoTrack: videoTrack,
		audioCodec: audioCodec,
		videoCodec: videoCodec,
		id:         len(pipelines),
		clockRate:  clockRate,
	}

	pipelines[pipeline.id] = pipeline
	return pipeline
}

// Start starts the GStreamer Pipeline
func (p *Pipeline) Start() {
	audioEnable, videoEnable := false, false
	if p.audioCodec != "" {
		audioEnable = true
	}
	if p.videoCodec != "" {
		videoEnable = true
	}
	C.gstreamer_send_start_pipeline(p.Pipeline, C.bool(audioEnable), C.bool(videoEnable), C.int(p.id))
}

// Stop stops the GStreamer Pipeline
func (p *Pipeline) Stop() {
	C.gstreamer_send_stop_pipeline(p.Pipeline)
}

//export goHandlePipelineVideoBuffer
func goHandlePipelineVideoBuffer(buffer unsafe.Pointer, bufferLen C.int, duration C.int, pipelineID C.int) {
	pipelinesLock.Lock()
	pipeline, ok := pipelines[int(pipelineID)]
	pipelinesLock.Unlock()
	if ok {
		if err := pipeline.videoTrack.WriteSample(media.Sample{Data: C.GoBytes(buffer, bufferLen), Duration: time.Duration(duration)}); err != nil {
			panic(err)
		}
	} else {
		fmt.Printf("discarding buffer, no pipeline with id %d", int(pipelineID))
	}
	C.free(buffer)
}

//export goHandlePipelineAudioBuffer
func goHandlePipelineAudioBuffer(buffer unsafe.Pointer, bufferLen C.int, duration C.int, pipelineID C.int) {
	pipelinesLock.Lock()
	pipeline, ok := pipelines[int(pipelineID)]
	pipelinesLock.Unlock()
	if ok {
		if err := pipeline.audioTrack.WriteSample(media.Sample{Data: C.GoBytes(buffer, bufferLen), Duration: time.Duration(duration)}); err != nil {
			panic(err)
		}
	} else {
		fmt.Printf("discarding buffer, no pipeline with id %d", int(pipelineID))
	}
	C.free(buffer)
}
