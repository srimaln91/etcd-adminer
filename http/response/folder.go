package response

type Node struct {
	Type  string `json:"type"`
	Name  string `json:"name"`
	Nodes []Node `json:"nodes"`
}
