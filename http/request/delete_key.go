package request

type DeleteKeyRequest struct {
	Key         string `json:"key"`
	IsDirectory bool   `json:"isDirectory"`
}
