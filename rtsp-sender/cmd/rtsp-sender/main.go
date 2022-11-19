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
	if !parse() {
		return
	}
	logger.InitFileLogger("rtsp-sender", *config.Config.LogConfig, "")
	// go http.ServeHTTP()
	// go streamer.ServeStreams()
	rtspSender, err := rtsp_sender.NewRTSPSender()
	if err != nil {
		logger.Errorf("Error when creating rtsp-sender: %v", err)
		return
	}
	rtspSender.Start()

	sigs := make(chan os.Signal, 1)
	done := make(chan bool, 1)
	signal.Notify(sigs, syscall.SIGINT, syscall.SIGTERM)
	go func() {
		sig := <-sigs
		logger.Infof("%v", sig)
		done <- true
	}()
	logger.Infof("Server Start Awaiting Signal")
	<-done
	logger.Infof("Exiting")
}
