import { z } from "zod";
import { getPayloadClient } from "@/lib/commerce";
import { errorResponse, json, noDatabase, rateLimited } from "@/lib/server/http";

const Body = z.object({
  productId: z.string().min(1).max(64),
  rating: z.number().int().min(1).max(5),
  title: z.string().trim().max(120).optional().default(""),
  body: z.string().trim().min(3).max(3000),
  author: z.string().trim().min(1).max(80),
  website: z.string().nullish(), // honeypot
});

// POST /api/reviews: saved as "not approved". Approve it in /admin to show it.
export async function POST(req: Request) {
  const off = noDatabase();
  if (off) return off;
  if (rateLimited(req, "reviews", 5)) return json({ code: "RATE_LIMITED", message: "Too many reviews. Try again later." }, 429);
  try {
    const b = Body.parse(await req.json());
    if (b.website) return json({ ok: true });
    const payload = await getPayloadClient();
    await payload.findByID({ collection: "products", id: b.productId, depth: 0, overrideAccess: true }).catch(() => {
      throw Object.assign(new Error("Unknown product"), { status: 404 });
    });
    await payload.create({
      collection: "reviews",
      data: { product: b.productId, rating: b.rating, title: b.title || b.body.slice(0, 60), body: b.body, author: b.author, approved: false },
      overrideAccess: true,
    });
    return json({ ok: true });
  } catch (e) {
    if ((e as { status?: number }).status === 404) return json({ code: "NOT_FOUND", message: "Product not found" }, 404);
    return errorResponse(e);
  }
}
