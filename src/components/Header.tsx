"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, Heart, Menu, Pause, Play, Search, ShoppingCart, User } from "lucide-react";
import { announcements, nav, site, trending } from "@/data/site";
import { benefitCollections, collections, getCollection } from "@/data/collections";
import { products } from "@/data/products";
import { useStore } from "@/lib/store";
import { inr } from "@/lib/pricing";
import { Icon } from "./Icon";
import { PackArt } from "./PackArt";
import { CloseButton, Overlay } from "./ui";

function AnnouncementBar() {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setI((x) => (x + 1) % announcements.length), 4000);
    return () => clearInterval(t);
  }, [paused]);
  const a = announcements[i];
  return (
    <div className="bg-ink text-on-ink">
      <div className="container-x flex h-9 items-center justify-center gap-3 text-xs font-semibold md:text-sm">
        <Link key={i} href={a.href} className="animate-fade-up truncate hover:underline">{a.text}</Link>
        <button onClick={() => setPaused((p) => !p)} aria-pressed={paused} aria-label={paused ? "Play announcements" : "Pause announcements"} className="grid size-6 shrink-0 place-items-center rounded-full hover:bg-white/15">
          {paused ? <Play className="size-3" aria-hidden /> : <Pause className="size-3" aria-hidden />}
        </button>
      </div>
    </div>
  );
}

function Logo() {
  return (
    <Link href="/" className="flex items-baseline gap-1.5" aria-label={`${site.name} home`}>
      <span className="text-2xl font-extrabold tracking-[0.2em]">{site.short}</span>
      <span className="hidden text-[10px] font-bold uppercase tracking-[0.3em] text-accent sm:inline">Nutrition</span>
    </Link>
  );
}

type MenuKey = "shop" | "benefits" | "categories" | "world" | null;

function MegaMenu({ open, onClose }: { open: MenuKey; onClose: () => void }) {
  if (!open) return null;
  return (
    <div className="absolute inset-x-0 top-full z-40 border-t border-line bg-bg shadow-pop animate-pop" onMouseLeave={onClose}>
      <div className="container-x grid gap-8 py-8 md:grid-cols-4">
        {open === "benefits" && benefitCollections.map((c) => (
          <Link key={c.handle} href={`/collections/${c.handle}`} onClick={onClose} className="flex items-center gap-3 rounded-md p-2 font-semibold hover:bg-surface">
            <span className="grid size-10 place-items-center rounded-full bg-surface"><Icon name={c.icon} className="size-5" /></span>
            {c.title}
          </Link>
        ))}
        {open === "categories" && nav.categories.map((g) => (
          <div key={g.title}>
            <p className="mb-3 text-xs font-bold uppercase tracking-widest text-muted">{g.title}</p>
            <ul className="space-y-2">
              {g.links.map((h) => (
                <li key={h}><Link href={`/collections/${h}`} onClick={onClose} className="font-semibold hover:text-accent">{getCollection(h)?.title.replace(" for Muscle Gain and Recovery", "")}</Link></li>
              ))}
            </ul>
          </div>
        ))}
        {open === "world" && nav.world.map((l) => (
          <Link key={l.href} href={l.href} onClick={onClose} className="rounded-md bg-surface p-5 font-bold transition hover:-translate-y-0.5 hover:shadow-card">{l.label}</Link>
        ))}
        {open === "shop" && (
          <>
            <div className="md:col-span-1">
              <p className="mb-3 text-xs font-bold uppercase tracking-widest text-muted">Collections</p>
              <ul className="space-y-2">
                {["shop-all", "new-launch", "whey-protein", "creatine"].map((h) => (
                  <li key={h}><Link href={`/collections/${h}`} onClick={onClose} className="font-semibold hover:text-accent">{getCollection(h)?.title.replace(" for Muscle Gain and Recovery", "")}</Link></li>
                ))}
              </ul>
            </div>
            {products.slice(0, 3).map((p) => (
              <Link key={p.id} href={`/products/${p.handle}`} onClick={onClose} className="group rounded-md bg-surface p-3">
                <PackArt product={p} className="aspect-[4/3] w-full rounded-md transition group-hover:scale-[1.02]" />
                <p className="mt-2 line-clamp-1 text-sm font-bold">{p.title}</p>
                <p className="text-sm text-muted">From {inr(p.variants[0].price)}</p>
              </Link>
            ))}
          </>
        )}
      </div>
    </div>
  );
}

