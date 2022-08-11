package handlers

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/srimaln91/etcd-adminer/etcd"
	"github.com/srimaln91/etcd-adminer/http/request"
	"go.etcd.io/etcd/api/v3/v3rpc/rpctypes"
)

func (jh *GenericHandler) Authenticate(rw http.ResponseWriter, r *http.Request) {

	requestMeta, ok := r.Context().Value(META_KEY).(request.RequestMeta)
	if !ok {
		rw.WriteHeader(http.StatusInternalServerError)
		jh.logger.Error(r.Context(), "invalid request meta", requestMeta)
		return
	}

	client, err := etcd.NewClient(requestMeta.Backend.Endpoints())
	if err != nil {
		rw.WriteHeader(http.StatusInternalServerError)
		jh.logger.Error(r.Context(), err.Error())
		return
	}

	defer jh.closeEtcdClient(client)

	s, err := client.Authenticate(r.Context(), requestMeta.User, requestMeta.Pass)
	if err != nil {
		if err == rpctypes.ErrAuthFailed {
			rw.WriteHeader(http.StatusForbidden)
			return
		}

		rw.WriteHeader(http.StatusInternalServerError)
		jh.logger.Error(r.Context(), err.Error())
		return
	}

	response := struct {
		Token    string    `json:"token"`
		CreateAt time.Time `json:"created_at"`
	}{
		Token:    s.Token,
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
