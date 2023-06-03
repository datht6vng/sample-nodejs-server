package uploader

import (
	"context"
	"fmt"
	"os"
	"path/filepath"

	"github.com/dathuynh1108/hcmut-thesis/controller/pkg/util"
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
	// Make a copy of the file
	originalFile, err := os.Open(filePath)
	if err != nil {
		originalFile.Close()
		return "", err
	}

	copyFilePath := util.FileNameWithoutExt(filePath) + "_upload" + filepath.Ext(filePath)
	copyFile, err := os.Create(copyFilePath)
	if err != nil {
		return "", err
	}

	copyFile.ReadFrom(originalFile)
	originalFile.Close()
	copyFile.Sync()
	copyFile.Close()

	copyFile, err = os.Open(filePath)
	defer func() {
		copyFile.Close()
		os.RemoveAll(copyFilePath)
	}()
	if err != nil {
		return "", err
	}

	videoMetadata := &drive.File{
		Name:    filepath.Base(copyFilePath), // Tên tệp video trên Google Drive
		Parents: []string{destination},
	}

	uploadedFile, err := g.service.Files.Create(videoMetadata).Media(copyFile).Do()
	if err != nil {
		return "", err
	}
	return fmt.Sprintf("https://drive.google.com/uc?export=preview&id=%v", uploadedFile.Id), nil
}
