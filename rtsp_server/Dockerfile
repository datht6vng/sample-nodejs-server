FROM alpine
WORKDIR /services/hcmut-thesis/rtsp_server
COPY ./rtsp-simple-server ./rtsp-simple-server
COPY ./rtsp-simple-server.yml /configs/rtsp_server/rtsp-simple-server.yml
ENTRYPOINT ["./rtsp-simple-server"]
CMD ["/configs/rtsp_server/rtsp-simple-server.yml"]