package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/srimaln91/etcd-adminer/etcd"
	"github.com/srimaln91/etcd-adminer/http/request"
	"github.com/srimaln91/etcd-adminer/http/response"
	"go.etcd.io/etcd/api/v3/v3rpc/rpctypes"
)

const (
	leaderStatusUnknown  = "unknown"
	leaderStatusLeader   = "leader"
	leaderStatusFollower = "follower"
)

func (jh *GenericHandler) ClusterInfo(rw http.ResponseWriter, r *http.Request) {
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

		leaderStatus := leaderStatusUnknown
		endpointStatus, err := client.Status(r.Context(), member.GetPeerURLs()[0])
		if err != nil {
			jh.logger.Error(r.Context(), err.Error())
			rw.WriteHeader(http.StatusInternalServerError)
			return
		}

		if member.GetID() == endpointStatus.Leader {
			leaderStatus = leaderStatusLeader
		} else {
			leaderStatus = leaderStatusFollower
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
