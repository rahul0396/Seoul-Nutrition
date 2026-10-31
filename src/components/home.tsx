"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Pause, Play, Quote, Volume2, VolumeX } from "lucide-react";
import { healthTabs, heroSlides, saleEndsAt } from "@/data/site";
import { products } from "@/data/products";
import type { Product } from "@/data/types";
import { useStore } from "@/lib/store";
import { inr } from "@/lib/pricing";
import { PackArt } from "./PackArt";
import { ProductCard, PackPills } from "./ProductCard";
import { Button, CloseButton, Overlay, PriceBlock } from "./ui";

export function Countdown({ to, dark = true }: { to: string; dark?: boolean }) {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  if (now === null) return <div className="h-14" aria-hidden />;
  const ms = Math.max(0, new Date(to).getTime() - now);
  if (ms === 0) return <p className="font-bold">Sale ended</p>;
  const parts = [
    ["Days", Math.floor(ms / 864e5)],
    ["Hrs", Math.floor(ms / 36e5) % 24],
    ["Min", Math.floor(ms / 6e4) % 60],
    ["Sec", Math.floor(ms / 1e3) % 60],
  ] as const;
  return (
    <div className="flex gap-2" aria-label="Time left in the sale" role="timer">
      {parts.map(([l, n]) => (
        <div key={l} className={`grid w-14 place-items-center rounded-md py-1.5 ${dark ? "bg-white/15 text-white" : "bg-surface"}`}>
          <span className="text-xl font-extrabold tabular-nums">{String(n).padStart(2, "0")}</span>
          <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">{l}</span>
        </div>
      ))}
    </div>
  );
}

