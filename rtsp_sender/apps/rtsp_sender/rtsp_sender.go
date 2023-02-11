package rtsp_sender

import (
	"bytes"
	"fmt"
	"net"
	"os/exec"

	"github.com/datht6vng/hcmut-thexis/rtsp-sender/apps/rtsp_sender/interface/grpc_interface"
	"github.com/datht6vng/hcmut-thexis/rtsp-sender/apps/rtsp_sender/service/rtsp_client_service"
	"github.com/datht6vng/hcmut-thexis/rtsp-sender/pkg/config"
	grpc_pb "github.com/datht6vng/hcmut-thexis/rtsp-sender/pkg/grpc"
	"github.com/datht6vng/hcmut-thexis/rtsp-sender/pkg/logger"
	"github.com/juju/errors"
	"google.golang.org/grpc"
)

type Handler struct {
	// NodeID
	nodeID string
	// gRPC interface
	grpcRTSPSenderServer grpc_pb.RTSPSenderServer
	// HTTP interface
	// RTSP interface
	// Repository
}

func NewHandler(nodeID string) (*Handler, error) {
	handler := Handler{}
	handler.nodeID = nodeID

	// Service
	rtspClientService, err := rtsp_client_service.NewRTSPClientService()
	if err != nil {
		return nil, errors.Annotate(err, "cannot create rtsp client service")
	}
	// gRPC Server
	handler.grpcRTSPSenderServer = grpc_interface.NewGRPCRTSPSenderServer(rtspClientService)

	return &handler, nil
}

func (h *Handler) Start() error {
	// gRPC Interface
	if err := h.ServeGRPC(); err != nil {
		return errors.Annotate(err, "cannot start gRPC service")
	}
	// HTTP Interface

	// RTSP Interface
	if err := h.ServeRTSP(); err != nil {
		return errors.Annotate(err, "cannot start RTSP service")
	}
	return nil
}

func (h *Handler) ServeGRPC() error {
	grpcAddress := fmt.Sprintf("localhost:%d", config.Config.RTSPSenderConfig.Port)
	grpcListener, err := net.Listen("tcp", grpcAddress)
	if err != nil {
		return errors.Annotate(err, fmt.Sprintf("cannot listen on %s", grpcAddress))
	}

	var opts []grpc.ServerOption
	grpcServer := grpc.NewServer(opts...)
	grpc_pb.RegisterRTSPSenderServer(grpcServer, h.grpcRTSPSenderServer)

	logger.Infof("Serve gRPC on: %v", grpcAddress)
	go func() {
		if err := grpcServer.Serve(grpcListener); err != nil {
			logger.Infof("gRPC server runtime error: %v", err)
		}
	}()
	return nil
}

func (h *Handler) ServeRTSP() error {
	logger.Infof("Serve RTSP with rtsp simple server, config in /pkg/rtsp-server-sdk")
	var out bytes.Buffer
	cmd := exec.Command("./rtsp-simple-server")
	cmd.Stdout = &out
	cmd.Dir = "./pkg/rtsp_server_sdk"
	logger.Infof("Start rtsp-simple-server with command: %v", cmd.String())
	go cmd.Run()
	return nil
}
