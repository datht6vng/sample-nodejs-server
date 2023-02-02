// Implementation of gRPC interface
package grpc_interface

import (
	"context"

	"github.com/datht6vng/hcmut-thexis/rtsp-sender/apps/rtsp_sender/service/rtsp_client_service"
	"github.com/datht6vng/hcmut-thexis/rtsp-sender/pkg/grpc"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

func NewGRPCRTSPSenderServer() grpc.RTSPSenderServer {
	return &rtspSender{
		rtspClientService: nil,
	}
}

// Implementation of gRPC interface in "/pkg/grpc"
type rtspSender struct {
	grpc.UnimplementedRTSPSenderServer
	rtspClientService *rtsp_client_service.RTSPClientService
}

func (r *rtspSender) Connect(context.Context, *grpc.ConnectRequest) (*grpc.ConnectReply, error) {
	return nil, status.Errorf(codes.Unimplemented, "method Connect not implemented")
}
func (r *rtspSender) Disconnect(context.Context, *grpc.DisconnectRequest) (*grpc.DisconnectReply, error) {
	return nil, status.Errorf(codes.Unimplemented, "method Disconnect not implemented")
}
