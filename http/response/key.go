package response

type Key struct {
	Key            string `json:"key"`
	Value          string `json:"value"`
	CreateRevision int64  `json:"createRevision"`
	ModRevision    int64  `json:"modRevision"`
	Version        int64  `json:"version"`
	Lease          int64  `json:"lease"`
}
