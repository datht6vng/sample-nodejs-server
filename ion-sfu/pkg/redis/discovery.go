package redis

import (
	"context"
	"time"

	"github.com/redis/go-redis/v9"
)

const keepAlivePrefix = "redis_keep_alive"
const ConnectionSetKey = "redis_connection_set"
const roomPrefix = "redis_room"

func BuildKeepAliveKey(nodeID string) string {
	return keepAlivePrefix + ":" + nodeID
}

func BuildRoomKey(roomName string) string {
	return roomPrefix + ":" + roomName
}

func KeepAlive(redis *redis.Client, nodeID string) {
	ctx := context.Background()
	ticker := time.NewTicker(3 * time.Second)
	key := BuildKeepAliveKey(nodeID)
	redis.SAdd(ctx, ConnectionSetKey, nodeID)
	go func() {
		for {
			select {
			case <-ticker.C:
				redis.Set(ctx, key, "OK", 9*time.Second)
			}
		}
	}()
}

func StartCleaner(redis *redis.Client) {
	ctx := context.Background()
	ticker := time.NewTicker(9 * time.Second)
	go func() {
		for {
			select {
			case <-ticker.C:
				connectionSets := redis.SMembers(ctx, ConnectionSetKey).Val()
				for _, connection := range connectionSets {
					if redis.TTL(ctx, BuildKeepAliveKey(connection)).Val() > 0 {
						continue
					}
					redis.SRem(ctx, ConnectionSetKey, connection)
				}
			}
		}
	}()
}
