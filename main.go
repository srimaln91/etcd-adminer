package main

import (
	"github.com/srimaln91/etcd-adminer/bootstrap"
	buildMeta "github.com/srimaln91/go-make"
)

func main() {

	// Print binary details and terminate the program when --version flag provided.
	buildMeta.CheckVersion()

	bootstrap.Init()
}
