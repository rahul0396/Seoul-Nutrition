# Seoul Nutrition storefront

A full D2C supplement storefront in Next.js 16 (App Router), React 19, TypeScript and Tailwind CSS 4. Its structure, pages and interactions are rebuilt from wellbeingnutrition.com. All code, copy and artwork are new placeholders for Seoul Nutrition.

## Run it

```bash
npm install
cp .env.example .env   # add your MongoDB, Payload and Razorpay keys
npm run seed           # load the starter products into the database
npm run dev            # store: http://localhost:3000 · admin: http://localhost:3000/admin
npm run build          # production build
npm run contrast       # WCAG contrast check on the design tokens
```

Without a `.env` the store still runs on the starter data in `src/data` (checkout is switched off). **Setup, daily use and how the backend works: see [BACKEND.md](BACKEND.md).**

## What's in it

| Page | Route | Features |
| --- | --- | --- |
| Home | `/` | announcement bar (rotating, pausable), mega menu, hero slideshow with sale countdown, trending chips, category tiles, video-review carousel with quick view, health-need tabs, promise marquee, science banner, story block, experts, testimonials |
| Collection | `/collections/[handle]` | 20 collections (categories + benefits), type chips with counts, filter drawer (availability, price), 5 sorts, empty state, SEO blocks (comparison table, benefit cards, FAQ, popular searches) |
| Product | `/products/[handle]` | gallery + thumbnails + lightbox, pack-size cards with savings, member price, stock warning, qty, add to cart / buy now, notify me (out of stock), wishlist, trust badges, highlights, sticky section tabs with scroll-spy, ingredients, how to take, FAQ, lab reports, rating histogram, reviews, write a review, related products, mobile sticky add-to-cart |
| Cart drawer | everywhere | free-gift milestones, free shipping progress, qty and remove, membership upsell, coupon field + available coupons with eligibility, recommendations, billing breakdown, total savings |
| Checkout | `/checkout` | address form with validation, Razorpay (UPI, cards, netbanking) or COD, prepaid discount, server-side pricing and stock checks, order confirmation |
| Search | `/search?q=` + header panel | live results, trending, no-results fallback |
| Account | `/account` | phone + OTP login (demo OTP `123456`), order history empty state, membership card |
| Wishlist | `/pages/wishlist` | saved products |
| Membership | `/pages/membership-access` | hero, benefits, plan card, member vs regular table, how it works, FAQ |
| Consultation, Contact | `/pages/consultancy`, `/pages/contact-us` | validated lead forms |
| Journal | `/blogs/journal`, `/blogs/journal/[slug]` | article list + article with shop-the-article |
| Content + policies | `/pages/[slug]` | our story, science, promise, ingredients, press, careers, privacy, terms, shipping, refunds, referral |
| Popups | everywhere | 10%-off signup popup (after 12s, once), notify-me modal, toasts |

## Where to change things

- **Products, prices, stock, coupons, announcements, shipping, COD and membership rules:** in `/admin` once the database is connected (the files in `src/data` are the starter data)
- **Brand, contact, hero slides, nav, footer, content pages:** `src/data/site.ts`
- **Collections and their SEO content:** `src/data/collections.ts`
- **Colours, fonts, radius, shadows, motion:** `src/app/globals.css` (`@theme` block). Keep the names and change the values, then run `npm run contrast`.
- **Product images:** upload them on the product in `/admin`. Until then `src/components/PackArt.tsx` draws placeholder pouches.
- **Video reels:** the quick view in `src/components/home.tsx` (`QuickView`) has a video placeholder.
- **Placeholder text:** search the code for "Placeholder".

## Backend

Products, orders, customers, coupons, reviews, leads and store settings are managed in the admin panel at `/admin` (Payload CMS + MongoDB). Checkout prices the cart on the server, supports Razorpay and cash on delivery, and keeps stock in step with each order's status. Full guide: [BACKEND.md](BACKEND.md).
