package etcd

import (
	"context"
	"errors"
	"fmt"
)

type BackEndProvider struct {
	backEnds map[string]*BackEnd
}

var ErrBackendNotFound error = errors.New("backend not found")
var ErrAuthenticationFailed error = errors.New("authentication failed")
var ErrNoConnectivity error = errors.New("can not reach ETCD nodes")

func NewBackendProvider() *BackEndProvider {
	return &BackEndProvider{
		backEnds: make(map[string]*BackEnd),
	}
}

// RegisterBackend registers a new ETCD backend
func (bp *BackEndProvider) RegisterBackend(name string, endpoints []string, userName, password string) error {

	adminClient, err := NewClient(endpoints)
	if err != nil {
		return err
	}

	_, err = adminClient.Authenticate(context.Background(), userName, password)
	if err != nil {
		return fmt.Errorf("%q: %w", name, err)
	}

	bp.backEnds[name] = &BackEnd{
		name:        name,
		endpoints:   endpoints,
		adminClient: adminClient,
	}

	return nil
}

func (bp *BackEndProvider) GetBackend(name string) (*BackEnd, error) {
	backEnd, ok := bp.backEnds[name]
	if !ok {
		return nil, ErrBackendNotFound
	}

	return backEnd, nil
}
