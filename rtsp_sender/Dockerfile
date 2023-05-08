## BUILDER
FROM alpine:edge as builder

WORKDIR /services/hcmut-thesis/rtsp_sender
ENV GO111MODULE=on
ENV CGO_ENABLED=1
ENV GOOS=linux
RUN echo http://nl.alpinelinux.org/alpine/edge/testing >> /etc/apk/repositories
RUN apk add go
RUN apk add \
    gstreamer \
    gstreamer-dev \
    gst-plugins-base \
    gst-plugins-base-dev \
    gst-plugins-good \
    gst-plugins-bad \
    gst-plugins-ugly \
    gstreamer-tools \
    gst-libav \
    gst-rtsp-server \
    ffmpeg

RUN apk add \
build-base \
pkgconfig

COPY . .

RUN go mod download
RUN go build -a -installsuffix cgo -o ./cmd/rtsp_sender/main ./cmd/rtsp_sender

## OS
FROM alpine

WORKDIR /services/hcmut-thesis/ion-sfu

RUN apk add --no-cache bash
RUN apk add --no-cache tzdata 
RUN cp /usr/share/zoneinfo/Asia/Ho_Chi_Minh /etc/localtime 
RUN echo "Asia/Ho_Chi_Minh" > /etc/timezone  
RUN apk --no-cache add ca-certificates && apk --no-cache add curl

COPY --from=builder /services/hcmut-thesis/rtsp_sender/cmd/rtsp_sender/main .
COPY --from=builder /services/hcmut-thesis/rtsp_sender/rtsp_sender.toml /configs/rtsp_sender.toml
ENTRYPOINT ["main"]
CMD ["-c", "/configs/rtsp_sender.toml"]