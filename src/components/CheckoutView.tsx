"use client";

import Link from "next/link";
import { useState } from "react";
import { CheckCircle2, Lock } from "lucide-react";
import { shipping } from "@/data/site";
import { inr } from "@/lib/pricing";
import { useStore } from "@/lib/store";
import { PackArt } from "./PackArt";
import { Button } from "./ui";

// Demo checkout. In the backend step this posts the cart to your server,
// creates a Razorpay order, opens Razorpay Checkout, and verifies the payment
// signature on the server before marking the order paid.

const input = "h-12 w-full rounded-md border border-line-input px-4 outline-none focus:border-ink aria-[invalid=true]:border-danger";

export function CheckoutView() {
  const s = useStore();
  const { summary } = s;
  const [pay, setPay] = useState<"online" | "cod">("online");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [placed, setPlaced] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const prepaidOff = pay === "online" ? Math.round(((summary.total - summary.shippingFee - summary.membershipFee) * shipping.prepaidExtra) / 100) : 0;
  const grand = summary.total - prepaidOff;
  const codBlocked = s.membershipInCart;

  if (!s.ready) return <div className="container-x min-h-[60vh] py-16" />;

  if (placed) {
    return (
      <div className="container-x grid min-h-[60vh] place-items-center py-16 text-center">
        <div className="animate-pop">
          <CheckCircle2 className="mx-auto size-16 text-success" aria-hidden />
          <h1 className="mt-4 text-3xl font-extrabold">Order placed</h1>
          <p className="mt-2 text-muted">Order {placed}. This is a demo; no payment was taken.</p>
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

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const err: Record<string, string> = {};
    if (!String(f.get("name") || "").trim()) err.name = "Enter your full name";
    if (!/^[6-9]\d{9}$/.test(String(f.get("phone") || ""))) err.phone = "Enter a 10 digit mobile number";
    if (!/^\S+@\S+\.\S+$/.test(String(f.get("email") || ""))) err.email = "Enter a valid email";
    if (!String(f.get("address") || "").trim()) err.address = "Enter your address";
    if (!String(f.get("city") || "").trim()) err.city = "Enter your city";
    if (!/^\d{6}$/.test(String(f.get("pincode") || ""))) err.pincode = "Enter a 6 digit pincode";
    setErrors(err);
    if (Object.keys(err).length) return;
    setBusy(true);
    setTimeout(() => {
      setPlaced("SN" + Math.floor(100000 + Math.random() * 899999));
      s.clear();
      setBusy(false);
    }, 900);
  };

  const fieldsets: [string, string, string, string?][] = [
    ["name", "Full name", "text", "name"], ["phone", "Mobile number", "tel", "tel-national"], ["email", "Email", "email", "email"],
    ["address", "House, street, area", "text", "street-address"], ["city", "City", "text", "address-level2"], ["pincode", "Pincode", "text", "postal-code"],
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
                  <span className="mb-1 block text-sm font-bold">{l}</span>
                  <input name={n} type={t} autoComplete={ac} inputMode={n === "phone" || n === "pincode" ? "numeric" : undefined} className={input} aria-invalid={!!errors[n]} />
                  {errors[n] && <span className="mt-1 block text-sm text-danger">{errors[n]}</span>}
                </label>
              ))}
            </div>
          </section>
          <section>
            <h2 className="mb-4 text-xl font-extrabold">Payment</h2>
            <div role="radiogroup" className="space-y-3">
              {([["online", "Pay online (UPI, cards, netbanking)", `Extra ${shipping.prepaidExtra}% off`], ["cod", "Cash on delivery", codBlocked ? "Not available with membership" : ""]] as const).map(([k, l, note]) => (
                <label key={k} className={`flex cursor-pointer items-center gap-3 rounded-md border-2 p-4 ${pay === k ? "border-ink bg-surface" : "border-line"} ${k === "cod" && codBlocked ? "cursor-not-allowed opacity-50" : ""}`}>
                  <input type="radio" name="pay" value={k} checked={pay === k} disabled={k === "cod" && codBlocked} onChange={() => setPay(k)} className="size-4 accent-[var(--color-ink)]" />
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
            {prepaidOff > 0 && <div className="flex justify-between text-success"><dt>Prepaid discount</dt><dd>−{inr(prepaidOff)}</dd></div>}
            <div className="flex justify-between"><dt>Shipping</dt><dd>{summary.shippingFee ? inr(summary.shippingFee) : "Free"}</dd></div>
            <div className="flex justify-between border-t border-line pt-3 text-lg font-extrabold"><dt>Total</dt><dd>{inr(grand)}</dd></div>
          </dl>
          <Button size="lg" className="mt-5 w-full" loading={busy}>{pay === "online" ? `Pay ${inr(grand)}` : `Place order · ${inr(grand)}`}</Button>
          <p className="mt-2 text-center text-xs text-muted">Demo checkout. Payments are connected in the backend step.</p>
        </aside>
      </form>
    </div>
  );
}
