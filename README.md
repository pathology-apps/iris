# Environment Variables
* Set in `./config/k8s/deploy-golang.yml` for production and `./.env` for local development. Do not worry about setting flags that are not for local development such as `RELAY_IPS`.

# Running Locally
1. Copy `.env.example` to `.env` and set the neccessary environment variables. Set `ROOT_URL` to your dev machine, and set `UID` to your user id. Run `id -u` to get your user id.
2. Run `shield -d` to decrypt the secrets. (NOTE: run `shield -g` to generate a pre-commit hook to automatically encrypt secrets before committing, which removes them from the current changes. The command `shield -e` encrypts them manually.)
3. `dc build` to build the containers.
4. `dc up -d` to run the app.
5. Navigate to the url with port (`ROOT_URL` in `.env` file)

# Troubleshooting
1. `dc logs -f node`
2. `dc logs -f go`
3. `dc logs -f redis`

|Variable|Default|Description|
|---|---|---|
ENV|local|Initial identifier for logging application in ELK stack. Also sets flag in application to tell users which version they are on. Must be one of: `local, test, dev, production`
GO_PORT|3000|Port to run golang application.
PPROF_PORT|3001|**_Local & Test Only_**: Port to debug running container.
WEBPACK_DEV_SERVER_PORT|9093|**_Local Only_**: Port for webpack live-reload development server.
LOCAL_IP|10.15.17.50|**_Local Only_**: Used to emulate users in local development to trick Oracle servers into assigning a specific workstation. Sent to Webpack's dev server headers: X-Forwarded-For 
RELAY_IPS|pathapp-ap-ds2a:9093,|**_Dev & Test Only_**: CSV list of IP addresses for which to relay socket events down to local development box. Do not use on local development, only **_DEV_** and **_TEST_** environments.

# Secrets
* One file should exist for each secret, with the file contents containing the data.

|Variable|Default|Description|
|---|---|---|
JWT_SECRET|*OMITTED*|Used for signing client tokens for application access to golang project.
REDIS_PASS|*OMITTED*|Redis password for secure connections.
ORACLE_TNS|ptat.world|Connection string from `./config/tnsnames.ora` located in this repository.
ORACLE_USER|WEB_VIEWER|User for TNS connection.
ORACLE_PASS|*OMITTED*|Password for TNS connection.

# Guides
## Check NPM package versions

```bash
dc exec node npm outdated
---
# Example output:
Package               Current   Wanted         Latest  Location
@ant-design/icons     MISSING    4.6.3          4.6.3  pathtrack
antd                  4.16.10  4.16.12        4.16.12  pathtrack
react                  17.0.1   17.0.1         17.0.2  pathtrack
react-dom              17.0.1   17.0.1         17.0.2  pathtrack
```
## Update NPM package
```bash
dc exec node npm up <package>
```

## Install NPM package
```bash
dc exec node npm i <package><@version?>
```

## Audit & fix NPM packages security advisories
```bash
dc exec node npm audit
---
dc exec node npm audit fix
```

## Increment PathTrack Version
* Updates version.json, publishes all current work to origin, adds git tag to new commit, publishes new CHANGELOG.md, and republishes changes to add CHANGELOG.md to git:
```bash
## Requires golang + git-chiglog
go get -u github.com/git-chglog/git-chglog/cmd/git-chglog
```
```bash
./version major
./version minor
./version patch
```

## Delete PathTrack Version
* Delete local and remote git tag, must specify exact tag name, ex: v6.1.0+golang
```bash
./version del 7.2.0
```

# Kubernetes Server Maintenance 
#### Scale application
```bash
kubectl -n pathtrack scale deploy golang --replicas=X
```

#### Restart golang container
```bash
kubectl -n pathtrack rollout restart deployment/golang
```

#### Golang Logs Command
```bash
kubectl -n pathtrack logs [-f] deployment/golang
# -f flag will follow logs
```

#### Golang Logs Search Command
```bash
kubectl -n pathtrack logs deployment/golang | grep error
```

#### Redis Logs Command
```bash
kubectl -n pathtrack logs [-f] deployment/redis
# -f flag will follow logs
```

# API Documentation
[https://documenter.getpostman.com/view/2186973/SW11XdpJ?version=latest#intro]

# Special Notes
### Leaving NOWORK location, notes. @TODO Implement into CHANGE_SENDING_LOCATION
```bash
#SCANNER_CFG:
[ID]	royerbr:4001	P	ULNC	UH Logistics Nerve Center	[NULL]	[NULL]	1911IER-3	Honeywell	[NULL]	[NULL]	B	R	ULNC	A	A	ULNC	0	[NULL]	[NULL]	0

#PATH_TRACK_CFG:
BARCODE_SCANNER	Barcode Scanner	1	ROYER_OFFICE	[NULL]	[NULL]	royerbr	4001	royerbr:4001	P	[NULL]	1911IER-3	Honeywell	0	120	[NULL]
ZPL_PRINTER	Barcode Label Printer	1	60-1601G	[NULL]	[NULL]	[NULL]	[NULL]	 \\172.20.26.90\60-1601G	NCRC I Room 60-1601G ZD410	10.23.186.145	[NULL]	00:07:4D:47:4C:49	0	120	[NULL]

#LOGIN_WORKSTATION:
1,159	ULNC	UH Logistics Nerve Center	[NULL]	royerbr	10.15.17.50	0	royerbr:4001	 \\172.20.26.90\60-1601G	[NULL]	[NULL]	0
```
