"use client";

import { createContext, useContext, useMemo } from "react";
import type { Catalog } from "@/data/types";
import { variantIndex } from "./pricing";

// The catalogue the server loaded for this page, available to every client
// component through useCatalog(). Replaces importing src/data/products directly.

type Ctx = Catalog & { findVariant: ReturnType<typeof variantIndex>; findProduct: (handle: string) => Catalog["products"][number] | undefined };

const CatalogCtx = createContext<Ctx | null>(null);

export function CatalogProvider({ catalog, children }: { catalog: Catalog; children: React.ReactNode }) {
  const value = useMemo<Ctx>(() => {
    const byHandle = new Map(catalog.products.map((p) => [p.handle, p]));
    return { ...catalog, findVariant: variantIndex(catalog.products), findProduct: (h) => byHandle.get(h) };
  }, [catalog]);
  return <CatalogCtx.Provider value={value}>{children}</CatalogCtx.Provider>;
}

export function useCatalog() {
  const c = useContext(CatalogCtx);
  if (!c) throw new Error("useCatalog must be used inside CatalogProvider");
  return c;
}
