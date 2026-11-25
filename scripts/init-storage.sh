#!/usr/bin/env bash
# One-time setup of the Garage S3 node started by infra/docker-compose.yml (US-15-002).
# Creates the layout, the private bucket "homecare-private" and imports the dev access key from infra/.env.
# Cách chạy (từ gốc repo, sau khi 'docker compose ... --profile infra up -d'):  bash scripts/init-storage.sh
set -euo pipefail
cd "$(dirname "$0")/.."
set -a; source infra/.env; set +a

garage() { docker compose -f infra/docker-compose.yml exec -T garage /garage "$@"; }

node_id=$(garage status 2>/dev/null | awk '/NO ROLE ASSIGNED|HEALTHY NODES/{f=1} f && $1 ~ /^[0-9a-f]{16}$/ {print $1; exit}')
if [ -n "${node_id}" ]; then
  garage layout assign -z dc1 -c 1G "${node_id}" || true
  garage layout apply --version 1 || true
fi
garage key import --yes -n homecare-dev "${GARAGE_ACCESS_KEY_ID}" "${GARAGE_SECRET_ACCESS_KEY}" || true
garage bucket create homecare-private || true
garage bucket allow --read --write homecare-private --key homecare-dev
echo "Garage ready: bucket homecare-private, endpoint http://localhost:3900 (region garage)"
