package controller

import (
	"context"
	"encoding/json"
	"strconv"
	"sync"

	service "github.com/dathuynh1108/hcmut-thesis/controller/apps/controller/service/room_service"
	"github.com/dathuynh1108/hcmut-thesis/controller/pkg/config"
	"github.com/dathuynh1108/hcmut-thesis/controller/pkg/logger"
	"github.com/gofiber/websocket/v2"
	"github.com/google/uuid"
	"github.com/pion/ion/proto/rtc"
	"github.com/pion/webrtc/v3"
	"github.com/sourcegraph/jsonrpc2"
)

type Signaller interface {
	Send(request *rtc.Request) error
	Recv() (*rtc.Reply, error)
	CloseSend() error
}

// Join message sent when initializing a peer connection
type Join struct {
	SID    string                    `json:"sid"`
	UID    string                    `json:"uid"`
	Offer  webrtc.SessionDescription `json:"offer"`
	Config JoinConfig                `json:"config"`
}

type JoinConfig struct {
	// If true the peer will not be allowed to publish tracks to SessionLocal.
	NoPublish bool
	// If true the peer will not be allowed to subscribe to other peers in SessionLocal.
	NoSubscribe bool
	// If true the peer will not automatically subscribe all tracks,
	// and then the peer can use peer.Subscriber().AddDownTrack/RemoveDownTrack
	// to customize the subscrbe stream combination as needed.
	// this parameter depends on NoSubscribe=false.
	NoAutoSubscribe bool
}

// Negotiation message sent when renegotiating the peer connection
type Negotiation struct {
	Desc webrtc.SessionDescription `json:"desc"`
}

// Trickle message sent when renegotiating the peer connection
type Trickle struct {
	Target    int                     `json:"target"`
	Candidate webrtc.ICECandidateInit `json:"candidate"`
}

type WebSocketController struct {
	roomService service.RoomService
}

func NewWebSocketController(roomService service.RoomService) *WebSocketController {
	return &WebSocketController{
		roomService: roomService,
	}
}

func (c *WebSocketController) Handle(con *websocket.Conn) {
	logger.Infof("Handling websocket connection of: %v", con.RemoteAddr())
	conn := wrapSocketConnection(con)
	onErr := func(req *jsonrpc2.Request, err error) {
		if err != nil {
			conn.WriteJSON(
				jsonrpc2.Response{
					ID: req.ID,
					Error: &jsonrpc2.Error{
						Code:    jsonrpc2.CodeParseError,
						Message: err.Error(),
					},
				},
			)
		}
	}

	reqChannel := make(chan *rtc.Request, 1024)
	resChannel := make(chan *rtc.Reply, 1024)

	resJoinChannel := make(chan *rtc.Reply_Join, 1024)         // Message need to sync
	resOfferChannel := make(chan *rtc.Reply_Description, 1024) // Message need to sync

	reqOnce := sync.Once{}
	resOnce := sync.Once{}
	for {
		var msg []byte
		var err error
		if _, msg, err = con.ReadMessage(); err != nil {
			logger.Infof("Close websocket connection by error: %v", err)
			break
		}
		req := &jsonrpc2.Request{}
		if err := json.Unmarshal(msg, req); err != nil {
			logger.Infof("Close websocket connection by error: %v", err)
			onErr(req, err)
			break
		}
		switch req.Method {
		case "join":
			var join Join
			err := json.Unmarshal(*req.Params, &join)
			if err != nil {
				logger.Infof("Close websocket connection by error: %v", err)
				onErr(req, err)
				break
			}
			logger.Infof("%v send join to %v", join.UID, join.SID)
			sfuNode, err := c.roomService.SetOrGetSFUNode(join.SID)
			if err != nil {
				logger.Infof("Close websocket connection by error: %v", err)
				onErr(req, err)
				break
			}
			sfuClient := c.roomService.MakeRedisRPCClientStream(sfuNode, config.Config.NodeID+":"+uuid.NewString())
			ctx, cancel := context.WithCancel(context.Background())
			signaller, err := sfuClient.Signal(ctx)
			if err != nil {
				cancel()
				logger.Infof("Close websocket connection by error: %v", err)
				onErr(req, err)
				break
			}

			closed := make(chan bool)
			defer func() {
				cancel()
				err := signaller.CloseSend()
				if err != nil {
					logger.Errorf("Close send error: %v", err)
				}
				close(closed)
			}()

			reqOnce.Do(func() { go c.signalToSFU(join.UID, reqChannel, signaller, reqChannel, closed) })
			resOnce.Do(func() {
				go c.handleSignalFromSFU(join.UID, conn, signaller, resChannel, resJoinChannel, resOfferChannel, closed)
			})

			reqChannel <- &rtc.Request{
				Payload: &rtc.Request_Join{
					Join: &rtc.JoinRequest{
						Sid: join.SID,
						Uid: join.UID,
						Config: map[string]string{
							"NoPublish":       strconv.FormatBool(join.Config.NoPublish),
							"NoSubscribe":     strconv.FormatBool(join.Config.NoSubscribe),
							"NoAutoSubscribe": strconv.FormatBool(join.Config.NoAutoSubscribe),
						},
						Description: &rtc.SessionDescription{
							Target: rtc.Target_PUBLISHER,
							Type:   "offer",
							Sdp:    join.Offer.SDP,
						},
					},
				},
			}
			reply := <-resJoinChannel
			response := jsonrpc2.Response{
				ID: req.ID,
			}
			response.SetResult(reply.Join.Description)
			conn.WriteJSON(response)

		case "offer":
			var negotiation Negotiation
			err := json.Unmarshal(*req.Params, &negotiation)
			if err != nil {
				logger.Infof("Close websocket connection by error: %v", err)
				onErr(req, err)
				break
			}

			reqChannel <- &rtc.Request{
				Payload: &rtc.Request_Description{
					Description: &rtc.SessionDescription{
						Target: rtc.Target_PUBLISHER,
						Type:   "offer",
						Sdp:    negotiation.Desc.SDP,
					},
				},
			}
			reply := <-resOfferChannel
			response := jsonrpc2.Response{
				ID: req.ID,
			}
			sdp := webrtc.SessionDescription{
				SDP:  reply.Description.Sdp,
				Type: webrtc.SDPTypeAnswer,
			}
			response.SetResult(sdp)
			conn.WriteJSON(response)

		case "answer":
			var negotiation Negotiation
			err := json.Unmarshal(*req.Params, &negotiation)
			if err != nil {
				logger.Infof("Close websocket connection by error: %v", err)
				onErr(req, err)
				break
			}

			reqChannel <- &rtc.Request{
				Payload: &rtc.Request_Description{
					Description: &rtc.SessionDescription{
						Target: rtc.Target_SUBSCRIBER,
						Type:   "answer",
						Sdp:    negotiation.Desc.SDP,
					},
				},
			}

		case "trickle":
			var trickle Trickle
			err := json.Unmarshal(*req.Params, &trickle)
			if err != nil {
				logger.Infof("Close websocket connection by error: %v", err)
				onErr(req, err)
				break
			}
			candidate, _ := json.Marshal(trickle.Candidate)
			reqChannel <- &rtc.Request{
				Payload: &rtc.Request_Trickle{
					Trickle: &rtc.Trickle{
						Target: rtc.Target(trickle.Target),
						Init:   string(candidate),
					},
				},
			}
		}

	}
}

