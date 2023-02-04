package main

import (
	"flag"
	"fmt"
	"os"
	"os/signal"
	"syscall"

	"github.com/datht6vng/hcmut-thexis/rtsp-sender/apps/rtsp_sender"
	"github.com/datht6vng/hcmut-thexis/rtsp-sender/pkg/config"
	"github.com/datht6vng/hcmut-thexis/rtsp-sender/pkg/logger"
)

var (
	configFile string
)

func showHelp() {
	fmt.Printf("Usage:%s {params}\n", os.Args[0])
	fmt.Println("      -c {config file}")
	fmt.Println("      -h (show help info)")
}
func parse() bool {
	flag.StringVar(&configFile, "c", "./config.toml", "config file")
	help := flag.Bool("h", false, "help info")
	flag.Parse()
	if _, err := os.Stat(configFile); os.IsNotExist(err) || *help {
		showHelp()
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

	nodeID := "rtsp-sender"
	if hostName := os.Getenv("HOSTNAME"); hostName != "" {
		nodeID += hostName
	}
	if !parse() {
		return
	}
	logger.InitFileLogger(nodeID, *config.Config.LogConfig, "")

	handler, err := rtsp_sender.NewHandler(nodeID)
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
