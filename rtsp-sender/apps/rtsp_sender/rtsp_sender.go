package rtsp_sender

import (
	"errors"
	"sync"

	"github.com/datht6vng/hcmut-thexis/rtsp-sender/pkg/config"
	"github.com/datht6vng/hcmut-thexis/rtsp-sender/pkg/logger"
)

var (
	ErrNotFound = errors.New("Not found")
)

type RTSPSender struct {
	rtspSenderLock sync.RWMutex
	clients        map[string]*Client
}

func NewRTSPSender() (*RTSPSender, error) {
	return &RTSPSender{
		clients: map[string]*Client{},
	}, nil
}

func (r *RTSPSender) Start() error {
	// Test code
	r.AddClient("ABC")
	r.AddClient("XYZ")
	// =================
	return nil
}

func (r *RTSPSender) AddClient(url string) error {
	// Test code
	r.rtspSenderLock.Lock()
	defer r.rtspSenderLock.Unlock()

	if _, ok := r.clients[url]; ok {
		return nil
	}

	client := NewClient(url, config.Config.SFUConfig.SFUAddres, "ion")
	if err := client.Connect(); err != nil {
		logger.Errorf("Error sfu connect: %v", err)
		return err
	}
	// =================
	r.clients[url] = client
	return nil
}

func (r *RTSPSender) GetClient(url string) (*Client, error) {
	r.rtspSenderLock.RLock()
	defer r.rtspSenderLock.RUnlock()
	if client, ok := r.clients[url]; ok {
		return client, nil
	}
	return nil, ErrNotFound
}

func (r *RTSPSender) RemoveClient(url string) error {
	r.rtspSenderLock.Lock()
	defer r.rtspSenderLock.Unlock()
	if _, ok := r.clients[url]; !ok {
		return ErrNotFound
	}
	delete(r.clients, url)
	return nil
}
