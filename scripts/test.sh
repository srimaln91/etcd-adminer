#!/bin/bash

set -e
cd "$(dirname "${BASH_SOURCE[0]}")/.."

# Check the Go installation
if [ "$(which go)" == "" ]; then
	echo "error: Go is not installed. Please download and follow installation"\
		 "instructions at https://golang.org/dl to continue."
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

go test ./... -coverpkg=./... -race -coverprofile=coverage.out -covermode=atomic -ldflags "$LDFLAGS"