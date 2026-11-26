"use client";

import Link from "next/link";
import { useState } from "react";
import { AlertTriangle, CheckCircle2, Lock } from "lucide-react";
import { site } from "@/data/site";
import { inr } from "@/lib/pricing";
import { useStore } from "@/lib/store";
import { useCatalog } from "@/lib/catalog";
import { PackArt } from "./PackArt";
import { Button } from "./ui";

// Checkout. The server re-prices the cart and creates the order:
//   COD:    POST /api/checkout -> order placed
//   Online: POST /api/checkout -> open Razorpay -> POST /api/checkout/verify
// The Razorpay webhook confirms the payment too, in case this tab is closed.

const input = "h-12 w-full rounded-md border border-line-input px-4 outline-none focus:border-ink aria-[invalid=true]:border-danger";

type RazorpayOrder = { keyId: string; orderId: string; amount: number; currency: string };
type Placed = { orderNumber: string; amount: number; pay: "online" | "cod" };
type RazorpayResponse = { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string };
type RazorpayCtor = new (opts: Record<string, unknown>) => { open: () => void; on: (ev: string, cb: (r: { error?: { description?: string } }) => void) => void };

function loadRazorpay(): Promise<RazorpayCtor> {
  const w = window as unknown as { Razorpay?: RazorpayCtor };
  if (w.Razorpay) return Promise.resolve(w.Razorpay);
  return new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.async = true;
    s.onload = () => (w.Razorpay ? resolve(w.Razorpay) : reject(new Error("Razorpay did not load")));
    s.onerror = () => reject(new Error("Could not load the payment window. Check your internet and try again."));
    document.body.appendChild(s);
  });
}

