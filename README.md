<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/83d18cdd-f8f3-49b4-a8dd-105583acd04d

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Deploy to Cloud Run

- The server listens on `process.env.PORT` (Cloud Run sets it to `8080`; local default is `3000`).
- `npm run build` builds the Vite frontend into `dist/` and bundles the server to `dist/server.cjs`.
- `npm start` runs the bundle with `NODE_ENV=production` (serves `dist/` statically).
- A multi-stage `Dockerfile` is included for deterministic builds. Health check: `GET /api/health`.
- Set secrets (`GEMINI_API_KEY`, `APP_URL`, `PAYU_*`, `SMTP_*`/`GMAIL_*`) as Cloud Run environment variables / Secret Manager, never in the repo.

### PayU setup (fixes "incorrectly calculated hash")
PayU rejects the payment if the server signs with a missing/wrong salt. Set these on **every** Cloud Run service (e.g. both `asia-south1` and `asia-southeast1`):

```bash
gcloud run services update SERVICE_NAME --region REGION \
  --update-env-vars PAYU_KEY=your_key,PAYU_ENV=production \
  --update-secrets PAYU_SALT=payu-salt:latest      # or --update-env-vars PAYU_SALT=...
```

Then open `https://YOUR-SERVICE-URL/api/health` and confirm `"payu": { "configured": true, ... }`.
`PAYU_ENV=production` needs live key/salt; use `PAYU_ENV=test` with PayU test credentials.

### Pricing: portal and PayU always match
The server is the single source of truth. `GET /api/pricing` returns the current price per course/currency, and the PayU
routes (`/api/create-payu-payment`, `/api/payu/checkout-direct`, `/api/payu/checkout/:txnid`) charge the same number.
While the promo is active (admin toggle on `/api/masterclass`, or until `PROMO_ENDS_AT`) the discounted price is charged;
afterwards the original price is charged. The price is locked at the moment checkout starts.

### Avoiding the plain "Rate exceeded." page
That page is returned by Cloud Run / Google's front end (not by this app) when a service is overloaded or hits its
instance limit. What is included to prevent it:

- **Capacity** - run once per project (keeps all existing env vars):
  ```bash
  PROJECT=your-gcp-project SERVICES="service-a:asia-south1 service-b:asia-southeast1" ./scripts/cloudrun-capacity.sh
  ```
  Sets min instances 1 (no cold start), max instances 10, concurrency 80, startup CPU boost.
- **Server hardening** (`server.ts`) - per-IP `/api` limiter that returns a clean `429` + `Retry-After`
  (`API_RATE_LIMIT_PER_MIN`), long-lived static asset caching, short browser caching for `/api/masterclass` and
  `/api/pricing`, Node keep-alive tuned for Google's load balancer, graceful `SIGTERM` shutdown.
- **Diagnose** - find what is generating the 429s:
  ```bash
  PROJECT=your-gcp-project SERVICE=service-a ./scripts/diagnose-429.sh 1h
  ```
  The same URL hit many times per second from one IP means a polling/retry loop in the frontend.
