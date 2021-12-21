package etcd

import (
	"time"

	clientv3 "go.etcd.io/etcd/client/v3"
)

type Config struct {
	etcdConfig clientv3.Config
}

type Client struct {
	*clientv3.Client
}

func NewClient(endpoints []string, options ...func(*Config)) (*Client, error) {

	cfg := Config{
		etcdConfig: clientv3.Config{
			Endpoints:   endpoints,
			DialTimeout: time.Second * 5,
		},
	}

	// Apply options
	for _, o := range options {
		o(&cfg)
	}

	c, err := clientv3.New(cfg.etcdConfig)
	if err != nil {
		return nil, err
	}

	return &Client{
		c,
	}, err
}

func WithAuth(username, password string) func(*Config) {
	return func(cfg *Config) {
		cfg.etcdConfig.Username = username
		cfg.etcdConfig.Password = password
	}
}
