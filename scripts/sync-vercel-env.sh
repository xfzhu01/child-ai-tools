#!/usr/bin/env bash
# Push deployment env vars from .env to the linked Vercel project.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
# shellcheck disable=SC1091
source "$ROOT/scripts/load-deploy-env.sh"

if ! npx vercel whoami >/dev/null 2>&1; then
  echo "→ Log in to Vercel first:"
  echo "  npx vercel login"
  exit 1
fi

if [[ ! -f "$ROOT/.vercel/project.json" ]]; then
  echo "→ Link this repo to a Vercel project first:"
  echo "  npx vercel link"
  exit 1
fi

upsert_env() {
  local name="$1"
  local value="$2"
  printf '%s' "$value" | npx vercel env rm "$name" production --yes >/dev/null 2>&1 || true
  printf '%s' "$value" | npx vercel env add "$name" production >/dev/null
  echo "  ✓ $name"
}

echo "→ Syncing Vercel production env..."
upsert_env DATABASE_URL "$DATABASE_URL"
upsert_env AUTH_SECRET "$AUTH_SECRET"
upsert_env LLM_API_KEY "$LLM_API_KEY"
upsert_env LLM_API_URL "$LLM_API_URL"
upsert_env LLM_MODEL "$LLM_MODEL"
upsert_env NEXT_PUBLIC_APP_NAME "$NEXT_PUBLIC_APP_NAME"
upsert_env DATABASE_POOL_MAX "$DATABASE_POOL_MAX"

if [[ -n "${AUTH_URL:-}" ]]; then
  upsert_env AUTH_URL "$AUTH_URL"
  upsert_env NEXT_PUBLIC_APP_URL "${NEXT_PUBLIC_APP_URL:-$AUTH_URL}"
else
  echo "  · AUTH_URL skipped (set after first deploy, then re-run)"
fi

echo "✓ Vercel env synced"
