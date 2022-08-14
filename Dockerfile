FROM golang:1.16 AS build_go

#RUN apk add --no-cache git

# Set the Current Working Directory inside the container
WORKDIR /tmp/etcd-adminer/api

# We want to populate the module cache based on the go.{mod,sum} files.
COPY go.mod .
COPY go.sum .

RUN go mod download

COPY . .

# unit tests
RUN go test -v

# build the binary
RUN GOOS=linux GOARCH=amd64 CGO_ENABLED=0 go build -o etcd-adminer-linux-amd64 .

# Build the UI
FROM node:latest AS build_ui

WORKDIR /tmp/etcd-adminer/ui

COPY ["./ui/package.json", "./ui/package-lock.json", "./"]
RUN ls
RUN npm install --production

COPY ./ui .

RUN npm run build


# Start fresh from a smaller image
FROM alpine:3.9
RUN apk add ca-certificates

COPY --from=build_go /tmp/etcd-adminer/api/etcd-adminer-linux-amd64 /app/etcd-adminer-linux-amd64
COPY config.default.yaml /app/config.yaml

COPY --from=build_ui /tmp/etcd-adminer/ui/build /app/static

WORKDIR /app

EXPOSE 8080

CMD ["/app/etcd-adminer-linux-amd64"]