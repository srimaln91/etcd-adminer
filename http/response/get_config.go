package response

type Cluster struct {
	Name      string   `json:"name"`
	Endpoints []string `json:"endpoints"`
}
type GetConfig struct {
	Clusters []Cluster `json:"clusters"`
}
