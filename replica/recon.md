# Recon map: wellbeingnutrition.com (web, responsive)

Scope: the full D2C storefront: home, collections, product page, cart drawer, search, account, wishlist, membership, content and policy pages. Checkout itself is Shopify-hosted on the original, and the clone stubs it until the backend is chosen.
For: Seoul Nutrition (whey protein brand). Rahul will replace all imagery, copy and links, then change features.
Date: 2026-10-30

## Sources

| # | source | URL | notes |
| --- | --- | --- | --- |
| 1 | homepage | https://wellbeingnutrition.com/ | nav, section order, footer, overlays |
| 2 | collection | https://wellbeingnutrition.com/collections/whey-protein | filters, sort, card anatomy, SEO blocks |
| 3 | product page | https://wellbeingnutrition.com/products/whey-protein-powder-kesar-pista-badam | PDP anatomy |
| 4 | membership | https://wellbeingnutrition.com/pages/membership-access | plan, benefits, FAQ |

Platform evidence: Shopify (CDN paths, wallet meta tags, Buy It Now). Clickpost for tracking. Third-party AI chat, FAQ and review widgets.

## Core loop

Shopper finds a product by benefit or category, picks a pack size, adds it to the cart drawer, unlocks a coupon or free gift, and checks out. Membership (₹149 for 3 months) gives a member price on everything.

## Screens

| ID | screen | route | purpose | key components | states seen |
| --- | --- | --- | --- | --- | --- |
| S01 | Global header | all | navigation | announcement bar (rotating, pausable), logo, mega menu (4 groups), search, account, wishlist, cart count, mobile drawer | desktop, mobile |
| S02 | Home | / | merchandising | hero slideshow + sale countdown, trending chips, category tiles (12), video-review carousel with quick view, health-need tabbed grid (10 tabs), promise icons (6), science banner, image+text block, expert cards (8), testimonials (5) | filled |
| S03 | Collection | /collections/[handle] | browse | banner + H1 + intro, breadcrumbs, filter drawer (availability, tag tiles with counts, price), sort (5), product grid, SEO blocks: comparison tables, benefits, usage, who-for, FAQ, popular searches | filled, filtered, empty filter result |
| S04 | Product page | /products/[handle] | convert | breadcrumbs, gallery + thumbnails + lightbox, title, subtitle, rating summary + histogram, price/MRP/% off, member price + JOIN, pack-size options with savings, stock count, qty stepper, Add to cart, Buy now, trust badges (4), benefit claims (6), anchor tabs (Description, Ingredients, How to take, FAQ, Lab reports), additional info spec list, study cards, reviews + write review | in stock, out of stock (notify me), loading CTA |
| S05 | Cart drawer | overlay | checkout prep | line items with qty, milestone progress (free gifts), coupon field + available coupons, billing summary + price breakup, recommendations, checkout | empty, filled, coupon applied, coupon error |
| S06 | Search | /search + overlay | find | input, trending chips, live results, results page | empty query, results, no results |
| S07 | Account | /account | identity | login/sign up (phone OTP or email on original), order history, logout | logged out, logged in, no orders |
| S08 | Wishlist | /pages/wishlist | save for later | product grid | empty, filled |
| S09 | Membership | /pages/membership-access | upsell | hero, benefits (4), plan card, member vs non-member table, how it works (3), FAQ (9), support | filled |
| S10 | Consultation | /pages/consultancy | lead gen | expert info, booking form | filled, submitted |
| S11 | Blog listing + article | /blogs/... | SEO content | article cards, article page | filled |
| S12 | Content pages | /pages/our-story etc. | brand | rich text, image+text | filled |
| S13 | Policy pages | /pages/privacy-policy etc. | legal | rich text | filled |
| S14 | Contact | /pages/contact-us | support | form, email, phone | filled, submitted |
| S15 | Overlays | all | engagement | notify-me modal (email+phone), "Get 10% OFF" signup popup, added-to-cart toast, product quick view | open, submitted |
| S16 | Footer | all | links | category + benefit lists, about, quick links, newsletter, app badges, socials | desktop, mobile accordion |

## Flows

