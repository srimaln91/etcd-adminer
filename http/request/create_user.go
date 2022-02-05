package request

type CreateUserRequest struct {
	UserName string   `json:"userName"`
	Password string   `json:"password"`
	Roles    []string `json:"roles"`
}
