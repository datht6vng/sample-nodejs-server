package rediswrapper

import (
	"context"
	"time"

	"github.com/redis/go-redis/v9"
)

type Config struct {
	Address   []string
	Password  string
	Database  int
	IsCluster bool
}

func NewUniversalClient(c *Config) (redis.UniversalClient, error) {
	ctx := context.Background()
	if len(c.Address) == 1 {
		singleClient := redis.NewClient(
			&redis.Options{
				Addr:         c.Address[0], // use default Addr
				Password:     c.Password,   // no password set
				DB:           c.Database,   // use default DB
				DialTimeout:  3 * time.Second,
				ReadTimeout:  5 * time.Second,
				WriteTimeout: 5 * time.Second,
			},
		)
		if err := singleClient.Ping(ctx).Err(); err != nil {
			return nil, err
		}

		if !c.IsCluster {
			return singleClient, nil
		}

		// Auto get all addresses of cluster
		slots, err := singleClient.ClusterSlots(ctx).Result()
		if err != nil || len(slots) == 0 {
			return nil, err
		}

		var addrs []string
		for _, slot := range slots {
			for _, node := range slot.Nodes {
				addrs = append(addrs, node.Addr)
			}
		}
		c.Address = addrs
	}

	clusterClient := redis.NewClusterClient(
		&redis.ClusterOptions{
			Addrs:        c.Address,
			Password:     c.Password,
			DialTimeout:  3 * time.Second,
			ReadTimeout:  5 * time.Second,
			WriteTimeout: 5 * time.Second,
		},
	)
	if err := clusterClient.Ping(ctx).Err(); err != nil {
		return nil, err
	}
	return clusterClient, nil
}
