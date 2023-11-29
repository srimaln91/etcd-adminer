# Web based admin interface for ETCD (https://etcd.io)

## Screenshot
![image info](./resources/screenshot.png)

## Configuration
The application config is defined in yaml format.  You may obtain it from (config.default.yaml)[config.default.yaml].

```yaml
http:
  port: 8080

logger:
  level: "DEBUG"

etcd:
- name: "LOCAL"
  endpoints:
    - "0.0.0.0:23791"
    - "0.0.0.0:23792"
    - "0.0.0.0:23793"
  superadmin:
    username: root
    password: root@123
```
## How to run

### Using Docker

#### Run the latest version using the publicly hosted image
```bash
docker run -d --name etcd-adminer -p 8080:8080 srimaln91/etcd-adminer:latest
```

#### Run the application using a custom configuration file

You can mount the config file as a bind mount.

```bash
docker run -d --name etcd-adminer -p 8080:8080 -v /path/to/config.yaml:/app/config.yaml srimaln91/etcd-adminer:latest
```

### Build and run

#### Backend API
```bash
# clone the project
git clone https://github.com/srimaln91/etcd-adminer.git
cd etcd-adminer

# download go modules
go mod download

# build it!
go build
```

#### React UI

The project uses React and it was scaffolded using create-react-app
```bash
cd ./ui

# install node modules
npm install

# start the development server with auto reload/compilation enabled
npm run start
```

## Contributions

Contributions are welcome. Please free free to open PRs if you have anything to contribute with.