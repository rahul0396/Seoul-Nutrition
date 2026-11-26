import { couponIsUsable, getPayloadClient, toCoupon } from "@/lib/commerce";
import { json, noDatabase, rateLimited } from "@/lib/server/http";

// GET /api/coupons?code=XYZ: checks a code that is not listed in the cart.
export async function GET(req: Request) {
  const off = noDatabase();
  if (off) return off;
  if (rateLimited(req, "coupon", 20)) return json({ coupon: null }, 429);
  const code = new URL(req.url).searchParams.get("code")?.trim().toUpperCase().slice(0, 40);
  if (!code) return json({ coupon: null }, 400);
  const payload = await getPayloadClient();
  const res = await payload.find({ collection: "coupons", where: { code: { equals: code } }, limit: 1, depth: 0, overrideAccess: true });
  const c = res.docs[0];
  return c && couponIsUsable(c) ? json({ coupon: toCoupon(c) }) : json({ coupon: null }, 404);
}