```
F01 Shopper buys from a category
    S02 category tile -> S03 collection -> S04 product -> pick pack -> add to cart -> S05 drawer -> checkout
    happy path clicks: 5
    edge: out of stock pack, qty above stock, coupon invalid, milestone just missed

F02 Shopper buys from a health need
    S02 tab (e.g. Sleep) -> card Add to cart -> S05 drawer -> checkout
    happy path clicks: 3

F03 Shopper searches
    S01 search -> type "whey" -> result -> S04
    edge: no results, typo

F04 Shopper joins membership
    S04 JOIN or S09 -> add membership to cart -> S05 -> member prices shown
    edge: membership already in cart, COD not allowed for membership

F05 Shopper asks to be notified
    S04/S03 out-of-stock -> Notify me -> email/phone -> confirmation
    edge: invalid phone, already subscribed

F06 Shopper saves to wishlist
    S03/S04 heart -> S08
    edge: logged out (local only)

F07 Shopper applies a coupon
    S05 available coupons -> apply -> savings shown
    edge: below minimum order, expired, already applied

F08 Returning shopper checks orders
    S07 login -> order history -> track (external tracking link)
```

## Components

| component | variants | states | used on |
| --- | --- | --- | --- |
| Button | primary, secondary, outline, ghost, link | default, hover, focus, disabled, loading, added | all |
| Announcement bar | rotating messages | playing, paused | S01 |
| Mega menu | 4 groups with columns | open, closed | S01 |
| Mobile drawer | nested accordion | open, closed | S01 |
| Product card | standard, compact | in stock, out of stock, added, on sale | S02, S03, S08, S06 |
| Pack pill | — | selected, unselected, out of stock | S03, S04 |
| Price block | sale, mrp, % off, member | — | S03, S04, S05 |
| Badge | sale, new, highly reordered, value deal | — | S03, S04 |
| Slideshow | hero, carousel | autoplay, paused | S02 |
| Countdown | — | running, ended | S02 |
| Tabs | pill tabs, anchor tabs | active | S02, S04 |
| Accordion | FAQ | open, closed | S03, S04, S09 |
| Drawer | cart, filter, mobile nav | open, closed | S01, S03, S05 |
| Modal | notify me, signup popup, lightbox, quick view | open, submitted | S15, S04 |
| Qty stepper | — | min, max | S04, S05 |
| Progress milestone | — | locked, unlocked | S05 |
| Coupon list | — | available, applied, ineligible | S05 |
| Rating | stars, histogram | — | S04 |
| Toast | success, error | — | all |
| Form inputs | text, email, phone, select, textarea, checkbox | default, focus, error, disabled | S07, S10, S14, S15 |

## Inferred data model

```
Product     id, handle, title, subtitle, category, tags[], benefits[], badges[],
            images[], rating, reviewCount, variants[], description, ingredients[],
            howToTake, faqs[], labReports[], specs{}
            evidence: S03 cards, S04     confidence: high
Variant     id, productId, label (Pack of 1 / 1KG), price, mrp, stock
            evidence: S04 pack options, "Only N left"   confidence: high
Collection  handle, title, intro, banner, productIds | rule, seoBlocks, faqs
            evidence: S03                confidence: high
Cart        lines[{variantId, qty}], couponCode, membership:boolean
            evidence: S05                confidence: high
Coupon      code, type (percent|flat), value, minSubtotal, description
            evidence: S05 "WBN20"        confidence: medium
Milestone   threshold (items or amount), reward
            evidence: S05 "Add 2 more products"   confidence: medium (item-count based)
Customer    id, phone, email, name, isMember, memberUntil, addresses[]
            evidence: S07, S09           confidence: medium
Order       id, customerId, lines, totals, status, trackingUrl
            evidence: S07 order history, Clickpost   confidence: medium
Review      productId, rating, title, body, author, date
            evidence: S04                confidence: high
StockAlert  variantId, email, phone      evidence: S15   confidence: high
```

Relationships: Product 1-n Variant, Collection n-n Product, Cart 1-n Line, Customer 1-n Order, Product 1-n Review.

## Feature matrix

See `features.csv`. Must: 24, should: 14, could: 8, skip: 6.

## Out of scope (cannot or should not be cloned)

- Their product photos, videos, lab reports, expert photos, testimonials and all copy (replace with Seoul Nutrition's own)
- Disney and Marvel licensed kids lines (licensed characters)
- Their customer reviews and ratings (yours start from zero)
- Their name, logo and brand colours
- Their AI chat vendor, Clickpost account and Shopify checkout (use your own providers)
- Their mobile apps

## Size

Screens 16, flows 8, entities 10. Hard parts: checkout and payments (Razorpay or Shopify), coupon and milestone rules, membership pricing across the site, the admin dashboard for products and orders (not visible on the original, to be designed fresh). Storefront front end: M (a few weeks). With backend and admin: L.
