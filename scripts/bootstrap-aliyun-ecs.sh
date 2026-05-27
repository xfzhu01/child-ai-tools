#!/usr/bin/env bash
# One-time setup on a fresh Aliyun ECS (Hong Kong recommended, no ICP filing).
# Run ON the server: curl -fsSL ... | bash   OR copy-paste after SSH login.
set -euo pipefail

if [[ "$(id -u)" -ne 0 ]]; then
  echo "Please run as root (e.g. sudo bash bootstrap-aliyun-ecs.sh)"
  exit 1
fi

echo "→ Installing Docker..."
if ! command -v docker >/dev/null 2>&1; then
  curl -fsSL https://get.docker.com | sh
  systemctl enable --now docker
fi

echo "→ Installing Docker Compose plugin..."
if ! docker compose version >/dev/null 2>&1; then
  apk add --no-cache docker-cli-compose 2>/dev/null || true
  if ! docker compose version >/dev/null 2>&1; then
    mkdir -p /usr/local/lib/docker/cli-plugins
    curl -SL "https://github.com/docker/compose/releases/download/v2.32.4/docker-compose-linux-$(uname -m)" \
      -o /usr/local/lib/docker/cli-plugins/docker-compose
    chmod +x /usr/local/lib/docker/cli-plugins/docker-compose
  fi
fi

mkdir -p ~/child-ai-tools

if [[ ! -f /swapfile ]]; then
  echo "→ Adding 2G swap (helps Docker build on small instances)..."
  fallocate -l 2G /swapfile 2>/dev/null || dd if=/dev/zero of=/swapfile bs=1M count=2048
  chmod 600 /swapfile
  mkswap /swapfile
  swapon /swapfile
  grep -q '^/swapfile' /etc/fstab || echo '/swapfile none swap sw 0 0' >> /etc/fstab
fi

echo ""
echo "✓ ECS ready for deploy"
echo "  1. Aliyun 安全组放行: TCP 22, 80"
echo "  2. 本地 .env 设置 DEPLOY_TARGET=aliyun 与 ALIYUN_SSH_*"
echo "  3. 运行: npm run deploy:aliyun"
