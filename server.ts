// ===========================================================================
// PayU integration
// ===========================================================================

// --- Credentials: ONE source of truth, read once, trimmed. ------------------
// NEVER put the salt in a VITE_* variable: Vite inlines VITE_* values into the
// public browser bundle. VITE_PAYU_SALT is accepted below only as a temporary
// fallback so an existing deployment keeps working - rename it to PAYU_SALT.
const PAYU_KEY = (process.env.PAYU_KEY || process.env.PAYU_MERCHANT_KEY || process.env.VITE_PAYU_MERCHANT_KEY || "").trim();
const PAYU_SALT = (process.env.PAYU_SALT || process.env.VITE_PAYU_SALT || "").trim();
const PAYU_ENV = (process.env.PAYU_ENV || "production").trim().toLowerCase(); // "production" | "test"
const PAYU_IS_TEST = PAYU_ENV === "test";
const PAYU_BASE_URL = PAYU_IS_TEST ? "https://test.payu.in/_payment" : "https://secure.payu.in/_payment";
const PAYU_VERIFY_URL = PAYU_IS_TEST
  ? "https://test.payu.in/merchant/postservice.php?form=2"
  : "https://info.payu.in/merchant/postservice.php?form=2";
const USD_TO_INR = 83;

if (!process.env.PAYU_SALT && process.env.VITE_PAYU_SALT) {
  console.warn("[PAYU] Using VITE_PAYU_SALT. Rename it to PAYU_SALT and rotate the salt: VITE_* values can leak into the browser bundle.");
}
console.log(`[PAYU] env=${PAYU_ENV} key=${PAYU_KEY ? PAYU_KEY.slice(0, 2) + "***" : "MISSING"} saltLength=${PAYU_SALT.length}`);
if (!PAYU_KEY || !PAYU_SALT) {
  console.error("[PAYU] PAYU_KEY and/or PAYU_SALT are missing - payments are disabled until both are set.");
} else if (PAYU_SALT.length !== 32) {
  console.warn(`[PAYU] Salt length is ${PAYU_SALT.length}; PayU salts are normally 32 characters. Check for a wrong or truncated value.`);
}

const payuReady = () => !!PAYU_KEY && !!PAYU_SALT;

// <payu-hash-helpers>
const sha512 = (value: string) => crypto.createHash("sha512").update(value, "utf8").digest("hex");

// Request hash: key|txnid|amount|productinfo|firstname|email|udf1|udf2|udf3|udf4|udf5||||||salt
// (udf6..udf10 are empty, giving 11 pipes between the email and the salt).
function buildPayuRequestHash(p: {
  txnid: string; amount: string; productinfo: string; firstname: string; email: string;
  udf1?: string; udf2?: string; udf3?: string; udf4?: string; udf5?: string;
}): string {
  return sha512([
    PAYU_KEY, p.txnid, p.amount, p.productinfo, p.firstname, p.email,
    p.udf1 ?? "", p.udf2 ?? "", p.udf3 ?? "", p.udf4 ?? "", p.udf5 ?? "",
    "", "", "", "", "",
    PAYU_SALT
  ].join("|"));
}

// Response hash: [additionalCharges|]salt|status|udf10|udf9|...|udf1|email|firstname|productinfo|amount|txnid|key
// (11 pipes between status and email).
function buildPayuResponseHash(p: Record<string, unknown>): string {
  const udf = (n: number) => String(p[`udf${n}`] ?? "");
  const base = [
    PAYU_SALT, String(p.status ?? ""),
    udf(10), udf(9), udf(8), udf(7), udf(6), udf(5), udf(4), udf(3), udf(2), udf(1),
    String(p.email ?? ""), String(p.firstname ?? ""), String(p.productinfo ?? ""),
    String(p.amount ?? ""), String(p.txnid ?? ""), PAYU_KEY
  ].join("|");
  const extra = p.additionalCharges ? String(p.additionalCharges) : "";
  return sha512(extra ? `${extra}|${base}` : base);
}

function safeEqualHex(a: string, b: string): boolean {
  const x = Buffer.from(a.toLowerCase(), "utf8");
  const y = Buffer.from(b.toLowerCase(), "utf8");
  return x.length === y.length && crypto.timingSafeEqual(x, y);
}
// </payu-hash-helpers>

