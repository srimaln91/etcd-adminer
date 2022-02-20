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

	r.HandleFunc("/api/getconfig", jobRequestHandler.GetConfig).Methods(http.MethodGet, http.MethodOptions)
	r.HandleFunc("/api/auth", jobRequestHandler.Authenticate).Methods(http.MethodPost, http.MethodOptions)

	r.Handle("/api/keys", authenticate(jobRequestHandler.GetKey)).Methods(http.MethodGet, http.MethodOptions).Queries("key", "")
	r.Handle("/api/keys", authenticate(jobRequestHandler.GetKeys)).Methods(http.MethodGet, http.MethodOptions)
	r.Handle("/api/keys", authenticate(jobRequestHandler.UpdateKey)).Methods(http.MethodPut, http.MethodOptions)
	r.Handle("/api/keys", authenticate(jobRequestHandler.DeleteKey)).Methods(http.MethodDelete, http.MethodOptions)

	r.Handle("/api/directory", authenticate(jobRequestHandler.CreateDirectory)).Methods(http.MethodPost, http.MethodOptions)
	r.Handle("/api/clusterinfo", authenticate(jobRequestHandler.ClusterInfo)).Methods(http.MethodGet, http.MethodOptions)

	r.Handle("/api/users", authenticate(jobRequestHandler.GetUserList)).Methods(http.MethodGet, http.MethodOptions)
	r.Handle("/api/users", authenticate(jobRequestHandler.CreateUser)).Methods(http.MethodPost, http.MethodOptions)
	r.Handle("/api/users/{name}", authenticate(jobRequestHandler.GetUserInfo)).Methods(http.MethodGet, http.MethodOptions)
	r.Handle("/api/users/{name}", authenticate(jobRequestHandler.DeleteUser)).Methods(http.MethodDelete, http.MethodOptions)
	r.Handle("/api/users/{name}/role/{role}", authenticate(jobRequestHandler.AssignRole)).Methods(http.MethodPost, http.MethodOptions)
	r.Handle("/api/users/{name}/role/{role}", authenticate(jobRequestHandler.UnassignRole)).Methods(http.MethodDelete, http.MethodOptions)

	r.Handle("/api/role", authenticate(jobRequestHandler.GetRoles)).Methods(http.MethodGet, http.MethodOptions)

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

func authenticate(next http.HandlerFunc) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Check HTTP authorization header
		_, _, ok := r.BasicAuth()
		if !ok {
			w.WriteHeader(http.StatusForbidden)
			return
		}

		// Check whether the endpoints are provided
		endpointString := r.Header.Get("X-Endpoints")
		if endpointString == "" {
			w.WriteHeader(http.StatusNotAcceptable)
			return
		}

		if len(endpointString) < 1 {
			w.WriteHeader(http.StatusNotAcceptable)
			return
		}

		// Call the next handler
		next.ServeHTTP(w, r)
	})
}
