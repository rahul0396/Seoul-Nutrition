import type { CommerceSettings, Coupon, Product, Variant } from "@/data/types";

// Pricing rules, shared by the browser (to show the cart) and the server (to
// decide what the customer is actually charged). Both call totals() with their
// own copy of the catalogue, so the cart and the bill can never disagree.

export type CartLine = { variantId: string; qty: number };
export type VariantHit = { product: Product; variant: Variant };
export type PricingContext = {
  findVariant: (id: string) => VariantHit | undefined;
  coupons: Coupon[];
  settings: Pick<CommerceSettings, "shipping" | "membership" | "milestones" | "cod">;
};

export const inr = (n: number) =>
  "₹" + Math.round(n).toLocaleString("en-IN", { maximumFractionDigits: 0 });

export const pctOff = (price: number, mrp: number) =>
  mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;

export const memberPrice = (price: number, discount: number) => Math.round(price * (1 - discount / 100));

export function variantIndex(products: Product[]) {
  const map = new Map<string, VariantHit>();
  for (const p of products) for (const v of p.variants) map.set(v.id, { product: p, variant: v });
  return (id: string) => map.get(id);
}

export function couponStatus(c: Coupon, subtotal: number): { ok: boolean; reason?: string } {
  if (subtotal < c.minSubtotal) return { ok: false, reason: `Add ${inr(c.minSubtotal - subtotal)} more to use this` };
  return { ok: true };
}

export function couponDiscount(c: Coupon | undefined, subtotal: number) {
  if (!c || !couponStatus(c, subtotal).ok) return 0;
  return c.kind === "percent" ? Math.round((subtotal * c.value) / 100) : Math.min(c.value, subtotal);
}

export type TotalsOptions = { member: boolean; membershipInCart: boolean; couponCode?: string; pay?: "online" | "cod" };

export function totals(lines: CartLine[], opts: TotalsOptions, ctx: PricingContext) {
  const { shipping, membership, milestones, cod } = ctx.settings;
  let mrpTotal = 0;
  let saleTotal = 0;
  let items = 0;
  const resolved = lines
    .map((l) => {
      const hit = ctx.findVariant(l.variantId);
      if (!hit) return null;
      mrpTotal += hit.variant.mrp * l.qty;
      saleTotal += hit.variant.price * l.qty;
      items += l.qty;
      return { ...l, ...hit };
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);

  const memberActive = opts.member || opts.membershipInCart;
  const memberSaving = memberActive ? saleTotal - resolved.reduce((s, l) => s + memberPrice(l.variant.price, membership.discount) * l.qty, 0) : 0;
  const afterMember = saleTotal - memberSaving;
  const coupon = ctx.coupons.find((c) => c.code === opts.couponCode);
  const couponSaving = couponDiscount(coupon, afterMember);
  const membershipFee = opts.membershipInCart ? membership.price : 0;
  const productTotal = afterMember - couponSaving;
  const shippingFee = items === 0 || productTotal >= shipping.freeAbove ? 0 : shipping.fee;
  const total = productTotal + membershipFee + shippingFee;
  const prepaidSaving = opts.pay === "online" ? Math.round((productTotal * shipping.prepaidExtra) / 100) : 0;
  const payable = total - prepaidSaving;

  let codBlockedReason: string | undefined;
  if (!cod.enabled) codBlockedReason = "Not available right now";
  else if (opts.membershipInCart) codBlockedReason = "Not available with membership";
  else if (cod.maxOrderValue > 0 && total > cod.maxOrderValue) codBlockedReason = `Only for orders up to ${inr(cod.maxOrderValue)}`;

  const next = milestones.find((m) => items < m.items);
  const unlocked = milestones.filter((m) => items >= m.items);

  return {
    lines: resolved,
    items,
    mrpTotal,
    saleTotal,
    mrpSaving: mrpTotal - saleTotal,
    memberSaving,
    coupon: couponSaving > 0 ? coupon : undefined,
    couponSaving,
    membershipFee,
    shippingFee,
    productTotal,
    total, // before the prepaid discount
    prepaidSaving,
    payable, // what the customer pays with the chosen payment method
    codAllowed: !codBlockedReason,
    codBlockedReason,
    totalSaving: mrpTotal - saleTotal + memberSaving + couponSaving + prepaidSaving,
    milestone: { next, unlocked, max: milestones[milestones.length - 1]?.items ?? 0 },
  };
}

export type Totals = ReturnType<typeof totals>;
