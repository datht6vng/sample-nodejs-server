package http

import (
	"encoding/json"
	"net/http"
	"os"
	"sort"
	"time"

	"github.com/datht6vng/hcmut-thexis/rtsp-sender/pkg/logger"

	"github.com/datht6vng/hcmut-thexis/rtsp-sender/pkg/streamer"
	"github.com/deepch/vdk/av"

	webrtc "github.com/deepch/vdk/format/webrtcv3"
	"github.com/gin-gonic/gin"
)

type JCodec struct {
	Type string
}

func ServeHTTP() {
	gin.SetMode(gin.ReleaseMode)

	router := gin.Default()
	router.Use(CORSMiddleware())

	if _, err := os.Stat("./pkg/web"); !os.IsNotExist(err) {
		router.LoadHTMLGlob("./pkg/web/templates/*")
		router.GET("/", HTTPAPIServerIndex)
		router.GET("/stream/player/:uuid", HTTPAPIServerStreamPlayer)
	}
	router.POST("/stream/receiver/:uuid", HTTPAPIServerStreamWebRTC)
	router.GET("/stream/codec/:uuid", HTTPAPIServerStreamCodec)
	router.POST("/stream", HTTPAPIServerStreamWebRTC2)

	router.StaticFS("/static", http.Dir("web/static"))
	err := router.Run(streamer.Config.Server.HTTPPort)
	if err != nil {
		logger.Errorf("Start HTTP Server error %v", err)
	}
}

// HTTPAPIServerIndex  index
func HTTPAPIServerIndex(c *gin.Context) {
	_, all := streamer.Config.List()
	if len(all) > 0 {
		c.Header("Cache-Control", "no-cache, max-age=0, must-revalidate, no-store")
		c.Header("Access-Control-Allow-Origin", "*")
		c.Redirect(http.StatusMovedPermanently, "stream/player/"+all[0])
	} else {
		c.HTML(http.StatusOK, "index.tmpl", gin.H{
			"port":    streamer.Config.Server.HTTPPort,
			"version": time.Now().String(),
		})
	}
}

// HTTPAPIServerStreamPlayer stream player
func HTTPAPIServerStreamPlayer(c *gin.Context) {
	_, all := streamer.Config.List()
	sort.Strings(all)
	c.HTML(http.StatusOK, "player.tmpl", gin.H{
		"port":     streamer.Config.Server.HTTPPort,
		"suuid":    c.Param("uuid"),
		"suuidMap": all,
		"version":  time.Now().String(),
	})
}

// HTTPAPIServerStreamCodec stream codec
func HTTPAPIServerStreamCodec(c *gin.Context) {
	if streamer.Config.Ext(c.Param("uuid")) {
		streamer.Config.RunIFNotRun(c.Param("uuid"))
		codecs := streamer.Config.CoGe(c.Param("uuid"))
		if codecs == nil {
			return
		}
		var tmpCodec []JCodec
		for _, codec := range codecs {
			if codec.Type() != av.H264 && codec.Type() != av.PCM_ALAW && codec.Type() != av.PCM_MULAW && codec.Type() != av.OPUS {
				logger.Infof("Codec Not Supported WebRTC ignore this track %v", codec.Type())
				continue
			}
			if codec.Type().IsVideo() {
				tmpCodec = append(tmpCodec, JCodec{Type: "video"})
			} else {
				tmpCodec = append(tmpCodec, JCodec{Type: "audio"})
			}
		}
		b, err := json.Marshal(tmpCodec)
		if err == nil {
			_, err = c.Writer.Write(b)
			if err != nil {
				logger.Infof("Write Codec Info error %v", err)
				return
			}
		}
	}
}

