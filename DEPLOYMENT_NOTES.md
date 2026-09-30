# Codexia deployment fixes

## Changes made
- Server now reads `process.env.PORT` and falls back to 3000 locally.
- Production server starts with `NODE_ENV=production`.
- Production bundle is ESM (`dist/server.mjs`) so Vite can be loaded correctly.
- Build tooling needed by `npm run build` is available during production/container builds.
- Added a multi-stage Dockerfile for Cloud Run.
- Added `cloudrun.env.example` for runtime configuration.

## Before deploying
This package is only complete if the application's `src/` directory is present. The supplied `server.ts` imports:
- `./src/data/legalDocuments`
- `./src/utils/certificateGenerator`
and `index.html` loads `/src/main.tsx`.

Those source files were not included in the uploaded files used to create this package. Do NOT deploy this folder until the original `src/` directory is copied into the project root.

## Build
npm ci
npm run build
npm start

## Cloud Run
Use the included Dockerfile. Cloud Run should supply PORT automatically. Set NODE_ENV=production and add the required secrets/environment variables.
