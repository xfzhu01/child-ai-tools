#!/usr/bin/env bash
# Load deployment variables from .env (never commit secrets).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ENV_FILE="${ENV_FILE:-$ROOT/.env}"

if [[ -f "$ENV_FILE" ]]; then
  set -a
  # shellcheck disable=SC1090
  source "$ENV_FILE"
  set +a
elif [[ -z "${AUTH_SECRET:-}" || -z "${LLM_API_KEY:-}" ]]; then
  echo "ERROR: $ENV_FILE not found and AUTH_SECRET/LLM_API_KEY not in environment."
  echo "Copy .env.example to .env or export required variables (CI)."
  exit 1
fi

: "${AUTH_SECRET:?AUTH_SECRET missing}"
: "${LLM_API_KEY:?LLM_API_KEY missing}"

if [[ -n "${DATABASE_URL_POOLED:-}" ]]; then
  DATABASE_URL="$DATABASE_URL_POOLED"
elif [[ -n "${DATABASE_URL:-}" && "$DATABASE_URL" != *"-pooler"* ]]; then
  DATABASE_URL="$(printf '%s' "$DATABASE_URL" | sed -E 's/@ep-([^.]+)\.c-/@ep-\1-pooler.c-/')"
fi

export DATABASE_URL="${DATABASE_URL:-}"
export DEPLOY_TARGET="${DEPLOY_TARGET:-vercel}"
export LLM_API_URL="${LLM_API_URL:-https://open.bigmodel.cn/api/paas/v4/chat/completions}"
export LLM_MODEL="${LLM_MODEL:-glm-4-flash-250414}"
export NEXT_PUBLIC_APP_NAME="${NEXT_PUBLIC_APP_NAME:-小宝打字}"
export DATABASE_POOL_MAX="${DATABASE_POOL_MAX:-1}"
