#!/usr/bin/env bash
# Raises Cloud Run capacity so traffic spikes / cold starts don't end in the plain "Rate exceeded." page.
# Uses `services update`, which changes ONLY these settings and keeps your env vars (PAYU_*, etc.).
#
# Usage:
#   PROJECT=my-gcp-project SERVICES="svc-mumbai:asia-south1 svc-singapore:asia-southeast1" \
#     ./scripts/cloudrun-capacity.sh
# Optional overrides: MIN_INSTANCES (default 1) MAX_INSTANCES (10) CONCURRENCY (80) CPU (1) MEMORY (512Mi)
set -euo pipefail

: "${PROJECT:?Set PROJECT to your GCP project id}"
: "${SERVICES:?Set SERVICES like \"service-name:region service-name:region\"}"

MIN_INSTANCES="${MIN_INSTANCES:-1}"
MAX_INSTANCES="${MAX_INSTANCES:-10}"
CONCURRENCY="${CONCURRENCY:-80}"
CPU="${CPU:-1}"
MEMORY="${MEMORY:-512Mi}"

for entry in $SERVICES; do
  svc="${entry%%:*}"
  region="${entry##*:}"
  echo ">> Updating ${svc} (${region})"
  gcloud run services update "$svc" \
    --project "$PROJECT" --region "$region" \
    --min-instances "$MIN_INSTANCES" --max-instances "$MAX_INSTANCES" \
    --concurrency "$CONCURRENCY" --cpu "$CPU" --memory "$MEMORY" \
    --cpu-boost --timeout 300
done
echo "Done. Verify with: curl https://<service-url>/api/health"
