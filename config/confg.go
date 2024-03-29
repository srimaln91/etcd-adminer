package config

import (
	"os"

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
	ETCD []struct {
		Name       string
		Endpoints  []string `yaml:"endpoints"`
		SuperAdmin struct {
			UserName string `yaml:"username"`
			Password string `yaml:"password"`
		} `yaml:"superadmin"`
	} `yaml:"etcd"`
}

var AppConfig *Config

func Parse(path string) (*Config, error) {
	file, err := os.ReadFile(path)
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
