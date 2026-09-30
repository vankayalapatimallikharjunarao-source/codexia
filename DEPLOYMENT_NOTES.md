# CODEXIA — Google Cloud Run Ready Package

## What was changed

- Server no longer hard-codes port 3000.
- Server reads Cloud Run's injected `PORT` and falls back to 8080.
- Server listens on `0.0.0.0`.
- Production build bundles `server.ts` to `dist/server.cjs`.
- Docker runtime starts `dist/server.cjs` (not the previous incorrect `dist/server.mjs`).
- Dockerfile uses Node 20 and `npm ci`.
- `.gcloudignore` keeps the source files required for the build.
- `APP_URL` has a safe local fallback and should be set to the public HTTPS URL in Cloud Run.
- PayU credentials remain server-side.

## Deploy

From this folder:

```bash
gcloud run deploy codexia --source . --region asia-south1
```

Or build/deploy the Dockerfile through Cloud Build.

In Cloud Run, configure:

```text
NODE_ENV=production
APP_URL=https://YOUR-PUBLIC-DOMAIN
GEMINI_API_KEY=...
PAYU_ENV=production
PAYU_KEY=...
PAYU_SALT=...
```

Do not set `PORT` manually; Cloud Run injects it.

## Important source status

The files supplied for this rebuild do NOT include the original `src/` directory. `index.html` references `src/main.tsx`, and `server.ts` imports:

- `src/data/legalDocuments`
- `src/utils/certificateGenerator`

Therefore this package is Cloud Run configuration/build corrected, but the original frontend source must be restored into `src/` before the original application can be built. No missing application source was invented.
