package response

type User struct {
	Name  string   `json:"name"`
	Roles []string `json:"roles"`
}
