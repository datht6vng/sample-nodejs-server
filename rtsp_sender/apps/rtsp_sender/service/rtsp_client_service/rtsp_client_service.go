package rtsp_client_service

import (
	"errors"
	"fmt"
	"sync"
	"sync/atomic"

	"github.com/datht6vng/hcmut-thexis/rtsp-sender/pkg/config"
	"github.com/datht6vng/hcmut-thexis/rtsp-sender/pkg/logger"
)

var (
	ErrNotFound = errors.New("not found")
)

type RTSPClientService struct {
	rtspSenderLock sync.RWMutex
	clients        map[string]*Client
	autoDomain     atomic.Int64
}

func NewRTSPClientService() (*RTSPClientService, error) {
	return &RTSPClientService{
		clients: map[string]*Client{},
	}, nil
}

func (r *RTSPClientService) ConnectRTSPClient(clientID, connectClientAddress, username, password string, enableRTSPRelay bool) (string, error) {
	// Force end
	if client, err := r.GetRTSPClient(connectClientAddress); err == nil {
		client.Close()
	}

	r.rtspSenderLock.Lock()
	defer r.rtspSenderLock.Unlock()

	rtspRelayAddress := ""
	rtspRelayAddress = fmt.Sprintf("rtsp://%v:%v/", config.Config.RTSPSenderConfig.RTSPRelayConfig.RTSPRelayIP, config.Config.RTSPSenderConfig.RTSPRelayConfig.RTSPRelayPort)
	if enableRTSPRelay {
		rtspRelayAddress = fmt.Sprintf("rtsp://%v:%v/%v", config.Config.RTSPSenderConfig.RTSPRelayConfig.RTSPRelayIP, config.Config.RTSPSenderConfig.RTSPRelayConfig.RTSPRelayPort, r.autoDomain.Add(1))
	}

	client := NewClient(connectClientAddress, rtspRelayAddress, username, password, config.Config.SFUConfig.SFUAddres, connectClientAddress, true, enableRTSPRelay)
	if err := client.Connect(); err != nil {
		logger.Errorf("Error when new client: %v", err)
		return "", err
	}
	client.OnClose(func() {
		r.autoDomain.Add(-1)
	})
	r.clients[connectClientAddress] = client
	return rtspRelayAddress, nil
}

func (r *RTSPClientService) GetRTSPClient(connectClientAddress string) (*Client, error) {
	r.rtspSenderLock.RLock()
	defer r.rtspSenderLock.RUnlock()

	if client, ok := r.clients[connectClientAddress]; ok {
		return client, nil
	}
	return nil, ErrNotFound
}

func (r *RTSPClientService) DisconnectRTSPClient(clientID, connectClientAddress string) error {
	if _, err := r.GetRTSPClient(connectClientAddress); err != nil {
		return err
	}
	r.rtspSenderLock.Lock()
	defer r.rtspSenderLock.Unlock()
	delete(r.clients, connectClientAddress)
	return nil
}
