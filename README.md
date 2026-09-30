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


## Google Cloud Run

This package has been adjusted to use Cloud Run's injected `PORT` and a production Node runtime. See `DEPLOYMENT_NOTES.md`.


## PayU payment-link mode

The payment gate is configured for the supplied merchant-created PayU payment-options links. Base and Premium are mapped separately, and the server shows/logs the configured INR amount before redirecting to PayU. Set `PAYU_CHECKOUT_MODE=payment_link`, `PAYU_BASE_AMOUNT_INR=3999`, and `PAYU_PREMIUM_AMOUNT_INR=9999` in Cloud Run.
