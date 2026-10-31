"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Mail, Phone } from "lucide-react";
import { benefitCollections, categoryCollections } from "@/data/collections";
import { contentPages, site } from "@/data/site";
import { useStore } from "@/lib/store";

function Newsletter() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const [err, setErr] = useState("");
  const { showToast } = useStore();
  return done ? (
    <p className="font-semibold text-on-ink">You are in. Watch your inbox for 10% off.</p>
  ) : (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        if (!/^\S+@\S+\.\S+$/.test(email)) return setErr("Enter a valid email address");
        setErr(""); setDone(true); showToast("Subscribed");
      }}
    >
      <label htmlFor="nl-email" className="sr-only">Email address</label>
      <div className="flex overflow-hidden rounded-full bg-white/10 focus-within:ring-2 focus-within:ring-accent">
        <input id="nl-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Your email" aria-invalid={!!err} aria-describedby={err ? "nl-err" : undefined} className="h-12 flex-1 bg-transparent px-5 text-on-ink placeholder:text-white/60 outline-none" />
        <button className="grid size-12 place-items-center bg-accent text-on-accent" aria-label="Subscribe"><ArrowRight className="size-5" aria-hidden /></button>
      </div>
      {err && <p id="nl-err" className="mt-2 text-sm text-[#ffb4b4]">{err}</p>}
    </form>
  );
}

export function Footer() {
  const about = Object.entries(contentPages).filter(([, p]) => p.group === "about");
  const policy = Object.entries(contentPages).filter(([, p]) => p.group === "policy");
  const cols = [
    { title: "Shop by category", links: categoryCollections.map((c) => ({ label: c.title.replace(" for Muscle Gain and Recovery", ""), href: `/collections/${c.handle}` })) },
    { title: "Shop by benefit", links: benefitCollections.map((c) => ({ label: c.title, href: `/collections/${c.handle}` })) },
    { title: "About us", links: [...about.map(([slug, p]) => ({ label: p.title, href: `/pages/${slug}` })), { label: "Journal", href: "/blogs/journal" }] },
    { title: "Quick links", links: [{ label: "Contact us", href: "/pages/contact-us" }, { label: "Track your order", href: site.trackingUrl }, ...policy.map(([slug, p]) => ({ label: p.title, href: `/pages/${slug}` }))] },
  ];
  return (
    <footer className="mt-20 bg-ink text-white/75">
      <div className="container-x grid gap-10 py-14 lg:grid-cols-[1.3fr_repeat(4,1fr)]">
        <div className="space-y-5">
          <p className="text-3xl font-extrabold tracking-[0.2em] text-on-ink">{site.short}</p>
          <p className="max-w-xs">{site.tagline}. Join the list for launches, offers and 10% off your first order.</p>
          <Newsletter />
          <div className="space-y-1 text-sm">
            <a href={`mailto:${site.email}`} className="flex items-center gap-2 hover:text-on-ink"><Mail className="size-4" aria-hidden />{site.email}</a>
            <a href={`tel:${site.phone.replace(/\s/g, "")}`} className="flex items-center gap-2 hover:text-on-ink"><Phone className="size-4" aria-hidden />{site.phone}</a>
          </div>
        </div>
        {cols.map((c) => (
          <div key={c.title}>
            <p className="mb-4 text-sm font-bold uppercase tracking-widest text-on-ink">{c.title}</p>
            <ul className="space-y-2 text-sm">
              {c.links.map((l) => <li key={l.href + l.label}><Link href={l.href} className="hover:text-on-ink hover:underline">{l.label}</Link></li>)}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-white/10">
        <div className="container-x flex flex-wrap items-center justify-between gap-4 py-6 text-sm">
          <p>© {new Date().getFullYear()} {site.name}. All rights reserved.</p>
          <ul className="flex gap-2">
            {site.socials.map((s) => (
              <li key={s.name}><a href={s.href} aria-label={s.name} className="grid size-9 place-items-center rounded-full border border-white/20 text-xs font-bold hover:bg-white hover:text-ink">{s.name.slice(0, 2)}</a></li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
