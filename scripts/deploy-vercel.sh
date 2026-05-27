#!/usr/bin/env bash
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
  echo "→ Linking new Vercel project..."
  npx vercel link --yes
fi

if [[ -z "${AUTH_URL:-}" ]]; then
  if [[ "${FIRST_DEPLOY:-}" == "1" ]]; then
    echo "WARN: FIRST_DEPLOY=1 — deploying without AUTH_URL. Update .env after you get the live URL."
  else
    echo "Tip: set AUTH_URL in .env before deploy, or run FIRST_DEPLOY=1 npm run deploy:beta"
  fi
fi

echo "→ Syncing Vercel env..."
bash "$ROOT/scripts/sync-vercel-env.sh"

echo "→ Deploying to Vercel (production)..."
DEPLOY_OUTPUT="$(npx vercel deploy --prod --yes 2>&1)"
echo "$DEPLOY_OUTPUT"
DEPLOY_URL="$(printf '%s\n' "$DEPLOY_OUTPUT" | grep -Eo 'https://[^[:space:]]+\.vercel\.app' | tail -1 || true)"

echo ""
echo "✓ Deploy complete"
if [[ -n "$DEPLOY_URL" ]]; then
  echo "  URL: $DEPLOY_URL"
  echo ""
  echo "Next:"
  echo "  1. Set AUTH_URL=$DEPLOY_URL in .env"
  echo "  2. Set NEXT_PUBLIC_APP_URL=$DEPLOY_URL"
  echo "  3. npm run deploy:beta   # sync env + redeploy for login cookies"
  echo "  4. curl $DEPLOY_URL/api/health"
else
  echo "  Check Vercel Dashboard for the production URL."
fi
