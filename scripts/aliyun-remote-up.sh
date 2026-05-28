#!/usr/bin/env bash
# Run ON the Aliyun ECS after code + .env.deploy are synced from your Mac.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [[ ! -f "$ROOT/.env.deploy" ]]; then
  echo "ERROR: $ROOT/.env.deploy not found."
  echo "Run npm run deploy:aliyun from your Mac first (it uploads .env.deploy)."
  exit 1
fi

if ! command -v docker >/dev/null 2>&1; then
  echo "ERROR: Docker not installed. Run scripts/bootstrap-aliyun-ecs.sh first."
  exit 1
fi

if [[ ! -f "$ROOT/.next/standalone/server.js" ]]; then
  echo "ERROR: Missing prebuilt .next/standalone — run npm run deploy:aliyun from your Mac."
  exit 1
fi

export DOCKER_BUILDKIT=1
export COMPOSE_DOCKER_CLI_BUILD=1
export BUILDKIT_PROGRESS=plain

echo "→ Packaging prebuilt app (no npm run build on ECS)..."
docker compose -f docker-compose.aliyun.yml build
if ! docker compose -f docker-compose.aliyun.yml up -d; then
  echo ""
  echo "ERROR: compose up failed. Recent app logs:"
  docker compose -f docker-compose.aliyun.yml logs app --tail 50 || true
  exit 1
fi

echo ""
echo "✓ Containers started"
echo "  Liveness: curl http://127.0.0.1/api/health/live"
echo "  Database: curl http://127.0.0.1/api/health"
