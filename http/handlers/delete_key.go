package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/srimaln91/etcd-adminer/etcd"
	"github.com/srimaln91/etcd-adminer/http/request"
	"github.com/srimaln91/etcd-adminer/http/response"
	"go.etcd.io/etcd/api/v3/v3rpc/rpctypes"
	clientv3 "go.etcd.io/etcd/client/v3"
)

func (jh *GenericHandler) DeleteKey(rw http.ResponseWriter, r *http.Request) {
	requestMeta, ok := r.Context().Value("meta").(request.RequestMeta)
	if !ok {
		rw.WriteHeader(http.StatusInternalServerError)
		return
	}

	client, err := etcd.NewClient(requestMeta.Endpoints, etcd.WithAuth(requestMeta.User, requestMeta.Pass))
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

	rw.Header().Add("Content-Type", "application/json")
	rw.WriteHeader(http.StatusOK)
	rw.Write(responseBytes)
}
