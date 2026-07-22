# Delivery Setup — 100,000+ AI Mega Prompts Pack

No backend, no database. Delivery runs on: **Razorpay Payment Pages → Webhook → Make.com → Email**, plus an immediate on-page download on `thank-you.html`. This doc is the step-by-step to wire that up. Claude cannot create these accounts/scenarios for you — follow this manually.

---

## (a) Create the 3 Razorpay Payment Pages

You need **3 separate Payment Pages** (or Payment Buttons), one per tier, because the amount is how the Make scenario later tells tiers apart.

1. Log in to the [Razorpay Dashboard](https://dashboard.razorpay.com/) → **Payment Pages** → **+ New Payment Page**.
2. Create three, with these exact amounts (amount fields must match `script.js` / this doc exactly):

   | Page name | Amount | Amount in paise |
   |---|---|---|
   | Mega Prompts — Starter | ₹199 | 19900 |
   | Mega Prompts — Pro | ₹499 | 49900 |
   | Mega Prompts — Reseller | ₹1,499 | 149900 |

3. For each page, under **Advanced Settings → Redirect URL after payment**, set:
   - Starter → `https://<your-domain>/mega-pack/thank-you.html?tier=starter`
   - Pro → `https://<your-domain>/mega-pack/thank-you.html?tier=pro`
   - Reseller → `https://<your-domain>/mega-pack/thank-you.html?tier=reseller`

   Razorpay appends its own payment ID param automatically — `thank-you.html` reads `pid` from the URL if present, so it's fine either way.
4. Make sure **"Collect email"** is turned ON for every page — the buyer's email is how the Make scenario knows where to send download links.
5. Copy each page's short link (or embed code) and drop it into `index.html` where you see:
   - `<!-- RAZORPAY_BUTTON_STARTER -->`
   - `<!-- RAZORPAY_BUTTON_PRO -->`
   - `<!-- RAZORPAY_BUTTON_RESELLER -->`

   (Currently those buttons call `payWithRazorpay('starter'|'pro'|'reseller')` in `script.js`, which opens Razorpay's Checkout.js modal directly using `CFG.RZP_KEY` and the tier's amount. If you'd rather link straight to a Payment Page instead of the modal, replace the `<button onclick="payWithRazorpay(...)">` with `<a href="https://rzp.io/l/your-page-link">` and keep the same visible button copy/price.)
6. Set your live key in `script.js` → `CFG.RZP_KEY`.

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

**Structure: Webhook → Router → 3 amount-filtered branches → Email module per branch.**

1. **Trigger — Custom Webhook**
   - Make.com → Scenarios → **+ Create a new scenario** → search module **Webhooks → Custom webhook** → **Add** → name it (e.g. "Mega Pack Delivery") → copy the generated URL → paste it into Razorpay's webhook URL field from step (b.2).
   - Run the scenario once in "listen" mode and send one real test payment (see checklist below) so Make captures the payload structure — this lets you map fields with the point-and-click picker instead of typing paths blind.

2. **Router**
   - Add a **Router** module right after the webhook trigger. Create 3 routes.

3. **Route 1 — Starter (₹199)**
   - Add a filter on the router branch:
     - `payload.payment.entity.amount` **Equal to** `19900`
   - Also filter `event` **Equal to** `payment.captured` (belt-and-braces, in case other events reach the same webhook later).
   - Add an **Email → Send an email** module:
     - To: map `payload.payment.entity.email`
     - Subject: "Your 10,000 AI Prompts are ready 🎉"
     - Body: include the `[DRIVE_STARTER]` Google Drive link (replace the placeholder with your real share link before sending).

4. **Route 2 — Pro (₹499)**
   - Filter: `payload.payment.entity.amount` **Equal to** `49900`, `event` = `payment.captured`.
   - Email module → To: `payload.payment.entity.email` → include `[DRIVE_PRO]` (full pack) and `[DRIVE_BONUSES]` (all 5 bonuses) links.

5. **Route 3 — Reseller (₹1,499)**
   - Filter: `payload.payment.entity.amount` **Equal to** `149900`, `event` = `payment.captured`.
   - Email module → To: `payload.payment.entity.email` → include `[DRIVE_PRO]`, `[DRIVE_BONUSES]`, and `[DRIVE_RESELLER]` (PLR/commercial resell rights document) links.

6. Turn the scenario **ON** (top-right toggle) so it runs automatically, not just in listen/test mode.

**Field path reference** (also documented at the top of `thank-you.html`):
```
event                = payment.captured
buyer email          = payload.payment.entity.email
amount (in paise)    = payload.payment.entity.amount
  → 19900  = ₹199  (Starter)
  → 49900  = ₹499  (Pro)
  → 149900 = ₹1,499 (Reseller)
```

---

## (d) Test-mode checklist

Do this **before** any paid traffic hits the page:

- [ ] Switch Razorpay to **Test Mode** (or create one real ₹1 live Payment Page temporarily) and complete a checkout end-to-end.
- [ ] Confirm the browser redirects to `thank-you.html?tier=<correct tier>` after payment — check the tier in the URL matches the amount you paid.
- [ ] Confirm `thank-you.html` shows **only that tier's** download cards (Starter shows 1 card, Pro shows 3, Reseller shows 4) and the Reseller upgrade card appears for Starter/Pro but not Reseller.
- [ ] Confirm the Razorpay webhook fired — check **Razorpay Dashboard → Webhooks → (your webhook) → Logs** for a `200 OK` delivery.
- [ ] Confirm the Make.com scenario run history shows a successful execution, routed to the correct branch (check the amount matched the tier you paid for).
- [ ] Confirm the delivery email actually lands in the test buyer's inbox (check spam) within 2 minutes, with the correct Drive links for that tier.
- [ ] Click every Drive link in both the email and the thank-you page — confirm they open and are shared as "Anyone with the link → Viewer" (not restricted).
- [ ] Repeat the above for **all 3 tiers** — a passing Starter test does not guarantee Pro/Reseller are wired correctly, since each is a separate branch and separate amount filter.
- [ ] Only after all 3 tiers pass, switch Razorpay back to Live Mode and update `CFG.RZP_KEY` in `script.js` to the live key.

---

## Placeholders still to fill in before launch

- `script.js` → `CFG.RZP_KEY`
- `script.js` → `CFG.SUPPORT_EMAIL`, `CFG.INSTAGRAM`, `CFG.YOUTUBE`
- `script.js` → `CFG.LAUNCH_DEADLINE_ISO` (set to your real launch-price end date)
- `thank-you.html` → `DELIVERY` object: `[DRIVE_STARTER]`, `[DRIVE_PRO]`, `[DRIVE_BONUSES]`, `[DRIVE_RESELLER]`
- `index.html` / `thank-you.html` → `<!-- META_PIXEL_CODE -->` (paste your Meta Pixel base code)
- `index.html` → `<!-- RAZORPAY_BUTTON_STARTER/PRO/RESELLER -->` (Payment Page links, if not using the built-in Checkout.js modal)
- `index.html` footer → `[SUPPORT_EMAIL]`
- `index.html` testimonials → `[TESTIMONIAL_1..6]`, `[NAME_1..6]`, `[ROLE_1..6]`
