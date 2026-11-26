import crypto from "node:crypto";
import Razorpay from "razorpay";

// Razorpay helpers. Keys live in environment variables only; never in code.
//   RAZORPAY_KEY_ID          rzp_test_... (test) or rzp_live_... (live)
//   RAZORPAY_KEY_SECRET      from Razorpay Dashboard > Account & Settings > API keys
//   RAZORPAY_WEBHOOK_SECRET  the secret you type when adding the webhook

export const razorpayConfigured = () => !!process.env.RAZORPAY_KEY_ID && !!process.env.RAZORPAY_KEY_SECRET;

let client: Razorpay | null = null;
export function razorpay() {
  if (!razorpayConfigured()) throw new Error("Razorpay keys are not set");
  client ??= new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID!, key_secret: process.env.RAZORPAY_KEY_SECRET! });
  return client;
}

const hmac = (secret: string, body: string) => crypto.createHmac("sha256", secret).update(body).digest("hex");

function safeEqual(a: string, b: string) {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && crypto.timingSafeEqual(x, y);
}

// Checkout success handler: signature = HMAC_SHA256(order_id + "|" + payment_id, key_secret)
export function validPaymentSignature(orderId: string, paymentId: string, signature: string) {
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret || !orderId || !paymentId || !signature) return false;
  return safeEqual(hmac(secret, `${orderId}|${paymentId}`), signature);
}

// Webhook: signature = HMAC_SHA256(raw request body, webhook_secret)
export function validWebhookSignature(rawBody: string, signature: string) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret || !signature) return false;
  return safeEqual(hmac(secret, rawBody), signature);
}
