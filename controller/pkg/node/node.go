package node

import (
	"context"
	"time"

	"github.com/dathuynh1108/hcmut-thesis/controller/pkg/logger"
	"github.com/redis/go-redis/v9"
)

type Node struct {
	redis   *redis.Client
	nodeID  string
	service string
}

func NewNode(redis *redis.Client, service, nodeID string) *Node {
	return &Node{
		redis:   redis,
		service: service,
		nodeID:  nodeID,
	}
}

func (n *Node) KeepAlive(duration time.Duration) {
	go func() {
		ctx := context.Background()
		ticker := time.NewTicker(duration)

		key := BuildKeepAliveServiceKey(n.service, n.nodeID)

		n.redis.SAdd(ctx, connectionSetKey, key)
		for {
			select {
			case <-ticker.C:
				n.redis.SAdd(ctx, connectionSetKey, key)
				n.redis.Set(ctx, key, "", 9*time.Second)
			}
		}
	}()
}

func (n *Node) StartCleaner(duration time.Duration) {
	go func() {
		ctx := context.Background()
		ticker := time.NewTicker(duration)
		for {
			select {
			case <-ticker.C:
				connectionSet := n.redis.SMembers(ctx, connectionSetKey).Val()
				pipeline := n.redis.Pipeline()
				for _, connection := range connectionSet {
					if n.redis.TTL(ctx, connection).Val() > 0 {
						continue
					}
					logger.Infof("Node: %v is dead", connection)
					// Check if this node is a SFU node
					if IsServiceNode(ServiceSFU, connection) {
						// Clean dangling room address
						roomOfServiceKey := BuildRoomSetKeyOfService(connection)
						roomKeys := n.redis.SMembers(ctx, roomOfServiceKey).Val()
						for _, roomKey := range roomKeys {
							logger.Infof("Delete dangling room: %v", roomKey)
							pipeline.Del(ctx, roomKey)
						}
						pipeline.Del(ctx, roomOfServiceKey)
					}
					// Check if this node is a Controller node
					if IsServiceNode(ServiceController, connection) {
						// Clean dangling rtsp connection address
						rtspConnectionSet := BuildRTSPConnectionSetKey(connection)
						rtspConnectionKeys := n.redis.SMembers(ctx, rtspConnectionSet).Val()
						for _, rtspConnection := range rtspConnectionKeys {
							logger.Infof("Delete dangling rtsp connection %v", rtspConnection)
							pipeline.Del(ctx, rtspConnection)
						}
						pipeline.Del(ctx, rtspConnectionSet)
					}
					// Clean dead node
					pipeline.SRem(ctx, connectionSetKey, connection)
				}
				pipeline.Exec(ctx)
			}
		}
	}()
}
