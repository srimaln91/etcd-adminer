package handlers

import (
	"encoding/json"
	"net/http"
	"strings"
	"time"

	"github.com/srimaln91/etcd-adminer/etcd"
	"go.etcd.io/etcd/api/v3/v3rpc/rpctypes"
)

func (jh *GenericHandler) Authenticate(rw http.ResponseWriter, r *http.Request) {

	user, pass, ok := r.BasicAuth()
	if !ok {
		rw.WriteHeader(http.StatusForbidden)
		return
	}

	endpointString := r.Header.Get("X-Endpoints")
	if endpointString == "" {
		rw.WriteHeader(http.StatusNotAcceptable)
		return
	}

	endpoints := strings.Split(endpointString, ",")
	if len(endpointString) < 1 {
		rw.WriteHeader(http.StatusNotAcceptable)
		return
	}

	_, err := etcd.NewClient(endpoints, etcd.WithAuth(user, pass))
	if err != nil {
		if err == rpctypes.ErrAuthFailed {
			rw.WriteHeader(http.StatusForbidden)
			return
		}

		rw.WriteHeader(http.StatusInternalServerError)
		return
	}

	response := struct {
		Token    string    `json:"token"`
		CreateAt time.Time `json:"created_at"`
	}{
		Token:    "token",
		CreateAt: time.Now(),
	}

	respData, err := json.Marshal(response)
	if err != nil {
		rw.WriteHeader(http.StatusInternalServerError)
		return
	}

	rw.Header().Add("Content-Type", "application/json")
	rw.WriteHeader(http.StatusOK)
	rw.Write(respData)

}
