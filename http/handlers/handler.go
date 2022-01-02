package handlers

import (
	"context"

	"github.com/srimaln91/etcd-adminer/config"
	"github.com/srimaln91/etcd-adminer/etcd"
	"github.com/srimaln91/etcd-adminer/log"
	clientv3 "go.etcd.io/etcd/client/v3"
)

type GenericHandler struct {
	logger           log.Logger
	superAdminClient *etcd.Client
}

func NewHTTPHandler(logger log.Logger) (*GenericHandler, error) {

	superAdminClient, err := etcd.NewClient(
		config.AppConfig.ETCD.Endpoints,
		etcd.WithAuth(
			config.AppConfig.ETCD.SuperAdmin.UserName,
			config.AppConfig.ETCD.SuperAdmin.Password,
		),
	)

	if err != nil {
		return nil, err
	}

	return &GenericHandler{
		logger:           logger,
		superAdminClient: superAdminClient,
	}, nil
}

func (jh *GenericHandler) getKeys(ctx context.Context, endpoints []string, user, pass string) (*clientv3.GetResponse, error) {

	client, err := etcd.NewClient(endpoints, etcd.WithAuth(user, pass))
	if err != nil {
		return nil, err
	}

	var keys *clientv3.GetResponse
	if client.Username == "root" {
		keys, err = client.Get(ctx, "/", clientv3.WithKeysOnly(), clientv3.WithPrefix(), clientv3.WithSort(clientv3.SortByKey, clientv3.SortAscend))
		if err != nil {
			return nil, err
		}
	} else {
		resp, err := jh.superAdminClient.UserGet(ctx, client.Username)
		if err != nil {
			return nil, err
		}

		var permissions = make([]string, 0)
		for _, role := range resp.Roles {
			roleResponse, err := jh.superAdminClient.RoleGet(ctx, role)
			if err != nil {
				return nil, err
			}

			for _, permission := range roleResponse.Perm {
				permissions = append(permissions, string(permission.Key))
			}
		}

		for index, permission := range permissions {
			if index == 0 {
				keys, err = client.Get(ctx, permission, clientv3.WithKeysOnly(), clientv3.WithPrefix(), clientv3.WithSort(clientv3.SortByKey, clientv3.SortDescend))
				if err != nil {
					return nil, err
				}

				continue
			}

			k, err := client.Get(ctx, permission, clientv3.WithKeysOnly(), clientv3.WithPrefix(), clientv3.WithSort(clientv3.SortByKey, clientv3.SortDescend))
			if err != nil {
				return nil, err
			}

			keys.Kvs = append(keys.Kvs, k.Kvs...)
		}
	}

	return keys, nil
}
