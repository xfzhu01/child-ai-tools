#!/usr/bin/env bash
set -euo pipefail

if [[ -z "${DATABASE_URL:-}" ]]; then
  echo "ERROR: set DATABASE_URL to your Neon pooled connection string first."
  echo "Example:"
  echo '  export DATABASE_URL="postgresql://...@ep-xxx-pooler...neon.tech/neondb?sslmode=require"'
  exit 1
fi

cd "$(dirname "$0")/.."

echo "→ prisma migrate deploy"
npx prisma migrate deploy

echo "→ prisma db seed"
npx prisma db seed

echo "✓ Neon database ready (admin + BETA2026 invite)"
