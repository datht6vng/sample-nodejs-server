package logger

import (
	"fmt"
	"io"
	"os"
	"sync"
	"time"

	"github.com/evalphobia/logrus_sentry"
	"github.com/sirupsen/logrus"
	lumberjack "gopkg.in/natefinch/lumberjack.v2"
)

type ReqStatus int

const (
	ReqSuccess ReqStatus = iota

	ReqFail
)

// Level type
type Level uint32
type Fields map[string]interface{}

// These are the different logging levels. You can set the logging level to log
// on your instance of logger, obtained with `logrus.New()`.
const (
	// PanicLevel level, highest level of severity. Logs and then calls panic with the
	// message passed to Debug, Info, ...
	PanicLevel Level = iota
	// FatalLevel level. Logs and then calls `logger.Exit(1)`. It will exit even if the
	// logging level is set to Panic.
	FatalLevel
	// ErrorLevel level. Logs. Used for errors that should definitely be noted.
	// Commonly used for hooks to send errors to an error tracking service.
	ErrorLevel
	// WarnLevel level. Non-critical entries that deserve eyes.
	WarnLevel
	// InfoLevel level. General operational entries about what's going on inside the
	// application.
	InfoLevel
	// DebugLevel level. Usually only enabled when debugging. Very verbose logging.
	DebugLevel
	// TraceLevel level. Designates finer-grained informational events than the Debug.
	TraceLevel
)

const (
	maximumCallerDepth int = 25
	knownLogrusFrames  int = 4
	timeFormat             = "2006-01-02T15:04:05.000"
)

var (
	// Used for caller information initialisation
	callerInitOnce     sync.Once
	logrusPackage      string
	minimumCallerDepth = 1
	loggers            = make(map[string]*MyLogger)
	loggerLock         sync.Mutex
	defaultLogger      = NewLogger(DebugLevel, "default")
)

func GetLogger() *logrus.Logger {
	return defaultLogger
}

// Infof logs a formatted info level log to the console
func Infof(format string, v ...interface{}) { defaultLogger.Infof(format, v...) }

// Tracef logs a formatted debug level log to the console
func Tracef(format string, v ...interface{}) { defaultLogger.Tracef(format, v...) }

// Debugf logs a formatted debug level log to the console
func Debugf(format string, v ...interface{}) { defaultLogger.Debugf(format, v...) }

// Warnf logs a formatted warn level log to the console
func Warnf(format string, v ...interface{}) { defaultLogger.Warnf(format, v...) }

// Errorf logs a formatted error level log to the console
func Errorf(format string, v ...interface{}) { defaultLogger.Errorf(format, v...) }

// Panicf logs a formatted panic level log to the console.
// The panic() function is called, which stops the ordinary flow of a goroutine.
func Panicf(format string, v ...interface{}) { defaultLogger.Panicf(format, v...) }

func LogCall(callId, action string, status ReqStatus, latency time.Duration, clientType string) {
	LogCallFull(callId, action, status, latency, "", "", clientType)
}

func LogCallFull(callId, action string, status ReqStatus, latency time.Duration, metadata string, deviceInfo string, clientType string) {
	defaultLogger.Infof("%s %s %s %s %d %d %s %s %s", callId, action, "", "", status, latency, clientType, deviceInfo, metadata)
}

func Init(level string, prefix string, sentryDsn string) {
	l := logrus.DebugLevel
	switch level {
	case "trace":
		l = logrus.TraceLevel
	case "debug":
		l = logrus.DebugLevel
	case "info":
		l = logrus.InfoLevel
	case "warn":
		l = logrus.WarnLevel
	case "error":
		l = logrus.ErrorLevel
	}

	defaultLogger.SetLevel(l)
	defaultLogger.SetFormatter(&TextFormatter{
		Prefix:          prefix,
		FullTimestamp:   true,
		TimestampFormat: timeFormat,
		ForceFormatting: true,
		colorScheme:     defaultCompiledColorScheme,
	})

	if sentryDsn != "" {
		hook, err := logrus_sentry.NewSentryHook(sentryDsn, []logrus.Level{
			logrus.PanicLevel,
			logrus.FatalLevel,
			logrus.ErrorLevel,
			logrus.WarnLevel,
		})

		if err == nil {
			defaultLogger.Hooks.Add(hook)
		}
	}
}

func InitFileLogger(prefix string, conf LogConf, sentryDsn string) {
	l := logrus.DebugLevel
	switch conf.Level {
	case "trace":
		l = logrus.TraceLevel
	case "debug":
		l = logrus.DebugLevel
	case "info":
		l = logrus.InfoLevel
	case "warn":
		l = logrus.WarnLevel
	case "error":
		l = logrus.ErrorLevel
	}

	defaultLogger.SetLevel(l)
	defaultLogger.SetFormatter(&TextFormatter{
		Prefix:          prefix,
		FullTimestamp:   true,
		TimestampFormat: timeFormat,
		ForceFormatting: true,
		colorScheme:     defaultCompiledColorScheme,
	})

	// file, e := os.OpenFile(filePath, os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0666)
	// if e != nil {
	// 	fmt.Printf("Failed to open log file")
	// }

	file := &lumberjack.Logger{
		Filename:   conf.FilePath,
		MaxSize:    conf.MaxSize, // megabytes
		MaxBackups: conf.MaxBackup,
		MaxAge:     conf.MaxAge, //days
		LocalTime:  true,
	}

	multi := io.MultiWriter(file, os.Stdout)
	defaultLogger.SetOutput(multi)

	if sentryDsn != "" {
		hook, err := logrus_sentry.NewSentryHook(sentryDsn, []logrus.Level{
			logrus.PanicLevel,
			logrus.FatalLevel,
			logrus.ErrorLevel,
			logrus.WarnLevel,
		})

		if err == nil {
			defaultLogger.Hooks.Add(hook)
		}
	}
}

