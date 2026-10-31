import type { Coupon, Review } from "./types";

// Everything brand-specific lives here. Change it once, it changes everywhere.

export const site = {
  name: "Seoul Nutrition",
  short: "SEOUL",
  tagline: "Clean protein, honestly made",
  email: "care@seoulnutrition.in",
  phone: "+91 90000 00000",
  hours: "Mon to Sat, 10 am to 7 pm",
  trackingUrl: "#track", // your logistics provider's tracking page
  socials: [
    { name: "Instagram", href: "#" },
    { name: "Facebook", href: "#" },
    { name: "YouTube", href: "#" },
    { name: "X", href: "#" },
    { name: "LinkedIn", href: "#" },
  ],
};

export const announcements = [
  { text: "Festive Sale is live: flat 15% off + extra 5% on prepaid orders", href: "/collections/shop-all" },
  { text: "Free shipping on orders above ₹499", href: "/pages/orders-shipping" },
  { text: "Members save up to 20% on every order", href: "/pages/membership-access" },
];

// Countdown target for the hero sale timer. Set to your sale's end.
export const saleEndsAt = "2026-11-15T23:59:59+05:30";

export const heroSlides = [
  { eyebrow: "Festive Sale", title: "Flat 15% off on all whey", body: "Plus an extra 5% when you pay online.", cta: "Shop now", href: "/collections/whey-protein", from: "#c1272d", to: "#6e0f13", countdown: true },
  { eyebrow: "New launch", title: "Kesar Pista whey is here", body: "25 g protein with real saffron and pistachio.", cta: "Try it", href: "/products/whey-blend-kesar-pista", from: "#c98a1b", to: "#6b4708", countdown: false },
  { eyebrow: "Membership", title: "Save up to 20%, always", body: "Join for ₹149 and get member prices on everything.", cta: "Join now", href: "/pages/membership-access", from: "#1f5c4a", to: "#0b2a21", countdown: false },
];

export const trending = ["Whey isolate", "Creatine", "Magnesium", "Collagen", "Electrolytes", "Sleep"];

export const healthTabs = [
  { key: "best", label: "Best sellers" },
  { key: "sports-performance", label: "Performance" },
  { key: "weight-management", label: "Weight" },
  { key: "gut-health", label: "Gut" },
  { key: "sleep-stress", label: "Sleep and stress" },
  { key: "immunity", label: "Immunity" },
  { key: "skin-hair", label: "Skin and hair" },
  { key: "energy", label: "Energy" },
];

export const promises = [
  { icon: "ScanSearch", title: "Traceable ingredients" },
  { icon: "FlaskConical", title: "Lab tested every batch" },
  { icon: "Leaf", title: "Vegetarian options" },
  { icon: "CandyOff", title: "No added sugar" },
  { icon: "Wheat", title: "Non-GMO" },
  { icon: "ShieldCheck", title: "No amino spiking" },
];

export const trustBadges = [
  { icon: "BadgeCheck", title: "GMP certified facility" },
  { icon: "FileCheck2", title: "FSSAI licensed" },
  { icon: "FlaskConical", title: "Protein content tested" },
  { icon: "ShieldCheck", title: "Amino spiking tested" },
];

export const experts = [
  { name: "Dr. Expert Name", role: "Sports nutritionist", place: "Seoul, Korea" },
  { name: "Expert Name", role: "Strength coach", place: "Jaipur, India" },
  { name: "Expert Name", role: "Clinical dietitian", place: "Mumbai, India" },
  { name: "Expert Name", role: "Food scientist", place: "Bengaluru, India" },
];

// Placeholder testimonials. Replace with real customers who gave permission.
export const testimonials = [
  { name: "Customer name", city: "Jaipur", text: "Placeholder: a real customer's words about the product go here, with their permission.", product: "Whey Isolate, Double Chocolate" },
  { name: "Customer name", city: "Delhi", text: "Placeholder: a second real testimonial. Keep it short and specific.", product: "Creatine Monohydrate" },
  { name: "Customer name", city: "Pune", text: "Placeholder: a third real testimonial about results or taste.", product: "Magnesium Glycinate" },
  { name: "Customer name", city: "Indore", text: "Placeholder: a fourth testimonial. Real names build trust.", product: "Whey Blend, Kesar Pista" },
];

export const coupons: Coupon[] = [
  { code: "SEOUL10", kind: "percent", value: 10, minSubtotal: 0, description: "10% off your first order" },
  { code: "PROTEIN20", kind: "percent", value: 20, minSubtotal: 3999, description: "20% off on orders above ₹3,999" },
  { code: "FLAT300", kind: "flat", value: 300, minSubtotal: 2499, description: "₹300 off on orders above ₹2,499" },
];

// Free-gift milestones by number of items in the cart.
export const milestones = [
  { items: 2, reward: "Free shaker bottle" },
  { items: 3, reward: "Free 10-sachet electrolyte pack" },
];

