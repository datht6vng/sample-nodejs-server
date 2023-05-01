# Start virtual rtsp server
rtspServer=192.168.0.107:rtsp://192.168.0.107:8554  ./rtsp-simple-server  

# Push data to rtsp server
gst-launch-1.0 -e rtspclientsink "location=rtsp://127.0.0.1:8555/1" name=sink \
	v4l2src device=/dev/video0 ! videoconvert ! videorate ! video/x-raw,framerate=60/1,width=1280,height=720 ! x264enc tune=zerolatency speed-preset=veryfast ! h264parse ! queue ! sink. \
	audiotestsrc wave=ticks apply-tick-ramp=true tick-interval=100000000 marker-tick-period=10 sine-periods-per-tick=10 freq=10000 ! audioconvert ! opusenc ! opusparse ! queue ! sink.


gst-launch-1.0 -e v4l2src device=/dev/video0 ! video/x-raw,width=1280,height=720 ! videoconvert ! x264enc tune=zerolatency speed-preset=veryfast ! h264parse ! queue ! rtspclientsink location=rtsp://localhost:8554/test
# Test
gst-launch-1.0 -v rtspsrc location="rtsp://127.0.0.1:8554/1" name=demux \
	demux. ! queue ! application/x-rtp ! rtph264depay ! h264parse ! avdec_h264 ! videoconvert ! autovideosink sync=false \
	demux. ! queue ! application/x-rtp ! rtpopusdepay ! opusparse ! opusdec ! audioconvert ! audioresample ! autoaudiosink sync=false




gst-launch-1.0  rtspsrc location=rtsp://127.0.0.1:8555/1 name=demux \
demux. ! queue ! application/x-rtp ! rtpopusdepay ! avdec_opus ! audioconvert ! audioresample  ! opusenc  ! appsink name=audiosink  demux. ! queue ! application/x-rtp ! rtph264depay ! avdec_h264 ! videoconvert ! videoscale  ! x264enc speed-preset=ultrafast tune=zerolatency !  tee name=video_tee \
video_tee. ! queue ! video/x-h264,stream-format=byte-stream  ! appsink name=videosink  \
video_tee. ! queue ! rtspclientsink location=rtsp://127.0.0.1:8554/1 


gst-launch-1.0 -v rtspsrc location="rtsp://admin:Dientoan@123@tris.ddns.net:5564/Streaming/Channels/102?transportmode=unicast&profile=Profile_2" user-id=admin user-pw=Dientoan@123 name=demux \
	demux. ! queue ! application/x-rtp ! rtph264depay ! h264parse ! avdec_h264 ! videoconvert ! queue ! autovideosink sync=false \
	demux. ! queue ! application/x-rtp ! rtpopusdepay ! opusparse ! opusdec ! audioconvert ! audioresample ! queue ! autoaudiosink sync=false



