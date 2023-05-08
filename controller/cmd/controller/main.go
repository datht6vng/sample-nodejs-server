package main

import (
	"flag"
	"fmt"
	"os"
	"os/signal"
	"syscall"

	"github.com/dathuynh1108/hcmut-thexis/controller/apps/controller"
	"github.com/dathuynh1108/hcmut-thexis/controller/pkg/config"
	"github.com/dathuynh1108/hcmut-thexis/controller/pkg/logger"
	"github.com/google/uuid"
	"github.com/tinyzimmer/go-gst/gst"
)

var (
	configFile string
)

func parse() bool {
	flag.StringVar(&configFile, "c", "./config.toml", "config file")
	help := flag.Bool("h", false, "help info")
	flag.Parse()
	if _, err := os.Stat(configFile); os.IsNotExist(err) || *help {
		fmt.Println("Cannot find config file:", configFile)
		return false
	}
	if err := config.ReadConfig(configFile); err != nil {
		logger.Errorf("Error when reading config file: %v", err)
		return false
	}
	return true
}

func main() {
	fmt.Println("------------ Start RTSP Sender ------------")

	nodeID := "controller"
	if hostName := os.Getenv("HOSTNAME"); hostName != "" {
		nodeID += "_" + hostName
	} else {
		nodeID += "_" + uuid.NewString()
	}
	if !parse() {
		return
	}
	config.Config.NodeID = nodeID
	logger.InitFileLogger(nodeID, *config.Config.LogConfig, "")
	gst.Init(nil)
	handler, err := controller.NewHandler(nodeID)
	if err != nil {
		logger.Infof("Cannot init rtsp sender handler with error: %v", nodeID, err)
	}

	if err := handler.Start(); err != nil {
		logger.Infof("Cannot start rtsp sender handler with error: %v", err)
	}

	sigs := make(chan os.Signal, 1)
	done := make(chan bool, 1)
	signal.Notify(sigs, syscall.SIGINT, syscall.SIGTERM)
	go func() {
		sig := <-sigs
		logger.Infof("%v", sig)
		done <- true
	}()
	logger.Infof("Server is running and awaiting signal for shutdown ...")
	<-done
	logger.Infof("Exiting")
}
