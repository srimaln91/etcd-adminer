package request

type CreateKeyRequest struct {
	Key   string `json:"key"`
	Value string `json:"value"`
}
