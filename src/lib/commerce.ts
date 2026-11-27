import { unstable_cache } from "next/cache";
import { getPayload, type Payload } from "payload";
import config from "@payload-config";
import type { Catalog, CommerceSettings, Coupon, Product, Review } from "@/data/types";
import { products as staticProducts } from "@/data/products";
import { coupons as staticCoupons, defaultSettings, reviews as staticReviews } from "@/data/site";
import type { Coupon as CouponDoc, Media, Product as ProductDoc, Review as ReviewDoc, Setting } from "@/payload-types";
import { CATALOG_TAG } from "@/payload/hooks/revalidate";

// The ONLY file the storefront uses to read store data. Pages and components
// never talk to Payload directly, so the backend can change later (another
// database, Shopify, Medusa...) by rewriting this file alone.
//
// Without DATABASE_URI the site runs on the starter data in src/data, which
// keeps local previews and the current deployment working.

export const hasDatabase = () => !!process.env.DATABASE_URI && !!process.env.PAYLOAD_SECRET;

export const getPayloadClient = (): Promise<Payload> => getPayload({ config });

const mediaUrl = (m: unknown, size?: "card" | "large") => {
  if (!m || typeof m !== "object") return undefined;
  const doc = m as Media;
  return (size && doc.sizes?.[size]?.url) || doc.url || undefined;
};

export function toProduct(d: ProductDoc): Product {
  return {
    id: d.id,
    handle: d.handle ?? d.id,
    title: d.title,
    subtitle: d.subtitle ?? "",
    label: d.label ?? "",
    categories: (d.categories as string[] | null) ?? [],
    benefits: (d.benefits as string[] | null) ?? [],
    badges: d.badges ?? [],
    art: { from: d.art?.from ?? "#ebe7e0", to: d.art?.to ?? "#d8d1c6", ink: d.art?.ink ?? "#16140f" },
    rating: d.ratings?.average ?? 0,
    reviewCount: d.ratings?.count ?? 0,
    ratingSplit: ([0, 1, 2, 3, 4].map((i) => d.ratings?.split?.[i] ?? 0) as Product["ratingSplit"]),
    variants: (d.variants ?? []).map((v) => ({ id: v.id!, label: v.label, price: v.price, mrp: v.mrp, stock: v.stock ?? 0, sku: v.sku ?? undefined })),
    description: (d.description ?? "").split(/\n\s*\n/).map((s) => s.trim()).filter(Boolean),
    highlights: d.highlights ?? [],
    ingredients: (d.ingredients ?? []).map((i) => ({ name: i.name, note: i.note ?? "" })),
    howToTake: d.howToTake ?? "",
    faqs: (d.faqs ?? []).map((f) => ({ q: f.q, a: f.a })),
    labReports: (d.labReports ?? []).map((r) => ({ title: r.title, url: mediaUrl(r.file) })),
    specs: Object.fromEntries((d.specs ?? []).map((s) => [s.key, s.value])),
    rank: d.rank ?? 50,
    isNew: !!d.newLaunch,
    images: (d.images ?? []).map((m) => ({ url: mediaUrl(m, "large") ?? "", alt: (m as Media)?.alt ?? d.title })).filter((i) => i.url),
  };
}

export function toCoupon(c: CouponDoc): Coupon {
  return { code: c.code, kind: c.kind, value: c.value, minSubtotal: c.minSubtotal ?? 0, description: c.description };
}

export function toSettings(s: Partial<Setting> | null | undefined): CommerceSettings {
  const d = defaultSettings;
  return {
    announcements: s?.announcements?.length ? s.announcements.map((a) => ({ text: a.text, href: a.href ?? "/" })) : d.announcements,
    shipping: { freeAbove: s?.shipping?.freeAbove ?? d.shipping.freeAbove, fee: s?.shipping?.fee ?? d.shipping.fee, prepaidExtra: s?.shipping?.prepaidExtra ?? d.shipping.prepaidExtra },
    cod: { enabled: s?.cod?.enabled ?? d.cod.enabled, maxOrderValue: s?.cod?.maxOrderValue ?? d.cod.maxOrderValue },
    membership: {
      price: s?.membership?.price ?? d.membership.price,
      mrp: s?.membership?.mrp ?? d.membership.mrp,
      months: s?.membership?.months ?? d.membership.months,
      discount: s?.membership?.discount ?? d.membership.discount,
    },
    milestones: s?.milestones?.length ? s.milestones.map((m) => ({ items: m.items, reward: m.reward })) : d.milestones,
  };
}

const now = () => new Date().toISOString();

// Coupons a customer may use right now (active, in date, under the usage limit).
export function couponIsUsable(c: CouponDoc, at = new Date()) {
  if (!c.active) return false;
  if (c.startsAt && new Date(c.startsAt) > at) return false;
  if (c.endsAt && new Date(c.endsAt) < at) return false;
  if (c.usageLimit && (c.usedCount ?? 0) >= c.usageLimit) return false;
  return true;
}

async function loadCatalog(): Promise<Catalog> {
  if (!hasDatabase()) {
    return { products: staticProducts, coupons: staticCoupons, settings: defaultSettings, source: "static" };
  }
  const payload = await getPayloadClient();
  const [products, coupons, settings] = await Promise.all([
    payload.find({ collection: "products", where: { status: { equals: "active" } }, sort: "rank", limit: 500, depth: 1, overrideAccess: true }),
    payload.find({ collection: "coupons", where: { active: { equals: true }, showInCart: { equals: true } }, limit: 50, depth: 0, overrideAccess: true }),
    payload.findGlobal({ slug: "settings", depth: 0, overrideAccess: true }),
  ]);
  return {
    products: products.docs.map(toProduct),
    coupons: coupons.docs.filter((c) => couponIsUsable(c)).map(toCoupon),
    settings: toSettings(settings),
    source: "database",
  };
}

// Cached for speed; Payload hooks clear the cache the moment an admin saves a
// product, coupon or setting, or an order changes stock.
export const getCatalog = unstable_cache(loadCatalog, ["catalog-v1"], { tags: [CATALOG_TAG], revalidate: 3600 });

export async function getProductByHandle(handle: string) {
  const { products } = await getCatalog();
  return products.find((p) => p.handle === handle);
}

export const getApprovedReviews = unstable_cache(
  async (productId: string, handle: string): Promise<Review[]> => {
    if (!hasDatabase()) return staticReviews.filter((r) => r.productHandle === handle || r.productHandle === "*");
    const payload = await getPayloadClient();
    const res = await payload.find({ collection: "reviews", where: { product: { equals: productId }, approved: { equals: true } }, sort: "-createdAt", limit: 20, depth: 0, overrideAccess: true });
    return res.docs.map((r: ReviewDoc) => ({ productHandle: handle, rating: r.rating, title: r.title, body: r.body, author: r.author, date: (r.createdAt ?? now()).slice(0, 10) }));
  },
  ["reviews-v1"],
  { tags: [CATALOG_TAG], revalidate: 3600 },
);
