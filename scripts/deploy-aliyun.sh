#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"

if [[ -f "$ROOT/.env.deploy" && ! -f "$ROOT/.env" ]]; then
  cat <<'EOF'
ERROR: deploy-aliyun.sh must run on your Mac (with a local .env), not on the ECS server.

The server already has .env.deploy from a previous sync. To rebuild there, run:

  cd ~/child-ai-tools
  bash scripts/aliyun-remote-up.sh
EOF
  exit 1
fi

# shellcheck disable=SC1091
source "$ROOT/scripts/load-deploy-env.sh"

: "${ALIYUN_SSH_HOST:?Set ALIYUN_SSH_HOST in .env (香港 ECS 公网 IP)}"
: "${ALIYUN_SSH_USER:?Set ALIYUN_SSH_USER in .env (usually root)}"

if [[ -z "${ALIYUN_SSH_KEY_PATH:-}" && -z "${ALIYUN_SSH_PRIVATE_KEY:-}" ]]; then
  echo "ERROR: Set ALIYUN_SSH_KEY_PATH or ALIYUN_SSH_PRIVATE_KEY in .env"
  exit 1
fi

ALIYUN_AUTH_URL="${ALIYUN_AUTH_URL:-${AUTH_URL:-}}"
if [[ -z "$ALIYUN_AUTH_URL" ]]; then
  ALIYUN_AUTH_URL="http://${ALIYUN_SSH_HOST}"
  echo "WARN: ALIYUN_AUTH_URL not set — using $ALIYUN_AUTH_URL (update after you have a stable URL)"
fi

SSH_KEY_FILE=""
if [[ -n "${ALIYUN_SSH_PRIVATE_KEY:-}" ]]; then
  SSH_KEY_FILE="$(mktemp)"
  trap 'rm -f "$SSH_KEY_FILE"' EXIT
  printf '%s\n' "$ALIYUN_SSH_PRIVATE_KEY" > "$SSH_KEY_FILE"
  chmod 600 "$SSH_KEY_FILE"
else
  SSH_KEY_FILE="$ALIYUN_SSH_KEY_PATH"
fi

SSH_OPTS=(-i "$SSH_KEY_FILE" -o StrictHostKeyChecking=accept-new -o ConnectTimeout=15)
REMOTE="${ALIYUN_SSH_USER}@${ALIYUN_SSH_HOST}"
REMOTE_DIR="${ALIYUN_REMOTE_DIR:-~/child-ai-tools}"

echo "→ Writing remote env file..."
ENV_FILE="$(mktemp)"
trap 'rm -f "$ENV_FILE" "$SSH_KEY_FILE"' EXIT
cat > "$ENV_FILE" <<EOF
DATABASE_URL=$DATABASE_URL
AUTH_SECRET=$AUTH_SECRET
AUTH_URL=$ALIYUN_AUTH_URL
AUTH_TRUST_HOST=true
NEXT_PUBLIC_APP_URL=$ALIYUN_AUTH_URL
NEXT_PUBLIC_APP_NAME=$NEXT_PUBLIC_APP_NAME
LLM_API_KEY=$LLM_API_KEY
LLM_API_URL=$LLM_API_URL
LLM_MODEL=$LLM_MODEL
DATABASE_POOL_MAX=$DATABASE_POOL_MAX
ADMIN_EMAIL=${ADMIN_EMAIL:-admin@example.com}
EOF

SSH_CMD=(ssh "${SSH_OPTS[@]}")
RSYNC_SSH="ssh -i ${SSH_KEY_FILE} -o StrictHostKeyChecking=accept-new -o ConnectTimeout=15"

echo "→ Syncing code to $REMOTE:$REMOTE_DIR ..."
rsync -az --delete \
  -e "$RSYNC_SSH" \
  --chmod=Du=rwx,Dgo=rx,Fu=rwX,Fgo=rX \
  --exclude node_modules \
  --exclude .git \
  --exclude .next \
  --exclude .open-next \
  --exclude .env \
  --exclude .env.deploy \
  "$ROOT/" "$REMOTE:$REMOTE_DIR/"

scp -i "$SSH_KEY_FILE" -o StrictHostKeyChecking=accept-new "$ENV_FILE" "$REMOTE:$REMOTE_DIR/.env.deploy"

echo "→ Building and starting containers on Aliyun ECS..."
"${SSH_CMD[@]}" "$REMOTE" "bash $REMOTE_DIR/scripts/aliyun-remote-up.sh"

echo ""
echo "✓ Aliyun deploy complete"
echo "  URL: $ALIYUN_AUTH_URL"
echo "  Health: curl $ALIYUN_AUTH_URL/api/health"
echo ""
echo "Tip: HK ECS 无需 ICP 备案；请确保安全组已放行 80/22。"
