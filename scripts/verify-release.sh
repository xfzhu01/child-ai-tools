#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

echo "→ Unit tests"
npm run test:unit

echo "→ Lint"
npm run lint

echo "→ Production build"
npm run build

echo "✓ Release verification passed"
