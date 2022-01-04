# Generic parameters
DATE=$(shell date -u +%Y-%m-%d-%H:%M:%S-%Z)

# Go parameters
GOCMD=go
GOBUILD=$(GOCMD) build
GOCLEAN=$(GOCMD) clean
GOTEST=$(GOCMD) test
GOGET=$(GOCMD) get

BUILD_BASE=build

OS := $(if $(GOOS),$(GOOS),$(shell go env GOOS))
ARCH := $(if $(GOARCH),$(GOARCH),$(shell go env GOARCH))
BINARY_NAME=etcd-adminer-$(OS)-$(ARCH)

# This version-strategy uses git tags to set the version string
VERSION := $(shell git describe --tags --always --dirty)
COMMIT := $(shell git rev-list -1 HEAD)

# This version-strategy uses a manual value to set the version string
#VERSION := 1.2.3

BUILD_DIR=$(BUILD_BASE)/$(VERSION)

.PHONY: all
all: clean test build ## Test and build

.PHONY: build
build: ## Build the binary
	@scripts/build.sh $(BUILD_DIR)

.PHONY: test
test: ## Run unit tests
	@scripts/test.sh

.PHONY: clean
clean: ## Clean the current build directory
	@$(GOCLEAN)
	@rm -rf $(BUILD_DIR)

.PHONY: clean-all
clean-all: ## Remvoe the build directory
	@$(GOCLEAN)
	@rm -rf $(BUILD_BASE)

.PHONY: run
run: ## Build API and UI, and run it
	@$(MAKE) build
	@cd $(BUILD_DIR); ./$(BINARY_NAME)

.PHONY: run
docker: ## Build docker images and push it to Dockerhub
	@scripts/docker-push.sh

.PHONY: help
help: ## display help page
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'