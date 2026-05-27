#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
# shellcheck disable=SC1091
source "$ROOT/scripts/load-deploy-env.sh"

if ! gh auth status >/dev/null 2>&1; then
  echo "→ Log in to GitHub first:"
  echo "  gh auth login"
  exit 1
fi

TARGET="${DEPLOY_TARGET:-vercel}"
REPO="${GITHUB_REPO:-xfzhu01/child-ai-tools}"

if git remote get-url origin >/dev/null 2>&1; then
  REMOTE_REPO="$(git remote get-url origin | sed -E 's#.*github.com[:/](.+)(\.git)?$#\1#')"
  REPO="${GITHUB_REPO:-$REMOTE_REPO}"
fi

echo "Using repo: $REPO"
echo "DEPLOY_TARGET=$TARGET"

echo "→ Setting repository variable DEPLOY_TARGET..."
gh variable set DEPLOY_TARGET --body "$TARGET" --repo "$REPO"

echo "→ Setting shared GitHub Actions secrets..."
gh secret set DATABASE_URL --body "$DATABASE_URL" --repo "$REPO"
gh secret set AUTH_SECRET --body "$AUTH_SECRET" --repo "$REPO"
gh secret set LLM_API_KEY --body "$LLM_API_KEY" --repo "$REPO"

if [[ "$TARGET" == "vercel" || "$TARGET" == "all" ]]; then
  : "${VERCEL_TOKEN:?Set VERCEL_TOKEN in .env (Vercel → Account → Tokens)}"
  : "${VERCEL_ORG_ID:?Set VERCEL_ORG_ID in .env}"
  : "${VERCEL_PROJECT_ID:?Set VERCEL_PROJECT_ID in .env}"
  : "${AUTH_URL:?Set AUTH_URL in .env (Vercel production URL)}"
  gh secret set AUTH_URL --body "$AUTH_URL" --repo "$REPO"
  gh secret set VERCEL_TOKEN --body "$VERCEL_TOKEN" --repo "$REPO"
  gh secret set VERCEL_ORG_ID --body "$VERCEL_ORG_ID" --repo "$REPO"
  gh secret set VERCEL_PROJECT_ID --body "$VERCEL_PROJECT_ID" --repo "$REPO"
  echo "  ✓ Vercel secrets"
fi

if [[ "$TARGET" == "aliyun" || "$TARGET" == "all" ]]; then
  : "${ALIYUN_SSH_HOST:?Set ALIYUN_SSH_HOST in .env}"
  : "${ALIYUN_SSH_USER:?Set ALIYUN_SSH_USER in .env}"
  if [[ -z "${ALIYUN_SSH_PRIVATE_KEY:-}" && -z "${ALIYUN_SSH_KEY_PATH:-}" ]]; then
    echo "ERROR: Set ALIYUN_SSH_PRIVATE_KEY or ALIYUN_SSH_KEY_PATH in .env"
    exit 1
  fi
  ALIYUN_AUTH_URL="${ALIYUN_AUTH_URL:-http://${ALIYUN_SSH_HOST}}"
  gh secret set ALIYUN_SSH_HOST --body "$ALIYUN_SSH_HOST" --repo "$REPO"
  gh secret set ALIYUN_SSH_USER --body "$ALIYUN_SSH_USER" --repo "$REPO"
  gh secret set ALIYUN_AUTH_URL --body "$ALIYUN_AUTH_URL" --repo "$REPO"
  if [[ -n "${ALIYUN_SSH_PRIVATE_KEY:-}" ]]; then
    gh secret set ALIYUN_SSH_PRIVATE_KEY --body "$ALIYUN_SSH_PRIVATE_KEY" --repo "$REPO"
  else
    gh secret set ALIYUN_SSH_PRIVATE_KEY --body "$(cat "$ALIYUN_SSH_KEY_PATH")" --repo "$REPO"
  fi
  echo "  ✓ Aliyun secrets"
fi

echo "✓ GitHub CI configured for DEPLOY_TARGET=$TARGET"
