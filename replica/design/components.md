# Components: Seoul Nutrition storefront

All components use tokens (CSS variables in src/app/globals.css). No raw hex in components.

Button
  variants  primary (ink), accent, outline, ghost, link
  sizes     sm 36px, md 44px, lg 52px
  states    default, hover (lift 1px), active, focus-visible (2px ring accent), disabled, loading (spinner, label kept), added (check)
  a11y      real <button>, aria-busy while loading
  used on   all

AnnouncementBar
  rotating messages every 4s, pause/play button (aria-pressed), link per message
  used on   S01

MegaMenu
  4 groups: Shop all, By benefit, By category, World of Seoul. Opens on hover and on focus/click, Esc closes
  used on   S01

MobileNav
  left drawer, nested accordions, focus trapped, Esc closes
  used on   S01

ProductCard
  label line (flavour), image with badges, review count, title (2 line clamp), pack pills, price block, member price + JOIN, Add to cart (loading -> added), Notify me when out of stock, wishlist heart
  states    in stock, out of stock, added, on sale
  used on   S02, S03, S06, S08

PackPills
  radio group, selected = ink border + surface fill, out of stock = struck label
  used on   S03, S04

PriceBlock
  sale price (lg/800), MRP struck (muted), % off (accent), optional member line (member colour)
  used on   S03, S04, S05

Slideshow
  autoplay 5s, dots + prev/next, pause on hover and via button, prefers-reduced-motion disables autoplay
  used on   S02

Countdown
  d/h/m/s boxes, ends -> "Sale ended"
  used on   S02

Tabs (pill)
  role=tablist, arrow keys move
  used on   S02

AnchorTabs
  sticky bar on PDP, scroll-spy highlight
  used on   S04

Accordion
  details/summary based, plus/minus icon rotates
  used on   S03, S04, S09

Drawer
  side panel right (cart, filter) or left (nav), overlay click and Esc close, body scroll locked
  used on   S01, S03, S05

Modal
  centred dialog, Esc close, focus first input
  variants  notify-me, signup popup, lightbox, quick view
  used on   S15, S04

QtyStepper
  min 1, max stock, buttons with aria-labels
  used on   S04, S05

Milestone
  progress bar by item count, tier labels, unlocked state with check
  used on   S05

CouponList
  available coupons as tickets, Apply, applied shows saving, ineligible shows reason
  used on   S05

Stars / RatingHistogram
  5 stars with partial fill, bars per level
  used on   S04

Toast
  bottom centre, auto-hide 2.5s, role=status
  used on   all

Reveal (motion)
  fade + translate up when scrolled into view, disabled under prefers-reduced-motion
  used on   section wrappers
