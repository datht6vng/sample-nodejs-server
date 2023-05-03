package rtsp_sender

import (
	"fmt"
	"net"
	"os/exec"

	"github.com/dathuynh1108/hcmut-thexis/rtsp-sender/apps/rtsp_sender/interface/grpc_interface"
	"github.com/dathuynh1108/hcmut-thexis/rtsp-sender/apps/rtsp_sender/interface/http_interface"
	"github.com/dathuynh1108/hcmut-thexis/rtsp-sender/apps/rtsp_sender/service/rtsp_client_service"
	"github.com/dathuynh1108/hcmut-thexis/rtsp-sender/pkg/config"
	grpc_pb "github.com/dathuynh1108/hcmut-thexis/rtsp-sender/pkg/grpc"
	"github.com/dathuynh1108/hcmut-thexis/rtsp-sender/pkg/logger"
	"github.com/juju/errors"
	"google.golang.org/grpc"
)

type Handler struct {
	// NodeID
	nodeID string
	// gRPC interface
	grpcRTSPSenderServer grpc_pb.RTSPSenderServer
	// HTTP interface
	httpRTSPSenderServer http_interface.HTTPRTSPSenderServer
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

	// HTTP Server
	handler.httpRTSPSenderServer = http_interface.NewHTTPRTSPSenderServer()
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

	// HTTP Interface
	if err := h.ServeHTTP(); err != nil {
		return errors.Annotate(err, "cannot start HTTP service")
	}

	return nil
}

func (h *Handler) ServeGRPC() error {
	grpcAddress := fmt.Sprintf("0.0.0.0:%d", config.Config.RTSPSenderConfig.GRPCConfig.Port)
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
	logger.Infof("Serve RTSP with rtsp simple server, config path:%v", config.Config.RTSPSenderConfig.RTSPRelayConfig.RTSPRelayServerConfigPath)
	cmd := exec.Command("./rtsp-simple-server", config.Config.RTSPSenderConfig.RTSPRelayConfig.RTSPRelayServerConfigPath)
	cmd.Dir = fmt.Sprintf("%v", config.Config.RTSPSenderConfig.RTSPRelayConfig.RTSPRelayServerPath)
	logger.Infof("Start rtsp-simple-server with command: %v", cmd.String())
	go func() {
		if err := cmd.Run(); err != nil {
			logger.Errorf("RTSP Relay Server Error: %v", err)
		}
	}()
	return nil
}

func (h *Handler) ServeHTTP() error {
	address := fmt.Sprintf("0.0.0.0:%v", config.Config.RTSPSenderConfig.HTTPConfig.Port)
	logger.Infof("Serve HTTP on address: %v", address)
	go func() {
		if err := h.httpRTSPSenderServer.Start(address); err != nil {
			logger.Errorf("HTTP Server Error: %v", err)
		}
	}()
	return nil
}
