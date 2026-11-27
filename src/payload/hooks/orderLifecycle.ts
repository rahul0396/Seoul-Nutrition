import { APIError, type CollectionAfterChangeHook, type CollectionBeforeChangeHook, type PayloadRequest } from "payload";
import { ADMIN_ONLY_STATUSES, HOLDS_STOCK, type OrderStatus, statusLabel } from "../constants";
import { revalidateCatalog } from "./revalidate";
import { userRole } from "../access";

// One place that keeps stock, coupon usage and membership in step with an
// order's status, however the status changed (checkout, payment webhook or a
// person in /admin):
//
//   status enters a stock-holding state  -> take stock, count the coupon, grant membership
//   status leaves it (cancel, RTO, ...)  -> put stock back, release the coupon use
//
// Stock writes are conditional Mongo updates ("only if stock >= qty"), so two
// buyers can never both take the last unit. They run in the same database
// transaction as the order save when MongoDB supports it (Atlas does).

type Item = {
  id?: string;
  productId: string;
  variantId: string;
  sku?: string | null;
  title: string;
  variantLabel: string;
  qty: number;
  stockTaken?: number | null;
  [k: string]: unknown;
};

type HistoryEntry = { at: string; status: string; by: string; note?: string };

// Thrown when checkout asked for "all or nothing" and an item ran out between
// the stock check and saving the order.
export class ShortStockError extends Error {
  constructor(public items: string[]) {
    super(`Not enough stock for: ${items.join(", ")}`);
  }
}

async function sessionFor(req: PayloadRequest): Promise<import("mongoose").ClientSession | undefined> {
  const db = req.payload.db as unknown as { sessions?: Record<string, import("mongoose").ClientSession> };
  const id = req.transactionID instanceof Promise ? await req.transactionID : req.transactionID;
  const s = id ? db.sessions?.[String(id)] : undefined;
  return s && s.inTransaction() ? s : undefined;
}

function model(req: PayloadRequest, slug: string) {
  // Payload's MongoDB adapter exposes the underlying Mongoose models.
  return (req.payload.db as unknown as { collections: Record<string, import("mongoose").Model<unknown>> }).collections[slug];
}

export const orderNumber: CollectionBeforeChangeHook = async ({ data, operation, req }) => {
  if (operation !== "create" || data.orderNumber) return data;
  const counters = (req.payload.db as unknown as { connection: import("mongoose").Connection }).connection.collection<{ _id: string; seq: number }>("counters");
  // Outside the order's transaction on purpose: every order bumps this one
  // document, and keeping it out avoids needless conflicts. A failed order just
  // leaves a gap in the numbering.
  const res = await counters.findOneAndUpdate({ _id: "order" }, { $inc: { seq: 1 } }, { upsert: true, returnDocument: "after" });
  data.orderNumber = `SN${100000 + (res?.seq ?? Date.now() % 100000)}`;
  return data;
};

export const orderLifecycle: CollectionBeforeChangeHook = async ({ data, originalDoc, operation, req }) => {
  const prev = (originalDoc?.status ?? null) as OrderStatus | null;
  const next = (data.status ?? prev) as OrderStatus;
  const by = req.user ? String((req.user as { email?: string }).email ?? "staff") : "system";

  // Staff cannot mark orders paid or refunded by hand.
  if (req.user && prev !== next && ADMIN_ONLY_STATUSES.has(next) && userRole(req.user) !== "admin") {
    throw new APIError(`Only an admin can set an order to "${statusLabel(next)}".`, 403, null, true);
  }

  const merged = { ...(originalDoc ?? {}), ...data } as Record<string, unknown>;
  const items = ((merged.items as Item[]) ?? []).map((i) => ({ ...i }));
  const committed = !!merged.committed;
  const history: HistoryEntry[] = [...((merged.history as HistoryEntry[]) ?? [])];
  const session = await sessionFor(req);
  const Products = model(req, "products");
  const Coupons = model(req, "coupons");
  const Customers = model(req, "customers");
  let stockChanged = false;

  if (HOLDS_STOCK.has(next) && !committed) {
    const short: string[] = [];
    for (const it of items) {
      const res = await Products.updateOne(
        { _id: it.productId, variants: { $elemMatch: { id: it.variantId, stock: { $gte: it.qty } } } },
        { $inc: { "variants.$.stock": -it.qty } },
        { session },
      );
      if (res.modifiedCount === 1) {
        it.stockTaken = it.qty;
        stockChanged = true;
      } else {
        it.stockTaken = 0;
        short.push(`${it.title} (${it.variantLabel})`);
      }
    }
    if (short.length && req.context?.failOnShortStock) {
      // Put back what this attempt took, then refuse the order.
      for (const it of items) {
        if (it.stockTaken) await Products.updateOne({ _id: it.productId, "variants.id": it.variantId }, { $inc: { "variants.$.stock": it.stockTaken } }, { session });
      }
      throw new ShortStockError(short);
    }
    const code = (merged.totals as { couponCode?: string } | undefined)?.couponCode;
    if (code) await Coupons.updateOne({ code }, { $inc: { usedCount: 1 } }, { session });
    if (merged.membership && next === "paid" && merged.customer) {
      const months = Number(merged.membershipMonths ?? 3);
      const until = new Date();
      until.setMonth(until.getMonth() + months);
      const customerId = typeof merged.customer === "object" ? (merged.customer as { id: string }).id : merged.customer;
      await Customers.updateOne({ _id: customerId }, { $set: { isMember: true, memberUntil: until } }, { session });
    }
    data.committed = true;
    data.items = items;
    if (short.length) {
      data.stockIssue = true;
      history.push({ at: new Date().toISOString(), status: next, by: "system", note: `Not enough stock for: ${short.join(", ")}. Restock or refund.` });
    }
  } else if (!HOLDS_STOCK.has(next) && committed) {
    for (const it of items) {
      const n = Number(it.stockTaken ?? 0);
      if (n > 0) {
        await Products.updateOne({ _id: it.productId, "variants.id": it.variantId }, { $inc: { "variants.$.stock": n } }, { session });
        it.stockTaken = 0;
        stockChanged = true;
      }
    }
    const code = (merged.totals as { couponCode?: string } | undefined)?.couponCode;
    if (code) await Coupons.updateOne({ code, usedCount: { $gt: 0 } }, { $inc: { usedCount: -1 } }, { session });
    data.committed = false;
    data.items = items;
  }

  if (operation === "create" || prev !== next) {
    const note = typeof req.context?.statusNote === "string" ? req.context.statusNote : undefined;
    history.push({ at: new Date().toISOString(), status: next, by, ...(note ? { note } : {}) });
    data.history = history;
  }

  if (stockChanged) req.context.stockChanged = true;
  return data;
};

export const afterOrderChange: CollectionAfterChangeHook = ({ doc, req }) => {
  if (req.context?.stockChanged) revalidateCatalog();
  return doc;
};
