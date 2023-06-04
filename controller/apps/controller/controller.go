package controller

import (
	"context"
	"fmt"
	"net"
	"time"

	"github.com/dathuynh1108/hcmut-thesis/controller/apps/controller/entity"
	"github.com/dathuynh1108/hcmut-thesis/controller/apps/controller/interface/grpc_interface"
	"github.com/dathuynh1108/hcmut-thesis/controller/apps/controller/interface/http_interface"
	"github.com/dathuynh1108/hcmut-thesis/controller/apps/controller/service/room_service"
	"github.com/dathuynh1108/hcmut-thesis/controller/apps/controller/service/rtsp_client_service"
	"github.com/dathuynh1108/hcmut-thesis/controller/apps/controller/uploader"
	"github.com/dathuynh1108/hcmut-thesis/controller/pkg/config"
	grpc_pb "github.com/dathuynh1108/hcmut-thesis/controller/pkg/grpc"
	"github.com/dathuynh1108/hcmut-thesis/controller/pkg/logger"
	"github.com/dathuynh1108/hcmut-thesis/controller/pkg/node"
	"github.com/dathuynh1108/hcmut-thesis/controller/pkg/rediswrapper"
	"github.com/dathuynh1108/redisrpc"
	"github.com/juju/errors"
	"github.com/redis/go-redis/v9"
	"google.golang.org/grpc"
	"google.golang.org/protobuf/proto"
)

type Handler struct {
	// NodeID
	nodeID string
	// gRPC interface
	grpcControllerServer grpc_pb.ControllerServer
	// HTTP interface
	httpControllerServer http_interface.HTTPControllerServer
	// RTSP interface

	redis redis.UniversalClient

	// Repository
	Node *node.Node
}

func NewHandler(nodeID string) (*Handler, error) {
	handler := Handler{}
	handler.nodeID = nodeID

	r, err := rediswrapper.NewUniversalClient(
		&rediswrapper.Config{
			Address:   config.Config.RedisConfig.Address,
			Password:  config.Config.RedisConfig.Password,
			Database:  config.Config.RedisConfig.Database,
			IsCluster: config.Config.RedisConfig.IsCluster,
		},
	)
	if err != nil {
		return nil, fmt.Errorf("Cannot create redis client: %v", err)
	}

	logger.Infof("Redis client conneced on: %v", config.Config.RedisConfig.Address)

	handler.redis = r
	handler.Node = node.NewNode(r, node.ServiceController, handler.nodeID)

	// Flush old data and keep node alive
	rtspConnectionSetKey := node.BuildRTSPConnectionSetKey(node.BuildKeepAliveServiceKey(node.ServiceController, config.Config.NodeID))
	rtspConnectionKeys := r.SMembers(context.Background(), rtspConnectionSetKey).Val()

	pipeline := r.Pipeline()
	for _, rtspConnectionKey := range rtspConnectionKeys {
		pipeline.Del(context.Background(), rtspConnectionKey)
	}
	pipeline.Del(context.Background(), rtspConnectionSetKey)
	pipeline.Exec(context.Background())

	handler.Node.KeepAlive(3 * time.Second) // Current not neccessary
	handler.Node.StartCleaner(9 * time.Second)

	// Uploader
	uploader, err := uploader.NewGoogleUploader(config.Config.UploaderConfig.Creditials)
	if err != nil {
		return nil, errors.Annotate(err, "cannot create uploader")
	}

	// Service
	rtspClientService, err := rtsp_client_service.NewRTSPClientService(r, uploader)
	if err != nil {
		return nil, errors.Annotate(err, "cannot create rtsp client service")
	}

	roomService, err := room_service.NewRoomService(r)
	if err != nil {
		return nil, errors.Annotate(err, "cannot create room service")
	}

	// gRPC Server
	handler.grpcControllerServer = grpc_interface.NewGRPCControllerServer(rtspClientService)

	// HTTP Server
	handler.httpControllerServer = http_interface.NewHTTPControllerServer(roomService)

	listenForRedisEvents := func() {
		go func() {
			pubsub := r.Subscribe(context.Background(), entity.RedisEventChannel)
			for msg := range pubsub.Channel() {
				go func(msg *redis.Message) {
					message := &grpc_pb.EventMessage{}
					err := proto.Unmarshal([]byte(msg.Payload), message)
					if err != nil {
						logger.Errorf("Unmarshal error: %v", err)
					}
					switch message.Payload.(type) {
					case *grpc_pb.EventMessage_DisconnectPayload:
						payload := message.GetDisconnectPayload()
						rtspClientService.InternalDisconnectRTSPClient(payload.ClientID, payload.ConnectClientAddress)
					}
				}(msg)
			}
		}()
	}
	listenForRedisEvents()
	return &handler, nil
}

