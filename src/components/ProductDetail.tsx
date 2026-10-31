"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Bell, ChevronLeft, ChevronRight, FileText, Heart, Truck } from "lucide-react";
import type { Product } from "@/data/types";
import { reviews as allReviews, shipping, trustBadges } from "@/data/site";
import { useStore } from "@/lib/store";
import { inr, pctOff } from "@/lib/pricing";
import { Icon } from "./Icon";
import { PackArt } from "./PackArt";
import { PackPills } from "./ProductCard";
import { Accordion, Badge, Button, CloseButton, Overlay, PriceBlock, QtyStepper, Stars, badgeTone } from "./ui";

const views = ["front", "back", "scoop", "lifestyle"] as const;

function Gallery({ product }: { product: Product }) {
  const [i, setI] = useState(0);
  const [zoom, setZoom] = useState(false);
  const n = views.length;
  return (
    <div className="lg:sticky lg:top-24">
      <div className="flex gap-3">
        <div className="hidden flex-col gap-3 md:flex" role="tablist" aria-label="Product images">
          {views.map((v, k) => (
            <button key={v} role="tab" aria-selected={i === k} onClick={() => setI(k)} className={`size-20 overflow-hidden rounded-md border-2 transition ${i === k ? "border-ink" : "border-transparent opacity-70 hover:opacity-100"}`} aria-label={`Image ${k + 1}`}>
              <PackArt product={product} view={v} className="size-full" />
            </button>
          ))}
        </div>
        <div className="relative flex-1 overflow-hidden rounded-lg bg-surface">
          <button onClick={() => setZoom(true)} className="block w-full cursor-zoom-in" aria-label="Open image viewer">
            <PackArt key={i} product={product} view={views[i]} className="aspect-square w-full animate-pop" />
          </button>
          <div className="absolute left-3 top-3 flex flex-col gap-1.5">{product.badges.map((b) => <Badge key={b} tone={badgeTone(b)}>{b}</Badge>)}</div>
          <button onClick={() => setI((i - 1 + n) % n)} className="absolute left-3 top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-full bg-bg/90 shadow-card md:hidden" aria-label="Previous image"><ChevronLeft className="size-5" aria-hidden /></button>
          <button onClick={() => setI((i + 1) % n)} className="absolute right-3 top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-full bg-bg/90 shadow-card md:hidden" aria-label="Next image"><ChevronRight className="size-5" aria-hidden /></button>
          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5 md:hidden">{views.map((_, k) => <span key={k} className={`h-1.5 rounded-full bg-ink transition-all ${k === i ? "w-5" : "w-1.5 opacity-30"}`} />)}</div>
        </div>
      </div>
      <p className="mt-2 text-xs text-muted">Images are for illustration only.</p>
      <Overlay open={zoom} onClose={() => setZoom(false)} side="center" label="Image viewer">
        <div className="relative bg-surface">
          <div className="absolute right-2 top-2 z-10"><CloseButton onClick={() => setZoom(false)} label="Close (Esc)" /></div>
          <PackArt product={product} view={views[i]} className="aspect-square w-full" />
          <div className="flex items-center justify-between p-3">
            <button onClick={() => setI((i - 1 + n) % n)} className="grid size-10 place-items-center rounded-full bg-bg" aria-label="Previous image"><ChevronLeft className="size-5" aria-hidden /></button>
            <span className="text-sm font-bold">{i + 1} / {n}</span>
            <button onClick={() => setI((i + 1) % n)} className="grid size-10 place-items-center rounded-full bg-bg" aria-label="Next image"><ChevronRight className="size-5" aria-hidden /></button>
          </div>
        </div>
      </Overlay>
    </div>
  );
}

function AnchorTabs({ ids }: { ids: [string, string][] }) {
  const [active, setActive] = useState(ids[0][0]);
  useEffect(() => {
    const io = new IntersectionObserver((es) => es.forEach((e) => e.isIntersecting && setActive(e.target.id)), { rootMargin: "-40% 0px -55% 0px" });
    ids.forEach(([id]) => { const el = document.getElementById(id); if (el) io.observe(el); });
    return () => io.disconnect();
  }, [ids]);
  return (
    <nav aria-label="Product sections" className="sticky top-16 z-30 border-b border-line bg-bg/95 backdrop-blur md:top-[72px]">
      <div className="container-x no-scrollbar flex gap-6 overflow-x-auto">
        {ids.map(([id, label]) => (
          <a key={id} href={`#${id}`} aria-current={active === id ? "true" : undefined} className={`shrink-0 border-b-2 py-4 text-sm font-bold transition ${active === id ? "border-ink text-ink" : "border-transparent text-muted hover:text-ink"}`}>{label}</a>
        ))}
      </div>
    </nav>
  );
}

