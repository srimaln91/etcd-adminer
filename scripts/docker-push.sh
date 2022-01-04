#!/bin/bash

set -e
cd $(dirname "${BASH_SOURCE[0]}")/..

# GIT_BRANCH is the current branch name
export GIT_BRANCH=$(git branch --show-current)
# GIT_VERSION - always the last verison number, like 1.12.1.
export GIT_VERSION=$(git describe --tags --abbrev=0)  
# GIT_COMMIT_SHORT - the short git commit number, like a718ef0.
export GIT_COMMIT_SHORT=$(git rev-parse --short HEAD)
# DOCKER_REPO - the base repository name to push the docker build to.
export DOCKER_REPO=$DOCKER_USER/etcd-adminer

if [ "$GIT_BRANCH" != "main" ]; then
	echo "Not pushing, not on main"
elif [ "$DOCKER_USER" == "" ]; then
	echo "Not pushing, DOCKER_USER not set"	
	exit 1
elif [ "$DOCKER_PASSWORD" == "" ]; then
	echo "Not pushing, DOCKER_PASSWORD not set"
	exit 1
else 
	push(){
		docker tag $DOCKER_REPO:$GIT_COMMIT_SHORT $DOCKER_REPO:$1
		docker push $DOCKER_REPO:$1
		echo "Pushed $DOCKER_REPO:$1"
	}
	# docker login
	echo $DOCKER_PASSWORD | docker login -u $DOCKER_USER --password-stdin

	# build the docker image
	docker build -f Dockerfile -t $DOCKER_REPO:$GIT_COMMIT_SHORT .
	if [ "$(curl -s https://hub.docker.com/v2/repositories/srimaln91/etcd-adminer/tags/$GIT_VERSION/ | grep "digest")" == "" ]; then
		# push the newest tag
		push "$GIT_VERSION"
		push "latest"
	fi
	push "edge"
fi
