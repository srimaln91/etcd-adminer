package request

import "github.com/srimaln91/etcd-adminer/etcd"

type RequestMeta struct {
	User    string
	Pass    string
	Backend *etcd.BackEnd
}
