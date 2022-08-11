package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/srimaln91/etcd-adminer/config"
	"github.com/srimaln91/etcd-adminer/http/response"
)

func (jh *GenericHandler) GetConfig(rw http.ResponseWriter, r *http.Request) {
	cfg := response.GetConfig{}

	for _, cluster := range config.AppConfig.ETCD {
		cfg.Clusters = append(cfg.Clusters, response.Cluster{
			Name:      cluster.Name,
			Endpoints: cluster.Endpoints,
		})
	}

	responseBytes, err := json.Marshal(cfg)
	if err != nil {
		rw.WriteHeader(http.StatusInternalServerError)
		return
	}

	rw.Header().Add("Content-Type", "application/json")
	rw.WriteHeader(http.StatusOK)
	rw.Write(responseBytes)
}
