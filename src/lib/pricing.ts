import { getVariant } from "@/data/products";
import { coupons, membership, milestones, shipping } from "@/data/site";
import type { Coupon } from "@/data/types";

export type CartLine = { variantId: string; qty: number };

export const inr = (n: number) =>
  "₹" + Math.round(n).toLocaleString("en-IN", { maximumFractionDigits: 0 });

export const pctOff = (price: number, mrp: number) =>
  mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;

export const memberPrice = (price: number) => Math.round(price * (1 - membership.discount / 100));

export function couponStatus(c: Coupon, subtotal: number): { ok: boolean; reason?: string } {
  if (subtotal < c.minSubtotal) return { ok: false, reason: `Add ${inr(c.minSubtotal - subtotal)} more to use this` };
  return { ok: true };
}

export function couponDiscount(c: Coupon | undefined, subtotal: number) {
  if (!c || !couponStatus(c, subtotal).ok) return 0;
  return c.kind === "percent" ? Math.round((subtotal * c.value) / 100) : Math.min(c.value, subtotal);
}

export function totals(lines: CartLine[], opts: { member: boolean; membershipInCart: boolean; couponCode?: string }) {
  let mrpTotal = 0;
  let saleTotal = 0;
  let items = 0;
  const resolved = lines
    .map((l) => {
      const hit = getVariant(l.variantId);
      if (!hit) return null;
      mrpTotal += hit.variant.mrp * l.qty;
      saleTotal += hit.variant.price * l.qty;
      items += l.qty;
      return { ...l, ...hit };
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);

  const memberActive = opts.member || opts.membershipInCart;
  const memberSaving = memberActive ? saleTotal - resolved.reduce((s, l) => s + memberPrice(l.variant.price) * l.qty, 0) : 0;
  const afterMember = saleTotal - memberSaving;
  const coupon = coupons.find((c) => c.code === opts.couponCode);
  const couponSaving = couponDiscount(coupon, afterMember);
  const membershipFee = opts.membershipInCart ? membership.price : 0;
  const productTotal = afterMember - couponSaving;
  const shippingFee = items === 0 || productTotal >= shipping.freeAbove ? 0 : shipping.fee;
  const total = productTotal + membershipFee + shippingFee;

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
    total,
    totalSaving: mrpTotal - saleTotal + memberSaving + couponSaving,
    milestone: { next, unlocked, max: milestones[milestones.length - 1]?.items ?? 0 },
  };
}
