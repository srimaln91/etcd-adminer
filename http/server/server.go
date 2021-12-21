package server

import (
	"context"
	"fmt"

	"github.com/srimaln91/etcd-adminer/log"

	"net/http"
	"time"
)

type server struct {
	httpServer http.Server
	logger     log.Logger
}

// Init initializes the server
func Start(address string, handler http.Handler, logger log.Logger) (server, error) {

	// initialize the router
	// r := router.Init(srv.container, srv.config.AppConfig)

	httpServer := &http.Server{
		Addr: address,

		// good practice to set timeouts to avoid Slowloris attacks
		WriteTimeout: time.Second * 60,
		ReadTimeout:  time.Second * 60,
		IdleTimeout:  time.Second * 60,

		// pass our instance of gorilla/mux in
		Handler: handler,
	}

	// run our server in a goroutine so that it doesn't block
	go func() {

		err := httpServer.ListenAndServe()
		if err != nil {
			logger.Fatal(context.TODO(), err.Error())
		}
	}()

	// srv.server = server
	logger.Info(context.Background(), fmt.Sprintf("HTTP server listening on %s", address), "functional_path", "http.server.Init")

	return server{
		httpServer: *httpServer,
	}, nil

}

// ShutDown releases all http connections gracefully and shut down the server
func (srv *server) ShutDown(ctx context.Context) {

	// srv.logger.Warn("http.server.ShutDown", "Stopping HTTP Server")
	srv.httpServer.SetKeepAlivesEnabled(false)

	// Doesn't block if no connections, but will otherwise wait
	// until the timeout deadline.
	err := srv.httpServer.Shutdown(ctx)
	if err != nil {
		srv.logger.Fatal(ctx, "Unable to stop HTTP server", "functional_path", "http.server.ShutDown")

	}

}
