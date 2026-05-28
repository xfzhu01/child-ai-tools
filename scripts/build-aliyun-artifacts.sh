#!/usr/bin/env bash
# Build Next.js standalone on a powerful machine (Mac/CI), not on small Aliyun ECS.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

export DEPLOY_TARGET=aliyun
export SKIP_TYPE_CHECK=1
export NEXT_TELEMETRY_DISABLED=1

if [[ -f "$ROOT/.env" ]]; then
  set -a
  # shellcheck disable=SC1091
  source "$ROOT/.env"
  set +a
fi

if [[ -n "${DATABASE_URL_POOLED:-}" ]]; then
  export DATABASE_URL="$DATABASE_URL_POOLED"
fi

echo "→ prisma generate"
npx prisma generate

echo "→ next build (DEPLOY_TARGET=aliyun)"
npm run build

if [[ ! -f "$ROOT/.next/standalone/server.js" ]]; then
  echo "ERROR: .next/standalone/server.js not found — standalone output missing"
  exit 1
fi

echo "✓ Build artifacts ready (.next/standalone + .next/static)"
