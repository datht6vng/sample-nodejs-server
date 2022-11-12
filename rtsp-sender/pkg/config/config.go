package config

import (
	"github.com/datht6vng/hcmut-thexis/rtsp-sender/pkg/logger"
	"github.com/spf13/viper"
)

type AppConfig struct {
	SFUConfig *SFUConfig      `mapstructure:"sfu"`
	LogConfig *logger.LogConf `mapstructure:"log"`
}
type SFUConfig struct {
	SFUAddres string `mapstructure:"sfu_address"`
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
