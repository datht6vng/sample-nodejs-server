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

func (r *RTSPClientService) ConnectRTSPClient(clientID, connectClientAddress string, ennableRTSPRelay bool) error {
	if _, err := r.GetRTSPClient(connectClientAddress); err == nil {
		return err
	}

	r.rtspSenderLock.Lock()
	defer r.rtspSenderLock.Unlock()

	rtspRelayAddress := fmt.Sprintf("rtsp://localhost:%v/")
	if ennableRTSPRelay {
		rtspRelayAddress += fmt.Sprint(r.autoDomain.Add(1))
	}

	client := NewClient(connectClientAddress, rtspRelayAddress, config.Config.SFUConfig.SFUAddres, connectClientAddress, true, ennableRTSPRelay)
	if err := client.Connect(); err != nil {
		logger.Errorf("Error when new client: %v", err)
		return err
	}

	r.clients[connectClientAddress] = client
	return nil
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

	r.autoDomain.Add(-1)
	r.clients[connectClientAddress].Close()
	delete(r.clients, connectClientAddress)
	return nil
}
