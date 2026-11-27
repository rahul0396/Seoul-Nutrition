# Seoul Nutrition backend

The store, the admin panel and the APIs all live in this one Next.js app.

| What | Where | Built with |
| --- | --- | --- |
| Storefront | `/` | Your existing pages, now reading live data |
| Admin panel | `/admin` | Payload CMS 3 |
| Checkout and payments | `/api/checkout`, `/api/checkout/verify`, `/api/razorpay/webhook` | Next.js route handlers + Razorpay |
| Forms | `/api/leads`, `/api/reviews`, `/api/coupons` | Next.js route handlers |
| Database | MongoDB Atlas | Payload MongoDB adapter |
| Product photos | Vercel Blob in production, `/media` locally | Payload uploads |

Without `DATABASE_URI` the site still runs on the starter data in `src/data`, and checkout replies "backend not connected". Your current deployment keeps working until you add the keys.

---

## 1. One-time setup (about 30 minutes)

### MongoDB Atlas (free)
1. Create a free **M0** cluster at mongodb.com/atlas. Mumbai (`ap-south-1`) is closest to your customers.
2. **Database Access**: add a user with a strong password.
3. **Network Access**: add `0.0.0.0/0`. Vercel has no fixed IP addresses, so this is needed. The password still protects the database.
4. **Connect > Drivers**: copy the connection string, put the password in, and add `/seoul` before the `?` so the database is called `seoul`.

### Environment variables
Copy `.env.example` to `.env` and fill it in. Generate the secret with `openssl rand -hex 32`.

### Run it locally
```bash
npm install
npm run seed      # copies the products, coupons and settings from src/data into the database
npm run dev       # http://localhost:3000 and http://localhost:3000/admin
```
Open `/admin` and create your account. **The first account becomes the admin.** Then go to **Team** and add your staff as "Staff".

`npm run seed` is safe to run again: it only adds what is missing. `npm run seed -- --force` overwrites products and coupons with the values in `src/data`, so don't use it once you edit products in the admin.

### Razorpay (test mode first)
1. Razorpay Dashboard > **Account & Settings > API Keys**: generate **test** keys and put them in `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET`.
2. **Account & Settings > Payment capture**: set it to **automatic**.
3. **Webhooks > Add new webhook**:
   - URL: `https://<your-domain>/api/razorpay/webhook`
   - Secret: any random string. Put the same value in `RAZORPAY_WEBHOOK_SECRET`.
   - Events: `payment.captured`, `payment.failed`, `order.paid`
4. Place a test order with Razorpay's test UPI ID or test cards. The order should go to **Paid** in `/admin` and its stock should drop.

The webhook only reaches a public URL. To test it on your laptop, use a Vercel preview deployment or a tunnel such as `ngrok http 3000`.

### Vercel
1. Add every variable from `.env.example` under **Project > Settings > Environment Variables**, for Production and Preview.
2. **Storage > Blob > Create** and connect it to the project. This sets `BLOB_READ_WRITE_TOKEN`. Without it, uploaded photos disappear on the next deploy.
3. Redeploy. The build reads the database to pre-render product pages, so `DATABASE_URI` has to be set for builds too.
4. Before taking real orders, move to Vercel **Pro**. Hobby is for non-commercial use. A small VPS running `npm run build && npm start` also works.

### Going live
- Switch to **live** Razorpay keys, add a live-mode webhook with the same URL and events, and redeploy.
- Add your FSSAI licence number and real policies (`src/data/site.ts` > `contentPages`).
- Place one real ₹1 test order, then refund it from the Razorpay dashboard.

---

## 2. Daily use (for you and your staff)

**Dashboard** (`/admin`): COD orders to confirm, orders ready to pack, packed-but-not-shipped, today's sales, and low-stock pack sizes. Click any tile to open that list.

**Order flow.** Change the **Status** field and click Save:

```
Online:  Awaiting payment → Paid ─────────────┐
COD:     COD: to confirm → COD: confirmed ────┼→ Packed → Shipped → Delivered
                                              └→ Cancelled / RTO / Refunded
```

