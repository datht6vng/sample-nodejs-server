package sfu

import (
	"context"
	"fmt"
	"math/rand"
	"net"
	"os"
	"runtime"
	"sync"
	"time"

	"github.com/go-logr/logr"
	"github.com/google/uuid"
	"github.com/pion/ice/v2"
	"github.com/pion/ion-sfu/pkg/buffer"
	"github.com/pion/ion-sfu/pkg/node"
	"github.com/pion/ion-sfu/pkg/stats"
	"github.com/pion/turn/v2"
	"github.com/pion/webrtc/v3"
	"github.com/redis/go-redis/v9"
)

// Logger is an implementation of logr.Logger. If is not provided - will be turned off.
var Logger logr.Logger = logr.Discard()

// ICEServerConfig defines parameters for ice servers
type ICEServerConfig struct {
	URLs       []string `mapstructure:"urls"`
	Username   string   `mapstructure:"username"`
	Credential string   `mapstructure:"credential"`
}

type Candidates struct {
	IceLite    bool     `mapstructure:"icelite"`
	NAT1To1IPs []string `mapstructure:"nat1to1"`
}

// WebRTCTransportConfig represents Configuration options
type WebRTCTransportConfig struct {
	Configuration webrtc.Configuration
	Setting       webrtc.SettingEngine
	Router        RouterConfig
	BufferFactory *buffer.Factory
}

type WebRTCTimeoutsConfig struct {
	ICEDisconnectedTimeout int `mapstructure:"disconnected"`
	ICEFailedTimeout       int `mapstructure:"failed"`
	ICEKeepaliveInterval   int `mapstructure:"keepalive"`
}

// WebRTCConfig defines parameters for ice
type WebRTCConfig struct {
	ICESinglePort int                  `mapstructure:"singleport"`
	ICEPortRange  []uint16             `mapstructure:"portrange"`
	ICEServers    []ICEServerConfig    `mapstructure:"iceserver"`
	Candidates    Candidates           `mapstructure:"candidates"`
	SDPSemantics  string               `mapstructure:"sdpsemantics"`
	MDNS          bool                 `mapstructure:"mdns"`
	Timeouts      WebRTCTimeoutsConfig `mapstructure:"timeouts"`
}

// Config for base SFU
type Config struct {
	SFU struct {
		Ballast   int64 `mapstructure:"ballast"`
		WithStats bool  `mapstructure:"withstats"`
	} `mapstructure:"sfu"`
	WebRTC        WebRTCConfig `mapstructure:"webrtc"`
	Router        RouterConfig `mapstructure:"Router"`
	Turn          TurnConfig   `mapstructure:"turn"`
	BufferFactory *buffer.Factory
	TurnAuth      func(username string, realm string, srcAddr net.Addr) ([]byte, bool)
	Redis         RedisConfig `mapstructure:"redis"`
}

type RedisConfig struct {
	Addrs     []string `mapstructure:"address"`
	Pwd       string   `mapstructure:"password"`
	DB        int      `mapstructure:"database"`
	IsCluster bool     `mapstructure:"is_cluster"`
}

var (
	packetFactory *sync.Pool
)

// SFU represents an sfu instance
type SFU struct {
	sync.RWMutex
	webrtc       WebRTCTransportConfig
	turn         *turn.Server
	sessions     map[string]Session
	datachannels []*Datachannel
	withStats    bool
	Redis        *redis.Client
	NodeID       string
	Node         *node.Node
}

