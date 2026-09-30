# CODEXIA — PayU Locked-Price Cloud Run Checkout

This package fixes the open-amount behavior shown by the Base Cohort PayU page.

## Locked cohort prices
- Base Cohort (`standard`): ₹3,999
- Executive Track / Premium (`premium`): ₹9,999

The browser never supplies an amount. The server resolves the amount from `SERVER_COURSE_CATALOG`, signs it into the PayU Hosted Checkout request, and stores the pending order for callback verification.

## Direct cohort URLs
After deployment, use:
- `/api/payu/checkout-direct?courseId=standard&currency=INR`
- `/api/payu/checkout-direct?courseId=premium&currency=INR`

Optional customer query fields: `name`, `email`, `phone`. Do not add an `amount` query parameter; it is intentionally ignored/not supported.

## Cloud Run
Set `PAYU_KEY`, `PAYU_SALT`, `PAYU_ENV=production`, and `PAYU_CHECKOUT_MODE=hosted`. Deploy with:

```bash
gcloud run deploy codexia-payu --source . --region asia-south1 --allow-unauthenticated
```

PayU Hosted Checkout uses a server-side POST to `https://secure.payu.in/_payment` in production. The amount is included in that signed transaction, so the customer cannot edit it on the payment page.

## Important
The previously supplied external `checkout-direct?courseId=standard` URL displays an amount-entry field (the first screenshot), which indicates that that upstream flow is an open-amount invoice. Redirecting to it cannot make the amount immutable from Codexia. This package therefore provides the locked checkout endpoint on your own Cloud Run service instead.
