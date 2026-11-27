import { CheckoutInput, placeOrder } from "@/lib/server/checkout";
import { errorResponse, json, noDatabase, rateLimited } from "@/lib/server/http";

// POST /api/checkout: price the cart on the server and create the order.
// COD: the order is placed. Online: returns the Razorpay order to open.
export async function POST(req: Request) {
  const off = noDatabase();
  if (off) return off;
  if (rateLimited(req, "checkout", 10)) return json({ code: "RATE_LIMITED", message: "Too many attempts. Wait a minute and try again." }, 429);
  try {
    const input = CheckoutInput.parse(await req.json());
    return json(await placeOrder(input));
  } catch (e) {
    return errorResponse(e);
  }
}