// --- Authoritative course catalog (never trust prices from the browser) -----
interface ServerCourseInfo {
  courseId: string;
  name: string;
  subtitle: string;
  originalPriceINR: number;
  offerPriceINR: number;
  originalPriceUSD: number;
  offerPriceUSD: number;
  isOfferActive: boolean;
  payuRedirectUrl: string;
}

const SERVER_COURSE_CATALOG: Record<string, ServerCourseInfo> = {
  standard: {
    courseId: "standard",
    name: "Base Cohort",
    subtitle: "Launch pricing - 6-day live curriculum",
    originalPriceINR: 4999,
    offerPriceINR: 3999,
    originalPriceUSD: 79,
    offerPriceUSD: 59,
    isOfferActive: true,
    payuRedirectUrl: "/api/payu/checkout-direct?courseId=standard&currency=INR"
  },
  base: {
    courseId: "base",
    name: "Base Cohort",
    subtitle: "Launch pricing - 6-day live curriculum",
    originalPriceINR: 4999,
    offerPriceINR: 3999,
    originalPriceUSD: 79,
    offerPriceUSD: 59,
    isOfferActive: true,
    payuRedirectUrl: "/api/payu/checkout-direct?courseId=base&currency=INR"
  },
  premium: {
    courseId: "premium",
    name: "Executive Track",
    subtitle: "1-on-1 Mentorship & Executive AI Blueprint",
    originalPriceINR: 12999,
    offerPriceINR: 9999,
    originalPriceUSD: 199,
    offerPriceUSD: 149,
    isOfferActive: true,
    payuRedirectUrl: "/api/payu/checkout-direct?courseId=premium&currency=INR"
  },
  ai_masterclass: {
    courseId: "ai_masterclass",
    name: "AI Architect Masterclass",
    subtitle: "Specialized Deep-Dive Cohort",
    originalPriceINR: 4999,
    offerPriceINR: 3999,
    originalPriceUSD: 79,
    offerPriceUSD: 59,
    isOfferActive: true,
    payuRedirectUrl: "/api/payu/checkout-direct?courseId=ai_masterclass&currency=INR"
  }
};

type PayuCurrency = "INR" | "USD";

// Lenient lookup (falls back to the standard course) - used when STARTING a payment.
function getCourse(courseId: unknown): ServerCourseInfo {
  const id = String(courseId || "standard").toLowerCase();
  return Object.prototype.hasOwnProperty.call(SERVER_COURSE_CATALOG, id)
    ? SERVER_COURSE_CATALOG[id]
    : SERVER_COURSE_CATALOG.standard;
}

// Strict lookup (no fallback) - used when VERIFYING a payment.
function findCourse(courseId: unknown): ServerCourseInfo | null {
  const id = String(courseId || "").toLowerCase();
  return Object.prototype.hasOwnProperty.call(SERVER_COURSE_CATALOG, id) ? SERVER_COURSE_CATALOG[id] : null;
}

const coursePrices = (course: ServerCourseInfo, currency: PayuCurrency) =>
  currency === "USD"
    ? { offer: course.offerPriceUSD, original: course.originalPriceUSD }
    : { offer: course.offerPriceINR, original: course.originalPriceINR };

const courseTrack = (courseId: string): "base" | "premium" => (courseId.includes("premium") ? "premium" : "base");

const pendingPayuOrders: Record<string, any> = {};

// Drop stale checkout sessions so the map cannot grow forever.
setInterval(() => {
  const cutoff = Date.now() - 48 * 60 * 60 * 1000;
  for (const [id, o] of Object.entries(pendingPayuOrders)) {
    if (new Date(o.createdAt).getTime() < cutoff) delete pendingPayuOrders[id];
  }
}, 60 * 60 * 1000).unref();

// --- Small helpers -----------------------------------------------------------
function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// PayU rejects odd characters in firstname; the hash must be computed on the exact value we post.
const cleanPayuName = (v: unknown): string =>
  String(v ?? "").replace(/[^\p{L}\p{N} ._-]/gu, "").trim().slice(0, 60) || "Student";

const cleanPayuEmail = (v: unknown): string | null => {
  const s = String(v ?? "").trim().toLowerCase();
  return s.length <= 100 && /^[^\s@<>"'&|]+@[^\s@<>"'&|]+\.[^\s@<>"'&|]+$/.test(s) ? s : null;
};

const cleanPayuPhone = (v: unknown): string => {
  const digits = String(v ?? "").replace(/\D/g, "");
  return digits.length >= 10 && digits.length <= 15 ? digits : "9999999999";
};

