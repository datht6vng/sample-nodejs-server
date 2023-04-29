package entity

import (
	"encoding/json"
	"os"
	"strings"
	"time"

	"github.com/datht6vng/hcmut-thexis/rtsp-sender/pkg/util"
)

type RecordMetadata struct {
	RecordFilename string    `json:"record_filename"`
	Timestamp      time.Time `json:"timestamp"`
}

type Metadata struct {
	Filename       string           `json:"filename,omitempty"`
	Session        string           `json:"session"`
	RecordMetadata []RecordMetadata `json:"record_metadata,omitempty"`
}

func (m *Metadata) Write() error {
	file, _ := json.MarshalIndent(m, "", "\t")
	return os.WriteFile(m.Filename, file, 0777)
}

func (m *Metadata) PushRecord(recordFilename string, timestamp time.Time) {
	m.RecordMetadata = util.InsertSorted(
		m.RecordMetadata,
		RecordMetadata{
			RecordFilename: recordFilename,
			Timestamp:      timestamp,
		},
		func(i int) bool {
			return timestamp.Before(m.RecordMetadata[i].Timestamp)
		},
	)
}

func (m *Metadata) RemoveRecord(recordFilename string) {
	m.RecordMetadata = util.RemoveItemInSortedSlice(
		m.RecordMetadata,
		func(i int) int {
			return strings.Compare(recordFilename, m.RecordMetadata[i].RecordFilename)
		},
	)
}
