"use client";

import { useEffect, useState } from "react";
import { Bell, CheckCircle2, Gift } from "lucide-react";
import { useStore } from "@/lib/store";
import { Button, CloseButton, Overlay } from "./ui";

const field = "h-12 w-full rounded-full border border-line-input px-5 outline-none focus:border-ink aria-[invalid=true]:border-danger";

export function NotifyMeModal() {
  const { notifyFor, setNotifyFor, showToast } = useStore();
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [err, setErr] = useState<{ email?: string; phone?: string }>({});
  const [done, setDone] = useState(false);
  const close = () => { setNotifyFor(null); setDone(false); setErr({}); };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const next: typeof err = {};
    if (!/^\S+@\S+\.\S+$/.test(email)) next.email = "Enter a valid email address";
    if (phone && !/^[6-9]\d{9}$/.test(phone.replace(/\D/g, "").slice(-10))) next.phone = "Enter a 10 digit mobile number";
    setErr(next);
    if (Object.keys(next).length) return;
    // Hook up: POST { product: notifyFor, email, phone } to your back-in-stock endpoint.
    setDone(true);
    showToast("We will let you know");
  };

  return (
    <Overlay open={!!notifyFor} onClose={close} side="center" label="Notify me when back in stock">
      <div className="flex items-start justify-between p-5 pb-0">
        <span className="grid size-12 place-items-center rounded-full bg-accent-soft text-accent"><Bell className="size-5" aria-hidden /></span>
        <CloseButton onClick={close} />
      </div>
      {done ? (
        <div className="p-6 pt-3 text-center">
          <CheckCircle2 className="mx-auto size-12 text-success" aria-hidden />
          <p className="mt-3 text-xl font-extrabold">You are on the list</p>
          <p className="mt-1 text-muted">We will email you as soon as {notifyFor} is back.</p>
          <Button className="mt-5 w-full" onClick={close}>Continue shopping</Button>
        </div>
      ) : (
        <form noValidate onSubmit={submit} className="space-y-3 p-6 pt-3">
          <h2 className="text-xl font-extrabold">Keep me posted</h2>
          <p className="text-sm text-muted">{notifyFor} is sold out. Leave your details and we will tell you the moment it is back.</p>
          <div>
            <label htmlFor="nm-email" className="mb-1 block text-sm font-bold">Email</label>
            <input id="nm-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} aria-invalid={!!err.email} className={field} />
            {err.email && <p className="mt-1 text-sm text-danger">{err.email}</p>}
          </div>
          <div>
            <label htmlFor="nm-phone" className="mb-1 block text-sm font-bold">Mobile (optional)</label>
            <input id="nm-phone" type="tel" inputMode="numeric" value={phone} onChange={(e) => setPhone(e.target.value)} aria-invalid={!!err.phone} className={field} />
            {err.phone && <p className="mt-1 text-sm text-danger">{err.phone}</p>}
          </div>
          <Button size="lg" className="w-full">Notify me</Button>
        </form>
      )}
    </Overlay>
  );
}

const POPUP_KEY = "seoul-signup-popup";

export function SignupPopup() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  useEffect(() => {
    let seen = "1";
    try { seen = window.localStorage.getItem(POPUP_KEY) ?? ""; } catch { /* ignore */ }
    if (seen || navigator.webdriver) return;
    const t = setTimeout(() => setOpen(true), 12000);
    return () => clearTimeout(t);
  }, []);
  const close = () => { setOpen(false); try { window.localStorage.setItem(POPUP_KEY, "1"); } catch { /* ignore */ } };
  return (
    <Overlay open={open} onClose={close} side="center" label="Get 10% off">
      <div className="grid md:grid-cols-[1fr_1.2fr]">
        <div className="hidden place-items-center bg-accent p-6 text-on-accent md:grid">
          <div className="text-center"><Gift className="mx-auto size-14 animate-float" aria-hidden /><p className="mt-3 text-4xl font-extrabold">10%</p><p className="font-bold">OFF</p></div>
        </div>
        <div className="p-6">
          <div className="flex justify-end"><CloseButton onClick={close} /></div>
          {done ? (
            <><p className="text-2xl font-extrabold">Your code: SEOUL10</p><p className="mt-2 text-muted">Use it at checkout on your first order.</p><Button className="mt-5 w-full" onClick={close}>Start shopping</Button></>
          ) : (
            <form noValidate onSubmit={(e) => { e.preventDefault(); if (/^\S+@\S+\.\S+$/.test(email)) setDone(true); }} className="space-y-3">
              <p className="text-2xl font-extrabold">Get 10% off your first order</p>
              <p className="text-sm text-muted">Join the list for launches and member-only offers.</p>
              <label htmlFor="sp-email" className="sr-only">Email</label>
              <input id="sp-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Your email" className={field} />
              <Button size="lg" variant="accent" className="w-full">Unlock 10% off</Button>
              <button type="button" onClick={close} className="w-full text-sm text-muted hover:underline">No thanks</button>
            </form>
          )}
        </div>
      </div>
    </Overlay>
  );
}

export function Toast() {
  const { toast } = useStore();
  return (
    <div role="status" aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-6 z-[70] flex justify-center px-4">
      {toast && <p key={toast} className="animate-pop rounded-full bg-ink px-5 py-3 text-sm font-bold text-on-ink shadow-pop">{toast}</p>}
    </div>
  );
}
