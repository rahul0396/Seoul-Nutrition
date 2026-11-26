import { z } from "zod";
import type { Payload } from "payload";
import type { Order } from "@/payload-types";
import { getPayloadClient, couponIsUsable, toCoupon, toProduct, toSettings } from "@/lib/commerce";
import { totals, variantIndex, type CartLine } from "@/lib/pricing";
import { razorpay, razorpayConfigured } from "./razorpay";
import { withRetry } from "./retry";
import { ShortStockError } from "@/payload/hooks/orderLifecycle";

// Server-side checkout. The browser only says WHAT it wants (variant ids,
// quantities, coupon code, address, payment method). Prices, discounts, stock
// and the final amount are all decided here from the database.

const phone = z.string().transform((s) => s.replace(/\D/g, "").slice(-10)).pipe(z.string().regex(/^[6-9]\d{9}$/, "Enter a 10 digit mobile number"));

export const CheckoutInput = z.object({
  lines: z.array(z.object({ variantId: z.string().min(1).max(64), qty: z.number().int().min(1).max(20) })).max(30),
  couponCode: z.string().trim().toUpperCase().max(40).optional().or(z.literal("").transform(() => undefined)),
  membership: z.boolean().default(false),
  pay: z.enum(["online", "cod"]),
  contact: z.object({ name: z.string().trim().min(2).max(80), phone, email: z.string().trim().email().max(120) }),
  address: z.object({
    line1: z.string().trim().min(5).max(200),
    city: z.string().trim().min(2).max(60),
    state: z.string().trim().max(60).optional().default(""),
    pincode: z.string().trim().regex(/^\d{6}$/, "Enter a 6 digit pincode"),
  }),
});
export type CheckoutInput = z.infer<typeof CheckoutInput>;

export class CheckoutError extends Error {
  constructor(public code: string, message: string, public status = 400, public details?: unknown) {
    super(message);
  }
}

const CLAIMABLE = ["pending_payment", "payment_failed"] as const;

function mergeLines(lines: CartLine[]) {
  const m = new Map<string, number>();
  for (const l of lines) m.set(l.variantId, (m.get(l.variantId) ?? 0) + l.qty);
  return [...m].map(([variantId, qty]) => ({ variantId, qty }));
}

