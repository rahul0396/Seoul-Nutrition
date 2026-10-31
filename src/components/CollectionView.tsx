"use client";

import { useMemo, useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import type { Product } from "@/data/types";
import { ProductCard } from "./ProductCard";
import { Button, CloseButton, Overlay } from "./ui";

const sorts = [
  { key: "featured", label: "Featured" },
  { key: "relevance", label: "Most relevant" },
  { key: "best", label: "Best selling" },
  { key: "price-asc", label: "Price, low to high" },
  { key: "price-desc", label: "Price, high to low" },
] as const;
type SortKey = (typeof sorts)[number]["key"];

const priceBands = [
  { key: "u1000", label: "Under ₹1,000", test: (n: number) => n < 1000 },
  { key: "1to2", label: "₹1,000 to ₹2,000", test: (n: number) => n >= 1000 && n <= 2000 },
  { key: "o2000", label: "Over ₹2,000", test: (n: number) => n > 2000 },
];

const tagOf = (p: Product) =>
  p.categories.includes("whey-protein") ? "Whey" : p.categories.includes("creatine") ? "Creatine" : p.categories.includes("accessories") ? "Gear" : p.categories.includes("plant-protein") ? "Plant" : "Others";

export function CollectionView({ items }: { items: Product[] }) {
  const [sort, setSort] = useState<SortKey>("featured");
  const [avail, setAvail] = useState<string[]>([]);
  const [tag, setTag] = useState("All");
  const [bands, setBands] = useState<string[]>([]);
  const [open, setOpen] = useState(false);

  const inStock = (p: Product) => p.variants.some((v) => v.stock > 0);
  const tags = useMemo(() => {
    const m = new Map<string, number>();
    items.forEach((p) => m.set(tagOf(p), (m.get(tagOf(p)) ?? 0) + 1));
    return [["All", items.length] as [string, number], ...[...m.entries()].sort((a, b) => b[1] - a[1])];
  }, [items]);

  const list = useMemo(() => {
    let l = items.filter((p) => {
      if (avail.length === 1) {
        if (avail[0] === "in" && !inStock(p)) return false;
        if (avail[0] === "out" && inStock(p)) return false;
      }
      if (tag !== "All" && tagOf(p) !== tag) return false;
      if (bands.length && !priceBands.filter((b) => bands.includes(b.key)).some((b) => b.test(p.variants[0].price))) return false;
      return true;
    });
    l = [...l];
    if (sort === "best" || sort === "relevance") l.sort((a, b) => a.rank - b.rank);
    if (sort === "price-asc") l.sort((a, b) => a.variants[0].price - b.variants[0].price);
    if (sort === "price-desc") l.sort((a, b) => b.variants[0].price - a.variants[0].price);
    if (sort === "featured") l.sort((a, b) => Number(inStock(b)) - Number(inStock(a)));
    return l;
  }, [items, avail, tag, bands, sort]);

  const toggle = (arr: string[], set: (v: string[]) => void, k: string) => set(arr.includes(k) ? arr.filter((x) => x !== k) : [...arr, k]);
  const activeCount = avail.length + bands.length + (tag !== "All" ? 1 : 0);
  const reset = () => { setAvail([]); setBands([]); setTag("All"); };

  const filters = (
    <div className="space-y-6">
      <fieldset>
        <legend className="mb-3 font-bold">Availability</legend>
        {[["in", "In stock", items.filter(inStock).length], ["out", "Out of stock", items.filter((p) => !inStock(p)).length]].map(([k, l, n]) => (
          <label key={k as string} className="flex cursor-pointer items-center gap-3 py-1.5">
            <input type="checkbox" checked={avail.includes(k as string)} onChange={() => toggle(avail, setAvail, k as string)} className="size-4 accent-[var(--color-ink)]" />
            <span className="flex-1">{l}</span><span className="text-sm text-muted">({n})</span>
          </label>
        ))}
      </fieldset>
      <fieldset>
        <legend className="mb-3 font-bold">Price</legend>
        {priceBands.map((b) => (
          <label key={b.key} className="flex cursor-pointer items-center gap-3 py-1.5">
            <input type="checkbox" checked={bands.includes(b.key)} onChange={() => toggle(bands, setBands, b.key)} className="size-4 accent-[var(--color-ink)]" />
            <span>{b.label}</span>
          </label>
        ))}
      </fieldset>
    </div>
  );

  return (
    <div>
      {/* Tag tiles */}
      <div role="radiogroup" aria-label="Product type" className="no-scrollbar -mx-4 mb-5 flex gap-2 overflow-x-auto px-4">
        {tags.map(([t, n]) => (
          <button key={t} role="radio" aria-checked={tag === t} onClick={() => setTag(t)} className={`shrink-0 rounded-full border px-4 py-2 text-sm font-bold transition ${tag === t ? "border-ink bg-ink text-on-ink" : "border-line hover:border-ink"}`}>
            {t} <span className="opacity-70">({n})</span>
          </button>
        ))}
      </div>

      <div className="mb-6 flex items-center justify-between gap-3 border-y border-line py-3">
        <button onClick={() => setOpen(true)} className="inline-flex h-10 items-center gap-2 rounded-full border border-line px-4 text-sm font-bold hover:border-ink">
          <SlidersHorizontal className="size-4" aria-hidden /> Filter {activeCount > 0 && <span className="grid size-5 place-items-center rounded-full bg-ink text-[11px] text-on-ink">{activeCount}</span>}
        </button>
        <p className="hidden text-sm text-muted sm:block" aria-live="polite">{list.length} products</p>
        <label className="flex items-center gap-2 text-sm">
          <span className="font-bold">Sort by</span>
          <select value={sort} onChange={(e) => setSort(e.target.value as SortKey)} className="h-10 rounded-full border border-line bg-bg px-3 font-semibold outline-none focus:border-ink">
            {sorts.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
          </select>
        </label>
      </div>

      {list.length === 0 ? (
        <div className="rounded-lg bg-surface p-10 text-center">
          <p className="text-lg font-bold">No products match these filters</p>
          <Button variant="outline" className="mt-4" onClick={reset}>Clear filters</Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 md:gap-5 lg:grid-cols-4">
          {list.map((p, k) => <div key={p.id} className="animate-fade-up" style={{ animationDelay: `${Math.min(k, 8) * 40}ms` }}><ProductCard product={p} /></div>)}
        </div>
      )}

      <Overlay open={open} onClose={() => setOpen(false)} side="left" label="Filters" width="w-[88vw] max-w-[380px]">
        <div className="flex items-center justify-between border-b border-line p-4"><p className="text-lg font-extrabold">Filter</p><CloseButton onClick={() => setOpen(false)} /></div>
        <div className="flex-1 overflow-y-auto p-5">{filters}</div>
        <div className="flex gap-3 border-t border-line p-4">
          <Button variant="outline" className="flex-1" onClick={reset}>Clear all</Button>
          <Button className="flex-1" onClick={() => setOpen(false)}>Show {list.length}</Button>
        </div>
      </Overlay>
    </div>
  );
}
