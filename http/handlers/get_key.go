package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/srimaln91/etcd-adminer/etcd"
	"github.com/srimaln91/etcd-adminer/http/response"
	"go.etcd.io/etcd/api/v3/v3rpc/rpctypes"
)

func (jh *GenericHandler) GetKey(rw http.ResponseWriter, r *http.Request) {

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
