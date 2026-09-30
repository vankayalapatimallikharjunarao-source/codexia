# PayU Locked Price Fix

The first screenshot is an open-amount PayU page: it asks the customer to enter the amount. That behavior is controlled by the PayU payment-link configuration. A redirecting application cannot reliably force `₹3,999` into that page.

The second screenshot is a fixed-amount PayU checkout. To reproduce that behavior for both cohorts, this package uses PayU Hosted Checkout and sends the amount server-side. PayU documents the hosted checkout `_payment` flow with an `amount` parameter and a signed request.

The authoritative mapping is:

```text
standard -> Base Cohort -> ₹3999
premium  -> Executive Track -> ₹9999
```

No frontend-supplied price is trusted. If a user manipulates a URL such as `?amount=1`, the server still charges the catalog amount.
