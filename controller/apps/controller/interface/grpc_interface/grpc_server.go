// Implementation of gRPC interface
package grpc_interface

import (
	"context"
	"fmt"
	"net/http"
	"strings"

	"github.com/dathuynh1108/hcmut-thesis/controller/apps/controller/service/rtsp_client_service"
	"github.com/dathuynh1108/hcmut-thesis/controller/pkg/grpc"
	"github.com/dathuynh1108/hcmut-thesis/controller/pkg/logger"
)

func NewGRPCControllerServer(rtspClientService *rtsp_client_service.RTSPClientService) grpc.ControllerServer {
	return &controller{
		rtspClientService: rtspClientService,
	}
}

// Implementation of gRPC interface in "/pkg/grpc"
type controller struct {
	grpc.UnimplementedControllerServer
	rtspClientService *rtsp_client_service.RTSPClientService
}

func parseRTSPAddress(url string, username string, password string) (string, string, string, error) {
	// If url included username and password, we don't care about username and password pass in
	// Seperator of username, password and url is "@"
	if !strings.Contains(url, "rtsp://") {
		return "", "", "", fmt.Errorf("invalid address")
	}
	if !strings.Contains(url, "@") {
		return url, username, password, nil
	}
	seperatorIndex := strings.LastIndex(url, "@")
	head := url[:seperatorIndex]
	address := url[seperatorIndex+1:]
	headSplit := strings.Split(head, "://")
	if len(headSplit) < 2 {
		return "", "", "", fmt.Errorf("invalid address, username, password")
	}
	method := headSplit[0]
	usernameAndPassword := strings.Split(headSplit[1], ":")
	username = usernameAndPassword[0]
	password = usernameAndPassword[1]
	return method + "://" + address, username, password, nil
}

func (r *controller) Connect(ctx context.Context, request *grpc.ConnectRequest) (*grpc.ConnectReply, error) {
	var rtspRelayAddress string
	var err error
	clientAddress, username, password, err := parseRTSPAddress(
		request.ConnectClientAddress,
		request.Username,
		request.Password,
	)
	if err != nil {
		return &grpc.ConnectReply{
			Code:    http.StatusInternalServerError,
			Message: err.Error(),
		}, nil
	}
	logger.Infof("Request connect to: %v, username: %v, password: %v", clientAddress, username, password)

	if rtspRelayAddress, err = r.rtspClientService.ConnectRTSPClient(
		request.ClientID,
		clientAddress,
		username,
		password,
		request.EnableRTSPRelay,
		request.EnableRecord,
	); err != nil {
		return &grpc.ConnectReply{
			Code:    http.StatusInternalServerError,
			Message: err.Error(),
		}, nil
	}
	return &grpc.ConnectReply{
		Code:    http.StatusOK,
		Message: fmt.Sprintf("Connect successfully to %v", request.ConnectClientAddress),
		Data: &grpc.ConnectReplyData{
			RelayAddress: rtspRelayAddress,
		},
	}, nil
}

func (r *controller) Disconnect(ctx context.Context, request *grpc.DisconnectRequest) (*grpc.DisconnectReply, error) {
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

func (r *controller) GetRecordFile(ctx context.Context, request *grpc.GetRecordFileRequest) (*grpc.GetRecordFileReply, error) {
	fileAddress, startTime, endTime, err := r.rtspClientService.GetRecordFile(request.ClientID, request.Timestamp)
	if err != nil {
		return &grpc.GetRecordFileReply{
			Code:    http.StatusInternalServerError,
			Message: err.Error(),
		}, nil
	}
	return &grpc.GetRecordFileReply{
		Code:        http.StatusOK,
		Message:     fmt.Sprintf("Get record file successfully for %v", request.ClientID),
		FileAddress: fileAddress,
		StartTime:   startTime,
		EndTime:     endTime,
	}, nil
}
