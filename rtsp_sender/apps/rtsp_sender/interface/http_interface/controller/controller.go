package controller

import (
	"github.com/dathuynh1108/hcmut-thexis/rtsp-sender/apps/rtsp_sender/entity"
	"github.com/gofiber/fiber/v2"
)

type controller struct {
}

func (c *controller) Success(ctx *fiber.Ctx, successCode int, code int, message string, data interface{}) error {
	response := entity.Response{
		Code:    code,
		Message: message,
		Data:    data,
	}
	return ctx.Status(successCode).JSON(response)
}
func (c *controller) Failure(ctx *fiber.Ctx, errorCode int, code int, message string) error {
	response := entity.Response{
		Code:    code,
		Message: message,
		Data:    nil,
	}
	return ctx.Status(errorCode).JSON(response)
}
