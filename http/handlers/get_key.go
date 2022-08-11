package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/srimaln91/etcd-adminer/etcd"
	"github.com/srimaln91/etcd-adminer/http/request"
	"github.com/srimaln91/etcd-adminer/http/response"
	"go.etcd.io/etcd/api/v3/v3rpc/rpctypes"
)

func (jh *GenericHandler) GetKey(rw http.ResponseWriter, r *http.Request) {

	requestMeta, ok := r.Context().Value(META_KEY).(request.RequestMeta)
	if !ok {
		rw.WriteHeader(http.StatusInternalServerError)
		return
	}

	client, err := etcd.NewClient(requestMeta.Backend.Endpoints(), etcd.WithAuth(requestMeta.User, requestMeta.Pass))
	if err != nil {
		if err == rpctypes.ErrAuthFailed {
			rw.WriteHeader(http.StatusForbidden)
			return
		}

		rw.WriteHeader(http.StatusInternalServerError)
		return
	}

	defer jh.closeEtcdClient(client)

	queryParams := r.URL.Query()
	requestedKey := queryParams.Get("key")

	if requestedKey == "" {
		rw.WriteHeader(http.StatusNotAcceptable)
		return
	}

	etcdKey, err := client.Get(r.Context(), requestedKey)
	if err != nil {
		rw.WriteHeader(http.StatusInternalServerError)
		return
	}

	if etcdKey.Count < 1 {
		rw.WriteHeader(http.StatusNotFound)
		return
	}

	respData := response.Key{
		Key:            string(etcdKey.Kvs[0].Key),
		Value:          string(etcdKey.Kvs[0].Value),
		CreateRevision: etcdKey.Kvs[0].CreateRevision,
		ModRevision:    etcdKey.Kvs[0].ModRevision,
		Version:        etcdKey.Kvs[0].Version,
		Lease:          etcdKey.Kvs[0].Lease,
	}

	response, err := json.Marshal(respData)
	if err != nil {
		rw.WriteHeader(http.StatusInternalServerError)
		return
	}

	rw.Header().Add("Content-Type", "application/json")
	rw.WriteHeader(http.StatusOK)
	rw.Write(response)

}
