package gst

import (
	"sync"
	"time"

	"github.com/datht6vng/hcmut-thexis/rtsp-sender/pkg/logger"
	"github.com/tinyzimmer/go-glib/glib"
	"github.com/tinyzimmer/go-gst/gst"
	"github.com/tinyzimmer/go-gst/gst/app"
)

const (
	MaxAliveTime = time.Hour
	srcName      = "src"
)

type Pipeline2 struct {
	pipeline    *gst.Pipeline
	main        *glib.MainLoop
	autoCleaner *time.Timer
	mu          sync.RWMutex
}

func CreatePipeline2(pipelineStr string) (*Pipeline2, error) {
	pipeline, err := gst.NewPipelineFromString(pipelineStr)
	if err != nil {
		return nil, err
	}

	if err != nil {
		return nil, err
	}

	return &Pipeline2{
		pipeline: pipeline,
	}, nil
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
			// _, newState := msg.ParseStateChanged()
			// if newState != gst.StatePlaying {
			// 	return true
			// }
			logger.Tracef("[GST-STATE-CHANGE]%v", msg)

		default:
			logger.Tracef("[GST] %v", msg)
		}
		return true
	}
}

func (p *Pipeline2) Pause() {
	p.pipeline.SetState(gst.StatePaused)
}

func (p *Pipeline2) Resume() {
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

// Push pushes a buffer on the appsrc of the GStreamer Pipeline
func (p *Pipeline2) Push(buffer []byte) {
	ele, err := p.pipeline.GetElementByName("src")
	if err != nil {
		return
	}
	src := app.SrcFromElement(ele)
	b := gst.NewBufferFromBytes(buffer)
	src.PushBuffer(b)
}
