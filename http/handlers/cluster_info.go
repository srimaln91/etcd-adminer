package handlers

import (
	"encoding/json"
	"net/http"
	"strings"

	"github.com/srimaln91/etcd-adminer/etcd"
	"github.com/srimaln91/etcd-adminer/http/response"
	"go.etcd.io/etcd/api/v3/v3rpc/rpctypes"
)

const (
	leaderStatusUnknown  = "unknown"
	leaderStatusLeader   = "leader"
	leaderStatusFollower = "follower"
)

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

		leaderStatus := leaderStatusUnknown
		endpointStatus, err := client.Status(r.Context(), member.GetClientURLs()[0])
		if err != nil {
			jh.logger.Error(r.Context(), err.Error())
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
