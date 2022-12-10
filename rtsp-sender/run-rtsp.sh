rtspServer=192.168.0.107:rtsp://192.168.0.107:8554  ./rtsp-simple-server  
gst-launch-1.0 videotestsrc ! queue ! x264enc ! rtspclientsink location=rtsp://localhost:8554/test
gst-launch-1.0 -e v4l2src device=/dev/video0 ! video/x-raw,width=1280,height=720 ! videoconvert ! x264enc tune=zerolatency speed-preset=veryfast !  rtph264pay ! queue ! rtspclientsink location=rtsp://localhost:8554/test