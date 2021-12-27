package handlers

import (
	"encoding/json"
	"net/http"
	"strings"
	"time"

	"github.com/srimaln91/etcd-adminer/config"
	"github.com/srimaln91/etcd-adminer/etcd"
	"github.com/srimaln91/etcd-adminer/filetree"
	"github.com/srimaln91/etcd-adminer/http/request"
	"github.com/srimaln91/etcd-adminer/http/response"
	"github.com/srimaln91/etcd-adminer/log"
	"go.etcd.io/etcd/api/v3/v3rpc/rpctypes"
	clientv3 "go.etcd.io/etcd/client/v3"
)

type GenericHandler struct {
	logger log.Logger
}

func NewHTTPHandler(logger log.Logger) GenericHandler {
	return GenericHandler{
		logger: logger,
	}
}

func (jh *GenericHandler) Authenticate(rw http.ResponseWriter, r *http.Request) {

	user, pass, ok := r.BasicAuth()
	if !ok {
		rw.WriteHeader(http.StatusForbidden)
		return
	}

	_, err := etcd.NewClient(config.AppConfig.ETCD.Endpoints, etcd.WithAuth(user, pass))
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

	rw.WriteHeader(http.StatusOK)
	rw.Write(respData)
	rw.Header().Add("Content-Type", "application/json")

}

func (jh *GenericHandler) GetKeys(rw http.ResponseWriter, r *http.Request) {

	user, pass, ok := r.BasicAuth()
	if !ok {
		rw.WriteHeader(http.StatusForbidden)
		return
	}

	client, err := etcd.NewClient(config.AppConfig.ETCD.Endpoints, etcd.WithAuth(user, pass))
	if err != nil {
		if err == rpctypes.ErrAuthFailed {
			rw.WriteHeader(http.StatusForbidden)
			return
		}

		rw.WriteHeader(http.StatusInternalServerError)
		return
	}

	keys, err := client.Get(r.Context(), "/", clientv3.WithKeysOnly(), clientv3.WithPrefix(), clientv3.WithSort(clientv3.SortByKey, clientv3.SortDescend))
	if err != nil {
		rw.WriteHeader(http.StatusInternalServerError)
		return
	}

	rootDirectory := filetree.NewNode("/")

	for _, k := range keys.Kvs {
		segments := strings.Split(string(k.Key), "/")

		segments = segments[1:]
		length := len(segments)

		path := segments[:length-1]
		filename := segments[length-1]

		rootDirectory.AddFile(path, filename)
	}

	respData, err := json.Marshal(rootDirectory)
	if err != nil {
		rw.WriteHeader(http.StatusInternalServerError)
		return
	}

	rw.WriteHeader(http.StatusOK)
	rw.Write(respData)
	rw.Header().Add("Content-Type", "application/json")

}

func (jh *GenericHandler) GetKey(rw http.ResponseWriter, r *http.Request) {

	user, pass, ok := r.BasicAuth()
	if !ok {
		rw.WriteHeader(http.StatusForbidden)
		return
	}

	client, err := etcd.NewClient(config.AppConfig.ETCD.Endpoints, etcd.WithAuth(user, pass))
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

	rw.WriteHeader(http.StatusOK)
	rw.Write(response)
	rw.Header().Add("Content-Type", "application/json")
}

func (jh *GenericHandler) UpdateKey(rw http.ResponseWriter, r *http.Request) {
	user, pass, ok := r.BasicAuth()
	if !ok {
		rw.WriteHeader(http.StatusForbidden)
		return
	}

	client, err := etcd.NewClient(config.AppConfig.ETCD.Endpoints, etcd.WithAuth(user, pass))
	if err != nil {
		if err == rpctypes.ErrAuthFailed {
			rw.WriteHeader(http.StatusForbidden)
			return
		}

		rw.WriteHeader(http.StatusInternalServerError)
		return
	}

	reqDataDecoded := request.CreateKeyRequest{}
	decoder := json.NewDecoder(r.Body)

	err = decoder.Decode(&reqDataDecoded)
	if err != nil {
		rw.WriteHeader(http.StatusUnprocessableEntity)
		return
	}

	resp, err := client.Put(r.Context(), reqDataDecoded.Key, reqDataDecoded.Value)
	if err != nil {
		if err == rpctypes.ErrAuthFailed {
			rw.WriteHeader(http.StatusForbidden)
			return
		}

		rw.WriteHeader(http.StatusInternalServerError)
		return
	}

	responseData := response.UpdateKeyResponse{}
	responseData.Revision = resp.Header.Revision

	responseBytes, err := json.Marshal(responseData)
	if err != nil {
		rw.WriteHeader(http.StatusInternalServerError)
		return
	}

	rw.Write(responseBytes)
	rw.WriteHeader(http.StatusOK)
}

func (jh *GenericHandler) DeleteKey(rw http.ResponseWriter, r *http.Request) {
	user, pass, ok := r.BasicAuth()
	if !ok {
		rw.WriteHeader(http.StatusForbidden)
		return
	}

	client, err := etcd.NewClient(config.AppConfig.ETCD.Endpoints, etcd.WithAuth(user, pass))
	if err != nil {
		if err == rpctypes.ErrAuthFailed {
			rw.WriteHeader(http.StatusForbidden)
			return
		}

		rw.WriteHeader(http.StatusInternalServerError)
		return
	}

	reqDataDecoded := request.DeleteKeyRequest{}
	decoder := json.NewDecoder(r.Body)

	err = decoder.Decode(&reqDataDecoded)
	if err != nil {
		rw.WriteHeader(http.StatusUnprocessableEntity)
		return
	}

	var resp *clientv3.DeleteResponse

	// Delete with a prefix if it is a directory
	if reqDataDecoded.IsDirectory {
		resp, err = client.Delete(r.Context(), reqDataDecoded.Key, clientv3.WithPrefix())
	} else {
		resp, err = client.Delete(r.Context(), reqDataDecoded.Key)
	}

	if err != nil {
		if err == rpctypes.ErrAuthFailed {
			rw.WriteHeader(http.StatusForbidden)
			return
		}

		rw.WriteHeader(http.StatusInternalServerError)
		return
	}

	responseBytes, err := json.Marshal(response.UpdateKeyResponse{
		Revision: resp.Header.Revision,
	})

	if err != nil {
		rw.WriteHeader(http.StatusInternalServerError)
		return
	}

	rw.Write(responseBytes)
	rw.WriteHeader(http.StatusOK)
}
