#!/usr/bin/env bash
# Sync Vercel production env from process environment (for GitHub Actions).
set -euo pipefail

: "${VERCEL_TOKEN:?VERCEL_TOKEN required}"
: "${VERCEL_ORG_ID:?VERCEL_ORG_ID required}"
: "${VERCEL_PROJECT_ID:?VERCEL_PROJECT_ID required}"
: "${DATABASE_URL:?DATABASE_URL required}"
: "${AUTH_SECRET:?AUTH_SECRET required}"
: "${LLM_API_KEY:?LLM_API_KEY required}"
: "${AUTH_URL:?AUTH_URL required}"

export VERCEL_TOKEN VERCEL_ORG_ID VERCEL_PROJECT_ID

LLM_API_URL="${LLM_API_URL:-https://open.bigmodel.cn/api/paas/v4/chat/completions}"
LLM_MODEL="${LLM_MODEL:-glm-4-flash-250414}"
NEXT_PUBLIC_APP_NAME="${NEXT_PUBLIC_APP_NAME:-小宝打字}"
NEXT_PUBLIC_APP_URL="${NEXT_PUBLIC_APP_URL:-$AUTH_URL}"
DATABASE_POOL_MAX="${DATABASE_POOL_MAX:-1}"

upsert_env() {
  local name="$1"
  local value="$2"
  printf '%s' "$value" | npx vercel env rm "$name" production --yes --token="$VERCEL_TOKEN" >/dev/null 2>&1 || true
  printf '%s' "$value" | npx vercel env add "$name" production --token="$VERCEL_TOKEN" >/dev/null
  echo "  ✓ $name"
}

echo "→ Syncing Vercel production env (CI)..."
upsert_env DATABASE_URL "$DATABASE_URL"
upsert_env AUTH_SECRET "$AUTH_SECRET"
upsert_env AUTH_URL "$AUTH_URL"
upsert_env LLM_API_KEY "$LLM_API_KEY"
upsert_env LLM_API_URL "$LLM_API_URL"
upsert_env LLM_MODEL "$LLM_MODEL"
upsert_env NEXT_PUBLIC_APP_NAME "$NEXT_PUBLIC_APP_NAME"
upsert_env NEXT_PUBLIC_APP_URL "$NEXT_PUBLIC_APP_URL"
upsert_env DATABASE_POOL_MAX "$DATABASE_POOL_MAX"
echo "✓ Vercel env synced"
