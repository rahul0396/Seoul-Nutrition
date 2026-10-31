"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { trending } from "@/data/site";
import { products } from "@/data/products";
import { searchProducts } from "./Header";
import { ProductCard } from "./ProductCard";

export function SearchResults() {
  const params = useSearchParams();
  const router = useRouter();
  const q = params.get("q") ?? "";
  const [value, setValue] = useState(q);
  useEffect(() => setValue(q), [q]);
  const results = searchProducts(q);

  return (
    <div className="container-x py-10">
      <h1 className="text-3xl font-extrabold md:text-4xl">{q ? <>Results for “{q}”</> : "Search"}</h1>
      <form role="search" className="mt-6 flex max-w-2xl items-center gap-3 rounded-full border border-line-input px-5 focus-within:border-ink" onSubmit={(e) => { e.preventDefault(); router.push(`/search?q=${encodeURIComponent(value.trim())}`); }}>
        <Search className="size-5 text-muted" aria-hidden />
        <label htmlFor="sr-q" className="sr-only">Search</label>
        <input id="sr-q" value={value} onChange={(e) => setValue(e.target.value)} placeholder="Search products" className="h-13 flex-1 bg-transparent outline-none" />
      </form>
      <div className="mt-4 flex flex-wrap gap-2">
        {trending.map((t) => <Link key={t} href={`/search?q=${encodeURIComponent(t)}`} className="rounded-full bg-surface px-4 py-2 text-sm font-semibold hover:bg-ink hover:text-on-ink">{t}</Link>)}
      </div>
      {q && <p className="mt-8 text-muted" aria-live="polite">{results.length} {results.length === 1 ? "product" : "products"} found</p>}
      {q && results.length === 0 && (
        <div className="mt-6">
          <p className="text-lg font-bold">Nothing matched. Try one of our best sellers:</p>
          <div className="mt-6 grid grid-cols-2 gap-3 md:gap-5 lg:grid-cols-4">{[...products].sort((a, b) => a.rank - b.rank).slice(0, 4).map((p) => <ProductCard key={p.id} product={p} />)}</div>
        </div>
      )}
      <div className="mt-6 grid grid-cols-2 gap-3 md:gap-5 lg:grid-cols-4">{results.map((p) => <ProductCard key={p.id} product={p} />)}</div>
    </div>
  );
}
