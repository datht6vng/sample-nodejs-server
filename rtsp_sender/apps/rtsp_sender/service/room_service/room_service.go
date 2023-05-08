package room_service

import (
	"errors"
	"math/rand"

	"github.com/dathuynh1108/hcmut-thexis/rtsp-sender/pkg/redis"
)

type RoomService interface {
	GetSFUNode(roomName string) (string, error)
}

func NewRoomService(r *redis.Redis) (RoomService, error) {
	return &service{
		r: r,
	}, nil
}

type service struct {
	r *redis.Redis
}

func (s *service) GetSFUNode(roomName string) (string, error) {
	if s.r == nil {
		return "", errors.New("No Redis connection")
	}
	currentSFUNode := s.r.Get(redis.BuildRoomKey(roomName))
	if currentSFUNode == "" {
		currentSFUs := s.r.SMembers(redis.ConnectionSetKey)
		min := 0
		max := len(currentSFUs)
		s.r.Set(redis.BuildRoomKey(roomName), currentSFUs[rand.Intn(max-min)+min], 0)
	}
	return currentSFUNode, nil
}
