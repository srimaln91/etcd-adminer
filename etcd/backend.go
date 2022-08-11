package etcd

type BackEnd struct {
	name        string
	endpoints   []string
	adminClient *Client
}

func (be *BackEnd) Name() string {
	return be.name
}

func (be *BackEnd) Endpoints() []string {
	return be.endpoints
}

func (be *BackEnd) AdminConnection() *Client {
	return be.adminClient
}
