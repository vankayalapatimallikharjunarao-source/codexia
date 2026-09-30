# PayU Checkout Fix

## What caused the visible error

The payment-link checkout path now redirects through the supplied Cloud Run `/api/payu/checkout-direct` endpoints. The screenshot error is PayU's own "Too many Requests" response.

This version removes that short-payment-link redirect from the server-side checkout flow.

## New flow

1. Codexia creates a unique transaction ID on the server.
2. The server calculates the SHA-512 Hosted Checkout hash using the PayU merchant salt.
3. Codexia returns a one-time checkout URL such as `/api/payu/checkout/<txnid>`.
4. That route renders an HTML form and POSTs directly to PayU Hosted Checkout:
   - Production: `https://secure.payu.in/_payment`
   - Test: `https://test.payu.in/_payment`
5. PayU posts the result to `/api/payu/callback`.
6. The callback validates the reverse hash, transaction ID, amount, product and status.
7. The server calls PayU `verify_payment` before provisioning paid access.

## Additional protections

- 8-second duplicate-session collapse for rapid double-clicks / frontend retry loops.
- No-cache headers on the checkout form.
- PayU salt is never returned by `/api/payu-config`.
- The checkout engine now uses the supplied Cloud Run `/api/payu/checkout-direct` URLs for Base and Premium.
- Cloud Run uses `process.env.PORT` with an 8080 fallback.

## Required Cloud Run variables

Set these as server-side environment variables / Secret Manager values:

- `PAYU_ENV=production`
- `PAYU_KEY=<your production merchant key>`
- `PAYU_SALT=<your production merchant salt>`
- `APP_URL=https://<your-cloud-run-service-url>` (or your custom HTTPS domain)

Do not put `PAYU_SALT` in frontend/Vite environment variables.
