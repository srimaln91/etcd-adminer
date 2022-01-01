package handlers

import (
	"context"
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
	logger           log.Logger
	superAdminClient *etcd.Client
}

func NewHTTPHandler(logger log.Logger) (*GenericHandler, error) {

	superAdminClient, err := etcd.NewClient(
		config.AppConfig.ETCD.Endpoints,
		etcd.WithAuth(
			config.AppConfig.ETCD.SuperAdmin.UserName,
			config.AppConfig.ETCD.SuperAdmin.Password,
		),
	)

	if err != nil {
		return nil, err
	}

	return &GenericHandler{
		logger:           logger,
		superAdminClient: superAdminClient,
	}, nil
}

func (jh *GenericHandler) getKeys(ctx context.Context, endpoints []string, user, pass string) (*clientv3.GetResponse, error) {

	client, err := etcd.NewClient(endpoints, etcd.WithAuth(user, pass))
	if err != nil {
		return nil, err
	}

	var keys *clientv3.GetResponse
	if client.Username == "root" {
		keys, err = client.Get(ctx, "/", clientv3.WithKeysOnly(), clientv3.WithPrefix(), clientv3.WithSort(clientv3.SortByKey, clientv3.SortAscend))
		if err != nil {
			return nil, err
		}
	} else {
		resp, err := jh.superAdminClient.UserGet(ctx, client.Username)
		if err != nil {
			return nil, err
		}

		var permissions = make([]string, 0)
		for _, role := range resp.Roles {
			roleResponse, err := jh.superAdminClient.RoleGet(ctx, role)
			if err != nil {
				return nil, err
			}

			for _, permission := range roleResponse.Perm {
				permissions = append(permissions, string(permission.Key))
			}
		}

		for index, permission := range permissions {
			if index == 0 {
				keys, err = client.Get(ctx, permission, clientv3.WithKeysOnly(), clientv3.WithPrefix(), clientv3.WithSort(clientv3.SortByKey, clientv3.SortDescend))
				if err != nil {
					return nil, err
				}

				continue
			}

			k, err := client.Get(ctx, permission, clientv3.WithKeysOnly(), clientv3.WithPrefix(), clientv3.WithSort(clientv3.SortByKey, clientv3.SortDescend))
			if err != nil {
				return nil, err
			}

			keys.Kvs = append(keys.Kvs, k.Kvs...)
		}
	}

	return keys, nil
}

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

func (jh *GenericHandler) GetKeys(rw http.ResponseWriter, r *http.Request) {

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

	keys, err := jh.getKeys(r.Context(), endpoints, user, pass)
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

func (jh *GenericHandler) GetKey(rw http.ResponseWriter, r *http.Request) {

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

func (jh *GenericHandler) CreateDirectory(rw http.ResponseWriter, r *http.Request) {

	user, pass, ok := r.BasicAuth()
	if !ok {
		rw.WriteHeader(http.StatusForbidden)
		return
	}

	reqDataDecoded := request.CreateDirectoryRequest{}
	decoder := json.NewDecoder(r.Body)

	err := decoder.Decode(&reqDataDecoded)
	if err != nil {
		rw.WriteHeader(http.StatusUnprocessableEntity)
		return
	}

	path := strings.Split(reqDataDecoded.Path, "/")
	if len(path) == 0 {
		rw.WriteHeader(http.StatusNotAcceptable)
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

	keys, err := jh.getKeys(r.Context(), endpoints, user, pass)
	if err != nil {
		if err == rpctypes.ErrAuthFailed {
			rw.WriteHeader(http.StatusForbidden)
			return
		}

		rw.WriteHeader(http.StatusInternalServerError)
		return
	}

	// Create filetree by fetching keys from ETCD
	fileTree := filetree.NewFileTree("/")

	for _, k := range keys.Kvs {
		segments := strings.Split(string(k.Key), "/")

		segments = segments[1:]
		length := len(segments)

		path := segments[:length-1]
		filename := segments[length-1]

		fileTree.AddFile(fileTree.Root, path, filename)
	}

	// Add virtual directory
	if reqDataDecoded.IsDirectory {
		fileTree.AddDirectory(fileTree.Root, path[1:])
	} else {
		fileTree.AddFile(fileTree.Root, path[1:len(path)-1], path[len(path)-1])
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

func (jh *GenericHandler) UpdateKey(rw http.ResponseWriter, r *http.Request) {
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

	client, err := etcd.NewClient(endpoints, etcd.WithAuth(user, pass))
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

	rw.Header().Add("Content-Type", "application/json")
	rw.WriteHeader(http.StatusOK)
	rw.Write(responseBytes)
}

func (jh *GenericHandler) DeleteKey(rw http.ResponseWriter, r *http.Request) {
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

	client, err := etcd.NewClient(endpoints, etcd.WithAuth(user, pass))
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

func (jh *GenericHandler) ClusterInfo(rw http.ResponseWriter, r *http.Request) {
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

	client, err := etcd.NewClient(endpoints, etcd.WithAuth(user, pass))
	if err != nil {
		if err == rpctypes.ErrAuthFailed {
			rw.WriteHeader(http.StatusForbidden)
			return
		}

		rw.WriteHeader(http.StatusInternalServerError)
		return
	}

	members, err := client.Cluster.MemberList(r.Context())
	if err != nil {
		if err == rpctypes.ErrAuthFailed {
			rw.WriteHeader(http.StatusForbidden)
			return
		}

		rw.WriteHeader(http.StatusInternalServerError)
		return
	}

	clusterResponse := response.ClusterInfo{
		ClusterID: members.Header.GetClusterId(),
		MemberID:  members.Header.GetMemberId(),
		RaftTerm:  members.Header.GetRaftTerm(),
		Revision:  members.Header.GetRevision(),
		Nodes:     make([]response.ClusterNode, 0),
	}

	for _, member := range members.Members {

		leaderStatus := "unknown"
		endpointStatus, err := client.Status(r.Context(), member.GetClientURLs()[0])
		if err != nil {
			jh.logger.Error(r.Context(), err.Error())
		}

		if member.GetID() == endpointStatus.Leader {
			leaderStatus = "leader"
		} else {
			leaderStatus = "follower"
		}

		node := response.ClusterNode{
			Name:         member.GetName(),
			ID:           member.GetID(),
			IsLearner:    member.GetIsLearner(),
			PeerUrls:     member.GetPeerURLs(),
			ClientUrls:   member.GetClientURLs(),
			LeaderStatus: leaderStatus,
			DBSIze:       endpointStatus.DbSize,
			DBSizeInUse:  endpointStatus.DbSizeInUse,
		}

		clusterResponse.Nodes = append(clusterResponse.Nodes, node)
	}

	responseBytes, err := json.Marshal(clusterResponse)
	if err != nil {
		rw.WriteHeader(http.StatusInternalServerError)
		return
	}

	rw.Header().Add("Content-Type", "application/json")
	rw.WriteHeader(http.StatusOK)
	rw.Write(responseBytes)

}

func (jh *GenericHandler) GetConfig(rw http.ResponseWriter, r *http.Request) {
	response := response.GetConfig{
		Endpoints: config.AppConfig.ETCD.Endpoints,
	}

	responseBytes, err := json.Marshal(response)
	if err != nil {
		rw.WriteHeader(http.StatusInternalServerError)
		return
	}

	rw.Header().Add("Content-Type", "application/json")
	rw.WriteHeader(http.StatusOK)
	rw.Write(responseBytes)
}
