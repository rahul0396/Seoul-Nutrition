# Seoul Nutrition storefront

A full D2C supplement storefront in Next.js 16 (App Router), React 19, TypeScript and Tailwind CSS 4. Its structure, pages and interactions are rebuilt from wellbeingnutrition.com. All code, copy and artwork are new placeholders for Seoul Nutrition.

## Run it

```bash
npm install
npm run dev          # http://localhost:3000
npm run build        # production build
npm run contrast     # WCAG contrast check on the design tokens
STATIC_EXPORT=1 npm run build   # static site in out/ (no server needed)
```

## What's in it

| Page | Route | Features |
| --- | --- | --- |
| Home | `/` | announcement bar (rotating, pausable), mega menu, hero slideshow with sale countdown, trending chips, category tiles, video-review carousel with quick view, health-need tabs, promise marquee, science banner, story block, experts, testimonials |
| Collection | `/collections/[handle]` | 20 collections (categories + benefits), type chips with counts, filter drawer (availability, price), 5 sorts, empty state, SEO blocks (comparison table, benefit cards, FAQ, popular searches) |
| Product | `/products/[handle]` | gallery + thumbnails + lightbox, pack-size cards with savings, member price, stock warning, qty, add to cart / buy now, notify me (out of stock), wishlist, trust badges, highlights, sticky section tabs with scroll-spy, ingredients, how to take, FAQ, lab reports, rating histogram, reviews, write a review, related products, mobile sticky add-to-cart |
| Cart drawer | everywhere | free-gift milestones, free shipping progress, qty and remove, membership upsell, coupon field + available coupons with eligibility, recommendations, billing breakdown, total savings |
| Checkout | `/checkout` | address form with validation, online vs COD (COD blocked for membership), prepaid discount, order summary, demo success |
| Search | `/search?q=` + header panel | live results, trending, no-results fallback |
| Account | `/account` | phone + OTP login (demo OTP `123456`), order history empty state, membership card |
| Wishlist | `/pages/wishlist` | saved products |
| Membership | `/pages/membership-access` | hero, benefits, plan card, member vs regular table, how it works, FAQ |
| Consultation, Contact | `/pages/consultancy`, `/pages/contact-us` | validated lead forms |
| Journal | `/blogs/journal`, `/blogs/journal/[slug]` | article list + article with shop-the-article |
| Content + policies | `/pages/[slug]` | our story, science, promise, ingredients, press, careers, privacy, terms, shipping, refunds, referral |
| Popups | everywhere | 10%-off signup popup (after 12s, once), notify-me modal, toasts |

## Where to change things

- **Brand, contact, announcements, hero slides, coupons, milestones, membership, shipping rules, nav, footer, content pages:** `src/data/site.ts`
- **Products, prices, pack sizes, stock, copy:** `src/data/products.ts`
- **Collections and their SEO content:** `src/data/collections.ts`
- **Colours, fonts, radius, shadows, motion:** `src/app/globals.css` (`@theme` block). Keep the names and change the values, then run `npm run contrast`.
- **Product images:** `src/components/PackArt.tsx` draws placeholder pouches. Put your photos in `public/products/` and render them there instead.
- **Video reels:** the quick view in `src/components/home.tsx` (`QuickView`) has a video placeholder.
- **Placeholder text:** search the code for "Placeholder".

## Not connected yet (backend step)

The cart, wishlist and login are stored in the browser (localStorage) for now. To go live, connect:

- products and orders to a database, plus an admin dashboard to manage them
- phone OTP login (for example MSG91 or Firebase)
- payments (Razorpay) with server-side signature verification
- back-in-stock alerts, reviews, newsletter and lead forms
- your shipping and tracking provider

`replica/` holds the planning files: recon map, feature matrix, design tokens and component specs.
