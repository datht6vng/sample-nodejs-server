package uploader

import (
	"context"
	"fmt"
	"os"
	"path/filepath"

	"golang.org/x/oauth2/google"
	"google.golang.org/api/drive/v3"
	"google.golang.org/api/option"
)

type GoogleUploader struct {
	service *drive.Service
}

func NewGoogleUploader(serviceAccountFile string) (*GoogleUploader, error) {
	ctx := context.Background()

	b, err := os.ReadFile(serviceAccountFile)
	if err != nil {
		return nil, err
	}

	serviceAccount, err := google.JWTConfigFromJSON(b, drive.DriveScope)
	if err != nil {
		return nil, err
	}

	service, err := drive.NewService(ctx, option.WithTokenSource(serviceAccount.TokenSource(ctx)))
	if err != nil {
		return nil, err
	}
	return &GoogleUploader{
		service: service,
	}, nil
}

func (g *GoogleUploader) UploadFile(filePath, destination string) (string, error) {
	videoFile, err := os.Open(filePath)
	if err != nil {
		return "", err
	}
	defer videoFile.Close()

	videoMetadata := &drive.File{
		Name:    filepath.Base(filePath), // Tên tệp video trên Google Drive
		Parents: []string{destination},
	}

	uploadedFile, err := g.service.Files.Create(videoMetadata).Media(videoFile).Do()
	if err != nil {
		return "", err
	}
	return fmt.Sprintf("https://drive.google.com/uc?export=preview&id=%v", uploadedFile.Id), nil
}