// HTTPAPIServerStreamWebRTC stream video over WebRTC
func HTTPAPIServerStreamWebRTC(c *gin.Context) {
	if !streamer.Config.Ext(c.PostForm("suuid")) {
		logger.Infof("Stream Not Found")
		return
	}
	streamer.Config.RunIFNotRun(c.PostForm("suuid"))
	codecs := streamer.Config.CoGe(c.PostForm("suuid"))
	if codecs == nil {
		logger.Infof("Stream Codec Not Found")
		return
	}
	var AudioOnly bool
	if len(codecs) == 1 && codecs[0].Type().IsAudio() {
		AudioOnly = true
	}
	muxerWebRTC := webrtc.NewMuxer(webrtc.Options{ICEServers: streamer.Config.GetICEServers(), ICEUsername: streamer.Config.GetICEUsername(), ICECredential: streamer.Config.GetICECredential(), PortMin: streamer.Config.GetWebRTCPortMin(), PortMax: streamer.Config.GetWebRTCPortMax()})
	answer, err := muxerWebRTC.WriteHeader(codecs, c.PostForm("data"))
	if err != nil {
		logger.Infof("WriteHeader %v", err)
		return
	}
	_, err = c.Writer.Write([]byte(answer))
	if err != nil {
		logger.Infof("Write %v", err)
		return
	}
	go func() {
		cid, ch := streamer.Config.ClAd(c.PostForm("suuid"))
		defer streamer.Config.ClDe(c.PostForm("suuid"), cid)
		defer muxerWebRTC.Close()
		var videoStart bool
		noVideo := time.NewTimer(10 * time.Second)
		for {
			select {
			case <-noVideo.C:
				logger.Infof("noVideo")
				return
			case pck := <-ch:
				if pck.IsKeyFrame || AudioOnly {
					noVideo.Reset(10 * time.Second)
					videoStart = true
				}
				if !videoStart && !AudioOnly {
					continue
				}
				err = muxerWebRTC.WritePacket(pck)
				if err != nil {
					logger.Infof("WritePacket %v", err)
					return
				}
			}
		}
	}()
}

func CORSMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Header("Access-Control-Allow-Origin", "*")
		c.Header("Access-Control-Allow-Credentials", "true")
		c.Header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization, x-access-token")
		c.Header("Access-Control-Expose-Headers", "Content-Length, Access-Control-Allow-Origin, Access-Control-Allow-Headers, Cache-Control, Content-Language, Content-Type")
		c.Header("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(http.StatusNoContent)
			return
		}

		c.Next()
	}
}

type Response struct {
	Tracks []string `json:"tracks"`
	Sdp64  string   `json:"sdp64"`
}

type ResponseError struct {
	Error string `json:"error"`
}

func HTTPAPIServerStreamWebRTC2(c *gin.Context) {
	url := c.PostForm("url")
	if _, ok := streamer.Config.Streams[url]; !ok {
		streamer.Config.Streams[url] = streamer.StreamST{
			URL:      url,
			OnDemand: true,
			Cl:       make(map[string]streamer.Viewer),
		}
	}

	streamer.Config.RunIFNotRun(url)

	codecs := streamer.Config.CoGe(url)
	if codecs == nil {
		logger.Infof("Stream Codec Not Found")
		c.JSON(500, ResponseError{Error: streamer.Config.LastError.Error()})
		return
	}

	muxerWebRTC := webrtc.NewMuxer(
		webrtc.Options{
			ICEServers: streamer.Config.GetICEServers(),
			PortMin:    streamer.Config.GetWebRTCPortMin(),
			PortMax:    streamer.Config.GetWebRTCPortMax(),
		},
	)

	sdp64 := c.PostForm("sdp64")
	answer, err := muxerWebRTC.WriteHeader(codecs, sdp64)
	if err != nil {
		logger.Infof("Muxer WriteHeader %v", err)
		c.JSON(500, ResponseError{Error: err.Error()})
		return
	}

	response := Response{
		Sdp64: answer,
	}

	for _, codec := range codecs {
		if codec.Type() != av.H264 &&
			codec.Type() != av.PCM_ALAW &&
			codec.Type() != av.PCM_MULAW &&
			codec.Type() != av.OPUS {
			logger.Infof("Codec Not Supported WebRTC ignore this track %v", codec.Type())
			continue
		}
		if codec.Type().IsVideo() {
			response.Tracks = append(response.Tracks, "video")
		} else {
			response.Tracks = append(response.Tracks, "audio")
		}
	}

	c.JSON(200, response)

	AudioOnly := len(codecs) == 1 && codecs[0].Type().IsAudio()

	go func() {
		cid, ch := streamer.Config.ClAd(url)
		defer streamer.Config.ClDe(url, cid)
		defer muxerWebRTC.Close()
		var videoStart bool
		noVideo := time.NewTimer(10 * time.Second)
		for {
			select {
			case <-noVideo.C:
				logger.Infof("noVideo")
				return
			case pck := <-ch:
				if pck.IsKeyFrame || AudioOnly {
					noVideo.Reset(10 * time.Second)
					videoStart = true
				}
				if !videoStart && !AudioOnly {
					continue
				}
				err = muxerWebRTC.WritePacket(pck)
				if err != nil {
					logger.Infof("WritePacket %v", err)
					return
				}
			}
		}
	}()
}