export function HeroSlider() {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const n = heroSlides.length;
  useEffect(() => {
    if (paused || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => setI((x) => (x + 1) % n), 5000);
    return () => clearInterval(t);
  }, [paused, n]);
  const art = [products[0], products[2], products[6]];

  return (
    <section aria-roledescription="carousel" aria-label="Featured" className="relative overflow-hidden" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <div className="flex transition-transform duration-700 ease-[var(--ease-brand)]" style={{ transform: `translateX(-${i * 100}%)` }}>
        {heroSlides.map((s, k) => (
          <div key={k} className="w-full shrink-0" aria-roledescription="slide" aria-label={`${k + 1} of ${n}`} aria-hidden={k !== i}>
            <div className="relative" style={{ background: `linear-gradient(120deg, ${s.from}, ${s.to})` }}>
              <div className="container-x grid min-h-[480px] items-center gap-8 py-12 text-white md:min-h-[560px] md:grid-cols-2">
                <div className={k === i ? "animate-fade-up" : ""}>
                  <p className="mb-3 inline-block rounded-full bg-white/15 px-3 py-1 text-xs font-bold uppercase tracking-widest">{s.eyebrow}</p>
                  <h1 className="text-4xl font-extrabold leading-[1.05] tracking-tight md:text-6xl">{s.title}</h1>
                  <p className="mt-4 max-w-md text-lg text-white/85">{s.body}</p>
                  {s.countdown && <div className="mt-6"><p className="mb-2 text-xs font-bold uppercase tracking-widest text-white/80">Sale ends in</p><Countdown to={saleEndsAt} /></div>}
                  <Link href={s.href} tabIndex={k === i ? 0 : -1} className="mt-7 inline-flex h-13 items-center gap-2 rounded-full bg-white px-7 font-extrabold text-ink transition hover:-translate-y-0.5 hover:shadow-pop">
                    {s.cta}<ChevronRight className="size-4" aria-hidden />
                  </Link>
                </div>
                <div className="relative mx-auto hidden w-full max-w-md md:block">
                  <div className="absolute inset-8 rounded-full bg-white/10 blur-2xl" />
                  <PackArt product={art[k % art.length]} className="relative w-full animate-float drop-shadow-2xl [&>rect:first-of-type]:opacity-0" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 items-center gap-2">
        <button onClick={() => setI((i - 1 + n) % n)} className="grid size-9 place-items-center rounded-full bg-white/20 text-white hover:bg-white/35" aria-label="Previous slide"><ChevronLeft className="size-4" aria-hidden /></button>
        {heroSlides.map((_, k) => (
          <button key={k} onClick={() => setI(k)} aria-label={`Go to slide ${k + 1}`} aria-current={k === i} className={`h-2 rounded-full bg-white transition-all ${k === i ? "w-8" : "w-2 opacity-50"}`} />
        ))}
        <button onClick={() => setI((i + 1) % n)} className="grid size-9 place-items-center rounded-full bg-white/20 text-white hover:bg-white/35" aria-label="Next slide"><ChevronRight className="size-4" aria-hidden /></button>
        <button onClick={() => setPaused((p) => !p)} aria-pressed={paused} className="grid size-9 place-items-center rounded-full bg-white/20 text-white hover:bg-white/35" aria-label={paused ? "Play slideshow" : "Pause slideshow"}>
          {paused ? <Play className="size-4" aria-hidden /> : <Pause className="size-4" aria-hidden />}
        </button>
      </div>
    </section>
  );
}

export function HealthTabs() {
  const [tab, setTab] = useState(healthTabs[0].key);
  const list = useMemo(() => {
    const all = tab === "best" ? [...products].sort((a, b) => a.rank - b.rank) : products.filter((p) => p.benefits.includes(tab));
    return all.slice(0, 8);
  }, [tab]);
  const onKey = (e: React.KeyboardEvent, idx: number) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    const next = (idx + (e.key === "ArrowRight" ? 1 : -1) + healthTabs.length) % healthTabs.length;
    setTab(healthTabs[next].key);
    document.getElementById(`ht-${healthTabs[next].key}`)?.focus();
  };
  return (
    <div>
      <div role="tablist" aria-label="Shop by health need" className="no-scrollbar -mx-4 mb-6 flex gap-2 overflow-x-auto px-4">
        {healthTabs.map((t, idx) => (
          <button key={t.key} id={`ht-${t.key}`} role="tab" aria-selected={tab === t.key} tabIndex={tab === t.key ? 0 : -1} onKeyDown={(e) => onKey(e, idx)} onClick={() => setTab(t.key)}
            className={`shrink-0 rounded-full border px-5 py-2.5 text-sm font-bold transition ${tab === t.key ? "border-ink bg-ink text-on-ink" : "border-line hover:border-ink"}`}>
            {t.label}
          </button>
        ))}
      </div>
      <div role="tabpanel" aria-labelledby={`ht-${tab}`} className="grid grid-cols-2 gap-3 md:gap-5 lg:grid-cols-4">
        {list.map((p, k) => <div key={tab + p.id} className="animate-fade-up" style={{ animationDelay: `${k * 50}ms` }}><ProductCard product={p} /></div>)}
      </div>
      {tab !== "best" && (
        <div className="mt-8 text-center"><Link href={`/collections/${tab}`} className="inline-flex h-11 items-center rounded-full border border-ink px-6 font-bold hover:bg-ink hover:text-on-ink">View all</Link></div>
      )}
    </div>
  );
}

function QuickView({ product, onClose }: { product: Product; onClose: () => void }) {
  const { add, setCartOpen, showToast, setNotifyFor } = useStore();
  const [vid, setVid] = useState(product.variants[0].id);
  const [tab, setTab] = useState<"d" | "i" | "h">("d");
  const [muted, setMuted] = useState(true);
  const v = product.variants.find((x) => x.id === vid)!;
  return (
    <div className="grid max-h-[90vh] overflow-y-auto md:grid-cols-2">
      <div className="relative grid aspect-[9/12] place-items-center bg-ink text-on-ink md:aspect-auto">
        <div className="p-6 text-center">
          <Play className="mx-auto size-14 opacity-80" aria-hidden />
          <p className="mt-3 text-sm text-white/70">Video placeholder: add your reel (MP4) here</p>
        </div>
        <button onClick={() => setMuted((m) => !m)} aria-pressed={!muted} aria-label={muted ? "Unmute" : "Mute"} className="absolute bottom-3 right-3 grid size-10 place-items-center rounded-full bg-white/15 hover:bg-white/25">
          {muted ? <VolumeX className="size-4" aria-hidden /> : <Volume2 className="size-4" aria-hidden />}
        </button>
      </div>
      <div className="flex flex-col gap-4 p-5">
        <div className="flex justify-end"><CloseButton onClick={onClose} /></div>
        <h2 className="text-xl font-extrabold">{product.title}</h2>
        <PriceBlock price={v.price} mrp={v.mrp} />
        <PackPills product={product} value={vid} onChange={setVid} size="md" />
        <div className="flex gap-4 border-b border-line text-sm font-bold" role="tablist">
          {([["d", "Description"], ["i", "Ingredients"], ["h", "How to take"]] as const).map(([k, l]) => (
            <button key={k} role="tab" aria-selected={tab === k} onClick={() => setTab(k)} className={`-mb-px border-b-2 py-2 ${tab === k ? "border-ink" : "border-transparent text-muted"}`}>{l}</button>
          ))}
        </div>
        <div className="text-sm text-muted">
          {tab === "d" && <p>{product.description[0]}</p>}
          {tab === "i" && <ul className="list-disc pl-5">{product.ingredients.map((x) => <li key={x.name}>{x.name}</li>)}</ul>}
          {tab === "h" && <p>{product.howToTake}</p>}
        </div>
        {v.stock > 0 ? (
          <Button size="lg" onClick={() => { add(v.id); showToast("Added to cart"); onClose(); setCartOpen(true); }}>Add to cart · {inr(v.price)}</Button>
        ) : (
          <Button size="lg" variant="outline" onClick={() => { onClose(); setNotifyFor(product.title); }}>Notify me</Button>
        )}
        <Link href={`/products/${product.handle}`} onClick={onClose} className="text-center text-sm font-bold underline">See full details</Link>
      </div>
    </div>
  );
}

export function VideoReviews() {
  const featured = [products[0], products[2], products[6], products[8], products[7], products[1]];
  const [open, setOpen] = useState<Product | null>(null);
  return (
    <>
      <div className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2">
        {featured.map((p, k) => (
          <button key={p.id} onClick={() => setOpen(p)} className="group relative aspect-[9/14] w-[62vw] max-w-[260px] shrink-0 snap-start overflow-hidden rounded-lg text-left" style={{ background: `linear-gradient(160deg, ${p.art.from}, ${p.art.to})` }} aria-label={`Play video review: ${p.title}`}>
            <PackArt product={p} className="absolute inset-x-0 top-6 mx-auto w-3/4 transition duration-500 group-hover:scale-105 [&>rect:first-of-type]:opacity-0" />
            <span className="absolute left-1/2 top-[42%] grid size-14 -translate-x-1/2 place-items-center rounded-full bg-white/90 text-ink shadow-pop transition group-hover:scale-110"><Play className="size-6 translate-x-0.5" fill="currentColor" aria-hidden /></span>
            <div className="absolute inset-x-3 bottom-3 rounded-md bg-white/95 p-3">
              <p className="line-clamp-1 text-xs font-bold">{p.title}</p>
              <p className="text-sm font-extrabold">{inr(p.variants[0].price)} <span className="text-xs font-semibold text-muted line-through">{inr(p.variants[0].mrp)}</span></p>
            </div>
            <span className="absolute left-3 top-3 rounded-full bg-black/40 px-2 py-0.5 text-[10px] font-bold text-white">Creator {k + 1}</span>
          </button>
        ))}
      </div>
      <Overlay open={!!open} onClose={() => setOpen(null)} side="center" label="Video review">
        {open && <QuickView product={open} onClose={() => setOpen(null)} />}
      </Overlay>
    </>
  );
}

export function TestimonialCard({ t }: { t: { name: string; city: string; text: string; product: string } }) {
  return (
    <figure className="flex h-full flex-col rounded-lg bg-surface p-6">
      <Quote className="size-8 text-accent" aria-hidden />
      <blockquote className="mt-3 flex-1 text-lg font-semibold leading-relaxed">{t.text}</blockquote>
      <figcaption className="mt-5 flex items-center gap-3">
        <span className="grid size-11 place-items-center rounded-full bg-ink font-bold text-on-ink">{t.name.slice(0, 1)}</span>
        <span><span className="block font-bold">{t.name}, {t.city}</span><span className="text-sm text-muted">Bought {t.product}</span></span>
      </figcaption>
    </figure>
  );
}
