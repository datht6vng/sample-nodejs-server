package main

import (
	"errors"
)

var (
	ErrorStreamExitNoVideoOnStream = errors.New("Stream Exit No Video On Stream")
	ErrorStreamExitRtspDisconnect  = errors.New("Stream Exit Rtsp Disconnect")
	ErrorStreamExitNoViewer        = errors.New("Stream Exit On Demand No Viewer")
)
