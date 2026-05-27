#!/usr/bin/env bash
# Route deploy:beta to Vercel, Aliyun, Cloudflare, or all targets.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
# shellcheck disable=SC1091
source "$ROOT/scripts/load-deploy-env.sh"

TARGET="${DEPLOY_TARGET:-vercel}"

case "$TARGET" in
  vercel)
    exec bash "$ROOT/scripts/deploy-vercel.sh"
    ;;
  aliyun)
    exec bash "$ROOT/scripts/deploy-aliyun.sh"
    ;;
  cloudflare)
    exec bash "$ROOT/scripts/deploy-cloudflare.sh"
    ;;
  all)
    bash "$ROOT/scripts/deploy-vercel.sh"
    bash "$ROOT/scripts/deploy-aliyun.sh"
    ;;
  *)
    echo "ERROR: Unknown DEPLOY_TARGET=$TARGET (use vercel | aliyun | cloudflare | all)"
    exit 1
    ;;
esac
