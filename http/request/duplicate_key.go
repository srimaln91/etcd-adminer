package request

type DuplicateKeyRequest struct {
	Key         string `json:"key"`
	IsDirectory bool   `json:"isDirectory"`
	NewNodeName string `json:"newNodeName"`
}
