import { z } from "zod";
import { getPayloadClient } from "@/lib/commerce";
import { errorResponse, json, noDatabase, rateLimited } from "@/lib/server/http";

const Body = z.object({
  kind: z.enum(["contact", "consult", "notify", "newsletter"]),
  name: z.string().trim().max(80).optional(),
  phone: z.string().trim().max(20).optional(),
  email: z.string().trim().email().max(120).optional().or(z.literal("")),
  product: z.string().trim().max(160).optional(),
  goal: z.string().trim().max(80).optional(),
  message: z.string().trim().max(2000).optional(),
  website: z.string().optional(), // honeypot: real people leave it empty
});

// POST /api/leads: contact, consultation, back-in-stock and newsletter forms.
export async function POST(req: Request) {
  const off = noDatabase();
  if (off) return off;
  if (rateLimited(req, "leads", 8)) return json({ code: "RATE_LIMITED", message: "Too many requests. Try again in a minute." }, 429);
  try {
    const { website, email, ...b } = Body.parse(await req.json());
    if (website) return json({ ok: true }); // bot
    if (!b.phone && !email) return json({ code: "INVALID_INPUT", message: "Add a phone number or email" }, 400);
    const payload = await getPayloadClient();
    await payload.create({ collection: "leads", data: { ...b, email: email || undefined }, overrideAccess: true });
    return json({ ok: true });
  } catch (e) {
    return errorResponse(e);
  }
}
