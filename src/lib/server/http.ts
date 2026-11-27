import { ZodError } from "zod";
import { hasDatabase } from "@/lib/commerce";
import { CheckoutError } from "./checkout";

export const json = (body: unknown, status = 200) => Response.json(body, { status, headers: { "cache-control": "no-store" } });

export function noDatabase() {
  return hasDatabase() ? null : json({ code: "BACKEND_NOT_CONFIGURED", message: "The store backend is not connected yet." }, 503);
}

export function errorResponse(e: unknown) {
  if (e instanceof CheckoutError) return json({ code: e.code, message: e.message, details: e.details }, e.status);
  if (e instanceof ZodError) {
    const first = e.issues[0];
    return json({ code: "INVALID_INPUT", message: first ? `${first.path.join(".")}: ${first.message}` : "Invalid input", fields: e.issues.map((i) => i.path.join(".")) }, 400);
  }
  console.error(e);
  return json({ code: "SERVER_ERROR", message: "Something went wrong. Please try again." }, 500);
}

// Very small in-memory rate limit per IP. Good enough to stop a form being
// spammed from one machine; use a shared store (Upstash, Redis) if you need more.
const hits = new Map<string, number[]>();
export function rateLimited(req: Request, key: string, max: number, windowMs = 60_000) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const id = `${key}:${ip}`;
  const now = Date.now();
  const list = (hits.get(id) ?? []).filter((t) => now - t < windowMs);
  list.push(now);
  hits.set(id, list);
  if (hits.size > 5000) hits.clear();
  return list.length > max;
}