function SearchPanel({ onClose }: { onClose: () => void }) {
  const [q, setQ] = useState("");
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  useEffect(() => input.current?.focus(), []);
  const results = useMemo(() => searchProducts(q).slice(0, 6), [q]);
  const go = (term: string) => { onClose(); router.push(`/search?q=${encodeURIComponent(term)}`); };
  return (
    <div className="flex h-full flex-col">
      <form className="flex items-center gap-2 border-b border-line p-4" onSubmit={(e) => { e.preventDefault(); if (q.trim()) go(q.trim()); }} role="search">
        <Search className="size-5 text-muted" aria-hidden />
        <label htmlFor="site-search" className="sr-only">Search products</label>
        <input id="site-search" ref={input} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search whey, creatine, magnesium…" className="h-11 flex-1 bg-transparent text-lg outline-none" />
        <CloseButton onClick={onClose} />
      </form>
      <div className="flex-1 overflow-y-auto p-4">
        {!q && (
          <>
            <p className="mb-3 text-xs font-bold uppercase tracking-widest text-muted">Trending</p>
            <div className="flex flex-wrap gap-2">
              {trending.map((t) => <button key={t} onClick={() => go(t)} className="rounded-full border border-line px-4 py-2 text-sm font-semibold hover:border-ink">{t}</button>)}
            </div>
          </>
        )}
        {q && results.length === 0 && <p className="text-muted">No products match “{q}”. Try “whey” or “creatine”.</p>}
        <ul className="grid gap-2">
          {results.map((p) => (
            <li key={p.id}>
              <Link href={`/products/${p.handle}`} onClick={onClose} className="flex items-center gap-3 rounded-md p-2 hover:bg-surface">
                <PackArt product={p} className="size-16 shrink-0 rounded-md" />
                <span className="flex-1"><span className="line-clamp-1 font-bold">{p.title}</span><span className="text-sm text-muted">From {inr(p.variants[0].price)}</span></span>
              </Link>
            </li>
          ))}
        </ul>
        {q && results.length > 0 && <button onClick={() => go(q)} className="mt-4 font-bold text-accent hover:underline">See all results for “{q}”</button>}
      </div>
    </div>
  );
}

export function searchProducts(q: string) {
  const t = q.trim().toLowerCase();
  if (!t) return [];
  const words = t.split(/\s+/);
  return products.filter((p) => {
    const hay = [p.title, p.subtitle, p.label, ...p.categories, ...p.benefits].join(" ").toLowerCase();
    return words.every((w) => hay.includes(w));
  });
}

function MobileNav({ onClose }: { onClose: () => void }) {
  const groups = [
    { title: "Shop by benefit", links: benefitCollections.map((c) => ({ label: c.title, href: `/collections/${c.handle}` })) },
    { title: "Shop by category", links: collections.filter((c) => c.group === "category").map((c) => ({ label: c.title.replace(" for Muscle Gain and Recovery", ""), href: `/collections/${c.handle}` })) },
    { title: "World of Seoul", links: nav.world },
  ];
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-line p-4"><Logo /><CloseButton onClick={onClose} label="Close menu" /></div>
      <nav className="flex-1 overflow-y-auto p-4" aria-label="Mobile">
        <Link href="/collections/shop-all" onClick={onClose} className="block py-3 text-lg font-extrabold">Shop all</Link>
        {groups.map((g) => (
          <details key={g.title} className="border-t border-line py-3">
            <summary className="flex items-center justify-between text-lg font-extrabold">{g.title}<ChevronDown className="size-5" aria-hidden /></summary>
            <ul className="mt-2 space-y-1 pl-1">
              {g.links.map((l) => <li key={l.href}><Link href={l.href} onClick={onClose} className="block py-2 font-semibold text-muted hover:text-ink">{l.label}</Link></li>)}
            </ul>
          </details>
        ))}
        <div className="border-t border-line pt-3">
          {nav.extra.map((l) => <Link key={l.href} href={l.href} onClick={onClose} className="block py-2 font-bold">{l.label}</Link>)}
          <Link href="/account" onClick={onClose} className="block py-2 font-bold">My account</Link>
        </div>
      </nav>
    </div>
  );
}

