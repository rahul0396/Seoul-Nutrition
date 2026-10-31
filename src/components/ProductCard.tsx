"use client";

import Link from "next/link";
import { useState } from "react";
import { Bell, Heart } from "lucide-react";
import type { Product } from "@/data/types";
import { useStore } from "@/lib/store";
import { PackArt } from "./PackArt";
import { Badge, Button, PriceBlock, badgeTone } from "./ui";

export function PackPills({ product, value, onChange, size = "sm" }: { product: Product; value: string; onChange: (id: string) => void; size?: "sm" | "md" }) {
  if (product.variants.length < 2) return null;
  return (
    <div role="radiogroup" aria-label="Pack size" className="flex flex-wrap gap-2">
      {product.variants.map((v) => {
        const on = v.id === value;
        const out = v.stock <= 0;
        return (
          <button
            key={v.id}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={() => onChange(v.id)}
            className={`rounded-full border font-semibold transition ${size === "sm" ? "px-3 py-1 text-xs" : "px-4 py-2 text-sm"} ${on ? "border-ink bg-ink text-on-ink" : "border-line bg-bg hover:border-ink"} ${out ? "line-through opacity-60" : ""}`}
          >
            {v.label}
          </button>
        );
      })}
    </div>
  );
}

export function ProductCard({ product }: { product: Product }) {
  const { add, setCartOpen, showToast, wishlist, toggleWish, setNotifyFor } = useStore();
  const [variantId, setVariantId] = useState(product.variants[0].id);
  const [state, setState] = useState<"idle" | "loading" | "added">("idle");
  const variant = product.variants.find((v) => v.id === variantId)!;
  const out = variant.stock <= 0;
  const wished = wishlist.includes(product.handle);

  const onAdd = () => {
    setState("loading");
    setTimeout(() => {
      add(variant.id);
      setState("added");
      showToast("Added to cart");
      setCartOpen(true);
      setTimeout(() => setState("idle"), 1500);
    }, 350);
  };

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-lg border border-line bg-bg transition duration-300 hover:-translate-y-1 hover:shadow-pop">
      <div className="relative">
        <Link href={`/products/${product.handle}`} className="block aspect-square overflow-hidden bg-surface" aria-label={product.title}>
          <PackArt product={product} className="size-full transition duration-500 group-hover:scale-105" />
        </Link>
        <div className="pointer-events-none absolute left-3 top-3 flex flex-col items-start gap-1.5">
          {product.badges.map((b) => <Badge key={b} tone={badgeTone(b)}>{b}</Badge>)}
          {out && <Badge tone="soft">Out of stock</Badge>}
        </div>
        <button
          type="button"
          onClick={() => { toggleWish(product.handle); showToast(wished ? "Removed from wishlist" : "Saved to wishlist"); }}
          aria-pressed={wished}
          aria-label={wished ? "Remove from wishlist" : "Save to wishlist"}
          className="absolute right-3 top-3 grid size-9 place-items-center rounded-full bg-bg/90 shadow-card transition hover:scale-110"
        >
          <Heart className={`size-4 ${wished ? "fill-accent text-accent" : ""}`} aria-hidden />
        </button>
      </div>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <div className="flex items-center justify-between gap-2 text-xs font-semibold text-muted">
            <span>{product.label}</span>
            {product.reviewCount > 0 && <span>★ {product.rating.toFixed(1)} ({product.reviewCount})</span>}
          </div>
          <h3 className="mt-1 line-clamp-2 min-h-[2.75rem] font-bold leading-snug">
            <Link href={`/products/${product.handle}`} className="hover:underline">{product.title}</Link>
          </h3>
        </div>
        <PackPills product={product} value={variantId} onChange={setVariantId} />
        <div className="mt-auto">
          <PriceBlock price={variant.price} mrp={variant.mrp} />
        </div>
        {out ? (
          <Button variant="outline" onClick={() => setNotifyFor(product.title + " · " + variant.label)} className="w-full">
            <Bell className="size-4" aria-hidden /> Notify me
          </Button>
        ) : (
          <Button onClick={onAdd} loading={state === "loading"} done={state === "added"} className="w-full">
            {state === "added" ? "Added" : "Add to cart"}
          </Button>
        )}
      </div>
    </article>
  );
}
