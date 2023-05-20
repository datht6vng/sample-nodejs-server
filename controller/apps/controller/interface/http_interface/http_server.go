package http_interface

import (
	"encoding/json"
	"net/http"
	"os"

	"github.com/dathuynh1108/hcmut-thesis/controller/apps/controller/interface/http_interface/controller"
	service "github.com/dathuynh1108/hcmut-thesis/controller/apps/controller/service/room_service"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/recover"
	"github.com/gofiber/websocket/v2"
)

type HTTPControllerServer interface {
	Start(address string) error
	initRoute() error
	initMiddleware() error
}

func NewHTTPControllerServer(
	roomService service.RoomService,
) HTTPControllerServer {
	h := &httpControllerServer{
		app: fiber.New(fiber.Config{
			JSONEncoder: json.Marshal,
			JSONDecoder: json.Unmarshal,
		}),
	}
	h.roomController = controller.NewRoomController(roomService)
	h.webSocketController = controller.NewWebSocketController(roomService)
	h.initMiddleware()
	h.initRoute()
	return h
}

type httpControllerServer struct {
	app                 *fiber.App
	roomController      *controller.RoomController
	webSocketController *controller.WebSocketController
}

func (s *httpControllerServer) Start(address string) error {
	return s.app.Listen(address)
}

func (s *httpControllerServer) initMiddleware() error {
	s.app.Use(recover.New())
	s.app.Use(cors.New())
	return nil
}

func (s *httpControllerServer) initRoute() error {
	s.app.Static("/videos", "/videos", fiber.Static{
		Compress:  true,
		ByteRange: true,
		Browse:    true,
	})
	s.app.Get("/api/v1/sfu_node", s.roomController.SetOrGetSFUNode)

	s.app.Get("/ws", websocket.New(func(c *websocket.Conn) {
		// Websocket logic
		s.webSocketController.Handle(c)
	}))

	s.app.Get("/health/*", func(ctx *fiber.Ctx) error {
		return ctx.Status(http.StatusOK).JSON(
			fiber.Map{
				"from": os.Getenv("HOSTNAME"),
				"uri":  ctx.Path(),
			},
		)
	})
	return nil
}
