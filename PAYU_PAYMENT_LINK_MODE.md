# PayU Payment Link Redirection Mode

This package supports the requested merchant-created PayU payment links:

- Base Cohort: https://u.payu.in/crJLw8TgDtWB
- Premium Alpha: https://u.payu.in/1rC2wPC1aNFT

Set `PAYU_CHECKOUT_MODE=payment_link` to make `/api/create-payu-payment` return the fixed PayU link as `redirectUrl`, and to enable `/api/payu/payment-link/:courseId`.

## Important verification behavior

`PAYU_CHECKOUT_MODE=payment_link` does not create a server-side PayU transaction, so the hosted-checkout callback/`verify_payment` workflow cannot automatically verify that static payment-link transaction unless the merchant-created PayU link itself is configured in PayU to return to a compatible merchant callback. The existing server-side verification workflow has therefore been preserved and remains the default when `PAYU_CHECKOUT_MODE=hosted`.

PayU's current Hosted Checkout documentation uses a server-generated POST to `https://secure.payu.in/_payment` with a unique `txnid` and SHA-512 hash.
