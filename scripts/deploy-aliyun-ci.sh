#!/usr/bin/env bash
# Deploy to Aliyun ECS from GitHub Actions (env vars from secrets, no .env file).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"

: "${ALIYUN_SSH_HOST:?Missing ALIYUN_SSH_HOST secret}"
: "${ALIYUN_SSH_USER:?Missing ALIYUN_SSH_USER secret}"
: "${ALIYUN_SSH_PRIVATE_KEY:?Missing ALIYUN_SSH_PRIVATE_KEY secret}"
: "${DATABASE_URL:?Missing DATABASE_URL secret}"
: "${AUTH_SECRET:?Missing AUTH_SECRET secret}"
: "${LLM_API_KEY:?Missing LLM_API_KEY secret}"

export ALIYUN_SSH_PRIVATE_KEY
export ALIYUN_SSH_HOST ALIYUN_SSH_USER
export AUTH_SECRET LLM_API_KEY DATABASE_URL
export ALIYUN_AUTH_URL="${ALIYUN_AUTH_URL:-${AUTH_URL:-http://${ALIYUN_SSH_HOST}}}"
export AUTH_URL="$ALIYUN_AUTH_URL"
export NEXT_PUBLIC_APP_URL="$ALIYUN_AUTH_URL"
export LLM_API_URL="${LLM_API_URL:-https://open.bigmodel.cn/api/paas/v4/chat/completions}"
export LLM_MODEL="${LLM_MODEL:-glm-4-flash-250414}"
export NEXT_PUBLIC_APP_NAME="${NEXT_PUBLIC_APP_NAME:-小宝打字}"
export DATABASE_POOL_MAX="${DATABASE_POOL_MAX:-1}"

bash "$ROOT/scripts/deploy-aliyun.sh"
