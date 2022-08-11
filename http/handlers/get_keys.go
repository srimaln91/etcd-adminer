package handlers

import (
	"encoding/json"
	"net/http"
	"strings"

	"github.com/srimaln91/etcd-adminer/filetree"
	"github.com/srimaln91/etcd-adminer/http/request"
	"go.etcd.io/etcd/api/v3/v3rpc/rpctypes"
)

func (jh *GenericHandler) GetKeys(rw http.ResponseWriter, r *http.Request) {

	requestMeta, ok := r.Context().Value(META_KEY).(request.RequestMeta)
	if !ok {
		rw.WriteHeader(http.StatusInternalServerError)
		return
	}

	keys, err := jh.getKeys(r.Context(), requestMeta.Backend, requestMeta.User, requestMeta.Pass)
	if err != nil {
		if err == rpctypes.ErrAuthFailed {
			rw.WriteHeader(http.StatusForbidden)
			return
		}

		rw.WriteHeader(http.StatusInternalServerError)
		return
	}

	fileTree := filetree.NewFileTree("/")

	for _, k := range keys.Kvs {
		segments := strings.Split(string(k.Key), "/")

		segments = segments[1:]
		length := len(segments)

		path := segments[:length-1]
		filename := segments[length-1]

		fileTree.AddFile(fileTree.Root, path, filename)
	}

	respData, err := json.Marshal(fileTree.Root)
	if err != nil {
		jh.logger.Error(r.Context(), err.Error())
		rw.WriteHeader(http.StatusInternalServerError)
		return
	}

	rw.Header().Add("Content-Type", "application/json")
	rw.WriteHeader(http.StatusOK)
	rw.Write(respData)

}
