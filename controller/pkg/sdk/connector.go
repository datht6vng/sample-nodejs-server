package sdk

import (
	"context"
	"fmt"

	"github.com/google/uuid"
	"github.com/pion/ion/proto/rtc"
	"github.com/redis/go-redis/v9"

	"github.com/dathuynh1108/hcmut-thesis/controller/pkg/config"
	"github.com/dathuynh1108/hcmut-thesis/controller/pkg/logger"
	log "github.com/dathuynh1108/hcmut-thesis/controller/pkg/logger"
	"github.com/dathuynh1108/redisrpc"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/metadata"
	"google.golang.org/grpc/status"
)

type ConnectorConfig struct {
	SSL    bool
	Cafile string
	Token  string
}

type ServiceEvent struct {
	Name      string
	ErrStatus *status.Status
}

type Service interface {
	Name() string
	Connect()
	Close()
	Connected() bool
}

type Connector struct {
	services map[string]Service
	Metadata metadata.MD

	config   *ConnectorConfig
	grpcConn *redisrpc.Client

	OnOpen  func(Service)
	OnClose func(Service, ServiceEvent)

	ctx context.Context
}

// NewConnector create a ion connector
func NewConnector(redis redis.UniversalClient, addr string, cfg ...ConnectorConfig) (*Connector, error) {
	c := &Connector{
		services: make(map[string]Service),
		Metadata: make(metadata.MD),
		ctx:      context.Background(),
	}

	if len(cfg) > 0 {
		c.config = &cfg[0]
	}

	if addr == "" {
		return nil, fmt.Errorf("error: %v", errInvalidAddr)
	}

	if c.config != nil && c.config.Token != "" {
		c.Metadata.Append("authorization", c.config.Token)
	}

	var err error

	// ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	// defer cancel()
	// if c.config != nil && c.config.SSL {
	// 	var config *tls.Config
	// 	if c.config.Cafile != "" {
	// 		b, _ := ioutil.ReadFile(c.config.Cafile)
	// 		cp := x509.NewCertPool()
	// 		if !cp.AppendCertsFromPEM(b) {
	// 			return nil, fmt.Errorf("credentials: failed to append certificates")
	// 		}

	// 		config = &tls.Config{
	// 			InsecureSkipVerify: false,
	// 			RootCAs:            cp,
	// 		}
	// 	} else {
	// 		config = &tls.Config{
	// 			InsecureSkipVerify: false,
	// 		}
	// 	}

	// 	c.grpcConn, err = grpc.DialContext(ctx, addr, grpc.WithTransportCredentials(credentials.NewTLS(config)), grpc.WithBlock())
	// 	if err != nil {
	// 		log.Errorf("did not connect: %v", err)
	// 		return nil, fmt.Errorf("did not connect: %v", err)
	// 	}
	// } else {
	// 	c.grpcConn, err = grpc.DialContext(ctx, addr, grpc.WithTransportCredentials(insecure.NewCredentials()), grpc.WithBlock())
	// }

	c.grpcConn = redisrpc.NewClient(redis, addr, config.Config.NodeID+":"+uuid.NewString(), logger.GetLogger())
	if err != nil {
		return nil, fmt.Errorf("did not connect: %v", err)
	}

	log.Infof("gRPC connected: %s", addr)

	return c, nil
}

func (c *Connector) Signal(r *RTC) (Signaller, error) {
	c.RegisterService(r)
	client := rtc.NewRTCClient(c.grpcConn)
	r.ctx = metadata.NewOutgoingContext(r.ctx, c.Metadata)
	return client.Signal(r.ctx)
}

func (c *Connector) Close() {
	for _, s := range c.services {
		if s.Connected() {
			s.Close()
		}
	}

}

func (c *Connector) OnHeaders(service Service, headers metadata.MD) {
	for k, v := range headers {
		c.Metadata.Append(k, v[0])
	}

	if c.OnOpen != nil {
		c.OnOpen(service)
	}
}

func (c *Connector) OnEnd(service Service, headers metadata.MD) {
	if c.OnClose != nil {
		c.OnClose(service, ServiceEvent{
			Name:      service.Name(),
			ErrStatus: status.New(codes.OK, "close"),
		})
	}
}

func (c *Connector) RegisterService(service Service) {
	c.services[service.Name()] = service
}