export async function placeOrder(input: CheckoutInput) {
  const payload = await getPayloadClient();
  const lines = mergeLines(input.lines);
  if (!lines.length && !input.membership) throw new CheckoutError("EMPTY_CART", "Your cart is empty");

  const ids = lines.map((l) => l.variantId);
  const [productRes, settingsDoc, couponRes, customerRes] = await Promise.all([
    ids.length
      ? payload.find({ collection: "products", where: { and: [{ status: { equals: "active" } }, { "variants.id": { in: ids } }] }, limit: 100, depth: 0, overrideAccess: true })
      : Promise.resolve({ docs: [] }),
    payload.findGlobal({ slug: "settings", depth: 0, overrideAccess: true }),
    input.couponCode ? payload.find({ collection: "coupons", where: { code: { equals: input.couponCode } }, limit: 1, depth: 0, overrideAccess: true }) : Promise.resolve({ docs: [] }),
    payload.find({ collection: "customers", where: { phone: { equals: input.contact.phone } }, limit: 1, depth: 0, overrideAccess: true }),
  ]);

  const products = productRes.docs.map(toProduct);
  const findVariant = variantIndex(products);
  const settings = toSettings(settingsDoc);

  // 1. Every item must still exist and be in stock.
  const missing = lines.filter((l) => !findVariant(l.variantId));
  if (missing.length) throw new CheckoutError("ITEM_UNAVAILABLE", "Some items in your cart are no longer available", 409, { variantIds: missing.map((m) => m.variantId) });
  const short = lines.filter((l) => findVariant(l.variantId)!.variant.stock < l.qty);
  if (short.length) {
    throw new CheckoutError("OUT_OF_STOCK", "Some items do not have enough stock", 409, {
      items: short.map((l) => {
        const hit = findVariant(l.variantId)!;
        return { variantId: l.variantId, title: hit.product.title, label: hit.variant.label, available: hit.variant.stock };
      }),
    });
  }

  // 2. The coupon must be valid right now.
  const couponDoc = couponRes.docs[0];
  if (input.couponCode && (!couponDoc || !couponIsUsable(couponDoc))) throw new CheckoutError("COUPON_INVALID", `The code ${input.couponCode} is no longer valid`, 409);

  // 3. Membership is decided by the customer record, not by the browser.
  const customer = customerRes.docs[0];
  const isMember = !!customer?.isMember && (!customer.memberUntil || new Date(customer.memberUntil) > new Date());

  const t = totals(
    lines,
    { member: isMember, membershipInCart: input.membership && !isMember, couponCode: input.couponCode, pay: input.pay },
    { findVariant, coupons: couponDoc ? [toCoupon(couponDoc)] : [], settings },
  );
  if (input.couponCode && t.couponSaving === 0) throw new CheckoutError("COUPON_MIN", `Add more items to use ${input.couponCode}`, 409);
  if (input.pay === "cod" && !t.codAllowed) throw new CheckoutError("COD_NOT_ALLOWED", `Cash on delivery: ${t.codBlockedReason}`);
  if (input.pay === "online" && !razorpayConfigured()) throw new CheckoutError("PAYMENTS_NOT_CONFIGURED", "Online payment is not available right now. Please choose cash on delivery.", 503);
  if (input.pay === "online" && t.payable < 1) throw new CheckoutError("AMOUNT_TOO_LOW", "Order total is too low to pay online");

  // 4. Save the customer (guest checkout, keyed by mobile number).
  const address = { line1: input.address.line1, city: input.address.city, state: input.address.state, pincode: input.address.pincode };
  let customerId: string;
  if (customer) {
    const known = (customer.addresses ?? []).some((a) => a.line1 === address.line1 && a.pincode === address.pincode);
    await payload.update({
      collection: "customers",
      id: customer.id,
      data: { name: input.contact.name, email: input.contact.email, ...(known ? {} : { addresses: [...(customer.addresses ?? []), address] }) },
      overrideAccess: true,
    });
    customerId = customer.id;
  } else {
    const created = await payload.create({ collection: "customers", data: { name: input.contact.name, phone: input.contact.phone, email: input.contact.email, addresses: [address] }, overrideAccess: true });
    customerId = created.id;
  }

  // 5. Create the order. Its status hook takes stock straight away for COD,
  //    and when the payment succeeds for online orders.
  const order = await withRetry(() => payload.create({
    collection: "orders",
    overrideAccess: true,
    context: { failOnShortStock: true },
    data: {
      status: input.pay === "cod" ? "cod_pending" : "pending_payment",
      paymentMethod: input.pay,
      customer: customerId,
      contact: input.contact,
      address,
      items: t.lines.map((l) => ({
        productId: l.product.id,
        variantId: l.variant.id,
        sku: l.variant.sku,
        title: l.product.title,
        variantLabel: l.variant.label,
        qty: l.qty,
        price: l.variant.price,
        mrp: l.variant.mrp,
        lineTotal: l.variant.price * l.qty,
      })),
      membership: t.membershipFee > 0,
      membershipMonths: settings.membership.months,
      totals: {
        mrpTotal: t.mrpTotal,
        subtotal: t.saleTotal,
        memberDiscount: t.memberSaving,
        couponCode: t.coupon?.code,
        couponDiscount: t.couponSaving,
        prepaidDiscount: t.prepaidSaving,
        shippingFee: t.shippingFee,
        membershipFee: t.membershipFee,
        total: t.payable,
      },
    },
  })).catch((e) => {
    if (e instanceof ShortStockError || /Not enough stock for/.test(String(e?.message))) {
      throw new CheckoutError("OUT_OF_STOCK", "Some items just sold out. Please update your cart.", 409, { items: [] });
    }
    throw e;
  });

  if (input.pay === "cod") return { orderNumber: order.orderNumber!, pay: "cod" as const, amount: t.payable };

  // 6. Online: open a Razorpay order for exactly this amount.
  try {
    const rzpOrder = await razorpay().orders.create({
      amount: Math.round(t.payable * 100),
      currency: "INR",
      receipt: order.orderNumber!,
      notes: { orderId: order.id, orderNumber: order.orderNumber! },
    });
    await payload.update({ collection: "orders", id: order.id, data: { razorpay: { orderId: rzpOrder.id } }, overrideAccess: true });
    return {
      orderNumber: order.orderNumber!,
      pay: "online" as const,
      amount: t.payable,
      razorpay: { keyId: process.env.RAZORPAY_KEY_ID!, orderId: rzpOrder.id, amount: Number(rzpOrder.amount), currency: "INR" },
    };
  } catch (e) {
    await payload.update({ collection: "orders", id: order.id, data: { status: "payment_failed" }, context: { statusNote: "Could not open Razorpay order" }, overrideAccess: true });
    payload.logger.error({ err: e }, "Razorpay order create failed");
    throw new CheckoutError("PAYMENT_GATEWAY_ERROR", "Could not start the payment. Please try again or choose cash on delivery.", 502);
  }
}

