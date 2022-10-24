#!/bin/sh
ffmpeg \
  -re \
  -v info \
  -stream_loop -1 \
  -rtsp_transport tcp \
  -i rtsp://admin:admin@192.168.1.248:8554/live \
  -max_muxing_queue_size 512 \
  -map 0:a:0 \
  -acodec libopus -ab 128k -ac 2 -ar 48000 \
  -map 0:v:0 \
  -pix_fmt yuv420p -c:v h264 -b:v 1000k -deadline realtime -cpu-used 4 \
  -f tee \
  "[select=a:f=rtp:ssrc=11111111:payload_type=101]rtp://127.0.0.1:2001?rtcpport=2016|[select=v:f=rtp:ssrc=22222222:payload_type=102]rtp://127.0.0.1:2014?rtcpport=2009"



# gst-launch-1.0 -v \
# rtpbin name=rtpbin filesrc location="/test.mp4" ! decodebin \
# ! queue \
# ! videoconvert \
# ! x264enc tune=zerolatency \
# ! rtph264pay ! capssetter caps="application/x-rtp,payload=(int)102,clock-rate=(int)90000,ssrc=(uint)22222222,rtcp-fb-nack-pli=(int)1" \
# ! r.send_rtp_sink_0 \
# r.send_rtp_src_0 ! udpsink host=127.0.0.1 port=2006 \
# r.send_rtcp_src_0 ! udpsink host=127.0.0.1 port=2013 sync=false async=false udpsrc \
# ! r.recv_rtcp_sink_0