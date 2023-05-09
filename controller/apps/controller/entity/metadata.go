package entity

import (
	"bytes"
	"encoding/json"
	"strings"
	"time"

	"github.com/dathuynh1108/hcmut-thesis/controller/pkg/util"
	"github.com/rogpeppe/go-internal/lockedfile"
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
	return lockedfile.Write(m.Filename, bytes.NewBuffer(file), 0777)
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

func ReadMetadata(filename string) (*Metadata, error) {
	bytesContent, err := lockedfile.Read(filename)
	if err != nil {
		return nil, err
	}
	m := &Metadata{}
	if err := json.Unmarshal(bytesContent, m); err != nil {
		return nil, err
	}
	return m, nil
}
