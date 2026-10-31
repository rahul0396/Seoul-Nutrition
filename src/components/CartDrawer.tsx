"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Check, ChevronDown, Gift, ShoppingCart, Tag, Trash2, Truck } from "lucide-react";
import { coupons, membership, shipping } from "@/data/site";
import { products } from "@/data/products";
import { couponDiscount, couponStatus, inr, memberPrice } from "@/lib/pricing";
import { useStore } from "@/lib/store";
import { PackArt } from "./PackArt";
import { Button, CloseButton, Overlay, QtyStepper } from "./ui";

function Milestones() {
  const { summary } = useStore();
  const { next, unlocked, max } = summary.milestone;
  const pct = max ? Math.min(100, (summary.items / max) * 100) : 0;
  return (
    <div className="rounded-md bg-surface p-4">
      <p className="flex items-center gap-2 text-sm font-bold">
        <Gift className="size-4 text-accent" aria-hidden />
        {next ? `Add ${next.items - summary.items} more ${next.items - summary.items === 1 ? "product" : "products"} to get: ${next.reward}` : "You unlocked every free gift"}
      </p>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-surface-2" role="progressbar" aria-valuemin={0} aria-valuemax={max} aria-valuenow={summary.items} aria-label="Free gift progress">
        <div className="h-full rounded-full bg-accent transition-all duration-500" style={{ width: `${pct}%` }} />
      </div>
      {unlocked.length > 0 && (
        <ul className="mt-2 space-y-1 text-xs font-semibold text-success">
          {unlocked.map((u) => <li key={u.items} className="flex items-center gap-1"><Check className="size-3.5" aria-hidden />{u.reward} added free</li>)}
        </ul>
      )}
    </div>
  );
}

function Coupons() {
  const { couponCode, applyCoupon, summary, showToast } = useStore();
  const [code, setCode] = useState("");
  const [err, setErr] = useState("");
  const base = summary.saleTotal - summary.memberSaving;
  const apply = (c: string) => {
    const hit = coupons.find((x) => x.code === c.trim().toUpperCase());
    if (!hit) return setErr("That code is not valid");
    const st = couponStatus(hit, base);
    if (!st.ok) return setErr(st.reason!);
    setErr(""); applyCoupon(hit.code); showToast(`${hit.code} applied`); setCode("");
  };
  return (
    <details className="rounded-md border border-line p-4" open={!couponCode}>
      <summary className="flex items-center justify-between font-bold">
        <span className="flex items-center gap-2"><Tag className="size-4" aria-hidden />{couponCode ? `${couponCode} applied, you save ${inr(summary.couponSaving)}` : "Apply a coupon"}</span>
        <ChevronDown className="size-4" aria-hidden />
      </summary>
      <form className="mt-3 flex gap-2" onSubmit={(e) => { e.preventDefault(); apply(code); }}>
        <label htmlFor="coupon" className="sr-only">Coupon code</label>
        <input id="coupon" value={code} onChange={(e) => setCode(e.target.value)} placeholder="Enter code" aria-invalid={!!err} className="h-10 flex-1 rounded-full border border-line-input px-4 text-sm uppercase outline-none focus:border-ink" />
        <Button size="sm" variant="outline">Apply</Button>
      </form>
      {err && <p className="mt-2 text-sm text-danger" role="alert">{err}</p>}
      <ul className="mt-3 space-y-2">
        {coupons.map((c) => {
          const st = couponStatus(c, base);
          const on = couponCode === c.code;
          return (
            <li key={c.code} className={`flex items-center justify-between gap-3 rounded-md border border-dashed p-3 text-sm ${on ? "border-success bg-[#eef7f1]" : "border-line-input"}`}>
              <div>
                <p className="font-extrabold tracking-wide">{c.code}</p>
                <p className="text-muted">{c.description}</p>
                {st.ok && !on && <p className="text-xs font-semibold text-success">You save {inr(couponDiscount(c, base))}</p>}
                {!st.ok && <p className="text-xs font-semibold text-warning">{st.reason}</p>}
              </div>
              {on ? (
                <button onClick={() => applyCoupon(undefined)} className="text-xs font-bold text-danger hover:underline">Remove</button>
              ) : (
                <button onClick={() => apply(c.code)} disabled={!st.ok} className="text-xs font-bold text-accent hover:underline disabled:text-muted disabled:no-underline">Apply</button>
              )}
            </li>
          );
        })}
      </ul>
    </details>
  );
}

