package http_interface

import (
	"encoding/json"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/recover"
)

type HTTPRTSPSenderServer interface {
	Start(address string) error
	initRoute() error
	initMiddleware() error
}

func NewHTTPRTSPSenderServer() HTTPRTSPSenderServer {
	h := &httpRTSPSenderServer{
		app: fiber.New(fiber.Config{
			JSONEncoder: json.Marshal,
			JSONDecoder: json.Unmarshal,
		}),
	}
	h.initMiddleware()
	h.initRoute()
	return h
}

type httpRTSPSenderServer struct {
	app *fiber.App
}

func (s *httpRTSPSenderServer) Start(address string) error {
	return s.app.Listen(address)
}

func (s *httpRTSPSenderServer) initMiddleware() error {
	s.app.Use(recover.New())
	s.app.Use(cors.New())
	return nil
}

func (s *httpRTSPSenderServer) initRoute() error {
	s.app.Static("/videos", "./videos", fiber.Static{
		Compress:  true,
		ByteRange: true,
		Browse:    true,
	})
	return nil
}