export function CheckoutView() {
  const s = useStore();
  const { settings } = useCatalog();
  const [payChoice, setPay] = useState<"online" | "cod">("online");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [placed, setPlaced] = useState<Placed | null>(null);
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState<{ message: string; items?: string[] } | null>(null);
  const [pending, setPending] = useState<{ order: RazorpayOrder; orderNumber: string; amount: number; prefill: Record<string, string> } | null>(null);

  const codBlocked = !s.quote("cod").codAllowed;
  const pay = payChoice === "cod" && codBlocked ? "online" : payChoice;
  const summary = s.quote(pay);

  if (!s.ready) return <div className="container-x min-h-[60vh] py-16" />;

  if (placed) {
    return (
      <div className="container-x grid min-h-[60vh] place-items-center py-16 text-center">
        <div className="animate-pop max-w-md">
          <CheckCircle2 className="mx-auto size-16 text-success" aria-hidden />
          <h1 className="mt-4 text-3xl font-extrabold">{placed.pay === "cod" ? "Order placed" : "Payment received"}</h1>
          <p className="mt-2 text-muted">Order <strong className="text-ink">{placed.orderNumber}</strong> · {inr(placed.amount)}{placed.pay === "cod" ? " to pay on delivery" : " paid"}.</p>
          <p className="mt-2 text-sm text-muted">{placed.pay === "cod" ? "We will call or message you to confirm before we ship." : "We will message you when it ships."} Questions? {site.phone}</p>
          <Link href="/" className="mt-6 inline-flex h-11 items-center rounded-full bg-ink px-6 font-bold text-on-ink">Continue shopping</Link>
        </div>
      </div>
    );
  }

  if (summary.items === 0 && !s.membershipInCart) {
    return (
      <div className="container-x grid min-h-[60vh] place-items-center py-16 text-center">
        <div><h1 className="text-2xl font-extrabold">Your cart is empty</h1><Link href="/collections/shop-all" className="mt-4 inline-block font-bold text-accent hover:underline">Shop products</Link></div>
      </div>
    );
  }

  const finish = (p: Placed) => {
    setPlaced(p);
    setPending(null);
    s.clear();
    window.scrollTo({ top: 0 });
  };

  const openRazorpay = async (p: NonNullable<typeof pending>) => {
    setProblem(null);
    try {
      const Razorpay = await loadRazorpay();
      const rzp = new Razorpay({
        key: p.order.keyId,
        order_id: p.order.orderId,
        amount: p.order.amount,
        currency: p.order.currency,
        name: site.name,
        description: `Order ${p.orderNumber}`,
        prefill: p.prefill,
        theme: { color: "#16140f" },
        handler: async (r: RazorpayResponse) => {
          setBusy(true);
          try {
            const res = await fetch("/api/checkout/verify", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(r) });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data.message || "We could not confirm the payment.");
            finish({ orderNumber: p.orderNumber, amount: p.amount, pay: "online" });
          } catch (e) {
            setProblem({ message: `${e instanceof Error ? e.message : "We could not confirm the payment."} Your order number is ${p.orderNumber}.` });
          } finally {
            setBusy(false);
          }
        },
        modal: { ondismiss: () => setProblem({ message: "Payment was not completed. Your cart is saved: try again or choose cash on delivery." }) },
      });
      rzp.on("payment.failed", (r) => setProblem({ message: `Payment failed: ${r.error?.description ?? "please try another method"}.` }));
      rzp.open();
    } catch (e) {
      setProblem({ message: e instanceof Error ? e.message : "Could not open the payment window." });
    }
  };

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const v = (k: string) => String(f.get(k) || "").trim();
    const err: Record<string, string> = {};
    if (v("name").length < 2) err.name = "Enter your full name";
    if (!/^[6-9]\d{9}$/.test(v("phone").replace(/\D/g, "").slice(-10))) err.phone = "Enter a 10 digit mobile number";
    if (!/^\S+@\S+\.\S+$/.test(v("email"))) err.email = "Enter a valid email";
    if (v("address").length < 5) err.address = "Enter your full address";
    if (v("city").length < 2) err.city = "Enter your city";
    if (!/^\d{6}$/.test(v("pincode"))) err.pincode = "Enter a 6 digit pincode";
    setErrors(err);
    if (Object.keys(err).length) return;

    setBusy(true);
    setProblem(null);
    try {
      const body = {
        lines: s.lines,
        couponCode: s.couponCode,
        membership: s.membershipInCart,
        pay,
        contact: { name: v("name"), phone: v("phone"), email: v("email") },
        address: { line1: v("address"), city: v("city"), state: v("state"), pincode: v("pincode") },
      };
      const res = await fetch("/api/checkout", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (data.code === "COUPON_INVALID" || data.code === "COUPON_MIN") s.applyCoupon(undefined);
        if (data.code === "ITEM_UNAVAILABLE") (data.details?.variantIds ?? []).forEach((id: string) => s.remove(id));
        const items = data.code === "OUT_OF_STOCK" ? (data.details?.items ?? []).map((i: { title: string; label: string; available: number }) => `${i.title} (${i.label}): ${i.available ? `only ${i.available} left` : "sold out"}`) : undefined;
        setProblem({ message: data.message || "Could not place the order. Please try again.", items });
        return;
      }
      if (data.pay === "cod") return finish({ orderNumber: data.orderNumber, amount: data.amount, pay: "cod" });
      const p = { order: data.razorpay as RazorpayOrder, orderNumber: data.orderNumber as string, amount: data.amount as number, prefill: { name: body.contact.name, email: body.contact.email, contact: body.contact.phone } };
      setPending(p);
      await openRazorpay(p);
    } catch {
      setProblem({ message: "Network problem. Check your internet and try again." });
    } finally {
      setBusy(false);
    }
  };

  const fieldsets: [string, string, string, string?][] = [
    ["name", "Full name", "text", "name"], ["phone", "Mobile number", "tel", "tel-national"], ["email", "Email", "email", "email"],
    ["address", "House, street, area", "text", "street-address"], ["city", "City", "text", "address-level2"], ["state", "State", "text", "address-level1"], ["pincode", "Pincode", "text", "postal-code"],
  ];

  return (
    <div className="container-x py-10">
      <h1 className="flex items-center gap-2 text-3xl font-extrabold"><Lock className="size-6" aria-hidden /> Checkout</h1>
      <form noValidate onSubmit={submit} className="mt-8 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-8">
          <section>
            <h2 className="mb-4 text-xl font-extrabold">Delivery details</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {fieldsets.map(([n, l, t, ac]) => (
                <label key={n} className={`block ${n === "address" ? "sm:col-span-2" : ""}`}>
                  <span className="mb-1 block text-sm font-bold">{l}{n === "state" && <span className="font-normal text-muted"> (optional)</span>}</span>
                  <input name={n} type={t} autoComplete={ac} inputMode={n === "phone" || n === "pincode" ? "numeric" : undefined} className={input} aria-invalid={!!errors[n]} disabled={!!pending} />
                  {errors[n] && <span className="mt-1 block text-sm text-danger">{errors[n]}</span>}
                </label>
              ))}
            </div>
          </section>
          <section>
            <h2 className="mb-4 text-xl font-extrabold">Payment</h2>
            <div role="radiogroup" className="space-y-3">
              {([["online", "Pay online (UPI, cards, netbanking)", settings.shipping.prepaidExtra ? `Extra ${settings.shipping.prepaidExtra}% off` : ""], ["cod", "Cash on delivery", codBlocked ? s.quote("cod").codBlockedReason ?? "" : ""]] as const).map(([k, l, note]) => (
                <label key={k} className={`flex cursor-pointer items-center gap-3 rounded-md border-2 p-4 ${pay === k ? "border-ink bg-surface" : "border-line"} ${k === "cod" && codBlocked ? "cursor-not-allowed opacity-50" : ""}`}>
                  <input type="radio" name="pay" value={k} checked={pay === k} disabled={(k === "cod" && codBlocked) || !!pending} onChange={() => setPay(k)} className="size-4 accent-[var(--color-ink)]" />
                  <span className="flex-1 font-bold">{l}</span>
                  {note && <span className={`text-xs font-bold ${k === "online" ? "text-success" : "text-muted"}`}>{note}</span>}
                </label>
              ))}
            </div>
          </section>
        </div>

        <aside className="h-fit rounded-lg bg-surface p-6 lg:sticky lg:top-24">
          <h2 className="text-xl font-extrabold">Order summary</h2>
          <ul className="mt-4 space-y-3">
            {summary.lines.map((l) => (
              <li key={l.variantId} className="flex items-center gap-3">
                <span className="relative"><PackArt product={l.product} className="size-14 rounded-md" /><span className="absolute -right-2 -top-2 grid size-5 place-items-center rounded-full bg-ink text-[10px] font-bold text-on-ink">{l.qty}</span></span>
                <span className="flex-1 text-sm"><span className="line-clamp-1 font-bold">{l.product.title}</span><span className="text-muted">{l.variant.label}</span></span>
                <span className="text-sm font-bold">{inr(l.variant.price * l.qty)}</span>
              </li>
            ))}
            {s.membershipInCart && <li className="flex justify-between text-sm font-bold text-member"><span>Membership</span><span>{inr(summary.membershipFee)}</span></li>}
          </ul>
          <dl className="mt-5 space-y-2 border-t border-line pt-4 text-sm">
            <div className="flex justify-between"><dt>Subtotal</dt><dd>{inr(summary.saleTotal)}</dd></div>
            {summary.memberSaving > 0 && <div className="flex justify-between text-success"><dt>Member discount</dt><dd>−{inr(summary.memberSaving)}</dd></div>}
            {summary.couponSaving > 0 && <div className="flex justify-between text-success"><dt>Coupon {summary.coupon?.code}</dt><dd>−{inr(summary.couponSaving)}</dd></div>}
            {summary.prepaidSaving > 0 && <div className="flex justify-between text-success"><dt>Prepaid discount</dt><dd>−{inr(summary.prepaidSaving)}</dd></div>}
            <div className="flex justify-between"><dt>Shipping</dt><dd>{summary.shippingFee ? inr(summary.shippingFee) : "Free"}</dd></div>
            <div className="flex justify-between border-t border-line pt-3 text-lg font-extrabold"><dt>Total</dt><dd>{inr(summary.payable)}</dd></div>
          </dl>

          {problem && (
            <div role="alert" className="mt-4 flex gap-2 rounded-md border border-danger/40 bg-[#fdf1f1] p-3 text-sm text-danger">
              <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden />
              <div>
                <p className="font-bold">{problem.message}</p>
                {problem.items && <ul className="mt-1 list-disc pl-4">{problem.items.map((i) => <li key={i}>{i}</li>)}</ul>}
              </div>
            </div>
          )}

          {pending ? (
            <>
              <Button type="button" size="lg" className="mt-5 w-full" loading={busy} onClick={() => openRazorpay(pending)}>Pay {inr(pending.amount)}</Button>
              <button type="button" className="mt-2 w-full text-center text-sm text-muted hover:underline" onClick={() => { setPending(null); setProblem(null); }}>Change details or payment method</button>
            </>
          ) : (
            <Button size="lg" className="mt-5 w-full" loading={busy}>{pay === "online" ? `Pay ${inr(summary.payable)}` : `Place order · ${inr(summary.payable)}`}</Button>
          )}
          <p className="mt-2 text-center text-xs text-muted">Secure payments by Razorpay. Final amount is confirmed when you place the order.</p>
        </aside>
      </form>
    </div>
  );
}
