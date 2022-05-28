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
curl -sSfL -o /usr/local/bin/create-docker-ct https://raw.githubusercontent.com/hugojosefson/proxmox-pve-lxc-docker-compose/main/src/create-docker-ct

chmod +x /usr/local/bin/create-docker-ct
```

## Create an app CT

Run this script:

```sh
create-docker-ct <name_of_app>
```

...where `<name_of_app>` is the name of the app.

The application's name will be its directory name, and its hostname.

The script will output:

- the app CT's VMID number, and
- a file path to that specific CT's `docker-compose.yml` file.

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
