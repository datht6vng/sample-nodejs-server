package node

import (
	"context"
	"errors"
	"math/rand"
	"strings"
	"time"

	"github.com/redis/go-redis/v9"
)

const keepAliveServicePrefix = "redis_service_keep_alive"
const keepAliveRoomPrefix = "redis_service_room_alive"
const connectionSetKey = "redis_service_connection_set"
const roomPrefix = "redis_sfu_room"
const roomSetPrefix = "redis_sfu_room_set"
const seperator = ":"

func BuildKeepAliveServiceKey(service, nodeID string) string {
	return keepAliveServicePrefix + seperator + service + seperator + nodeID
}

func GetNodeID(id string) string {
	components := strings.Split(id, seperator)
	if len(components) < 3 {
		return ""
	}
	return components[2]
}

func IsServiceNode(service string, id string) bool {
	components := strings.Split(id, seperator)
	if len(components) < 2 {
		return false
	}
	return service == components[1]
}

func BuildRoomSetKeyOfService(postFix string) string {
	return roomSetPrefix + seperator + postFix
}

func BuildRoomKey(roomName string) string {
	return roomPrefix + seperator + roomName
}

func SetOrGetSFUAddressForRoom(r *redis.Client, roomName string) (string, error) {
	ctx := context.Background()
	if r == nil {
		return "", errors.New("No Redis connection")
	}
	roomKey := BuildRoomKey(roomName)
	sfuNodeID := r.Get(ctx, roomKey).Val()
	if sfuNodeID == "" {
		currentSFUIDs := r.SMembers(ctx, connectionSetKey).Val()
		min := 0
		max := len(currentSFUIDs)

		connectionID := currentSFUIDs[rand.Intn(max-min)+min]
		sfuNodeID = GetNodeID(connectionID)

		ok := r.SetNX(ctx, roomKey, sfuNodeID, 24*time.Hour).Val()

		if !ok {
			sfuNodeID = r.Get(ctx, roomKey).Val()
		} else {
			r.SAdd(ctx, BuildRoomSetKeyOfService(connectionID), roomKey)
		}
	}
	return sfuNodeID, nil
}

func RemoveRoom(r *redis.Client, roomName string) error {
	ctx := context.Background()
	if r == nil {
		return errors.New("No Redis connection")
	}
	roomKey := BuildRoomKey(roomName)
	sfuNodeID := r.Get(ctx, roomKey).Val()
	pipeline := r.Pipeline()
	pipeline.Del(ctx, roomKey)
	pipeline.SRem(ctx, sfuNodeID, roomKey)
	pipeline.Exec(ctx)
	return nil
}
