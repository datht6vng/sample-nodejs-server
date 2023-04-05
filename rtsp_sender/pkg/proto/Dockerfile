FROM golang:stretch as builder

RUN go install github.com/golang/protobuf/protoc-gen-go@latest
RUN export GO111MODULE=on && go install google.golang.org/grpc/cmd/protoc-gen-go-grpc@latest

RUN echo $GOPATH

FROM alpine

RUN apk --no-cache add protobuf

COPY --from=builder /go/bin/protoc-gen-go /usr/bin/
COPY --from=builder /go/bin/protoc-gen-go-grpc /usr/bin/

WORKDIR /workspace

CMD ["protoc"]