export const membership = {
  price: 149,
  mrp: 299,
  months: 3,
  discount: 15, // member % off on top of sale price
  benefits: [
    { icon: "Percent", title: "Up to 20% off", body: "Member prices on every order, all year." },
    { icon: "Gift", title: "Free gifts", body: "A member-only gift with your next order." },
    { icon: "Rocket", title: "Early access", body: "Shop new launches and sales before everyone else." },
    { icon: "Ticket", title: "Member-only deals", body: "Exclusive offers just for members." },
  ],
  faqs: [
    { q: "When do my benefits start?", a: "Right after your membership order is confirmed." },
    { q: "Do member prices work during sales?", a: "Yes. You get the member discount on top of most sale prices." },
    { q: "Does it renew automatically?", a: "No. We remind you before it ends and you choose whether to renew." },
    { q: "Can I return the membership?", a: "Membership fees are non-refundable once benefits have started." },
    { q: "Can I pay cash on delivery?", a: "Membership needs online payment. Products can still be COD." },
  ],
};

export const shipping = { freeAbove: 499, fee: 49, prepaidExtra: 5 };

// Placeholder reviews so the review UI has something to show.
export const reviews: Review[] = [
  { productHandle: "*", rating: 5, title: "Placeholder review title", body: "Placeholder review text. Real reviews from your customers will appear here once the review backend is connected.", author: "Customer A.", date: "2026-10-12" },
  { productHandle: "*", rating: 4, title: "Placeholder review title", body: "A second placeholder review. Keep reviews unedited and show the negative ones too.", author: "Customer B.", date: "2026-10-02" },
  { productHandle: "*", rating: 5, title: "Placeholder review title", body: "A third placeholder review to fill the layout.", author: "Customer C.", date: "2026-09-21" },
];

export const blogPosts = [
  { slug: "how-much-protein-do-you-need", title: "How much protein do you actually need?", excerpt: "A simple way to work out your daily protein, without the gym myths.", date: "2026-10-20", minutes: 5, tag: "Protein" },
  { slug: "isolate-vs-concentrate", title: "Whey isolate vs concentrate: which one is for you?", excerpt: "What the label differences mean for your stomach and your wallet.", date: "2026-10-08", minutes: 4, tag: "Protein" },
  { slug: "creatine-beginners-guide", title: "Creatine for beginners", excerpt: "How much to take, when to take it, and what to expect.", date: "2026-09-25", minutes: 6, tag: "Performance" },
  { slug: "sleep-and-recovery", title: "Why sleep is your best recovery tool", excerpt: "Small habits that improve sleep and gains together.", date: "2026-09-12", minutes: 4, tag: "Sleep" },
];

export const contentPages: Record<string, { title: string; group: "about" | "policy"; body: string[] }> = {
  "our-story": { title: "Our Story", group: "about", body: ["Placeholder: tell the Seoul Nutrition story here. Who started it, why, and what you stand for.", "Keep it honest and specific. People buy from founders they believe."] },
  "our-science": { title: "Our Science", group: "about", body: ["Placeholder: explain how you formulate, which studies you rely on, and how you test."] },
  "our-promise": { title: "Our Promise", group: "about", body: ["Placeholder: list the promises you make on every product: tested, traceable, no added sugar."] },
  "ingredients": { title: "Traceable Ingredients", group: "about", body: ["Placeholder: where your whey comes from and how you check each batch."] },
  "press": { title: "Press", group: "about", body: ["Placeholder: press mentions go here."] },
  "careers": { title: "Careers", group: "about", body: ["Placeholder: open roles and how to apply."] },
  "privacy-policy": { title: "Privacy Policy", group: "policy", body: ["Placeholder: your privacy policy. List every service that processes customer data (payments, shipping, email, analytics). Have a lawyer review it."] },
  "terms-and-conditions": { title: "Terms and Conditions", group: "policy", body: ["Placeholder: your terms of sale and use."] },
  "orders-shipping": { title: "Orders and Shipping", group: "policy", body: ["Placeholder: dispatch times, delivery areas, free-shipping threshold and COD rules."] },
  "refunds-cancellation": { title: "Refunds and Cancellation", group: "policy", body: ["Placeholder: how cancellations, returns and refunds work."] },
  "referral-policy": { title: "Referral Program", group: "policy", body: ["Placeholder: how referrals and rewards work."] },
};

export const nav = {
  benefits: [
    "sports-performance", "weight-management", "gut-health", "sleep-stress", "immunity", "skin-hair", "energy", "bone-joint",
  ],
  categories: [
    { title: "Protein", links: ["whey-protein", "whey-protein-isolate", "whey-protein-concentrate", "plant-protein"] },
    { title: "Performance", links: ["creatine", "electrolytes"] },
    { title: "Wellness", links: ["collagen", "vitamins-minerals"] },
    { title: "Gear", links: ["accessories"] },
  ],
  world: [
    { label: "Our Story", href: "/pages/our-story" },
    { label: "Our Science", href: "/pages/our-science" },
    { label: "Traceable Ingredients", href: "/pages/ingredients" },
    { label: "Journal", href: "/blogs/journal" },
  ],
  extra: [
    { label: "Free Consultation", href: "/pages/consultancy" },
    { label: "Membership", href: "/pages/membership-access" },
    { label: "Journal", href: "/blogs/journal" },
  ],
};
