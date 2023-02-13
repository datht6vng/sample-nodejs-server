package config

import (
	"github.com/datht6vng/hcmut-thexis/rtsp-sender/pkg/logger"
	"github.com/spf13/viper"
)

type AppConfig struct {
	RTSPSenderConfig *RTSPSenderConfig `mapstructure:"rtsp_sender"`
	SFUConfig        *SFUConfig        `mapstructure:"sfu"`
	LogConfig        *logger.LogConf   `mapstructure:"log"`
	NetworkConfig    *NetworkConfig    `mapstructure:"network"`
}

type RTSPSenderConfig struct {
	GRPCConfig      RTSPSenderGRPCConfig      `mapstructure:"grpc"`
	RTSPRelayConfig RTSPSenderRTSPRelayConfig `mapstructure:"rtsp_relay"`
}
type RTSPSenderGRPCConfig struct {
	Port int `mapstructure:"port"`
}
type RTSPSenderRTSPRelayConfig struct {
	RTSPRelayServerPath       string `mapstructure:"rtsp_relay_server_path"`
	RTSPRelayServerConfigPath string `mapstructure:"rtsp_relay_server_config_path"`
	RTSPRelayIP               string `mapstructure:"rtsp_relay_ip"`
	RTSPRelayPort             int    `mapstructure:"rtsp_relay_port"`
}

type SFUConfig struct {
	SFUAddres string `mapstructure:"sfu_address"`
}

type NetworkConfig struct {
	MaxBitrate   int `mapstructure:"max_bitrate"`
	MinBitrate   int `mapstructure:"min_bitrate"`
	TWCCInterval int `mapstructure:"twcc_interval"`
}

var (
	Config AppConfig
)

func ReadConfig(configPath string) error {
	viper := viper.New()
	viper.SetConfigFile(configPath)
	if err := viper.ReadInConfig(); err != nil {
		return err
	}
	if err := viper.Unmarshal(&Config); err != nil {
		return err
	}
	return nil
}
