package main

import (
	"flag"
	"fmt"
	"log"
	"os"
	"os/signal"
	"syscall"

	"github.com/datht6vng/hcmut-thexis/rtsp-sender/pkg/client"
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

	// Test code
	client := client.NewClient(config.Config.SFUConfig.SFUAddres, "ion")
	if err := client.Connect(); err != nil {
		logger.Errorf("Error sfu connect: %v", err)
	}
	// =================

	sigs := make(chan os.Signal, 1)
	done := make(chan bool, 1)
	signal.Notify(sigs, syscall.SIGINT, syscall.SIGTERM)
	go func() {
		sig := <-sigs
		log.Println(sig)
		done <- true
	}()
	log.Println("Server Start Awaiting Signal")
	<-done
	log.Println("Exiting")
}