type MyLogger struct {
	logger *logrus.Logger
	level  Level
	prefix string
}

func (ml *MyLogger) Level() string {
	switch ml.level {
	case PanicLevel:
		return "Panic"
	case FatalLevel:
		return "Fatal"
	case ErrorLevel:
		return "Error"
	case WarnLevel:
		return "Warn"
	case InfoLevel:
		return "Info"
	case DebugLevel:
		return "Debug"
	case TraceLevel:
		return "Trace"
	}
	return "Unkown"
}

func (ml *MyLogger) Prefix() string {
	return ml.prefix
}

func (ml *MyLogger) SetLevel(level Level) {
	ml.logger.SetLevel(logrus.Level(level))
}

func NewLoggerWithConfig(level Level, conf LogConf, prefix string) *logrus.Logger {
	loggerLock.Lock()
	defer loggerLock.Unlock()
	if logger, found := loggers[prefix]; found {
		return logger.logger
	}
	l := logrus.New()

	file := &lumberjack.Logger{
		Filename:   conf.FilePath,
		MaxSize:    conf.MaxSize, // megabytes
		MaxBackups: conf.MaxBackup,
		MaxAge:     conf.MaxAge, //days
		LocalTime:  true,
	}

	multi := io.MultiWriter(file, os.Stdout)
	l.SetOutput(multi)
	l.SetReportCaller(true)
	l.SetLevel(logrus.Level(level))
	l.SetFormatter(&TextFormatter{
		Prefix:          prefix,
		FullTimestamp:   true,
		TimestampFormat: timeFormat,
		ForceFormatting: true,
		colorScheme:     defaultCompiledColorScheme,
	})

	loggers[prefix] = &MyLogger{
		logger: l,
		level:  level,
		prefix: prefix,
	}
	return l
}

func NewLogger(level Level, prefix string) *logrus.Logger {
	loggerLock.Lock()
	defer loggerLock.Unlock()
	if logger, found := loggers[prefix]; found {
		return logger.logger
	}
	l := logrus.New()
	l.SetOutput(os.Stdout)
	l.SetReportCaller(true)
	l.SetLevel(logrus.Level(level))
	l.SetFormatter(&TextFormatter{
		Prefix:          prefix,
		FullTimestamp:   true,
		TimestampFormat: timeFormat,
		ForceFormatting: true,
	})

	loggers[prefix] = &MyLogger{
		logger: l,
		level:  level,
		prefix: prefix,
	}
	return l
}

func NewLoggerWithFields(level Level, prefix string, fields Fields) *logrus.Logger {
	loggerLock.Lock()
	defer loggerLock.Unlock()
	if logger, found := loggers[prefix]; found {
		return logger.logger
	}
	l := logrus.New()
	l.SetOutput(os.Stdout)
	l.SetReportCaller(true)
	l.SetLevel(logrus.Level(level))
	l.SetFormatter(&TextFormatter{
		Prefix:          prefix,
		Fields:          fields,
		FullTimestamp:   true,
		TimestampFormat: timeFormat,
		ForceFormatting: true,
	})

	loggers[prefix] = &MyLogger{
		logger: l,
		level:  level,
		prefix: prefix,
	}

	return l
}

func SetLogLevel(prefix string, level Level) error {
	loggerLock.Lock()
	defer loggerLock.Unlock()
	if l, found := loggers[prefix]; found {
		l.level = level
		l.logger.SetLevel(logrus.Level(level))
		return nil
	}
	return fmt.Errorf("logger [%v] not found", prefix)
}

func GetLoggers() map[string]*MyLogger {
	return loggers
}

type Ctx map[string]interface{}

// Trace implements Logger.
func Trace(message string, ctx Ctx) (int, error) {
	Tracef("%s : %v", message, ctx)
	return 1, nil
}

// Debug implements Logger.
func Debug(message string, ctx Ctx) (int, error) {
	Debugf("%s : %v", message, ctx)
	return 1, nil
}

// Info implements Logger.
func Info(message string, ctx Ctx) (int, error) {
	Infof("%s : %v", message, ctx)
	return 1, nil
}

// Warn implements Logger.
func Warn(message string, ctx Ctx) (int, error) {
	Warnf("%s : %v", message, ctx)
	return 1, nil
}

// Error implements Logger.
func Error(message string, err error, ctx Ctx) (int, error) {
	if err != nil {
		if message != "" {
			message = fmt.Sprintf("%s: %+v", message, err)
		} else {
			message = fmt.Sprintf("%+v", err)
		}
	}

	Errorf("%s : %v", message, ctx)
	return 1, nil
}
