# create-docker-ct for Proxmox VE

Scripts and notes for running one `docker-compose.yml` application using
[Docker Compose](https://github.com/docker/compose) inside an unprivileged LXC
container, on
[Proxmox Virtual Environment (PVE)](https://www.proxmox.com/en/proxmox-ve).

Use this if you want:

- one unprivileged LXC container per one application (one `docker-compose.yml`)
- a bind-mounted directory into each container/application, where
  - its `docker-compose.yml` lives there
  - its configuration lives there
  - its data lives there

This means, that to deploy a new application, you...

1. run the script `create-docker-ct` with the name of your new application as
   argument,
2. create or download its `docker-compose.yml` file into the directory the
   script tells you,
3. start the newly created LXC container.

## Install

### Prerequisites

- Install PVE (for example via
  https://github.com/hugojosefson/proxmox-root-on-encrypted-zfs).

### Install create-docker-ct

```sh
curl -sSfL https://github.com/hugojosefson/proxmox-create-docker-ct/tarball/main \
  | tar -xzvC /usr/local/bin --wildcards "*/usr_local_bin/" --strip-components=2
```

## Create an app CT

```
USAGE:

  create-docker-ct --help                              This help message
  create-docker-ct <name>                              Create a CT from alpine-3.16-default_20220622_amd64.tar.xz
  create-docker-ct <name> [<base_template_filename>]   Create a CT from specified base template

EXAMPLE:

  create-docker-ct my-service
  create-docker-ct my-service alpine-3.16-default_20220622_amd64.tar.xz
  create-docker-ct my-service alpine-3.15-default_20211202_amd64.tar.xz
  create-docker-ct my-service ubuntu-22.04-standard_22.04-1_amd64.tar.zst
```

Run this script:

```sh
create-docker-ct <name>
```

...where `<name>` is the name of the app.

The application's name will be its directory name, and its hostname.

The script will output:

- the app CT's VMID number, and
- the directory mounted as `/appdata` inside the CT, where its
  `docker-compose.yml` etc. lives.

## Deploy/redeploy application inside

Edit the CT's `docker-compose.yml` file, or overwrite it with what you want to
deploy.

Start or restart the app CT:

```sh
pct start <vmid>
```

```sh
pct restart <vmid>
```
