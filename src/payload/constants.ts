// Order lifecycle. Keep this list in one place: the admin, the checkout and the
// stock hook all read it.
//
//   pending_payment ─▶ paid ─────────┐
//   cod_pending ─▶ cod_confirmed ────┼─▶ packed ─▶ shipped ─▶ delivered
//                                    └─▶ cancelled / rto / refunded
//   pending_payment ─▶ payment_failed (customer can retry with a new order)

export const ORDER_STATUSES = [
  { label: "Awaiting payment", value: "pending_payment" },
  { label: "Payment failed", value: "payment_failed" },
  { label: "Paid", value: "paid" },
  { label: "COD: to confirm", value: "cod_pending" },
  { label: "COD: confirmed", value: "cod_confirmed" },
  { label: "Packed", value: "packed" },
  { label: "Shipped", value: "shipped" },
  { label: "Delivered", value: "delivered" },
  { label: "Cancelled", value: "cancelled" },
  { label: "Returned to origin (RTO)", value: "rto" },
  { label: "Refunded", value: "refunded" },
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number]["value"];

// Orders in these statuses hold stock (and count against coupon limits).
export const HOLDS_STOCK = new Set<OrderStatus>(["paid", "cod_pending", "cod_confirmed", "packed", "shipped", "delivered"]);

// Staff cannot set these by hand; only an admin (or the payment webhook) can.
export const ADMIN_ONLY_STATUSES = new Set<OrderStatus>(["paid", "refunded"]);

export const statusLabel = (s: string) => ORDER_STATUSES.find((x) => x.value === s)?.label ?? s;
