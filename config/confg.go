package config

import (
	"io/ioutil"

	"github.com/srimaln91/etcd-adminer/log"
	yaml "gopkg.in/yaml.v3"
)

type Config struct {
	HTTP struct {
		Port int `yaml:"port"`
	} `yaml:"http"`
	Logger struct {
		Level log.Level `yaml:"level"`
	} `yaml:"logger"`
	ETCD struct {
		Endpoints []string `yaml:"endpoints"`
	} `yaml:"etcd"`
}

var AppConfig *Config

func Parse(path string) (*Config, error) {
	file, err := ioutil.ReadFile(path)
	if err != nil {
		return nil, err
	}

	config := new(Config)
	err = yaml.Unmarshal(file, config)
	if err != nil {
		return nil, err
	}

	AppConfig = config
	return config, nil
}
