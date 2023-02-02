package main

import (
	"flag"
	"fmt"
	"net"
	"os"
	"os/signal"
	"syscall"

	"github.com/datht6vng/hcmut-thexis/rtsp-sender/apps/rtsp_sender/interface/grpc_interface"
	"github.com/datht6vng/hcmut-thexis/rtsp-sender/pkg/config"
	grpc_pb "github.com/datht6vng/hcmut-thexis/rtsp-sender/pkg/grpc"
	"github.com/datht6vng/hcmut-thexis/rtsp-sender/pkg/logger"
	"google.golang.org/grpc"
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

	// gRPC Interface
	grpcAddress := fmt.Sprintf("localhost:%d", *&config.Config.RTSPSenderConfig.Port)
	listen, err := net.Listen("tcp", grpcAddress)
	if err != nil {
		logger.Infof("Cannot listen on address: %v", grpcAddress)
	}

	var opts []grpc.ServerOption
	grpcServer := grpc.NewServer(opts...)
	grpcRTSPSenderServer := grpc_interface.NewGRPCRTSPSenderServer()
	grpc_pb.RegisterRTSPSenderServer(grpcServer, grpcRTSPSenderServer)
	grpcServer.Serve(listen)

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
