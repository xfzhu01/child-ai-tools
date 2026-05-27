#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
# shellcheck disable=SC1091
source "$ROOT/scripts/load-deploy-env.sh"

if ! npx wrangler whoami 2>&1 | grep -qE "Account ID|account"; then
  echo "→ Please log in to Cloudflare first:"
  echo "  npx wrangler login"
  exit 1
fi

if [[ -z "${AUTH_URL:-}" ]]; then
  if [[ "${FIRST_DEPLOY:-}" == "1" ]]; then
    AUTH_URL="http://localhost:3000"
    echo "WARN: FIRST_DEPLOY=1 — using temporary AUTH_URL for build. Update .env after deploy."
  else
    echo "ERROR: Set AUTH_URL in .env to your workers.dev or custom domain (no trailing slash)."
    echo "  Or run: FIRST_DEPLOY=1 npm run deploy:beta"
    exit 1
  fi
fi

export AUTH_URL
export NEXT_PUBLIC_APP_URL="${NEXT_PUBLIC_APP_URL:-$AUTH_URL}"

echo "→ Syncing Worker secrets..."
printf '%s' "$DATABASE_URL" | npx wrangler secret put DATABASE_URL
printf '%s' "$AUTH_SECRET" | npx wrangler secret put AUTH_SECRET
printf '%s' "$LLM_API_KEY" | npx wrangler secret put LLM_API_KEY

echo "→ Building OpenNext..."
npx opennextjs-cloudflare build

HANDLER=".open-next/server-functions/default/handler.mjs"
if [[ -f "$HANDLER" ]]; then
  HANDLER_KB=$(($(wc -c < "$HANDLER") / 1024))
  GZIP_KB=$(gzip -c "$HANDLER" | wc -c | tr -d ' ')
  GZIP_KB=$((GZIP_KB / 1024))
  echo "  Bundle: ${HANDLER_KB} KiB raw, ~${GZIP_KB} KiB gzipped (Cloudflare free limit: 3072 KiB)"
  if (( GZIP_KB > 3072 )); then
    echo ""
    echo "WARN: Bundle exceeds Workers Free plan (3 MiB gzipped)."
    echo "  Enable Workers Paid ($5/mo) for up to 10 MiB: https://dash.cloudflare.com/${CLOUDFLARE_ACCOUNT_ID:-}/workers/plans"
    echo "  This app needs ~3.6 MiB gzipped (Prisma + Next.js)."
    echo ""
  fi
fi

echo "→ Deploying to Cloudflare Workers..."
npx wrangler deploy

echo ""
echo "✓ Deploy complete"
if [[ -n "${CLOUDFLARE_ACCOUNT_ID:-}" ]]; then
  echo "  Live URL (after first successful deploy): https://child-ai-tools.<your-subdomain>.workers.dev"
fi
echo "  Set AUTH_URL / NEXT_PUBLIC_APP_URL in .env to your live URL, then run this script again if auth redirects fail."
echo "  Health check: curl \$AUTH_URL/api/health"
