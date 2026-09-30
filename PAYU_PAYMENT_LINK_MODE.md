# CODEXIA PayU Payment-Link Mode

## Current merchant-created PayU links

- **Base Cohort:** `https://api.payu.in/public/#/cb6837c412ad4b181e2f3879034e0c2e/paymentoptions`
- **Premium Cohort:** `https://api.payu.in/public/#/965e0d806e0abcc0ed67cff2601f984f/paymentoptions`

## Price display + logging

When the payment gate calls `/api/create-payu-payment` with `courseId=base` or `courseId=premium`, the server returns a **Codexia interstitial URL** rather than sending the browser directly to PayU.

The interstitial:

1. Shows the configured cohort price to the customer.
2. Writes a structured `PAYU_PAYMENT_REDIRECT` event to stdout.
3. Cloud Run captures that stdout as application logs.
4. Redirects the browser to the exact merchant-created PayU `paymentoptions` URL after 3 seconds, with a manual **Continue to PayU** button.

Configured defaults:

- Base Cohort: **INR 3,999.00**
- Premium Cohort: **INR 9,999.00**

You can change these server-side with `PAYU_BASE_AMOUNT_INR` and `PAYU_PREMIUM_AMOUNT_INR`. Keep them synchronized with the actual amount configured in the PayU links.

## API behavior

`POST /api/create-payu-payment` returns: `redirectUrl`, `paymentLink`, `finalAmount`, `amountStr`, `currency`, and `priceLogged`. The frontend should navigate to `redirectUrl`.

`GET /api/payu/payment-link/base` and `GET /api/payu/payment-link/premium` show/log the amount and then redirect to PayU.

## Important payment-link limitation

These are fixed merchant-created PayU payment-option links, not the server-generated Hosted Checkout `_payment` flow. PayU's Hosted Checkout supports merchant-generated transaction IDs, amounts, request hashes, and `surl`/`furl` callbacks. Fixed Payment Links are managed separately by PayU. Therefore, this mode can reliably show/log the configured amount before redirect, but it does **not** create the same `txnid` in Codexia's `pendingPayuOrders` store or automatically bind the external payment-link payment to that store. If automatic post-payment enrollment is required, configure PayU Payment Link status/webhook/reconciliation support or use the existing `PAYU_CHECKOUT_MODE=hosted` flow.

PayU documentation: Hosted Checkout request/response and redirect handling are documented by PayU.
