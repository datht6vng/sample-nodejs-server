package gst

import (
	"sync/atomic"
	"time"

	"github.com/datht6vng/hcmut-thexis/rtsp-sender/pkg/logger"
	"github.com/juju/errors"
	"github.com/pion/webrtc/v3/pkg/media"
	"github.com/tinyzimmer/go-glib/glib"
	"github.com/tinyzimmer/go-gst/gst"
	"github.com/tinyzimmer/go-gst/gst/app"
)

/*
	State flow
	VOID PENDING --> NULL --> READY --> PAUSED --> PLAYING
						|					|		|
					    -----------------------------
*/

type Pipeline2 struct {
	pipeline                                   *gst.Pipeline
	main                                       *glib.MainLoop
	autoCleaner                                *time.Timer
	ready                                      atomic.Bool
	audioCodec, videoCodec                     string
	onAudioSampleHandler, onVideoSampleHandler atomic.Value
}

func CreatePipeline2(pipelineStr string) (*Pipeline2, error) {
	pipeline, err := gst.NewPipelineFromString(pipelineStr)
	if err != nil {
		return nil, err
	}

	return &Pipeline2{
		pipeline: pipeline,
		ready:    atomic.Bool{},
	}, nil
}

func (p *Pipeline2) EmitAudioSample() error {
	audioSink, err := p.pipeline.GetElementByName(audioSinkName)
	if err != nil {
		return errors.Annotate(err, "cannot create audio sink")
	}

	if err := audioSink.SetProperty("emit-signals", true); err != nil {
		return errors.Annotate(err, "cannot set emit signals for pipeline")
	}

	sink := app.SinkFromElement(audioSink)
	sink.SetCallbacks(&app.SinkCallbacks{
		// Add a "new-sample" callback
		NewSampleFunc: p.onReceiveGSTAudioSample,
	})
	return nil
}

func (p *Pipeline2) EmitVideoSample() error {
	videoSink, err := p.pipeline.GetElementByName(videoSinkName)
	if err != nil {
		return errors.Annotate(err, "cannot create audio sink")
	}

	if err := videoSink.SetProperty("emit-signals", true); err != nil {
		return errors.Annotate(err, "cannot set emit signals for pipeline")
	}
	sink := app.SinkFromElement(videoSink)
	sink.SetCallbacks(&app.SinkCallbacks{
		// Add a "new-sample" callback
		NewSampleFunc: p.onReceiveGSTVideoSample,
	})

	return nil
}

// Start starts the GStreamer Pipeline
func (p *Pipeline2) Start() {
	go func() {
		p.pipeline.Ref()
		defer p.pipeline.Unref()

		// Note: Only use message watch with main loop
		p.main = glib.NewMainLoop(glib.MainContextDefault(), false)
		p.pipeline.GetPipelineBus().AddWatch(p.MessageWatch())
		p.pipeline.SetState(gst.StatePlaying)
		p.main.Run()
	}()
}

func (p *Pipeline2) MessageWatch() func(msg *gst.Message) bool {
	stop := func() {
		if p.main != nil {
			p.main.Quit()
		}
		p.pipeline.SetState(gst.StateNull)
		if p.autoCleaner != nil {
			p.autoCleaner.Stop()
		}
	}

	p.autoCleaner = time.AfterFunc(MaxAliveTime, func() {
		stop()
	})

	return func(msg *gst.Message) bool {
		switch msg.Type() {
		case gst.MessageEOS:
			stop()
			return false

		case gst.MessageError:
			// handle error if possible, otherwise close and return
			stop()
			return false

		case gst.MessageStateChanged:
			_, newState := msg.ParseStateChanged()
			if msg.Source() == SrcName && newState == gst.StatePlaying {
				p.ready.Store(true)
				logger.Infof("[GST-STATE-CHANGE]%v", msg)
			} else {
				logger.Debugf("[GST-STATE-CHANGE]%v", msg)
			}

		default:
			logger.Tracef("[GST] %v", msg)
		}
		return true
	}
}

func (p *Pipeline2) Pause() {
	p.ready.CompareAndSwap(true, false)
	p.pipeline.SetState(gst.StatePaused)
}

func (p *Pipeline2) Resume() {
	p.ready.CompareAndSwap(false, true)
	p.pipeline.SetState(gst.StatePlaying)
}

func (p *Pipeline2) StartBlockingPipeline() {
	// This start will block until EOS received
	p.pipeline.SetState(gst.StatePlaying)
	p.pipeline.GetPipelineBus().TimedPopFiltered(gst.ClockTimeNone, gst.MessageEOS)
	p.pipeline.SetState(gst.StateNull)
	p.pipeline.Unref()
}

// Stop stops the GStreamer Pipeline
func (p *Pipeline2) Stop() {
	p.pipeline.SendEvent(gst.NewEOSEvent())
}

func (p *Pipeline2) IsReady() bool {
	return p.ready.Load()
}

func (p *Pipeline2) onReceiveGSTAudioSample(sink *app.Sink) gst.FlowReturn {
	sample := sink.PullSample()
	if sample == nil {
		return gst.FlowEOS
	}
	// Retrieve the buffer from the sample
	buffer := sample.GetBuffer()
	if buffer == nil {
		return gst.FlowError
	}
	if err := p.onAudioSample(&media.Sample{
		Data:      buffer.Bytes(),
		Timestamp: time.Time{}.Add(buffer.PresentationTimestamp()),
		Duration:  buffer.Duration(),
	}); err != nil {
		return gst.FlowEOS
	}
	return gst.FlowOK
}

func (p *Pipeline2) onReceiveGSTVideoSample(sink *app.Sink) gst.FlowReturn {
	sample := sink.PullSample()
	if sample == nil {
		return gst.FlowEOS
	}
	// Retrieve the buffer from the sample
	buffer := sample.GetBuffer()
	if buffer == nil {
		return gst.FlowError
	}
	if err := p.onVideoSample(&media.Sample{
		Data:      buffer.Bytes(),
		Timestamp: time.Time{}.Add(buffer.PresentationTimestamp()),
		Duration:  buffer.Duration(),
	}); err != nil {
		return gst.FlowEOS
	}
	return gst.FlowOK
}

func (p *Pipeline2) onVideoSample(sample *media.Sample) error {
	if handler, ok := p.onVideoSampleHandler.Load().(func(media.Sample) error); ok {
		return handler(*sample)
	}
	return nil
}

func (p *Pipeline2) onAudioSample(sample *media.Sample) error {
	if handler, ok := p.onAudioSampleHandler.Load().(func(media.Sample) error); ok {
		return handler(*sample)
	}
	return nil
}

func (p *Pipeline2) OnVideoSample(f func(media.Sample) error) {
	p.onVideoSampleHandler.Store(f)
}

func (p *Pipeline2) OnAudioSample(f func(media.Sample) error) {
	p.onAudioSampleHandler.Store(f)
}

func (p *Pipeline2) ChangeEncoderBitrate(bitrate int) error {
	encoder, err := p.pipeline.GetElementByName(encoderName)
	if err != nil {
		return err
	}
	return encoder.SetProperty("bitrate", uint(bitrate))
}
