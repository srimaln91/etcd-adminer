package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/srimaln91/etcd-adminer/etcd"
	"github.com/srimaln91/etcd-adminer/http/request"
	"go.etcd.io/etcd/api/v3/v3rpc/rpctypes"
)

func (jh *GenericHandler) GetRoles(rw http.ResponseWriter, r *http.Request) {

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

	roleList, err := client.RoleList(r.Context())
	if err != nil {
		if err == rpctypes.ErrPermissionDenied || err == rpctypes.ErrPermissionNotGranted {
			rw.WriteHeader(http.StatusForbidden)
			return
		}

		rw.WriteHeader(http.StatusInternalServerError)
		return
	}

	response, err := json.Marshal(roleList.Roles)
	if err != nil {
		rw.WriteHeader(http.StatusInternalServerError)
		return
	}

	rw.Header().Add("Content-Type", "application/json")
	rw.WriteHeader(http.StatusOK)
	rw.Write(response)
}