// NewWebRTCTransportConfig parses our settings and returns a usable WebRTCTransportConfig for creating PeerConnections
func NewWebRTCTransportConfig(c Config) WebRTCTransportConfig {
	se := webrtc.SettingEngine{}
	se.DisableMediaEngineCopy(true)

	if c.WebRTC.ICESinglePort != 0 {
		Logger.Info("Listen on ", "single-port", c.WebRTC.ICESinglePort)
		opts := []ice.UDPMuxFromPortOption{
			ice.UDPMuxFromPortWithReadBufferSize(16777216),
			ice.UDPMuxFromPortWithWriteBufferSize(16777216),
		}
		udpMux, err := ice.NewMultiUDPMuxFromPort(int(c.WebRTC.ICESinglePort), opts...)
		if err != nil {
			panic(err)
		}
		se.SetICEUDPMux(udpMux)
	} else {
		var icePortStart, icePortEnd uint16

		if c.Turn.Enabled && len(c.Turn.PortRange) == 0 {
			icePortStart = sfuMinPort
			icePortEnd = sfuMaxPort
		} else if len(c.WebRTC.ICEPortRange) == 2 {
			icePortStart = c.WebRTC.ICEPortRange[0]
			icePortEnd = c.WebRTC.ICEPortRange[1]
		}
		if icePortStart != 0 || icePortEnd != 0 {
			if err := se.SetEphemeralUDPPortRange(icePortStart, icePortEnd); err != nil {
				panic(err)
			}
		}
	}

	var iceServers []webrtc.ICEServer
	if c.WebRTC.Candidates.IceLite {
		se.SetLite(c.WebRTC.Candidates.IceLite)
	} else {
		for _, iceServer := range c.WebRTC.ICEServers {
			s := webrtc.ICEServer{
				URLs:       iceServer.URLs,
				Username:   iceServer.Username,
				Credential: iceServer.Credential,
			}
			iceServers = append(iceServers, s)
		}
	}

	se.BufferFactory = c.BufferFactory.GetOrNew

	sdpSemantics := webrtc.SDPSemanticsUnifiedPlan
	switch c.WebRTC.SDPSemantics {
	case "unified-plan-with-fallback":
		sdpSemantics = webrtc.SDPSemanticsUnifiedPlanWithFallback
	case "plan-b":
		sdpSemantics = webrtc.SDPSemanticsPlanB
	}

	if c.WebRTC.Timeouts.ICEDisconnectedTimeout == 0 &&
		c.WebRTC.Timeouts.ICEFailedTimeout == 0 &&
		c.WebRTC.Timeouts.ICEKeepaliveInterval == 0 {
		Logger.Info("No webrtc timeouts found in config, using default ones")
	} else {
		se.SetICETimeouts(
			time.Duration(c.WebRTC.Timeouts.ICEDisconnectedTimeout)*time.Second,
			time.Duration(c.WebRTC.Timeouts.ICEFailedTimeout)*time.Second,
			time.Duration(c.WebRTC.Timeouts.ICEKeepaliveInterval)*time.Second,
		)
	}

	w := WebRTCTransportConfig{
		Configuration: webrtc.Configuration{
			ICEServers:   iceServers,
			SDPSemantics: sdpSemantics,
		},
		Setting:       se,
		Router:        c.Router,
		BufferFactory: c.BufferFactory,
	}

	if len(c.WebRTC.Candidates.NAT1To1IPs) > 0 {
		w.Setting.SetNAT1To1IPs(c.WebRTC.Candidates.NAT1To1IPs, webrtc.ICECandidateTypeHost)
	}

	if !c.WebRTC.MDNS {
		w.Setting.SetICEMulticastDNSMode(ice.MulticastDNSModeDisabled)
	}

	if c.SFU.WithStats {
		w.Router.WithStats = true
		stats.InitStats()
	}

	return w
}

func init() {
	// Init packet factory
	packetFactory = &sync.Pool{
		New: func() interface{} {
			b := make([]byte, 1460)
			return &b
		},
	}
}

// NewSFU creates a new sfu instance
func NewSFU(c Config) *SFU {
	// Init random seed
	rand.Seed(time.Now().UnixNano())
	// Init ballast
	ballast := make([]byte, c.SFU.Ballast*1024*1024)

	if c.BufferFactory == nil {
		c.BufferFactory = buffer.NewBufferFactory(c.Router.MaxPacketTrack, Logger)
	}

	w := NewWebRTCTransportConfig(c)

	sfu := &SFU{
		webrtc:    w,
		sessions:  make(map[string]Session),
		withStats: w.Router.WithStats,
	}

	if c.Turn.Enabled {
		ts, err := InitTurnServer(c.Turn, c.TurnAuth)
		if err != nil {
			Logger.Error(err, "Could not init turn server err")
			os.Exit(1)
		}
		sfu.turn = ts
	}
	r := redis.NewClient(
		&redis.Options{
			Addr:         c.Redis.Addrs[0], // use default Addr
			Password:     "",               // no password set
			DB:           0,                // use default DB
			DialTimeout:  3 * time.Second,
			ReadTimeout:  5 * time.Second,
			WriteTimeout: 5 * time.Second,
		})
	_, err := r.Ping(context.Background()).Result()
	if err != nil {
		panic(fmt.Errorf("Cannot connect to redis: %v", err))
	}
	hostname := os.Getenv("HOSTNAME")
	if hostname == "" {
		hostname = uuid.NewString()
	}

	sfu.NodeID = "sfu_" + hostname
	sfu.Redis = r
	sfu.Node = node.NewNode(r, node.ServiceSFU, sfu.NodeID)

	sfu.Node.KeepAlive(3 * time.Second)

	runtime.KeepAlive(ballast)
	return sfu
}

// NewSession creates a new SessionLocal instance
func (s *SFU) newSession(id string) Session {
	session := NewSession(id, s.datachannels, s.webrtc).(*SessionLocal)

	session.OnClose(func() {
		s.Lock()
		delete(s.sessions, id)
		s.Unlock()

		if s.withStats {
			stats.Sessions.Dec()
		}
		Logger.Info("Remove room", "room name", id)
		node.RemoveRoom(s.Redis, id)
	})

	s.Lock()
	s.sessions[id] = session
	s.Unlock()

	if s.withStats {
		stats.Sessions.Inc()
	}

	return session
}

// GetSession by id
func (s *SFU) getSession(id string) Session {
	s.RLock()
	defer s.RUnlock()
	return s.sessions[id]
}

func (s *SFU) GetSession(sid string) (Session, WebRTCTransportConfig) {
	session := s.getSession(sid)
	if session == nil {
		session = s.newSession(sid)
	}
	return session, s.webrtc
}

func (s *SFU) NewDatachannel(label string) *Datachannel {
	dc := &Datachannel{Label: label}
	s.datachannels = append(s.datachannels, dc)
	return dc
}

// GetSessions return all sessions
func (s *SFU) GetSessions() []Session {
	s.RLock()
	defer s.RUnlock()
	sessions := make([]Session, 0, len(s.sessions))
	for _, session := range s.sessions {
		sessions = append(sessions, session)
	}
	return sessions
}
