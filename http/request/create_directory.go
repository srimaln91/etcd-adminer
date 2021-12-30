package request

type CreateDirectoryRequest struct {
	Path        string `json:"path"`
	IsDirectory bool   `json:"isDirectory"`
}
