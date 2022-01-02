FROM golang:1.16 AS build_go

#RUN apk add --no-cache git

# Set the Current Working Directory inside the container
WORKDIR /tmp/etcd-adminer

# We want to populate the module cache based on the go.{mod,sum} files.
COPY go.mod .
COPY go.sum .

RUN go mod download

COPY . .

# Unit tests
RUN CGO_ENABLED=0 go test -v

# Build the Go app
RUN go build -o ./out/etcd-adminer-linux-amd64 .

# Build the UI
FROM node:latest AS build_ui

# Set the Current Working Directory inside the container
WORKDIR /tmp/ui

COPY ["./ui/package.json", "./ui/package-lock.json", "./"]
RUN ls
RUN npm install --production

COPY ./ui .

RUN npm run build


# Start fresh from a smaller image
FROM alpine:3.15.0 
RUN apk add ca-certificates

COPY --from=build_go /tmp/etcd-adminer/out/etcd-adminer-linux-amd64 /app/etcd-adminer-linux-amd64
COPY config.yaml /app/config.yaml

COPY --from=build_ui /tmp/ui/build /app/static

WORKDIR /app

# This container exposes port 8080 to the outside world
EXPOSE 8080

# Run the binary program produced by `go install`
CMD ["/app/etcd-adminer-linux-amd64"]