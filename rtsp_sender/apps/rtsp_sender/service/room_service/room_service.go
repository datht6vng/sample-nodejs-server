package room_service

import (
	"context"
	"errors"
	"math/rand"

	redisPkg "github.com/dathuynh1108/hcmut-thexis/rtsp-sender/pkg/redis"
	"github.com/redis/go-redis/v9"
)

type RoomService interface {
	GetSFUNode(roomName string) (string, error)
}

func NewRoomService(r *redis.Client) (RoomService, error) {
	return &service{
		r: r,
	}, nil
}

type service struct {
	r *redis.Client
}

func (s *service) GetSFUNode(roomName string) (string, error) {
	ctx := context.Background()
	if s.r == nil {
		return "", errors.New("No Redis connection")
	}
	currentSFUNode := s.r.Get(ctx, redisPkg.BuildRoomKey(roomName)).Val()
	if currentSFUNode == "" {
		currentSFUs := s.r.SMembers(ctx, redisPkg.ConnectionSetKey).Val()
		min := 0
		max := len(currentSFUs)
		s.r.Set(ctx, redisPkg.BuildRoomKey(roomName), currentSFUs[rand.Intn(max-min)+min], 0)
	}
	return currentSFUNode, nil
}
