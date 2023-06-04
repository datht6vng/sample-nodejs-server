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

const rtspConnectionPrefix = "redis_rtsp_connection"
const rtspConnectionSetPrefix = "redis_rtsp_connection_set"

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

func SetOrGetSFUAddressForRoom(r redis.UniversalClient, roomName string) (string, error) {
	ctx := context.Background()
	if r == nil {
		return "", errors.New("No Redis connection")
	}
	roomKey := BuildRoomKey(roomName)
	sfuNodeID := r.Get(ctx, roomKey).Val()
	if sfuNodeID == "" {
		currentSFUIDs := GetNodesOfService(r, ServiceSFU)
		if len(currentSFUIDs) == 0 {
			return "", errors.New("No SFU node found")
		}

		min := 0
		max := len(currentSFUIDs)

		var connectionID string
		if max == 0 {
			connectionID = currentSFUIDs[0]
		} else {
			connectionID = currentSFUIDs[rand.Intn(max-min)+min]
		}

		sfuNodeID = GetNodeID(connectionID)

		ok := r.SetNX(ctx, roomKey, sfuNodeID, 15*time.Minute).Val()

		if !ok {
			sfuNodeID = r.Get(ctx, roomKey).Val()
		} else {
			r.SAdd(ctx, BuildRoomSetKeyOfService(connectionID), roomKey)
		}
	}
	return sfuNodeID, nil
}

func RemoveRoom(r redis.UniversalClient, nodeID, roomName string) error {
	ctx := context.Background()
	if r == nil {
		return errors.New("No Redis connection")
	}
	roomKey := BuildRoomKey(roomName)
	pipeline := r.Pipeline()
	pipeline.Del(ctx, roomKey)
	pipeline.SRem(ctx, BuildRoomSetKeyOfService(BuildKeepAliveServiceKey(ServiceSFU, nodeID)), roomKey)
	pipeline.Exec(ctx)
	return nil
}

func GetNodesOfService(r redis.UniversalClient, service string) []string {
	connectionSet := r.SMembers(context.Background(), connectionSetKey).Val()
	currentNodeIDs := []string{}
	for _, connectionID := range connectionSet {
		if IsServiceNode(service, connectionID) {
			// Clean dangling room address
			currentNodeIDs = append(currentNodeIDs, connectionID)
		}
	}
	return currentNodeIDs
}

func BuildRTSPConnectionSetKey(postFix string) string {
	return rtspConnectionSetPrefix + seperator + postFix
}

func BuildRTSPConnectionKey(connectionURL string) string {
	return rtspConnectionPrefix + seperator + connectionURL
}

func SetRTSPConnection(r redis.UniversalClient, connectionURL string, nodeID string) bool {
	rtspConnectionKey := BuildRTSPConnectionKey(connectionURL)
	ok := r.SetNX(context.Background(), rtspConnectionKey, nodeID, 0).Val()
	if ok {
		go func() {
			connectionID := BuildKeepAliveServiceKey(ServiceController, nodeID)
			rtspConenctionSetKey := BuildRTSPConnectionSetKey(connectionID)
			r.SAdd(context.Background(), rtspConenctionSetKey, rtspConnectionKey)
		}()
	}
	return ok
}

func DeleteRTSPConnection(r redis.UniversalClient, connectionURL string) error {
	return r.Del(context.Background(), BuildRTSPConnectionKey(connectionURL)).Err()
}

func GetRTSPConnectionNodeID(r redis.UniversalClient, connectionURL string) string {
	return r.Get(context.Background(), BuildRTSPConnectionKey(connectionURL)).Val()
}