function ReviewForm({ onDone }: { onDone: () => void }) {
  const [rating, setRating] = useState(0);
  const [err, setErr] = useState("");
  return (
    <form
      className="space-y-3 p-6"
      onSubmit={(e) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        if (!rating) return setErr("Pick a star rating");
        if (!String(f.get("body") || "").trim()) return setErr("Write a few words about the product");
        // Hook up: POST the review to your backend for moderation.
        onDone();
      }}
    >
      <h2 className="text-xl font-extrabold">Write a review</h2>
      <fieldset>
        <legend className="mb-1 text-sm font-bold">Your rating</legend>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button type="button" key={n} onClick={() => setRating(n)} aria-label={`${n} star${n > 1 ? "s" : ""}`} aria-pressed={rating === n} className={`text-3xl transition hover:scale-110 ${n <= rating ? "text-[#e0a100]" : "text-line"}`}>★</button>
          ))}
        </div>
      </fieldset>
      <label className="block"><span className="mb-1 block text-sm font-bold">Title</span><input name="title" className="h-11 w-full rounded-md border border-line-input px-4 outline-none focus:border-ink" /></label>
      <label className="block"><span className="mb-1 block text-sm font-bold">Review</span><textarea name="body" rows={4} className="w-full rounded-md border border-line-input p-4 outline-none focus:border-ink" /></label>
      <label className="block"><span className="mb-1 block text-sm font-bold">Name</span><input name="name" className="h-11 w-full rounded-md border border-line-input px-4 outline-none focus:border-ink" /></label>
      {err && <p className="text-sm text-danger" role="alert">{err}</p>}
      <Button size="lg" className="w-full">Submit review</Button>
    </form>
  );
}

