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

	"github.com/pion/webrtc/v3"
	"github.com/pion/webrtc/v3/pkg/media"
)

func init() {
	go C.gstreamer_send_start_mainloop()
}

// Pipeline is a wrapper for a GStreamer Pipeline
type Pipeline1 struct {
	Pipeline               *C.GstElement
	audioTrack, videoTrack *webrtc.TrackLocalStaticSample
	id                     int
	audioCodec, videoCodec string
	clockRate              float32
	tracks                 []*webrtc.TrackLocalStaticSample
}

var pipelines = make(map[int]*Pipeline1)
var pipelinesLock sync.Mutex

func (p *Pipeline1) EmitVideoSample() {

}

// Start starts the GStreamer Pipeline
func (p *Pipeline1) Start() {
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
func (p *Pipeline1) Stop() {
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
