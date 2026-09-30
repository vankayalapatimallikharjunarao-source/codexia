# Codexia — Cloud Run + PayU Deployment Notes

## Important

The package supports two PayU modes. The requested production default is `PAYU_CHECKOUT_MODE=payment_link`, which sends Base and Premium customers through a Codexia price/logging interstitial and then to the supplied PayU `api.payu.in/public/#/.../paymentoptions` links. The previous server-generated Hosted Checkout mode remains available with `PAYU_CHECKOUT_MODE=hosted`; that mode validates PayU callbacks and verifies transactions server-to-server before provisioning access.

## Cloud Run

The server listens on the Cloud Run supplied `PORT` value and falls back to `8080` locally. It binds to `0.0.0.0`.

Build output expected by `package.json`:

- `dist/index.html`
- `dist/server.cjs`

The Dockerfile starts `dist/server.cjs`.

Do not manually set `PORT` to a different value in the application code.

## Deploy from this folder

```bash
gcloud run deploy codexia --source . --region asia-south1
```

After deployment, set:

```text
NODE_ENV=production
APP_URL=https://<your-cloud-run-url-or-custom-domain>
PAYU_ENV=production
PAYU_KEY=<production PayU merchant key>
PAYU_SALT=<production PayU merchant salt>
PAYU_BASE_AMOUNT_INR=3999
PAYU_PREMIUM_AMOUNT_INR=9999
GEMINI_API_KEY=<optional>
```

For SMTP/email features, also configure the SMTP/Gmail variables from `cloudrun.env.example`.

## PayU callback URL

The application generates:

```text
https://<APP_URL>/api/payu/callback
```

or, if `APP_URL` is omitted, it derives the public URL from the incoming Cloud Run request.

## Source files still required

The supplied project files do not contain the original `src/` directory. The existing `index.html` references `src/main.tsx`, and `server.ts` imports:

- `src/data/legalDocuments.ts`
- `src/utils/certificateGenerator.ts`

Restore the original `src/` directory before running `npm run build` or deploying this folder. The missing source was intentionally not invented or replaced.
