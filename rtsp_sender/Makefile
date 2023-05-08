BUILD_FLAGS := -ldflags "-X main.gitDescribe=$(shell git describe --always --tags --dirty)" -o peer-calls

.PHONY: coverage report build pack pack-linux

coverage:
	go test ./... -coverprofile=coverage.out

report:
	go tool cover -html=coverage.out

build:
	go build $(BUILD_FLAGS)

pack:
	packr build $(BUILD_FLAGS)

pack-linux:
	GOOS=linux GOARCH=amd64 packr build $(BUILD_FLAGS)

proto:
	docker build -t protoc-builder ./pkg/proto && \
	docker run -v $(CURDIR):/workspace protoc-builder \
	protoc \
	--go_opt=module=github.com/dathuynh1108/hcmut-thexis/rtsp-sender --go_out=. \
	--go-grpc_opt=module=github.com/dathuynh1108/hcmut-thexis/rtsp-sender --go-grpc_out=. \
	pkg/proto/*.proto

build-docker:
	docker build -t rtsp_sender .