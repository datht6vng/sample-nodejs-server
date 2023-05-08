package rtsp_client_service

import (
	"errors"
	"fmt"
	"io/fs"
	"os"
	"path/filepath"
	"sort"
	"strconv"
	"strings"
	"sync"
	"sync/atomic"
	"time"

	"github.com/dathuynh1108/hcmut-thexis/controller/apps/controller/entity"
	"github.com/dathuynh1108/hcmut-thexis/controller/pkg/config"
	"github.com/dathuynh1108/hcmut-thexis/controller/pkg/logger"
	gst "github.com/dathuynh1108/hcmut-thexis/controller/pkg/rtsp_to_webrtc"
	"github.com/dathuynh1108/hcmut-thexis/controller/pkg/util"
	jujuErr "github.com/juju/errors"
	"github.com/redis/go-redis/v9"
)

var (
	ErrNotFound = errors.New("not found")
)

type RTSPClientService struct {
	sync.RWMutex
	clients    map[string]*Client
	autoDomain atomic.Int64
	r          *redis.Client
}

func NewRTSPClientService(r *redis.Client) (*RTSPClientService, error) {
	return &RTSPClientService{
		clients: map[string]*Client{},
		r:       r,
	}, nil
}

func (r *RTSPClientService) ConnectRTSPClient(clientID, connectClientAddress, username, password string, enableRTSPRelay bool, enableRecord bool) (string, error) {
	// Force end
	if client, err := r.GetRTSPClient(connectClientAddress); err == nil {
		client.Close()
	}

	r.Lock()
	defer r.Unlock()

	rtspRelayAddress := "Disable"
	if enableRTSPRelay {
		rtspRelayAddress = fmt.Sprintf("rtsp://%v:%v/%v", config.Config.RTSPSenderConfig.RTSPRelayConfig.RTSPRelayIP, config.Config.RTSPSenderConfig.RTSPRelayConfig.RTSPRelayPort, r.autoDomain.Add(1))
	}

	client := NewClient(r.r, clientID, connectClientAddress, rtspRelayAddress, username, password, connectClientAddress, true, enableRTSPRelay, enableRecord)

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
	r.RLock()
	defer r.RUnlock()

	if client, ok := r.clients[connectClientAddress]; ok {
		return client, nil
	}
	return nil, jujuErr.Annotate(ErrNotFound, "cannot get rtsp client")
}

func (r *RTSPClientService) DisconnectRTSPClient(clientID, connectClientAddress string) error {
	if _, err := r.GetRTSPClient(connectClientAddress); err != nil {
		return err
	}
	r.clients[connectClientAddress].Close()

	r.Lock()
	delete(r.clients, connectClientAddress)
	r.Unlock()

	return nil
}

func (r *RTSPClientService) GetRecordFile(clientID string, ts int64) (string, int64, int64, error) {
	if clientID == "" {
		return "", 0, 0, fmt.Errorf("clientID is missing")
	}

	clientDir := filepath.Join("/videos", clientID)
	if _, err := os.Stat(clientDir); os.IsNotExist(err) {
		return "", 0, 0, jujuErr.Annotate(ErrNotFound, fmt.Sprintf("client dir for client ID:'%v' is missing", clientID))
	}

	sessionDirs, err := os.ReadDir(clientDir)
	if err != nil {
		return "", 0, 0, jujuErr.Annotate(err, "cannot read dir")
	}

	sort.Slice(sessionDirs, func(i, j int) bool {
		return strings.Compare(sessionDirs[i].Name(), sessionDirs[j].Name()) <= 0
	})

	sessionIndex := util.SearchElementOrSmaller(sessionDirs, ts, func(value int64, sessionDir fs.DirEntry) int64 {
		sesssionTS, _ := strconv.ParseInt(sessionDir.Name(), 10, 64)
		return ts - sesssionTS
	})

	if sessionIndex < 0 || sessionIndex >= len(sessionDirs) {
		return "", 0, 0, jujuErr.Annotate(ErrNotFound, "not found session folder")
	}

	sessionDir := filepath.Join(clientDir, sessionDirs[sessionIndex].Name())

	metaDataFilepath := filepath.Join(sessionDir, "metadata.json")
	metadata, err := entity.ReadMetadata(metaDataFilepath)
	if err != nil {
		return "", 0, 0, err
	}

	index := util.SearchElementOrSmaller(metadata.RecordMetadata, ts, func(value int64, recordMetadata entity.RecordMetadata) int64 {
		return value - recordMetadata.Timestamp.UnixNano()
	})

	if index < 0 || index >= len(metadata.RecordMetadata) {
		return "", 0, 0, jujuErr.Annotate(ErrNotFound, "not found record file")
	}

	startTime := metadata.RecordMetadata[index].Timestamp.UnixNano()
	endTime := metadata.RecordMetadata[index].Timestamp.Add(time.Duration(gst.RecordFileDuration)).UnixNano()
	return metadata.RecordMetadata[index].RecordFilename, startTime, endTime, nil
}
