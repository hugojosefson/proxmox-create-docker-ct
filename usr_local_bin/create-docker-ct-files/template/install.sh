#!/bin/sh
set -e

# Type any extra commands inside this function. They will run last.
extra_commands() {
  apt-get install -y byobu vim
  byobu-enable
}

apt-get update
apt-get full-upgrade --purge -y
apt-get auto-remove -y
apt-get install -y curl

curl https://get.docker.com/ | sh
docker run --rm -it hello-world

DOCKER_COMPOSE_VERSION="$(curl -sSfL https://api.mattandre.ws/semver/github/docker/compose)"
curl -sSfL -o /usr/local/bin/docker-compose "https://github.com/docker/compose/releases/download/${DOCKER_COMPOSE_VERSION}/docker-compose-linux-x86_64"
chmod +x /usr/local/bin/docker-compose

cat > /etc/systemd/system/docker-compose.service <<'EOF'
[Unit]
Description=Docker Compose Application Service
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/appdata
ExecStart=/usr/local/bin/docker-compose up -d --remove-orphans --wait
ExecStop=/usr/local/bin/docker-compose down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
EOF
systemctl enable docker-compose
echo "

"
docker --version
docker-compose --version

extra_commands

apt-get clean
poweroff
