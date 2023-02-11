# Start virtual rtsp server
rtspServer=192.168.0.107:rtsp://192.168.0.107:8554  ./rtsp-simple-server  

# Push data to rtsp server
gst-launch-1.0 -e rtspclientsink location=rtsp://localhost:8554/test name=sink \
	v4l2src device=/dev/video0 ! video/x-raw,width=1280,height=720 ! videoconvert ! x264enc tune=zerolatency speed-preset=veryfast ! h264parse ! queue ! sink. \
	audiotestsrc wave=ticks apply-tick-ramp=true tick-interval=100000000 marker-tick-period=10 sine-periods-per-tick=10 freq=10000 ! audioconvert ! opusenc ! opusparse ! queue ! sink.


gst-launch-1.0 -e v4l2src device=/dev/video0 ! video/x-raw,width=1280,height=720 ! videoconvert ! x264enc tune=zerolatency speed-preset=veryfast ! h264parse ! queue ! rtspclientsink location=rtsp://localhost:8554/test
# Test
gst-launch-1.0 -v rtspsrc location=rtsp://192.168.0.107:8554/test name=demux \
	demux. ! queue ! application/x-rtp ! rtph264depay ! avdec_h264 ! videoconvert ! autovideosink sync=false \
	demux. ! queue ! application/x-rtp ! rtpopusdepay ! opusdec ! audioconvert ! audioresample ! autoaudiosink sync=false
	
gst-launch-1.0 -v rtspsrc location=rtspt://192.168.0.107:8554/test ! application/x-rtp, payload=96 ! rtph264depay ! avdec_h264 ! videoconvert ! autovideosink sync=false