// Public HTTPS base URL for PayU return callbacks (surl/furl). Set APP_URL in production.
function getPublicAppUrl(req: express.Request): string {
  if (process.env.APP_URL && !process.env.APP_URL.includes("localhost")) {
    return process.env.APP_URL.replace(/\/$/, "");
  }
  const forwardedHost = req.get("x-forwarded-host");
  const host = forwardedHost || req.get("host");
  const forwardedProto = req.get("x-forwarded-proto");
  const proto = forwardedProto || (req.secure ? "https" : "http");

  if (host && !host.includes("localhost")) {
    const finalProto = host.endsWith(".run.app") || host.includes("codexia") ? "https" : proto;
    return `${finalProto}://${host}`.replace(/\/$/, "");
  }

  return "https://ais-dev-rffbl3drvahic2immp4x2t-526609645001.asia-east1.run.app";
}

function renderPayUAutoSubmitHtml(params: {
  actionUrl: string;
  payuParams: Record<string, string>;
  courseName: string;
  amountFormatted: string;
  currency: string;
}): string {
  const { actionUrl, payuParams, courseName, amountFormatted } = params;
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Connecting to PayU Checkout...</title>
  <style>
    body { background-color: #0b0d14; color: #ffffff; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 20px; box-sizing: border-box; }
    .card { background: #121520; border: 1px solid rgba(0, 242, 255, 0.3); padding: 2.5rem; border-radius: 20px; text-align: center; max-width: 460px; width: 100%; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7); }
    .logo { display: inline-flex; align-items: center; gap: 8px; background: #ffffff; padding: 6px 14px; border-radius: 8px; margin-bottom: 1.5rem; }
    .spinner { border: 3px solid rgba(0, 242, 255, 0.15); border-top: 3px solid #00f2ff; border-radius: 50%; width: 48px; height: 48px; animation: spin 0.8s linear infinite; margin: 0 auto 1.5rem; }
    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    .amount { font-size: 2.25rem; font-weight: 800; color: #00f2ff; margin: 0.75rem 0; font-family: ui-monospace, SFMono-Regular, monospace; }
    .info { font-size: 0.85rem; color: #94a3b8; line-height: 1.6; margin: 1rem 0; }
    .badge { display: inline-block; padding: 4px 12px; background: rgba(0, 242, 255, 0.1); border: 1px solid rgba(0, 242, 255, 0.25); border-radius: 9999px; font-size: 0.75rem; font-family: monospace; color: #00f2ff; margin-bottom: 0.5rem; }
    button { background: #00f2ff; color: #000; border: none; padding: 0.9rem 2rem; border-radius: 12px; font-weight: 800; font-size: 0.9rem; text-transform: uppercase; margin-top: 1rem; cursor: pointer; letter-spacing: 0.05em; transition: opacity 0.2s; width: 100%; }
    button:hover { opacity: 0.9; }
  </style>
</head>
<body>
  <div class="card">
    <div class="logo">
      <span style="font-weight:900; color:#000; font-size:1.1rem; letter-spacing:-0.5px;">pay<span style="color:#059669;">U</span></span>
    </div>
    <div class="spinner"></div>
    <div class="badge">SECURE HOSTED CHECKOUT</div>
    <h3 style="margin:0.25rem 0; font-size:1.2rem; font-weight:700;">Redirecting to PayU Payment Gateway...</h3>
    <p style="margin:0; color:#cbd5e1; font-size:0.95rem;">Enrolling in: <strong>${escapeHtml(courseName)}</strong></p>
    <div class="amount">${escapeHtml(amountFormatted)}</div>
    <p class="info">Authoritative price locked by server. You are being redirected to PayU's official checkout portal.</p>

    <form id="payu_form" action="${escapeHtml(actionUrl)}" method="post">
      ${Object.entries(payuParams)
        .map(([k, v]) => `<input type="hidden" name="${escapeHtml(k)}" value="${escapeHtml(v)}" />`)
        .join("\n      ")}
      <button type="submit">Proceed to PayU Checkout Now</button>
    </form>
  </div>
  <script>
    setTimeout(function() {
      var f = document.getElementById("payu_form");
      if (f) f.submit();
    }, 200);
  </script>
</body>
</html>`;
}

// --- Single place that builds a signed PayU request -------------------------
// course + currency travel inside udf1/udf2, which are part of the signed hash and are
// echoed back (and re-verified) in the callback, so the callback needs no server memory.
function buildPayuPayment(
  req: express.Request,
  input: { courseId?: unknown; currency?: unknown; name?: unknown; email?: unknown; phone?: unknown }
) {
  const course = getCourse(input.courseId);
  const currency: PayuCurrency = String(input.currency || "INR").toUpperCase() === "USD" ? "USD" : "INR";
  const prices = coursePrices(course, currency);
  const finalAmount = course.isOfferActive ? prices.offer : prices.original;
  const amount = finalAmount.toFixed(2);

  const email = cleanPayuEmail(input.email);
  if (!email) {
    return { error: "A valid email address is required to start a payment." } as const;
  }
  const firstname = cleanPayuName(input.name);
  const phone = cleanPayuPhone(input.phone);
  const productinfo = course.name;

  // PayU limits txnid to 25 characters.
  const txnid = `CX${Date.now().toString(36)}${crypto.randomBytes(4).toString("hex")}`.toUpperCase();

  const base = getPublicAppUrl(req);
  const surl = `${base}/api/payu/callback`;
  const furl = `${base}/api/payu/callback`;

  const udf1 = course.courseId;
  const udf2 = currency;
  const hash = buildPayuRequestHash({ txnid, amount, productinfo, firstname, email, udf1, udf2 });

  const payuParams: Record<string, string> = {
    key: PAYU_KEY,
    txnid,
    amount,
    productinfo,
    firstname,
    email,
    phone,
    surl,
    furl,
    udf1,
    udf2,
    hash,
    service_provider: "payu_paisa"
  };
  if (currency === "USD") payuParams.currency = "USD";

  const order = {
    txnid,
    courseId: course.courseId,
    courseName: course.name,
    originalPrice: prices.original,
    offerPrice: prices.offer,
    finalAmount,
    amountStr: amount,
    currency,
    isOfferActive: course.isOfferActive,
    status: "created",
    payuParams,
    customer: { firstname, email, phone },
    createdAt: new Date().toISOString()
  };
  pendingPayuOrders[txnid] = order;

  return { order, payuParams, course, currency, finalAmount };
}

const formatPayuAmount = (currency: string, amount: number) =>
  currency === "USD" ? `$${amount}` : `\u20B9${amount.toLocaleString()}`;

// --- Enrollment after a VERIFIED payment ------------------------------------
function enrollingCohortIdFor(track: "base" | "premium"): string {
  const enrolling = Array.from(cohorts.values()).find(c => c.track === track && c.status === "enrolling");
  return enrolling ? enrolling.id : (track === "base" ? "CODX-2026-07-BASE-01" : "CODX-2026-07-PREMIUM-01");
}

interface PaidTxn {
  txnid: string;
  amount: number;
  courseId: string;
  currency: PayuCurrency;
  email: string;
  name: string;
  phone: string;
}

function finalizePaidOrder(txn: PaidTxn): { ok: true; cohortId: string; order: any } | { ok: false; reason: string } {
  const course = findCourse(txn.courseId);
  if (!course) return { ok: false, reason: "unknown_course" };

  const prices = coursePrices(course, txn.currency);
  const amountOk = [prices.offer, prices.original].some(p => Math.abs(p - txn.amount) < 0.01);
  if (!amountOk) return { ok: false, reason: "amount_mismatch" };

  const pending = pendingPayuOrders[txn.txnid];
  if (pending && Math.abs(pending.finalAmount - txn.amount) > 0.01) return { ok: false, reason: "amount_mismatch" };

  const email = txn.email.toLowerCase().trim();
  if (!email) return { ok: false, reason: "no_email" };

  const track = courseTrack(course.courseId);
  const cohortId = enrollingCohortIdFor(track);

  const existing = studentProfiles.get(email);
  studentProfiles.set(email, {
    ...(existing ?? {}),
    email,
    username: txn.name,
    phone: txn.phone,
    track,
    cohort_id: cohortId
  });
  serverStore.has_paid = true;

  const amountINR = txn.currency === "INR" ? txn.amount : Math.round(txn.amount * USD_TO_INR);
  const amountUSD = txn.currency === "USD" ? txn.amount : Math.round(txn.amount / USD_TO_INR);

  const already = (serverStore.recently_registered || []).find((r: any) => r.txnid === txn.txnid);
  if (already) {
    already.username = txn.name;
    already.name = txn.name;
    already.phone = txn.phone;
  } else {
    serverStore.recently_registered = [{
      txnid: txn.txnid,
      email,
      username: txn.name,
      name: txn.name,
      phone: txn.phone,
      trackId: track === "premium" ? "track-premium" : "track-base",
      timestamp: new Date().toISOString(),
      tier: track,
      amountUSD,
      amountINR,
      cohort_id: cohortId
    }, ...(serverStore.recently_registered || [])];
    console.log(`[PAYU AUTO-PROVISIONING] ${txn.name} (${email}) admitted to cohort ${cohortId} (txn ${txn.txnid})`);
  }

  const order = pending || (pendingPayuOrders[txn.txnid] = {
    txnid: txn.txnid,
    courseId: course.courseId,
    courseName: course.name,
    finalAmount: txn.amount,
    currency: txn.currency,
    customer: { firstname: txn.name, email, phone: txn.phone },
    createdAt: new Date().toISOString()
  });
  order.status = "PAID";
  order.verifiedAt = new Date().toISOString();
  return { ok: true, cohortId, order };
}

// Ask PayU directly whether a transaction succeeded (covers a callback handled by another instance).
async function fetchPayuTransaction(txnid: string): Promise<PaidTxn | null> {
  const command = "verify_payment";
  const hash = sha512(`${PAYU_KEY}|${command}|${txnid}|${PAYU_SALT}`);
  const resp = await fetch(PAYU_VERIFY_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ key: PAYU_KEY, command, var1: txnid, hash }).toString(),
    signal: AbortSignal.timeout(10000)
  });
  if (!resp.ok) return null;
  const data: any = await resp.json();
  const d = data?.transaction_details?.[txnid];
  if (!d || String(d.status).toLowerCase() !== "success") return null;
  return {
    txnid,
    amount: Number(d.amt ?? d.transaction_amount ?? d.amount),
    courseId: String(d.udf1 || ""),
    currency: String(d.udf2) === "USD" ? "USD" : "INR",
    email: String(d.email || ""),
    name: cleanPayuName(d.firstname),
    phone: cleanPayuPhone(d.phone)
  };
}

// --- Routes ------------------------------------------------------------------

// Public, non-secret configuration only. The salt must NEVER be returned from here.
app.get(["/api/payu-config", "/api/razorpay-config"], (req, res) => {
  res.json({
    keyId: PAYU_KEY,
    merchantKey: PAYU_KEY,
    redirectUrl: (process.env.PAYU_REDIRECT_URL || "").trim(),
    hasSecret: !!PAYU_SALT,
    environment: PAYU_ENV,
    detectedVars: []
  });
});

// Create a PayU payment session (server-side price + signed hash)
app.post(["/api/create-payu-payment", "/api/payu/create-payment"], (req, res) => {
  if (!payuReady()) {
    return res.status(503).json({ success: false, error: "Payment gateway is not configured on the server (set PAYU_KEY and PAYU_SALT)." });
  }
  const { courseId, currency, customer } = req.body || {};
  const result = buildPayuPayment(req, {
    courseId,
    currency,
    name: customer?.firstname || customer?.name,
    email: customer?.email,
    phone: customer?.phone
  });
  if ("error" in result) {
    return res.status(400).json({ success: false, error: result.error });
  }

  const { order, payuParams } = result;
  res.json({
    success: true,
    txnid: order.txnid,
    courseId: order.courseId,
    courseName: order.courseName,
    originalPrice: order.originalPrice,
    offerPrice: order.offerPrice,
    offerActive: order.isOfferActive,
    finalAmount: order.finalAmount,
    amountStr: order.amountStr,
    currency: order.currency,
    redirectUrl: `/api/payu/checkout-direct?courseId=${order.courseId}&currency=${order.currency}`,
    checkoutPageUrl: `/api/payu/checkout/${order.txnid}`,
    actionUrl: PAYU_BASE_URL,
    payuParams,
    merchantName: "CODEXIA",
    verifiedOnServer: true
  });
});

// Direct gateway entrypoint that auto-posts to PayU Hosted Checkout
app.get("/api/payu/checkout-direct", (req, res) => {
  if (!payuReady()) {
    return res.status(503).send("Payment gateway is not configured on the server.");
  }
  const result = buildPayuPayment(req, {
    courseId: req.query.courseId,
    currency: req.query.currency,
    name: req.query.name || req.query.firstname,
    email: req.query.email,
    phone: req.query.phone
  });
  if ("error" in result) {
    return res.status(400).send(escapeHtml(result.error));
  }
  const { order, payuParams } = result;
  res.send(renderPayUAutoSubmitHtml({
    actionUrl: PAYU_BASE_URL,
    payuParams,
    courseName: order.courseName,
    amountFormatted: formatPayuAmount(order.currency, order.finalAmount),
    currency: order.currency
  }));
});

// Re-open an existing checkout session by txnid
app.get("/api/payu/checkout/:txnid", (req, res) => {
  const order = pendingPayuOrders[req.params.txnid];
  if (!order || !order.payuParams) {
    return res.status(404).send("This checkout session has expired. Please start the payment again.");
  }
  res.send(renderPayUAutoSubmitHtml({
    actionUrl: PAYU_BASE_URL,
    payuParams: order.payuParams,
    courseName: order.courseName,
    amountFormatted: formatPayuAmount(order.currency, order.finalAmount),
    currency: order.currency || "INR"
  }));
});

// PayU posts the result here (surl / furl). Nothing is trusted until the response hash verifies.
app.all("/api/payu/callback", (req, res) => {
  const payload: Record<string, any> = { ...(req.query || {}), ...(req.body || {}) };
  const txnid = String(payload.txnid || "");
  const fail = (reason: string) => {
    console.warn(`[PAYU CALLBACK] txn=${txnid || "?"} rejected: ${reason}`);
    return res.redirect(`/?payment=failed&txnid=${encodeURIComponent(txnid)}&status=FAILED`);
  };

  if (!payuReady()) return fail("gateway_not_configured");
  if (!txnid) return fail("missing_txnid");

  const receivedHash = String(payload.hash || "");
  if (!receivedHash || !safeEqualHex(buildPayuResponseHash(payload), receivedHash)) {
    return fail("hash_mismatch");
  }

  const order = pendingPayuOrders[txnid];
  const status = String(payload.status || "").toLowerCase();
  if (status !== "success") {
    if (order) order.status = "FAILED";
    return fail(`payu_status_${status || "unknown"}`);
  }

  const result = finalizePaidOrder({
    txnid,
    amount: Number(payload.amount),
    courseId: String(payload.udf1 || ""),
    currency: String(payload.udf2) === "USD" ? "USD" : "INR",
    email: String(payload.email || ""),
    name: cleanPayuName(payload.firstname),
    phone: cleanPayuPhone(payload.phone)
  });
  if (!result.ok) return fail(result.reason);

  res.redirect(`/?payment=success&txnid=${encodeURIComponent(txnid)}&status=PAID`);
});

// Frontend confirmation. Only returns verified:true for a payment that PayU itself confirmed.
app.post("/api/payu/verify-payment", async (req, res) => {
  const txnid = String(req.body?.txnid || "").trim();
  if (!txnid) {
    return res.status(400).json({ verified: false, error: "txnid is required" });
  }
  if (!payuReady()) {
    return res.status(503).json({ verified: false, error: "Payment gateway is not configured on the server." });
  }

  let order = pendingPayuOrders[txnid];
  let cohortId: string | undefined;

  if (!order || order.status !== "PAID") {
    let remote: PaidTxn | null = null;
    try {
      remote = await fetchPayuTransaction(txnid);
    } catch (err: any) {
      console.error("[PAYU VERIFY] Could not reach PayU:", err?.message || err);
      return res.status(502).json({ verified: false, error: "Could not reach PayU to confirm this payment. Please retry shortly." });
    }
    if (!remote) {
      return res.status(402).json({ verified: false, error: "This payment has not been confirmed by PayU." });
    }
    const result = finalizePaidOrder(remote);
    if (!result.ok) {
      return res.status(409).json({ verified: false, error: `Payment could not be validated (${result.reason}).` });
    }
    order = result.order;
    cohortId = result.cohortId;
  }

  if (!cohortId) {
    const profile = studentProfiles.get(String(order.customer?.email || "").toLowerCase());
    cohortId = profile?.cohort_id || enrollingCohortIdFor(courseTrack(String(order.courseId || "")));
  }

  res.json({
    verified: true,
    txnid: order.txnid,
    courseId: order.courseId,
    courseName: order.courseName,
    program: order.courseName,
    payment_status: "paid",
    enrollment_status: "active",
    cohort_id: cohortId,
    finalAmount: order.finalAmount,
    currency: order.currency,
    purchased_at: order.verifiedAt || new Date().toISOString(),
    message: "Payment verified with PayU"
  });
});