func (c *WebSocketController) signalToSFU(uid string, reqChannel chan *rtc.Request, signaller Signaller, resChannel chan *rtc.Request, closed <-chan bool) {
	go func() {
		for {
			select {
			case <-closed:
				return
			case req := <-reqChannel:
				if err := signaller.Send(req); err != nil {
					return
				}
			}
		}
	}()
}

func (c *WebSocketController) handleSignalFromSFU(uid string, conn *socketConnectionWrapper, signaller Signaller,
	resChannel chan *rtc.Reply, resJoinChannel chan *rtc.Reply_Join, resOfferChannel chan *rtc.Reply_Description,
	closed <-chan bool) {
	go func() {
		for {
			select {
			case <-closed:
				return
			case stream := <-resChannel:
				switch payload := stream.Payload.(type) {
				case *rtc.Reply_Join:
					resJoinChannel <- payload

				case *rtc.Reply_Description:
					if payload.Description.Type == "offer" {
						sdp := webrtc.SessionDescription{
							SDP:  payload.Description.Sdp,
							Type: webrtc.SDPTypeOffer,
						}

						response := jsonrpc2.Request{
							Method: "offer",
						}
						response.SetParams(sdp)
						conn.WriteJSON(response)
					} else {
						resOfferChannel <- payload
					}

				case *rtc.Reply_Trickle:
					var candidate webrtc.ICECandidateInit
					_ = json.Unmarshal([]byte(payload.Trickle.Init), &candidate)
					// logger.Infof("[%v] [trickle] type=%v candidate=%v", uid, payload.Trickle.Target, candidate)
					response := jsonrpc2.Request{
						Method: "trickle",
					}
					response.SetParams(Trickle{
						Candidate: candidate,
						Target:    int(payload.Trickle.Target),
					})
					conn.WriteJSON(response)
				}
			}
		}
	}()

	go func() {
		for {
			select {
			case <-closed:
				return
			default:
				reply, err := signaller.Recv()
				if err != nil {
					if err := signaller.CloseSend(); err != nil {
						logger.Errorf("[%v] error sending close: %s", uid, err)
					} else {
						logger.Infof("[%v] close send ok")
					}
					return
				}
				resChannel <- reply
			}
		}
	}()
}

type socketConnectionWrapper struct {
	conn *websocket.Conn
	mu   sync.Mutex
}

func wrapSocketConnection(conn *websocket.Conn) *socketConnectionWrapper {
	return &socketConnectionWrapper{
		conn: conn,
	}
}

func (w *socketConnectionWrapper) WriteJSON(v interface{}) error {
	w.mu.Lock()
	defer w.mu.Unlock()
	return w.conn.WriteJSON(v)
}

func (w *socketConnectionWrapper) Close() error {
	w.mu.Lock()
	defer w.mu.Unlock()
	return w.conn.Close()
}