async function findByRazorpayOrder(payload: Payload, razorpayOrderId: string) {
  const res = await payload.find({ collection: "orders", where: { "razorpay.orderId": { equals: razorpayOrderId } }, limit: 1, depth: 0, overrideAccess: true });
  return res.docs[0] as Order | undefined;
}

// Mark an order paid exactly once, whether the browser (verify route) or the
// Razorpay webhook gets here first.
export async function markPaid(opts: { razorpayOrderId: string; paymentId: string; amountPaise?: number; source: "checkout" | "webhook" }) {
  const payload = await getPayloadClient();
  const order = await findByRazorpayOrder(payload, opts.razorpayOrderId);
  if (!order) return { ok: false as const, reason: "ORDER_NOT_FOUND" };

  if (opts.amountPaise !== undefined && opts.amountPaise !== Math.round((order.totals?.total ?? 0) * 100)) {
    await payload.update({ collection: "orders", id: order.id, data: { notes: `${order.notes ?? ""}\nPayment ${opts.paymentId} amount ${opts.amountPaise / 100} does not match the order total. Check in Razorpay.`.trim() }, overrideAccess: true });
    return { ok: false as const, reason: "AMOUNT_MISMATCH" };
  }

  // Atomic claim: only one caller can attach the payment id.
  const Orders = (payload.db as unknown as { collections: Record<string, import("mongoose").Model<unknown>> }).collections.orders;
  const claim = await Orders.updateOne(
    { _id: order.id, status: { $in: CLAIMABLE }, $or: [{ "razorpay.paymentId": null }, { "razorpay.paymentId": { $exists: false } }] },
    { $set: { "razorpay.paymentId": opts.paymentId } },
  );

  if (claim.modifiedCount === 0) {
    const fresh = await payload.findByID({ collection: "orders", id: order.id, depth: 0, overrideAccess: true });
    if (fresh.razorpay?.paymentId === opts.paymentId || fresh.status === "paid") return { ok: true as const, order: fresh, already: true };
    // Money came in for an order that was cancelled meanwhile: flag it for a refund.
    await payload.update({
      collection: "orders",
      id: order.id,
      data: { stockIssue: true, notes: `${fresh.notes ?? ""}\nPayment ${opts.paymentId} was received while the order was "${fresh.status}". Refund it in Razorpay or reopen the order.`.trim() },
      overrideAccess: true,
    });
    return { ok: false as const, reason: "ORDER_NOT_PAYABLE", order: fresh };
  }

  const updated = await withRetry(() => payload.update({
    collection: "orders",
    id: order.id,
    data: { status: "paid", paidAt: new Date().toISOString() },
    context: { statusNote: `Payment ${opts.paymentId} (${opts.source})` },
    overrideAccess: true,
  }));
  return { ok: true as const, order: updated, already: false };
}

export async function markFailed(razorpayOrderId: string, reason: string) {
  const payload = await getPayloadClient();
  const order = await findByRazorpayOrder(payload, razorpayOrderId);
  if (!order || order.status !== "pending_payment") return;
  await withRetry(() => payload.update({ collection: "orders", id: order.id, data: { status: "payment_failed" }, context: { statusNote: reason.slice(0, 200) }, overrideAccess: true }));
}