export function ProductDetail({ product }: { product: Product }) {
  const s = useStore();
  const router = useRouter();
  const [vid, setVid] = useState(product.variants.find((v) => v.stock > 0)?.id ?? product.variants[0].id);
  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const v = product.variants.find((x) => x.id === vid)!;
  const out = v.stock <= 0;
  const wished = s.wishlist.includes(product.handle);
  const reviews = allReviews.filter((r) => r.productHandle === product.handle || r.productHandle === "*");

  useEffect(() => setQty(1), [vid]);

  const addToCart = (thenCheckout = false) => {
    setAdding(true);
    setTimeout(() => {
      s.add(v.id, qty);
      setAdding(false);
      if (thenCheckout) router.push("/checkout");
      else { s.showToast("Added to cart"); s.setCartOpen(true); }
    }, 350);
  };

  const sections: [string, string][] = [["description", "Description"]];
  if (product.ingredients.length) sections.push(["ingredients", "Ingredients"]);
  if (product.howToTake) sections.push(["how-to-take", "How to take"]);
  if (product.faqs.length) sections.push(["faq", "FAQ"]);
  if (product.labReports.length) sections.push(["lab-reports", "Lab reports"]);
  sections.push(["reviews", "Reviews"]);

  return (
    <>
      <div className="container-x grid gap-8 pb-10 lg:grid-cols-[1.1fr_1fr] lg:gap-14">
        <Gallery product={product} />

        <div className="space-y-5">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-accent">{product.label}</p>
            <h1 className="mt-1 text-2xl font-extrabold leading-tight tracking-tight md:text-4xl">{product.title}</h1>
            <p className="mt-2 text-muted">{product.subtitle}</p>
            {product.reviewCount > 0 && (
              <a href="#reviews" className="mt-3 inline-flex items-center gap-2 text-sm font-semibold hover:underline">
                <Stars value={product.rating} /> {product.rating.toFixed(1)} · {product.reviewCount} reviews
              </a>
            )}
          </div>

          <div className="rounded-lg bg-surface p-5">
            <PriceBlock price={v.price} mrp={v.mrp} size="lg" />
            <p className="mt-1 text-xs text-muted">MRP inclusive of all taxes</p>
          </div>

          {product.variants.length > 1 && (
            <div>
              <p className="mb-2 text-sm font-bold">Pack: <span className="text-muted">{v.label}</span></p>
              <div role="radiogroup" aria-label="Pack size" className="grid grid-cols-2 gap-3">
                {product.variants.map((x) => {
                  const on = x.id === vid;
                  return (
                    <button key={x.id} role="radio" aria-checked={on} onClick={() => setVid(x.id)} className={`relative rounded-md border-2 p-3 text-left transition ${on ? "border-ink bg-surface" : "border-line hover:border-ink"} ${x.stock <= 0 ? "opacity-60" : ""}`}>
                      {pctOff(x.price, x.mrp) > 0 && <span className="absolute -top-2.5 right-3 rounded-full bg-accent px-2 py-0.5 text-[10px] font-bold text-on-accent">Save {pctOff(x.price, x.mrp)}%</span>}
                      <span className="block font-extrabold">{x.label}</span>
                      <span className="text-sm">{inr(x.price)} <span className="text-muted line-through">{inr(x.mrp)}</span></span>
                      {x.stock <= 0 && <span className="block text-xs font-bold text-danger">Sold out</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {!out && v.stock < 100 && <p className="text-sm font-bold text-warning">Only {v.stock} left in stock</p>}

          <div className="flex flex-wrap items-center gap-3">
            {!out && <QtyStepper value={qty} onChange={setQty} max={v.stock} />}
            <button onClick={() => { s.toggleWish(product.handle); s.showToast(wished ? "Removed from wishlist" : "Saved to wishlist"); }} aria-pressed={wished} className="inline-flex h-11 items-center gap-2 rounded-full border border-line px-4 text-sm font-bold hover:border-ink">
              <Heart className={`size-4 ${wished ? "fill-accent text-accent" : ""}`} aria-hidden /> {wished ? "Saved" : "Save"}
            </button>
          </div>

          {out ? (
            <Button size="lg" variant="outline" className="w-full" onClick={() => s.setNotifyFor(`${product.title} · ${v.label}`)}><Bell className="size-4" aria-hidden /> Notify me when it is back</Button>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              <Button size="lg" variant="outline" loading={adding} onClick={() => addToCart(false)}>Add to cart</Button>
              <Button size="lg" onClick={() => addToCart(true)}>Buy it now</Button>
            </div>
          )}

          <p className="flex items-center gap-2 text-sm text-muted"><Truck className="size-4" aria-hidden /> Free shipping above {inr(shipping.freeAbove)} · Extra {shipping.prepaidExtra}% off on prepaid</p>

          <div className="grid grid-cols-2 gap-3 border-y border-line py-5 sm:grid-cols-4">
            {trustBadges.map((b) => (
              <div key={b.title} className="flex flex-col items-center gap-2 text-center"><Icon name={b.icon} className="size-7 text-member" /><span className="text-xs font-bold">{b.title}</span></div>
            ))}
          </div>

          <ul className="grid grid-cols-2 gap-3">
            {product.highlights.map((h) => <li key={h} className="flex items-center gap-2 text-sm font-semibold"><span className="size-2 shrink-0 rounded-full bg-accent" aria-hidden />{h}</li>)}
          </ul>
        </div>
      </div>

      <AnchorTabs ids={sections} />

      <div className="container-x max-w-4xl space-y-14 py-12 [&>section]:scroll-mt-36">
        <section id="description">
          <h2 className="mb-4 text-2xl font-extrabold">Description</h2>
          <div className="space-y-3 text-muted">{product.description.map((p, i) => <p key={i}>{p}</p>)}</div>
          {Object.keys(product.specs).length > 0 && (
            <details className="mt-6 rounded-lg border border-line p-5">
              <summary className="font-bold">Additional information</summary>
              <dl className="mt-4 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-[200px_1fr]">
                {Object.entries(product.specs).map(([k, val]) => <div key={k} className="contents"><dt className="font-bold">{k}</dt><dd className="text-muted">{val}</dd></div>)}
              </dl>
            </details>
          )}
        </section>

        {product.ingredients.length > 0 && (
          <section id="ingredients">
            <h2 className="mb-4 text-2xl font-extrabold">Ingredients</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {product.ingredients.map((x) => (
                <div key={x.name} className="flex gap-4 rounded-lg bg-surface p-5">
                  <span className="grid size-12 shrink-0 place-items-center rounded-full bg-bg" style={{ color: product.art.to }}><Icon name="Leaf" className="size-6" /></span>
                  <div><p className="font-bold">{x.name}</p><p className="text-sm text-muted">{x.note}</p></div>
                </div>
              ))}
            </div>
          </section>
        )}

        {product.howToTake && (
          <section id="how-to-take">
            <h2 className="mb-4 text-2xl font-extrabold">How to take</h2>
            <p className="rounded-lg bg-surface p-6 text-lg">{product.howToTake}</p>
          </section>
        )}

        {product.faqs.length > 0 && (
          <section id="faq"><h2 className="mb-4 text-2xl font-extrabold">FAQ</h2><Accordion items={product.faqs} /></section>
        )}

        {product.labReports.length > 0 && (
          <section id="lab-reports">
            <h2 className="mb-4 text-2xl font-extrabold">Lab reports</h2>
            <ul className="grid gap-3 sm:grid-cols-2">
              {product.labReports.map((r) => (
                <li key={r}><a href="#" className="flex items-center gap-3 rounded-lg border border-line p-4 font-bold transition hover:border-ink"><FileText className="size-5 text-accent" aria-hidden />{r}<span className="ml-auto text-xs font-semibold text-muted">PDF</span></a></li>
              ))}
            </ul>
            <p className="mt-2 text-xs text-muted">Placeholder links. Upload your real lab PDFs and link them here.</p>
          </section>
        )}

        <section id="reviews">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <h2 className="text-2xl font-extrabold">Customer reviews</h2>
            <Button variant="outline" onClick={() => setReviewOpen(true)}>Write a review</Button>
          </div>
          <div className="grid gap-8 md:grid-cols-[260px_1fr]">
            <div className="rounded-lg bg-surface p-5">
              <p className="text-5xl font-extrabold">{product.rating.toFixed(1)}</p>
              <Stars value={product.rating} size="size-5" />
              <p className="mt-1 text-sm text-muted">{product.reviewCount} reviews</p>
              <ul className="mt-4 space-y-2">
                {product.ratingSplit.map((pct, k) => (
                  <li key={k} className="flex items-center gap-2 text-sm">
                    <span className="w-6 font-bold">{5 - k}★</span>
                    <span className="h-2 flex-1 overflow-hidden rounded-full bg-surface-2"><span className="block h-full rounded-full bg-[#e0a100]" style={{ width: `${pct}%` }} /></span>
                    <span className="w-9 text-right text-muted">{pct}%</span>
                  </li>
                ))}
              </ul>
            </div>
            <ul className="space-y-4">
              {reviews.map((r, k) => (
                <li key={k} className="rounded-lg border border-line p-5">
                  <div className="flex items-center gap-3">
                    <span className="grid size-10 place-items-center rounded-full bg-ink text-sm font-bold text-on-ink">{r.author.slice(0, 1)}</span>
                    <div><p className="font-bold">{r.author}</p><p className="text-xs text-muted">{new Date(r.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p></div>
                    <span className="ml-auto"><Stars value={r.rating} /></span>
                  </div>
                  <p className="mt-3 font-bold">{r.title}</p>
                  <p className="mt-1 text-muted">{r.body}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>

      {/* Mobile sticky add to cart */}
      {!out && <div className="h-20 lg:hidden" aria-hidden />}
      {!out && (
        <div className="fixed inset-x-0 bottom-0 z-40 flex items-center gap-3 border-t border-line bg-bg p-3 lg:hidden">
          <div className="flex-1"><p className="text-lg font-extrabold leading-none">{inr(v.price * qty)}</p><p className="text-xs text-muted">{v.label} × {qty}</p></div>
          <Button size="lg" className="flex-1" loading={adding} onClick={() => addToCart(false)}>Add to cart</Button>
        </div>
      )}

      <Overlay open={reviewOpen} onClose={() => setReviewOpen(false)} side="center" label="Write a review">
        <div className="flex justify-end p-2"><CloseButton onClick={() => setReviewOpen(false)} /></div>
        <ReviewForm onDone={() => { setReviewOpen(false); s.showToast("Thanks! Your review is pending approval"); }} />
      </Overlay>
    </>
  );
}
