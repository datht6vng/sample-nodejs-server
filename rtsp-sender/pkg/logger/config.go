package logger

type LogConf struct {
	Level     string `mapstructure:"level"`
	FilePath  string `mapstructure:"filePath"`
	MaxSize   int    `mapstructure:"maxSize"`
	MaxBackup int    `mapstructure:"maxBackups"`
	MaxAge    int    `mapstructure:"maxAge"`
}
