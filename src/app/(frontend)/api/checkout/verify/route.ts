import { z } from "zod";
import { markPaid } from "@/lib/server/checkout";
import { validPaymentSignature } from "@/lib/server/razorpay";
import { errorResponse, json, noDatabase } from "@/lib/server/http";

const Body = z.object({ razorpay_order_id: z.string().min(1), razorpay_payment_id: z.string().min(1), razorpay_signature: z.string().min(1) });

// POST /api/checkout/verify: called by the browser right after Razorpay
// Checkout succeeds. The webhook does the same job if the browser never gets here.
export async function POST(req: Request) {
  const off = noDatabase();
  if (off) return off;
  try {
    const b = Body.parse(await req.json());
    if (!validPaymentSignature(b.razorpay_order_id, b.razorpay_payment_id, b.razorpay_signature)) {
      return json({ code: "BAD_SIGNATURE", message: "We could not verify this payment. If money was deducted, it will be confirmed or refunded automatically." }, 400);
    }
    const res = await markPaid({ razorpayOrderId: b.razorpay_order_id, paymentId: b.razorpay_payment_id, source: "checkout" });
    if (!res.ok) return json({ code: res.reason, message: "Payment received, but the order needs a manual check. Our team will contact you." }, 409);
    return json({ orderNumber: res.order.orderNumber, status: res.order.status });
  } catch (e) {
    return errorResponse(e);
  }
}
