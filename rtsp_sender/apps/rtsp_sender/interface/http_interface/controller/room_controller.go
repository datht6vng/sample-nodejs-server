package controller

import (
	"net/http"

	service "github.com/dathuynh1108/hcmut-thexis/rtsp-sender/apps/rtsp_sender/service/room_service"
	"github.com/gofiber/fiber/v2"
)

type RoomController struct {
	controller
	roomService service.RoomService
}

type GetSFUNodeRequest struct {
	RoomName string `json:"room_name"`
}

type GetSFUNodeResponse struct {
	SFUNode string `json:"sfu_node"`
}

func NewRoomController(roomService service.RoomService) *RoomController {
	return &RoomController{
		roomService: roomService,
	}
}

func (c *RoomController) GetSFUNode(ctx *fiber.Ctx) error {
	request := GetSFUNodeRequest{}
	err := ctx.BodyParser(request)
	if err != nil {
		return c.Failure(
			ctx, http.StatusBadRequest, http.StatusBadRequest, err.Error(),
		)
	}
	nodeAddr, err := c.roomService.GetSFUNode(request.RoomName)
	if err != nil {
		return c.Failure(
			ctx, http.StatusInternalServerError, http.StatusBadRequest, err.Error(),
		)
	}
	return c.Success(
		ctx, http.StatusOK, http.StatusOK, "Get sfu node successfully", &GetSFUNodeResponse{
			SFUNode: nodeAddr,
		},
	)
}