func (h *Handler) Start() error {
	// gRPC Interface
	if err := h.ServeGRPC(); err != nil {
		return errors.Annotate(err, "cannot start gRPC service")
	}
	// HTTP Interface

	// RTSP Interface
	// if err := h.ServeRTSP(); err != nil {
	// 	return errors.Annotate(err, "cannot start RTSP service")
	// }

	// HTTP Interface
	if err := h.ServeHTTP(); err != nil {
		return errors.Annotate(err, "cannot start HTTP service")
	}

	// HTTP Interface
	// if err := h.ServeRedisRPC(); err != nil {
	// 	return errors.Annotate(err, "cannot start Redis RPC service")
	// }
	return nil
}

func (h *Handler) ServeGRPC() error {
	grpcAddress := fmt.Sprintf("0.0.0.0:%d", config.Config.ControllerConfig.GRPCConfig.Port)
	grpcListener, err := net.Listen("tcp", grpcAddress)
	if err != nil {
		return errors.Annotate(err, fmt.Sprintf("cannot listen on %s", grpcAddress))
	}

	var opts []grpc.ServerOption
	grpcServer := grpc.NewServer(opts...)
	grpc_pb.RegisterControllerServer(grpcServer, h.grpcControllerServer)

	logger.Infof("Serve gRPC on: %v", grpcAddress)
	go func() {
		if err := grpcServer.Serve(grpcListener); err != nil {
			logger.Infof("gRPC server runtime error: %v", err)
		}
	}()
	return nil
}

// func (h *Handler) ServeRTSP() error {
// 	logger.Infof("Serve RTSP with rtsp simple server, config path:%v", config.Config.ControllerConfig.RTSPRelayConfig.RTSPRelayServerConfigPath)
// 	cmd := exec.Command("./rtsp-simple-server", config.Config.ControllerConfig.RTSPRelayConfig.RTSPRelayServerConfigPath)
// 	cmd.Dir = fmt.Sprintf("%v", config.Config.ControllerConfig.RTSPRelayConfig.RTSPRelayServerPath)
// 	logger.Infof("Start rtsp-simple-server with command: %v", cmd.String())
// 	go func() {
// 		if err := cmd.Run(); err != nil {
// 			logger.Errorf("RTSP Relay Server Error: %v", err)
// 		}
// 	}()
// 	return nil
// }

func (h *Handler) ServeHTTP() error {
	address := fmt.Sprintf("0.0.0.0:%v", config.Config.ControllerConfig.HTTPConfig.Port)
	logger.Infof("Serve HTTP on address: %v", address)
	go func() {
		if err := h.httpControllerServer.Start(address); err != nil {
			logger.Errorf("HTTP Server Error: %v", err)
		}
	}()
	return nil
}

func (h *Handler) ServeRedisRPC() error {
	nodeID := config.Config.NodeID
	logger.Infof("Serve RedisRPC on: %v", nodeID)
	service := redisrpc.NewServer(h.redis, nodeID, logger.GetLogger())
	grpc_pb.RegisterControllerServer(service, h.grpcControllerServer)
	return nil
}
