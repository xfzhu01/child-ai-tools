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

: "${VERCEL_TOKEN:?Set VERCEL_TOKEN in .env (Vercel → Settings → Tokens)}"
: "${VERCEL_ORG_ID:?Set VERCEL_ORG_ID in .env (from .vercel/project.json after vercel link)}"
: "${VERCEL_PROJECT_ID:?Set VERCEL_PROJECT_ID in .env}"
: "${AUTH_URL:?Set AUTH_URL in .env to your production URL (no trailing slash)}"

REPO="${GITHUB_REPO:-xfzhu01/child-ai-tools}"

if git remote get-url origin >/dev/null 2>&1; then
  REMOTE_REPO="$(git remote get-url origin | sed -E 's#.*github.com[:/](.+)(\.git)?$#\1#')"
  REPO="${GITHUB_REPO:-$REMOTE_REPO}"
fi

if [[ -z "$REPO" ]]; then
  echo "ERROR: Could not detect GitHub repo. Set GITHUB_REPO=owner/name"
  exit 1
fi

echo "Using repo: $REPO"

if ! git remote get-url origin >/dev/null 2>&1; then
  git remote add origin "git@github.com:${REPO}.git"
fi

if ! git rev-parse --abbrev-ref '@{upstream}' >/dev/null 2>&1; then
  git push -u origin main || true
fi

echo "→ Setting GitHub Actions secrets..."
gh secret set DATABASE_URL --body "$DATABASE_URL"
gh secret set AUTH_SECRET --body "$AUTH_SECRET"
gh secret set AUTH_URL --body "$AUTH_URL"
gh secret set LLM_API_KEY --body "$LLM_API_KEY"
gh secret set VERCEL_TOKEN --body "$VERCEL_TOKEN"
gh secret set VERCEL_ORG_ID --body "$VERCEL_ORG_ID"
gh secret set VERCEL_PROJECT_ID --body "$VERCEL_PROJECT_ID"

echo "✓ GitHub secrets configured. CI deploys to Vercel on push to main."
