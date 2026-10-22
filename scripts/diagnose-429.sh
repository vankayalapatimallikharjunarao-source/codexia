#!/usr/bin/env bash
# Shows recent 429 ("Rate exceeded") responses and which URLs/clients cause them.
# Usage: PROJECT=my-gcp-project SERVICE=my-service ./scripts/diagnose-429.sh [freshness, default 1h]
set -euo pipefail
: "${PROJECT:?Set PROJECT}"
: "${SERVICE:?Set SERVICE}"
FRESH="${1:-1h}"

gcloud logging read \
  "resource.type=\"cloud_run_revision\" AND resource.labels.service_name=\"${SERVICE}\" AND httpRequest.status=429" \
  --project "$PROJECT" --freshness "$FRESH" --limit 200 \
  --format="table(timestamp, httpRequest.requestMethod, httpRequest.requestUrl, httpRequest.remoteIp, httpRequest.userAgent)"
echo
echo "Tip: the same URL repeated many times per second from one IP = a polling/retry loop in the frontend."
