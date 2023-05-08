FROM golang:alpine

RUN export GO111MODULE=on 
RUN go install github.com/golang/protobuf/protoc-gen-go@latest
RUN go install google.golang.org/grpc/cmd/protoc-gen-go-grpc@latest
RUN echo $GOPATH
RUN apk --no-cache add protobuf
RUN apk --no-cache add protobuf-dev

WORKDIR /workspace
