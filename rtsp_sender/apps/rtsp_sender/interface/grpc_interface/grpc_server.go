// Implementation of gRPC interface
package grpc_interface

import (
	"context"
	"fmt"
	"net/http"

	"github.com/datht6vng/hcmut-thexis/rtsp-sender/apps/rtsp_sender/service/rtsp_client_service"
	"github.com/datht6vng/hcmut-thexis/rtsp-sender/pkg/grpc"
)

func NewGRPCRTSPSenderServer(rtspClientService *rtsp_client_service.RTSPClientService) grpc.RTSPSenderServer {
	return &rtspSender{
		rtspClientService: rtspClientService,
	}
}

// Implementation of gRPC interface in "/pkg/grpc"
type rtspSender struct {
	grpc.UnimplementedRTSPSenderServer
	rtspClientService *rtsp_client_service.RTSPClientService
}

func (r *rtspSender) Connect(ctx context.Context, request *grpc.ConnectRequest) (*grpc.ConnectReply, error) {
	if err := r.rtspClientService.ConnectRTSPClient(request.ClientID, request.ConnectClientAddress, request.EnableRTSPRelay); err != nil {
		return &grpc.ConnectReply{
			Code:    http.StatusInternalServerError,
			Message: err.Error(),
		}, nil
	}
	return &grpc.ConnectReply{
		Code:    http.StatusOK,
		Message: fmt.Sprintf("Connect successfully to %v", request.ConnectClientAddress),
	}, nil
}

func (r *rtspSender) Disconnect(ctx context.Context, request *grpc.DisconnectRequest) (*grpc.DisconnectReply, error) {
	if err := r.rtspClientService.DisconnectRTSPClient(request.ClientID, request.ConnectClientAddress); err != nil {
		return &grpc.DisconnectReply{
			Code:    http.StatusInternalServerError,
			Message: err.Error(),
		}, nil
	}
	return &grpc.DisconnectReply{
		Code:    http.StatusOK,
		Message: fmt.Sprintf("Disconnect successfully to %v", request.ConnectClientAddress),
	}, nil
}
