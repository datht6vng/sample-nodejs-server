## BUILDER
FROM golang:alpine as builder

ENV CGO_ENABLED=0
ENV GO111MODULE=on
ENV GOOS=linux 

WORKDIR /services/hcmut-thesis/ion-sfu

COPY . .

RUN go mod download
RUN go build -a -installsuffix cgo -o ./cmd/signal/allrpc/main ./cmd/signal/allrpc

## OS
FROM alpine

WORKDIR /services/hcmut-thesis/ion-sfu

RUN apk add --no-cache bash
RUN apk add --no-cache tzdata 
RUN cp /usr/share/zoneinfo/Asia/Ho_Chi_Minh /etc/localtime 
RUN echo "Asia/Ho_Chi_Minh" > /etc/timezone  
RUN apk --no-cache add ca-certificates

COPY --from=builder /services/hcmut-thesis/ion-sfu/cmd/signal/allrpc/main .
COPY --from=builder /services/hcmut-thesis/ion-sfu/sfu.toml /configs/sfu.toml

ENTRYPOINT ["main"]
CMD ["-c", "/configs/sfu.toml"]