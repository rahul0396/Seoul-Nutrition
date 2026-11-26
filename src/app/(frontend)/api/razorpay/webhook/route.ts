import { markFailed, markPaid } from "@/lib/server/checkout";
import { validWebhookSignature } from "@/lib/server/razorpay";
import { json, noDatabase } from "@/lib/server/http";

// POST /api/razorpay/webhook: Razorpay calls this for payment events.
// Set it up in Razorpay Dashboard > Webhooks with events:
//   payment.captured, payment.failed, order.paid
// The URL is https://<your-domain>/api/razorpay/webhook

type Payment = { id: string; order_id: string; amount: number; status: string; error_description?: string };

export async function POST(req: Request) {
  const off = noDatabase();
  if (off) return off;
  const raw = await req.text(); // the signature is over the exact raw body
  if (!validWebhookSignature(raw, req.headers.get("x-razorpay-signature") ?? "")) return json({ ok: false }, 400);

  let event: { event: string; payload?: { payment?: { entity: Payment } } };
  try {
    event = JSON.parse(raw);
  } catch {
    return json({ ok: false }, 400);
  }
  const p = event.payload?.payment?.entity;
  try {
    if (p?.order_id && (event.event === "payment.captured" || event.event === "order.paid")) {
      await markPaid({ razorpayOrderId: p.order_id, paymentId: p.id, amountPaise: p.amount, source: "webhook" });
    } else if (p?.order_id && event.event === "payment.failed") {
      await markFailed(p.order_id, `Payment failed: ${p.error_description ?? "unknown reason"}`);
    }
  } catch (e) {
    console.error("razorpay webhook", e);
    return json({ ok: false }, 500); // Razorpay retries on non-2xx
  }
  return json({ ok: true });
}
