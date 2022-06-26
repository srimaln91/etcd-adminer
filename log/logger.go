package log

import (
	"context"
	"errors"

	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
)

type Logger interface {
	Fatal(ctx context.Context, message string, params ...interface{})
	Error(ctx context.Context, message string, params ...interface{})
	Warn(ctx context.Context, message string, params ...interface{})
	Debug(ctx context.Context, message string, params ...interface{})
	Info(ctx context.Context, message string, params ...interface{})
}

type logger struct {
	zapLogger *zap.SugaredLogger
}

type Level string

const (
	FATAL Level = `FATAL`
	ERROR Level = `ERROR`
	WARN  Level = `WARN`
	INFO  Level = `INFO`
	DEBUG Level = `DEBUG`
)

var logTypes = map[Level]int{
	DEBUG: -1,
	INFO:  0,
	WARN:  1,
	ERROR: 2,
	FATAL: 5,
}

var errlevelNotDefined = errors.New("log level not defined")

func NewLogger(level Level) (Logger, error) {

	logLevel, ok := logTypes[level]
	if !ok {
		return nil, errlevelNotDefined
	}

	lev := zapcore.Level(logLevel)
	cfg := zap.Config{
		Level:         zap.NewAtomicLevelAt(lev),
		Encoding:      "json",
		OutputPaths:   []string{"stdout"},
		EncoderConfig: zap.NewProductionEncoderConfig(),
	}

	l, err := cfg.Build(zap.AddCallerSkip(1))
	if err != nil {
		return nil, err
	}
	defer l.Sync() // flushes buffer, if any

	sugar := l.Sugar()

	return &logger{
		zapLogger: sugar,
	}, nil

}

func (l *logger) Fatal(ctx context.Context, message string, params ...interface{}) {
	l.zapLogger.Fatalw(message, params...)
}

func (l *logger) Error(ctx context.Context, message string, params ...interface{}) {
	l.zapLogger.Errorw(message, params...)
}

func (l *logger) Warn(ctx context.Context, message string, params ...interface{}) {
	l.zapLogger.Warnw(message, params...)
}

func (l *logger) Debug(ctx context.Context, message string, params ...interface{}) {
	l.zapLogger.Debugw(message, params...)
}

func (l *logger) Info(ctx context.Context, message string, params ...interface{}) {
	l.zapLogger.Infow(message, params...)
}
