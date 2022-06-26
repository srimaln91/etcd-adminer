package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/srimaln91/etcd-adminer/etcd"
	"go.etcd.io/etcd/api/v3/v3rpc/rpctypes"
)

func (jh *GenericHandler) GetRoles(rw http.ResponseWriter, r *http.Request) {

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
