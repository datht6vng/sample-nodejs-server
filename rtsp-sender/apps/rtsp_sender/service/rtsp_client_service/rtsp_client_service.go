package rtsp_client_service

import (
	"errors"
	"sync"

	"github.com/datht6vng/hcmut-thexis/rtsp-sender/pkg/config"
	"github.com/datht6vng/hcmut-thexis/rtsp-sender/pkg/logger"
)

var (
	ErrNotFound = errors.New("Not found")
)

type RTSPClientService struct {
	rtspSenderLock sync.RWMutex
	clients        map[string]*Client
}

func NewRTSPClientService() (*RTSPClientService, error) {
	return &RTSPClientService{
		clients: map[string]*Client{},
	}, nil
}

func (r *RTSPClientService) AddClient(url string) error {
	// Test code
	r.rtspSenderLock.Lock()
	defer r.rtspSenderLock.Unlock()

	if _, ok := r.clients[url]; ok {
		return nil
	}

	client := NewClient(url, config.Config.SFUConfig.SFUAddres, "ion", true)
	if err := client.Connect(); err != nil {
		logger.Errorf("Error when new client: %v", err)
		return err
	}
	// =================
	r.clients[url] = client
	return nil
}

func (r *RTSPClientService) GetClient(url string) (*Client, error) {
	r.rtspSenderLock.RLock()
	defer r.rtspSenderLock.RUnlock()

	if client, ok := r.clients[url]; ok {
		return client, nil
	}
	return nil, ErrNotFound
}

func (r *RTSPClientService) RemoveClient(url string) error {
	r.rtspSenderLock.Lock()
	defer r.rtspSenderLock.Unlock()
	if _, ok := r.clients[url]; !ok {
		return ErrNotFound
	}
	r.clients[url].Close()
	delete(r.clients, url)
	return nil
}
