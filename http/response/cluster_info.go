package response

type ClusterNode struct {
	Name         string   `json:"name"`
	ID           uint64   `json:"ID"`
	IsLearner    bool     `json:"isLearner"`
	PeerUrls     []string `json:"peerUrls"`
	ClientUrls   []string `json:"clientUrls"`
	LeaderStatus string   `json:"isLeader"`
	DBSIze       int64    `json:"dbSize"`
	DBSizeInUse  int64    `json:"dbSizeInUse"`
}

type ClusterInfo struct {
	ClusterID uint64        `json:"clusterID"`
	MemberID  uint64        `json:"memberID"`
	RaftTerm  uint64        `json:"raftTerm"`
	Revision  int64         `json:"revision"`
	Nodes     []ClusterNode `json:"nodes"`
}
