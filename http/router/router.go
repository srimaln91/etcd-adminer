package router

import (
	"net/http"

	"github.com/gorilla/mux"
	"github.com/srimaln91/etcd-adminer/http/handlers"
	"github.com/srimaln91/etcd-adminer/log"
)

func NewRouter(logger log.Logger) (http.Handler, error) {

	// fs := http.FileServer(http.Dir("./static/"))

	// Init handler
	jobRequestHandler := handlers.NewHTTPHandler(logger)

	r := mux.NewRouter()
	r.Use(CORS)
	r.HandleFunc("/api/auth", jobRequestHandler.Authenticate).Methods(http.MethodPost, http.MethodOptions)
	r.HandleFunc("/api/keys", jobRequestHandler.GetKey).Methods(http.MethodGet, http.MethodOptions).Queries("key", "")
	r.HandleFunc("/api/keys", jobRequestHandler.GetKeys).Methods(http.MethodGet, http.MethodOptions)

	// r.HandleFunc("/api/job/{id}", jobRequestHandler.GetJob).Methods(http.MethodGet, http.MethodOptions)

	spa := spaHandler{staticPath: "static", indexPath: "index.html"}
	r.PathPrefix("/").Handler(spa)

	return r, nil
}

func CORS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {

		// Set headers
		w.Header().Set("Access-Control-Allow-Headers", "*")
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "*")

		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}

		// Next
		next.ServeHTTP(w, r)
	})
}