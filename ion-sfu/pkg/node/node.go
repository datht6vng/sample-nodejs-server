package node

import (
	"context"
	"time"

	"github.com/redis/go-redis/v9"
)

type Node struct {
	redis   redis.UniversalClient
	nodeID  string
	service string
}

func NewNode(redis redis.UniversalClient, service, nodeID string) *Node {
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
					// Check if this node is a SFU node
					if IsServiceNode(ServiceSFU, connection) {
						// Clean dangling room address
						roomOfServiceKey := BuildRoomSetKeyOfService(connection)
						roomKeys := n.redis.SMembers(ctx, roomOfServiceKey).Val()
						for _, roomKey := range roomKeys {
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
							rtspConnectionNode := n.redis.Get(ctx, rtspConnection).Val()
							if rtspConnectionNode == GetNodeID(connection) {
								pipeline.Del(ctx, rtspConnection)
							}
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
