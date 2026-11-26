"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { Coupon } from "@/data/types";
import type { CartLine, PricingContext } from "./pricing";
import { totals } from "./pricing";
import { useCatalog } from "./catalog";

// Client-side store for the storefront: cart, wishlist, UI state. Persisted to
// localStorage so the cart survives a refresh. Prices come from the catalogue
// the server loaded (useCatalog); the server prices the order again at checkout.

type User = { name: string; phone: string; isMember: boolean } | null;

type Store = {
  lines: CartLine[];
  add: (variantId: string, qty?: number) => void;
  setQty: (variantId: string, qty: number) => void;
  remove: (variantId: string) => void;
  clear: () => void;
  couponCode?: string;
  applyCoupon: (code?: string) => void;
  addCoupon: (c: Coupon) => void; // a valid code that is not listed in the cart
  pricing: PricingContext;
  membershipInCart: boolean;
  setMembershipInCart: (v: boolean) => void;
  wishlist: string[];
  toggleWish: (handle: string) => void;
  user: User;
  signIn: (u: NonNullable<User>) => void;
  signOut: () => void;
  cartOpen: boolean;
  setCartOpen: (v: boolean) => void;
  notifyFor: string | null; // product title the notify-me modal is open for
  setNotifyFor: (v: string | null) => void;
  toast: string | null;
  showToast: (msg: string) => void;
  summary: ReturnType<typeof totals>;
  quote: (pay: "online" | "cod") => ReturnType<typeof totals>;
  ready: boolean;
};

const Ctx = createContext<Store | null>(null);
const KEY = "seoul-store-v1";

function load(): Partial<Pick<Store, "lines" | "couponCode" | "membershipInCart" | "wishlist" | "user">> {
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const catalog = useCatalog();
  const [extraCoupons, setExtraCoupons] = useState<Coupon[]>([]);
  const [lines, setLines] = useState<CartLine[]>([]);
  const [couponCode, setCoupon] = useState<string | undefined>();
  const [membershipInCart, setMembershipInCart] = useState(false);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [user, setUser] = useState<User>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [notifyFor, setNotifyFor] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const s = load();
    if (s.lines) setLines(s.lines);
    if (s.couponCode) setCoupon(s.couponCode);
    if (s.membershipInCart) setMembershipInCart(s.membershipInCart);
    if (s.wishlist) setWishlist(s.wishlist);
    if (s.user) setUser(s.user);
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      window.localStorage.setItem(KEY, JSON.stringify({ lines, couponCode, membershipInCart, wishlist, user }));
    } catch {
      /* storage unavailable: keep working in memory */
    }
  }, [lines, couponCode, membershipInCart, wishlist, user, ready]);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2500);
  }, []);

  const add = useCallback((variantId: string, qty = 1) => {
    setLines((prev) => {
      const hit = prev.find((l) => l.variantId === variantId);
      return hit ? prev.map((l) => (l.variantId === variantId ? { ...l, qty: l.qty + qty } : l)) : [...prev, { variantId, qty }];
    });
  }, []);

  const setQty = useCallback((variantId: string, qty: number) => {
    setLines((prev) => (qty <= 0 ? prev.filter((l) => l.variantId !== variantId) : prev.map((l) => (l.variantId === variantId ? { ...l, qty } : l))));
  }, []);

  // Drop cart lines for products that no longer exist (deleted or archived).
  useEffect(() => {
    if (!ready) return;
    setLines((prev) => {
      const kept = prev.filter((l) => catalog.findVariant(l.variantId));
      return kept.length === prev.length ? prev : kept;
    });
  }, [ready, catalog]);

  const value = useMemo<Store>(() => {
    const pricing: PricingContext = { findVariant: catalog.findVariant, coupons: [...catalog.coupons, ...extraCoupons], settings: catalog.settings };
    const opts = { member: !!user?.isMember, membershipInCart, couponCode };
    const summary = totals(lines, opts, pricing);
    return {
      lines, add, setQty, pricing,
      addCoupon: (c) => setExtraCoupons((x) => (x.some((y) => y.code === c.code) ? x : [...x, c])),
      quote: (pay) => totals(lines, { ...opts, pay }, pricing),
      remove: (id) => setLines((p) => p.filter((l) => l.variantId !== id)),
      clear: () => { setLines([]); setCoupon(undefined); setMembershipInCart(false); },
      couponCode, applyCoupon: setCoupon,
      membershipInCart, setMembershipInCart,
      wishlist,
      toggleWish: (h) => setWishlist((w) => (w.includes(h) ? w.filter((x) => x !== h) : [...w, h])),
      user, signIn: setUser, signOut: () => setUser(null),
      cartOpen, setCartOpen, notifyFor, setNotifyFor, toast, showToast,
      summary, ready,
    };
  }, [lines, add, setQty, couponCode, membershipInCart, wishlist, user, cartOpen, notifyFor, toast, showToast, ready, catalog, extraCoupons]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore() {
  const s = useContext(Ctx);
  if (!s) throw new Error("useStore must be used inside StoreProvider");
  return s;
}
