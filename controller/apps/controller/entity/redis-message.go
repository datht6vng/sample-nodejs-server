package entity

import (
	"encoding/json"
	"errors"
)

const RedisEventChannel = "redis_event_channel"

const TypeDisconnect = "disconnect"

type DisconnectPayload struct {
	ClientID             string `json:"client_id"`
	ConnectClientAddress string `json:"connect_client_address"`
}

type Message struct {
	Type    string      `json:"type"`
	Payload interface{} `json:"payload"`
}

type JSONMessage struct {
	Type    string          `json:"type"`
	Payload json.RawMessage `json:"payload"`
}

func (m Message) MarshalBinary() ([]byte, error) {
	return json.Marshal(m)
}

func (m *Message) UnmarshalJSON(data []byte) error {
	j := &JSONMessage{}
	if err := json.Unmarshal(data, j); err != nil {
		return err
	}
	m.Type = j.Type
	switch j.Type {
	case TypeDisconnect:
		m.Payload = &DisconnectPayload{}
		return json.Unmarshal(j.Payload, m.Payload)
	default:
		return errors.New("error type not found")
	}
}
