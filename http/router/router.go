package router

import (
	"context"
	"net/http"

	"github.com/gorilla/mux"
	"github.com/srimaln91/etcd-adminer/http/handlers"
	"github.com/srimaln91/etcd-adminer/log"
)

func NewRouter(logger log.Logger) (http.Handler, error) {

	// Init handler
	jobRequestHandler, err := handlers.NewHTTPHandler(logger)
	if err != nil {
		logger.Fatal(context.Background(), err.Error())
	}

	r := mux.NewRouter()
	r.Use(CORS)
	r.HandleFunc("/api/auth", jobRequestHandler.Authenticate).Methods(http.MethodPost, http.MethodOptions)
	r.HandleFunc("/api/keys", jobRequestHandler.GetKey).Methods(http.MethodGet, http.MethodOptions).Queries("key", "")
	r.HandleFunc("/api/keys", jobRequestHandler.GetKeys).Methods(http.MethodGet, http.MethodOptions)
	r.HandleFunc("/api/keys", jobRequestHandler.UpdateKey).Methods(http.MethodPut, http.MethodOptions)
	r.HandleFunc("/api/keys", jobRequestHandler.DeleteKey).Methods(http.MethodDelete, http.MethodOptions)
	r.HandleFunc("/api/directory", jobRequestHandler.CreateDirectory).Methods(http.MethodPost, http.MethodOptions)
	r.HandleFunc("/api/clusterinfo", jobRequestHandler.ClusterInfo).Methods(http.MethodGet, http.MethodOptions)
	r.HandleFunc("/api/getconfig", jobRequestHandler.GetConfig).Methods(http.MethodGet, http.MethodOptions)
	r.HandleFunc("/api/users", jobRequestHandler.GetUserList).Methods(http.MethodGet, http.MethodOptions)
	r.HandleFunc("/api/users/{name}", jobRequestHandler.GetUserInfo).Methods(http.MethodGet, http.MethodOptions)
	r.HandleFunc("/api/users/{name}/role/{role}", jobRequestHandler.AssignRole).Methods(http.MethodPost, http.MethodOptions)
	r.HandleFunc("/api/users/{name}/role/{role}", jobRequestHandler.UnassignRole).Methods(http.MethodDelete, http.MethodOptions)
	r.HandleFunc("/api/role", jobRequestHandler.GetRoles).Methods(http.MethodGet, http.MethodOptions)

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