- **Stock is automatic.** COD orders take stock when they are placed; online orders take it when payment succeeds. Setting an order to Cancelled, RTO or Refunded puts the stock back. Saving twice never counts it twice.
- **COD: to confirm**: call or WhatsApp the customer, then set it to *COD: confirmed*. If they don't answer, set it to *Cancelled*.
- **Shipped**: fill in courier, AWB and tracking link on the **Shipping** tab.
- **Refunds**: refund the money in the Razorpay dashboard, then set the order to *Refunded*.
- **Notes and history**: every status change is recorded with who made it and when.
- A red **"Stock problem"** box means payment arrived for something that had just sold out (or for a cancelled order). Restock or refund, then untick it.

**Products**: edit prices, MRP, stock, photos, copy and FAQs. Changes show on the site within seconds. "Draft" hides a product. The first photo is the main one; four photos fill the gallery (front, back, scoop, lifestyle).

**Coupons**: % or flat ₹ off, minimum order, start/end dates and a usage limit. Untick "List it in the cart" for secret codes you share privately.

**Store settings**: announcement bar, free-shipping threshold, shipping fee, prepaid discount, COD on/off and COD order limit, membership price and discount, and free-gift milestones.

**Reviews**: customer reviews arrive unapproved. Tick **Approved** to publish one. Update the product's rating numbers on its "Look and ratings" tab.

**Leads**: contact form, consultation requests, back-in-stock requests and newsletter sign-ups.

**Who can do what**

| | Admin | Staff |
| --- | --- | --- |
| Orders: change status, tracking, notes | ✓ | ✓ (cannot mark Paid or Refunded) |
| Products: stock, photos, copy | ✓ | ✓ |
| Products: price, MRP, title, pack sizes, publish/hide | ✓ | |
| Coupons, store settings, team | ✓ | |
| Delete anything | ✓ | |

---

## 3. How it fits together (for developers)

```
src/
  payload.config.ts            Payload setup: database, collections, uploads
  payload/
    collections/               Products, Orders, Customers, Coupons, Reviews, Leads, Media, Users
    globals/Settings.ts        Store settings screen
    hooks/orderLifecycle.ts    Order number + stock / coupon / membership on status changes
    hooks/revalidate.ts        Clears the storefront cache when data changes
    components/DashboardStats  The "Today at Seoul Nutrition" tiles
  lib/
    commerce.ts                THE data layer: the storefront reads only through this file
    catalog.tsx                Gives client components the catalogue (useCatalog)
    pricing.ts                 Cart maths, shared by browser and server
    server/checkout.ts         Server-side pricing, order creation, markPaid/markFailed
    server/razorpay.ts         Razorpay client and signature checks
  app/(frontend)/              Storefront pages + /api routes
  app/(payload)/               Admin panel (generated by Payload, don't edit)
scripts/seed.ts                Starter data import
```

**Rules that keep it safe and easy to change**
1. **The browser never sends prices.** It sends variant ids, quantities, the coupon code, the address and the payment method. `server/checkout.ts` prices everything from the database.
2. **The storefront only reads through `lib/commerce.ts`.** To move to another backend later, rewrite that file; the components stay the same.
3. **Side effects go in the order status hook.** To add WhatsApp messages, Shiprocket, invoices or emails, add code to `payload/hooks/orderLifecycle.ts` (or a new `afterChange` hook on Orders) keyed on the new status. Checkout doesn't change.
4. **Orders keep a snapshot** of title, pack, price and MRP, so changing a price later never changes old orders.
5. **Payments are confirmed exactly once.** The verify route and the webhook can arrive in any order or at the same time; an atomic claim on the payment id makes sure only one of them marks the order paid.
6. **Stock can't go below zero.** Every stock change is a conditional MongoDB update inside the order's transaction. If two people buy the last unit at the same moment, one gets "just sold out".

**After changing a collection's fields**
```bash
npm run generate:types      # refresh src/payload-types.ts
npm run generate:importmap  # only if you add custom admin components
```

**Next steps you can add later**
- WhatsApp order updates (Interakt, WATI, AiSensy): an `afterChange` hook on Orders that sends a message when the status changes.
- Shiprocket: on *Packed*, call Shiprocket's create-order API and save the AWB.
- Order emails: add Payload's email adapter (`@payloadcms/email-resend`) and send from the same hook.
- Customer login with OTP (MSG91): lets customers see their past orders on `/account`. Not needed for guest checkout.
- Clean up old *Awaiting payment* orders (they hold no stock) with a weekly scheduled job.

**Known limits**
- Guest checkout gives member prices to whoever enters a member's mobile number. Fine for now; add OTP login if it is abused.
- The rate limit on the forms and checkout is per server instance. Put Cloudflare or Upstash in front if you see spam.