export function CartDrawer() {
  const s = useStore();
  const { summary } = s;
  const router = useRouter();
  const [breakup, setBreakup] = useState(false);
  const memberActive = !!s.user?.isMember || s.membershipInCart;
  const recos = products.filter((p) => !summary.lines.some((l) => l.product.id === p.id) && p.variants[0].stock > 0).slice(0, 2);

  return (
    <Overlay open={s.cartOpen} onClose={() => s.setCartOpen(false)} label="Cart">
      <div className="flex items-center justify-between border-b border-line px-4 py-3">
        <p className="text-lg font-extrabold">Your cart {summary.items > 0 && <span className="text-muted">({summary.items})</span>}</p>
        <CloseButton onClick={() => s.setCartOpen(false)} label="Close cart" />
      </div>

      {summary.items === 0 && !s.membershipInCart ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
          <span className="grid size-20 place-items-center rounded-full bg-surface"><ShoppingCart className="size-8" aria-hidden /></span>
          <p className="text-lg font-bold">Your cart is empty</p>
          <p className="text-muted">Start with our best sellers.</p>
          <Button onClick={() => { s.setCartOpen(false); router.push("/collections/shop-all"); }}>Shop all products</Button>
        </div>
      ) : (
        <>
          <div className="flex-1 space-y-4 overflow-y-auto p-4">
            <Milestones />
            <p className="flex items-center gap-2 text-sm font-semibold">
              <Truck className="size-4" aria-hidden />
              {summary.shippingFee === 0 ? "You get free shipping" : `Add ${inr(shipping.freeAbove - (summary.total - summary.shippingFee - summary.membershipFee))} more for free shipping`}
            </p>
            <ul className="divide-y divide-line">
              {summary.lines.map((l) => (
                <li key={l.variantId} className="flex gap-3 py-4">
                  <Link href={`/products/${l.product.handle}`} onClick={() => s.setCartOpen(false)} className="shrink-0">
                    <PackArt product={l.product} className="size-20 rounded-md" />
                  </Link>
                  <div className="flex flex-1 flex-col gap-2">
                    <div className="flex justify-between gap-2">
                      <p className="line-clamp-2 text-sm font-bold">{l.product.title}</p>
                      <button onClick={() => s.remove(l.variantId)} aria-label={`Remove ${l.product.title}`} className="grid size-8 shrink-0 place-items-center rounded-full text-muted hover:bg-surface hover:text-danger"><Trash2 className="size-4" aria-hidden /></button>
                    </div>
                    <p className="text-xs text-muted">{l.variant.label}</p>
                    <div className="flex items-center justify-between">
                      <QtyStepper value={l.qty} onChange={(n) => s.setQty(l.variantId, n)} max={Math.max(1, l.variant.stock)} />
                      <div className="text-right">
                        <p className="font-extrabold">{inr((memberActive ? memberPrice(l.variant.price) : l.variant.price) * l.qty)}</p>
                        <p className="text-xs text-muted line-through">{inr(l.variant.mrp * l.qty)}</p>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <div className={`rounded-md p-4 ${s.membershipInCart || s.user?.isMember ? "bg-[#e9f3ef]" : "border border-member"}`}>
              {s.user?.isMember ? (
                <p className="text-sm font-bold text-member">Member prices applied</p>
              ) : s.membershipInCart ? (
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-bold text-member">Membership ({membership.months} months) added · {inr(membership.price)}</p>
                  <button onClick={() => s.setMembershipInCart(false)} className="text-xs font-bold text-danger hover:underline">Remove</button>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm"><span className="font-bold text-member">Save {inr(Math.max(0, summary.saleTotal - summary.lines.reduce((a, l) => a + memberPrice(l.variant.price) * l.qty, 0)))} more</span> with membership for {inr(membership.price)}</p>
                  <Button size="sm" variant="member" onClick={() => s.setMembershipInCart(true)}>Join</Button>
                </div>
              )}
            </div>

            <Coupons />

            {recos.length > 0 && (
              <div>
                <p className="mb-2 text-sm font-bold">Pairs well with</p>
                <div className="grid grid-cols-2 gap-3">
                  {recos.map((p) => (
                    <div key={p.id} className="rounded-md border border-line p-2">
                      <PackArt product={p} className="aspect-square w-full rounded-md" />
                      <p className="mt-2 line-clamp-2 text-xs font-bold">{p.title}</p>
                      <div className="mt-1 flex items-center justify-between">
                        <span className="text-sm font-extrabold">{inr(p.variants[0].price)}</span>
                        <button onClick={() => { s.add(p.variants[0].id); s.showToast("Added to cart"); }} className="text-xs font-bold text-accent hover:underline">+ Add</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-line p-4">
            <button onClick={() => setBreakup((b) => !b)} aria-expanded={breakup} className="mb-2 flex w-full items-center justify-between text-sm font-bold">
              Billing summary <ChevronDown className={`size-4 transition ${breakup ? "rotate-180" : ""}`} aria-hidden />
            </button>
            {breakup && (
              <dl className="mb-3 space-y-1 text-sm animate-pop">
                <div className="flex justify-between"><dt className="text-muted">MRP total</dt><dd>{inr(summary.mrpTotal)}</dd></div>
                <div className="flex justify-between"><dt className="text-muted">Discount on MRP</dt><dd className="text-success">−{inr(summary.mrpSaving)}</dd></div>
                {summary.memberSaving > 0 && <div className="flex justify-between"><dt className="text-muted">Member discount</dt><dd className="text-success">−{inr(summary.memberSaving)}</dd></div>}
                {summary.couponSaving > 0 && <div className="flex justify-between"><dt className="text-muted">Coupon {summary.coupon?.code}</dt><dd className="text-success">−{inr(summary.couponSaving)}</dd></div>}
                {summary.membershipFee > 0 && <div className="flex justify-between"><dt className="text-muted">Membership</dt><dd>{inr(summary.membershipFee)}</dd></div>}
                <div className="flex justify-between"><dt className="text-muted">Shipping</dt><dd>{summary.shippingFee ? inr(summary.shippingFee) : "Free"}</dd></div>
              </dl>
            )}
            {summary.totalSaving > 0 && <p className="mb-2 rounded-md bg-[#eef7f1] px-3 py-2 text-sm font-bold text-success">You are saving {inr(summary.totalSaving)} on this order</p>}
            <Button size="lg" className="w-full" onClick={() => { s.setCartOpen(false); router.push("/checkout"); }}>
              Checkout · {inr(summary.total)}
            </Button>
            <p className="mt-2 text-center text-xs text-muted">Extra {shipping.prepaidExtra}% off when you pay online</p>
          </div>
        </>
      )}
    </Overlay>
  );
}
