#!/bin/bash

set -e
cd $(dirname "${BASH_SOURCE[0]}")/..

if [ "$1" == "" ]; then
	echo "error: missing argument (binary name)"
	exit 1
fi

# Check the Go installation
if [ "$(which go)" == "" ]; then
	echo "error: Go is not installed. Please download and follow installation"\
		 "instructions at https://golang.org/dl to continue."
	exit 1
fi

# Check Node.js installation
if [ "$(which node)" == "" ]; then
	echo "error: Node.js is not installed. Please download and follow installation"\
		 "instructions at https://nodejs.org/en/ to continue."
	exit 1
fi

# Check Node.js installation
if [ "$(which npm)" == "" ]; then
	echo "error: NPM is not installed. Please download and follow installation"\
		 "instructions at https://nodejs.org/en/ to continue."
	exit 1
fi

OS=$(go env GOOS)
ARCH=$(go env GOARCH)
DATE=$(date -u +%Y-%m-%d-%H:%M:%S-%Z)

# Hardcode some values as build metadata
if [ -d ".git" ]; then
    # This version-strategy uses git tags to set the version string
    VERSION=$(git describe --tags --always --dirty)
    COMMIT=$(git rev-list -1 HEAD)
    
	LDFLAGS="$LDFLAGS -X github.com/srimaln91/go-make.version=${VERSION}"
	LDFLAGS="$LDFLAGS -X github.com/srimaln91/go-make.gitCommit=${COMMIT}"
fi
LDFLAGS="$LDFLAGS -X github.com/srimaln91/go-make.osArch=${OS}/${ARCH}"
LDFLAGS="$LDFLAGS -X github.com/srimaln91/go-make.date=${DATE}"

# cleaning up
rm -rf $1 static/*

pushd ./ui
npm install
npm run build --production

popd
mkdir -p $1/static
mv ui/build/* $1/static/

go mod download
go build -ldflags "$LDFLAGS" -o $1/etcd-adminer-$OS-$ARCH
cp config.yaml $1/