import type { CollectionAfterChangeHook, CollectionAfterDeleteHook, GlobalAfterChangeHook } from "payload";
import { revalidateTag } from "next/cache";

export const CATALOG_TAG = "catalog";

// Tell Next.js the cached catalogue is out of date, so the storefront shows the
// new price, stock or setting on the very next request. Outside a Next.js
// request (for example the seed script) there is no cache to clear, so errors
// are ignored.
export function revalidateCatalog() {
  try {
    revalidateTag(CATALOG_TAG, { expire: 0 });
  } catch {
    /* not running inside Next.js */
  }
}

export const revalidateAfterChange: CollectionAfterChangeHook = ({ doc, req }) => {
  if (!req.context?.skipRevalidate) revalidateCatalog();
  return doc;
};

export const revalidateAfterDelete: CollectionAfterDeleteHook = ({ doc, req }) => {
  if (!req.context?.skipRevalidate) revalidateCatalog();
  return doc;
};

export const revalidateGlobal: GlobalAfterChangeHook = ({ doc, req }) => {
  if (!req.context?.skipRevalidate) revalidateCatalog();
  return doc;
};