export function Header() {
  const { summary, setCartOpen, wishlist, ready } = useStore();
  const [menu, setMenu] = useState<MenuKey>(null);
  const [search, setSearch] = useState(false);
  const [mobile, setMobile] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 8);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  const tabs: { key: Exclude<MenuKey, null>; label: string }[] = [
    { key: "shop", label: "Shop all" },
    { key: "benefits", label: "Benefits" },
    { key: "categories", label: "Categories" },
    { key: "world", label: "World of Seoul" },
  ];

  return (
    <>
      <AnnouncementBar />
      <header className={`sticky top-0 z-50 bg-bg/95 backdrop-blur transition-shadow ${scrolled ? "shadow-card" : ""}`}>
        <div className="container-x relative flex h-16 items-center gap-4 md:h-[72px]">
          <button className="grid size-10 place-items-center rounded-full hover:bg-surface lg:hidden" aria-label="Open menu" onClick={() => setMobile(true)}>
            <Menu className="size-5" aria-hidden />
          </button>
          <Logo />
          <nav className="ml-4 hidden h-full items-center gap-0.5 lg:flex" aria-label="Main">
            {tabs.map((t) => (
              <button
                key={t.key}
                onMouseEnter={() => setMenu(t.key)}
                onFocus={() => setMenu(t.key)}
                onClick={() => setMenu((m) => (m === t.key ? null : t.key))}
                aria-expanded={menu === t.key}
                className={`flex h-10 items-center gap-1 whitespace-nowrap rounded-full px-3 text-sm font-bold transition ${menu === t.key ? "bg-surface" : "hover:bg-surface"}`}
              >
                {t.label}<ChevronDown className={`size-4 transition ${menu === t.key ? "rotate-180" : ""}`} aria-hidden />
              </button>
            ))}
            {nav.extra.slice(0, 2).map((l) => (
              <Link key={l.href} href={l.href} onMouseEnter={() => setMenu(null)} className="hidden h-10 items-center whitespace-nowrap rounded-full px-3 text-sm font-bold hover:bg-surface xl:flex">{l.label}</Link>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-1">
            <button onClick={() => setSearch(true)} className="flex h-10 items-center gap-2 rounded-full px-3 hover:bg-surface md:border md:border-line md:pr-10" aria-label="Search">
              <Search className="size-5" aria-hidden /><span className="hidden text-sm text-muted md:inline">Search</span>
            </button>
            <Link href="/account" className="hidden size-10 place-items-center rounded-full hover:bg-surface sm:grid" aria-label="Account"><User className="size-5" aria-hidden /></Link>
            <Link href="/pages/wishlist" className="relative hidden size-10 place-items-center rounded-full hover:bg-surface sm:grid" aria-label={`Wishlist, ${wishlist.length} items`}>
              <Heart className="size-5" aria-hidden />
              {ready && wishlist.length > 0 && <span className="absolute right-1 top-1 grid size-4 place-items-center rounded-full bg-ink text-[10px] font-bold text-on-ink">{wishlist.length}</span>}
            </Link>
            <button onClick={() => setCartOpen(true)} className="relative grid size-10 place-items-center rounded-full hover:bg-surface" aria-label={`Cart, ${summary.items} items`}>
              <ShoppingCart className="size-5" aria-hidden />
              {ready && summary.items > 0 && <span key={summary.items} className="absolute right-0.5 top-0.5 grid size-5 place-items-center rounded-full bg-accent text-[11px] font-bold text-on-accent animate-pop">{summary.items}</span>}
            </button>
          </div>
          <MegaMenu open={menu} onClose={() => setMenu(null)} />
        </div>
      </header>
      <Overlay open={search} onClose={() => setSearch(false)} side="right" label="Search" width="w-full max-w-[560px]">
        <SearchPanel onClose={() => setSearch(false)} />
      </Overlay>
      <Overlay open={mobile} onClose={() => setMobile(false)} side="left" label="Menu" width="w-[88vw] max-w-[380px]">
        <MobileNav onClose={() => setMobile(false)} />
      </Overlay>
    </>
  );
}
