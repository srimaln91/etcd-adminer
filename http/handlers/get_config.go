package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/srimaln91/etcd-adminer/config"
	"github.com/srimaln91/etcd-adminer/http/response"
)

func (jh *GenericHandler) GetConfig(rw http.ResponseWriter, r *http.Request) {
	response := response.GetConfig{
		Endpoints: config.AppConfig.ETCD.Endpoints,
	}

	responseBytes, err := json.Marshal(response)
	if err != nil {
		rw.WriteHeader(http.StatusInternalServerError)
		return
	}

	rw.Header().Add("Content-Type", "application/json")
	rw.WriteHeader(http.StatusOK)
	rw.Write(responseBytes)
}
