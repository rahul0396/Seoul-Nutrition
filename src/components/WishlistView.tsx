"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { products } from "@/data/products";
import { useStore } from "@/lib/store";
import { ProductCard } from "./ProductCard";

export function WishlistView() {
  const { wishlist, ready } = useStore();
  const items = products.filter((p) => wishlist.includes(p.handle));
  return (
    <div className="container-x min-h-[50vh] py-12">
      <h1 className="text-3xl font-extrabold md:text-4xl">Wishlist</h1>
      {ready && items.length === 0 ? (
        <div className="mt-10 flex flex-col items-center gap-3 rounded-lg bg-surface p-12 text-center">
          <Heart className="size-10 text-muted" aria-hidden />
          <p className="text-lg font-bold">Nothing saved yet</p>
          <p className="text-muted">Tap the heart on any product to save it here.</p>
          <Link href="/collections/shop-all" className="mt-2 font-bold text-accent hover:underline">Browse products</Link>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-3 md:gap-5 lg:grid-cols-4">{items.map((p) => <ProductCard key={p.id} product={p} />)}</div>
      )}
    </div>
  );
}
