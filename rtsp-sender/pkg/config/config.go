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
	Port int `mapstructure:"port"`
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
