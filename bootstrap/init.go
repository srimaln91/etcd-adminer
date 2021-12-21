package bootstrap

import (
	"context"
	"flag"
	"fmt"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/srimaln91/etcd-adminer/config"
	"github.com/srimaln91/etcd-adminer/http/router"
	"github.com/srimaln91/etcd-adminer/http/server"
	"github.com/srimaln91/etcd-adminer/log"
)

func Init() {

	// Read and parse config
	configFilePath := flag.String("config", "config.yaml", "config filepath")
	flag.Parse()

	cfg, err := config.Parse(*configFilePath)
	if err != nil {
		panic(err)
	}

	// Init Logger
	logger, err := log.NewLogger(cfg.Logger.Level)
	if err != nil {
		panic(err)
	}

	// Init Http handler
	httpHandler, _ := router.NewRouter(logger)

	// Init Http server
	httpSrv, err := server.Start(fmt.Sprintf(":%d", cfg.HTTP.Port), httpHandler, logger)
	if err != nil {
		logger.Fatal(context.TODO(), err.Error())
	}

	// Listen for term signals
	c := make(chan os.Signal, 1)

	// We'll accept graceful shutdowns when quit via SIGINT (Ctrl+C)
	signal.Notify(c, os.Interrupt, syscall.SIGTERM, syscall.SIGQUIT, syscall.SIGINT)

	// Block until we receive our signal
	signal := <-c

	logger.Info(context.Background(), fmt.Sprintf("received signal: %s", signal))

	// Shutdown Http server
	// Create a deadline to wait for.
	ctx, cancel := context.WithTimeout(context.Background(), time.Second*5)
	defer cancel()

	httpSrv.ShutDown(ctx)

	<-ctx.Done()

	// Destruct other resources and stop the service
	Destruct()
}

func Destruct() {
	// TODO: Release acquired resouces and exit gracefully
}
