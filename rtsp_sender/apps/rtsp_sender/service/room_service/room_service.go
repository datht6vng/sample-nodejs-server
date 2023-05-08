package room_service

import (
	"context"
	"errors"
	"math/rand"
	"time"

	redisPkg "github.com/dathuynh1108/hcmut-thexis/rtsp-sender/pkg/redis"
	"github.com/dathuynh1108/redisrpc"
	"github.com/pion/ion/proto/rtc"
	"github.com/redis/go-redis/v9"
)

type RoomService interface {
	SetOrGetSFUNode(roomName string) (string, error)
	MakeRedisRPCClientStream(svcid string, nid string) rtc.RTCClient
}

func NewRoomService(r *redis.Client) (RoomService, error) {
	return &service{
		r: r,
	}, nil
}

type service struct {
	r *redis.Client
}

func (s *service) SetOrGetSFUNode(roomName string) (string, error) {
	ctx := context.Background()
	if s.r == nil {
		return "", errors.New("No Redis connection")
	}
	currentSFUNode := s.r.Get(ctx, redisPkg.BuildRoomKey(roomName)).Val()
	if currentSFUNode == "" {
		currentSFUs := s.r.SMembers(ctx, redisPkg.ConnectionSetKey).Val()
		min := 0
		max := len(currentSFUs)
		currentSFUNode = currentSFUs[rand.Intn(max-min)+min]
		ok := s.r.SetNX(ctx, redisPkg.BuildRoomKey(roomName), currentSFUNode, 24*time.Hour).Val()
		if !ok {
			currentSFUNode = s.r.Get(ctx, redisPkg.BuildRoomKey(roomName)).Val()
		}
	}
	return currentSFUNode, nil
}

func (s *service) MakeRedisRPCClientStream(svcid string, nid string) rtc.RTCClient {
	return rtc.NewRTCClient(redisrpc.NewClient(s.r, svcid, nid))
}
