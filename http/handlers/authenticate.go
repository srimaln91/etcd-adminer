package handlers

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/srimaln91/etcd-adminer/etcd"
	"go.etcd.io/etcd/api/v3/v3rpc/rpctypes"
)

func (jh *GenericHandler) Authenticate(rw http.ResponseWriter, r *http.Request) {

	user, pass, _ := r.BasicAuth()

	endpointString := r.Header.Get("X-Endpoints")
	endpoints := parseEndpoints(endpointString)

	client, err := etcd.NewClient(endpoints, etcd.WithAuth(user, pass))
	if err != nil {
		if err == rpctypes.ErrAuthFailed {
			rw.WriteHeader(http.StatusForbidden)
			return
		}

		rw.WriteHeader(http.StatusInternalServerError)
		return
	}

	defer jh.closeEtcdClient(client)

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
