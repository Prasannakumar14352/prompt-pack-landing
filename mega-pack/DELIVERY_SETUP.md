# Delivery Setup — 100,000+ AI Mega Prompts Pack

No backend, no database. Single product, single price (₹299). Delivery runs on: **one Razorpay Payment Page → Webhook → Make.com → Email**, plus an immediate on-page download on `thank-you.html`. This doc is the step-by-step to wire that up. Claude cannot create these accounts/scenarios for you — follow this manually.

---

## (a) Create the Razorpay Payment Page

1. Log in to the [Razorpay Dashboard](https://dashboard.razorpay.com/) → **Payment Pages** → **+ New Payment Page**.
2. Set the amount to **₹299** (29900 paise). If you're reusing an existing Payment Page that was previously ₹499, edit its amount field to 299 — don't leave it at 499.
3. Under **Advanced Settings → Redirect URL after payment**, set:
   - `https://<your-domain>/mega-pack/thank-you.html`

   Razorpay appends its own payment ID param automatically — `thank-you.html` reads `pid` from the URL if present, so it's fine either way.
4. Make sure **"Collect email"** is turned ON — the buyer's email is how the Make scenario knows where to send download links.
5. Copy the page's short link and drop it into `index.html` where you see:
   - `<!-- RAZORPAY_PAYMENT_PAGE -->`

   (That button calls `payWithRazorpay()` in `script.js`, which simply redirects the browser to `CFG.PRODUCT.url`. No Razorpay SDK, no key, no modal.)
6. In `script.js` → `CFG.PRODUCT.url`, paste that same Payment Page link.

---

## (b) Add the webhook

1. Razorpay Dashboard → **Settings → Webhooks → + Add New Webhook**.
2. Webhook URL: paste the Make.com **Custom Webhook** URL you'll generate in step (c.1) below (you'll circle back and paste it here once Make gives you the URL).
3. Active events — enable at minimum:
   - `payment.captured`
4. Set a Webhook Secret (any string) — copy it, you'll need it if you choose to verify signatures in Make (optional but recommended).
5. Save.

---

## (c) Build the Make.com scenario

**Structure: Webhook → Email. No Router needed — there's only one product and one price, so nothing to branch on.**

1. **Trigger — Custom Webhook**
   - Make.com → Scenarios → **+ Create a new scenario** → search module **Webhooks → Custom webhook** → **Add** → name it (e.g. "Mega Pack Delivery") → copy the generated URL → paste it into Razorpay's webhook URL field from step (b.2).
   - Run the scenario once in "listen" mode and send one real test payment (see checklist below) so Make captures the payload structure — this lets you map fields with the point-and-click picker instead of typing paths blind.

2. **(Optional but recommended) Filter**
   - Add a filter on the webhook's output: `event` **Equal to** `payment.captured`, and `payload.payment.entity.amount` **Equal to** `29900` — this guards against any other event type or a stale/mistaken amount ever triggering delivery.

3. **Email → Send an email**
   - To: map `payload.payment.entity.email`
   - Subject: "Your 100,000+ AI Prompts are ready 🎉"
   - Body: include the `[DRIVE_PRO]` (full pack) and `[DRIVE_BONUSES]` (all 5 bonuses) Google Drive links — replace both placeholders with your real share links before going live.

4. Turn the scenario **ON** (top-right toggle) so it runs automatically, not just in listen/test mode.

**Field path reference** (also documented at the top of `thank-you.html`):
```
event                = payment.captured
buyer email          = payload.payment.entity.email
amount (in paise)    = payload.payment.entity.amount   → expect 29900 (₹299)
```

**Never trust a price sent by the browser.** The amount your Make filter checks against (29900) comes from Razorpay's own webhook payload — set server-side when you configured the Payment Page in step (a) — not from anything the page or buyer submitted. If you ever add a second product, give it its own Payment Page with its own fixed amount rather than accepting a client-supplied price.

---

## (d) Test-mode checklist

Do this **before** any paid traffic hits the page:

- [ ] Switch the Payment Page to **Test Mode** (or pay ₹1 on a temporary test page) and complete a checkout end-to-end.
- [ ] Confirm the browser redirects to `thank-you.html` after payment.
- [ ] Confirm `thank-you.html` shows the single download card and no reseller/upgrade content.
- [ ] Confirm the Razorpay webhook fired — check **Razorpay Dashboard → Webhooks → (your webhook) → Logs** for a `200 OK` delivery.
- [ ] Confirm the Make.com scenario run history shows a successful execution.
- [ ] Confirm the delivery email actually lands in the test buyer's inbox (check spam) within 2 minutes, with the correct Drive links.
- [ ] Click every Drive link in both the email and the thank-you page — confirm they open and are shared as "Anyone with the link → Viewer" (not restricted).
- [ ] Confirm the amount charged was exactly **₹299** (29900 paise) — check the Razorpay payment record, not just the page copy.
- [ ] Only after the test passes, switch the Payment Page from Test Mode to Live Mode and confirm `CFG.PRODUCT.url` in `script.js` points at the live link.

---

## Placeholders still to fill in before launch

- `script.js` → `CFG.PRODUCT.url` (your live ₹299 Razorpay Payment Page link)
- `script.js` → `CFG.SUPPORT_EMAIL`, `CFG.INSTAGRAM`, `CFG.YOUTUBE`
- `script.js` → `CFG.LAUNCH_WINDOW_MINUTES` (per-visitor countdown length, in minutes)
- `thank-you.html` → `DELIVERY` array: `[DRIVE_PRO]`, `[DRIVE_BONUSES]`
- `index.html` / `thank-you.html` → `<!-- META_PIXEL_CODE -->` (paste your Meta Pixel base code)
- `index.html` → `<!-- RAZORPAY_PAYMENT_PAGE -->` (marks where the checkout button lives)
- `index.html` footer → `[SUPPORT_EMAIL]`
- `index.html` testimonials → `[TESTIMONIAL_1..6]`, `[NAME_1..6]`, `[ROLE_1..6]`
