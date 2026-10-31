"use client";

import Link from "next/link";
import { useState } from "react";
import { LogOut, Package } from "lucide-react";
import { membership, site } from "@/data/site";
import { useStore } from "@/lib/store";
import { Button } from "./ui";

// Demo login: any 10-digit mobile and the OTP 123456. Replace with your auth
// provider (for example MSG91 or Firebase phone auth) in the backend step.

export function AccountView() {
  const { user, signIn, signOut, ready } = useStore();
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [err, setErr] = useState("");

  if (!ready) return <div className="container-x min-h-[50vh] py-16" />;

  if (!user) {
    return (
      <div className="container-x grid min-h-[60vh] place-items-center py-16">
        <div className="w-full max-w-md rounded-lg border border-line p-8 shadow-card animate-pop">
          <h1 className="text-2xl font-extrabold">{step === "phone" ? "Log in or sign up" : "Enter the OTP"}</h1>
          <p className="mt-1 text-muted">{step === "phone" ? "We will send a one-time password to your mobile." : `Sent to +91 ${phone}. Demo OTP: 123456`}</p>
          <form
            noValidate
            className="mt-6 space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              if (step === "phone") {
                if (!/^[6-9]\d{9}$/.test(phone)) return setErr("Enter a valid 10 digit mobile number");
                setErr(""); setStep("otp");
              } else {
                if (otp !== "123456") return setErr("That OTP is not right");
                setErr(""); signIn({ name: "Customer", phone, isMember: false });
              }
            }}
          >
            {step === "phone" ? (
              <label className="block"><span className="mb-1 block text-sm font-bold">Mobile number</span>
                <span className="flex h-12 items-center rounded-full border border-line-input px-5 focus-within:border-ink"><span className="mr-2 font-semibold text-muted">+91</span>
                  <input inputMode="numeric" autoComplete="tel-national" maxLength={10} value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))} aria-invalid={!!err} className="flex-1 bg-transparent outline-none" />
                </span>
              </label>
            ) : (
              <label className="block"><span className="mb-1 block text-sm font-bold">OTP</span>
                <input inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))} aria-invalid={!!err} className="h-12 w-full rounded-full border border-line-input px-5 text-center text-lg tracking-[0.5em] outline-none focus:border-ink" />
              </label>
            )}
            {err && <p className="text-sm text-danger" role="alert">{err}</p>}
            <Button size="lg" className="w-full">{step === "phone" ? "Send OTP" : "Verify and continue"}</Button>
            {step === "otp" && <button type="button" onClick={() => setStep("phone")} className="w-full text-sm font-semibold text-muted hover:underline">Change number</button>}
          </form>
          <p className="mt-6 text-xs text-muted">By continuing you agree to our <Link href="/pages/terms-and-conditions" className="underline">terms</Link> and <Link href="/pages/privacy-policy" className="underline">privacy policy</Link>.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-x py-12">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div><h1 className="text-3xl font-extrabold">Hi, {user.name}</h1><p className="text-muted">+91 {user.phone}</p></div>
        <Button variant="outline" onClick={signOut}><LogOut className="size-4" aria-hidden /> Log out</Button>
      </div>
      <div className="mt-8 grid gap-6 lg:grid-cols-[2fr_1fr]">
        <section className="rounded-lg border border-line p-6">
          <h2 className="text-xl font-extrabold">Order history</h2>
          <div className="mt-6 flex flex-col items-center gap-3 py-10 text-center">
            <Package className="size-10 text-muted" aria-hidden />
            <p className="font-bold">No orders yet</p>
            <p className="text-sm text-muted">Orders appear here once checkout is connected to your backend.</p>
            <Link href="/collections/shop-all" className="mt-2 font-bold text-accent hover:underline">Start shopping</Link>
          </div>
        </section>
        <aside className="space-y-4">
          <div className="rounded-lg bg-[#e9f3ef] p-6">
            <p className="font-extrabold text-member">{user.isMember ? "You are a member" : "Become a member"}</p>
            <p className="mt-1 text-sm">{user.isMember ? `Member prices are on.` : `${membership.discount}% off everything for ${membership.months} months.`}</p>
            {!user.isMember && <Link href="/pages/membership-access" className="mt-3 inline-block font-bold text-member underline">See membership</Link>}
          </div>
          <div className="rounded-lg border border-line p-6 text-sm">
            <p className="font-bold">Need help?</p>
            <p className="mt-1 text-muted">{site.email}<br />{site.phone}<br />{site.hours}</p>
            <a href={site.trackingUrl} className="mt-3 inline-block font-bold underline">Track an order</a>
          </div>
        </aside>
      </div>
    </div>
  );
}
