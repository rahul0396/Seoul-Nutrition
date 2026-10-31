"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Check, ChevronRight, Loader2, Minus, Plus, Star, X } from "lucide-react";
import { inr, memberPrice, pctOff } from "@/lib/pricing";

type BtnProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "accent" | "outline" | "ghost" | "member";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  done?: boolean;
};

const variants = {
  primary: "bg-ink text-on-ink hover:bg-black",
  accent: "bg-accent text-on-accent hover:brightness-110",
  outline: "border border-ink text-ink hover:bg-ink hover:text-on-ink",
  ghost: "text-ink hover:bg-surface",
  member: "bg-member text-on-ink hover:brightness-110",
};
const sizes = { sm: "h-9 px-3 text-sm", md: "h-11 px-5 text-sm", lg: "h-13 px-6 text-base" };

export function Button({ variant = "primary", size = "md", loading, done, className = "", children, disabled, ...rest }: BtnProps) {
  return (
    <button
      {...rest}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={`inline-flex items-center justify-center gap-2 rounded-full font-bold transition duration-150 ease-[var(--ease-brand)] hover:-translate-y-px active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {loading ? <Loader2 className="size-4 animate-spin" aria-hidden /> : done ? <Check className="size-4" aria-hidden /> : null}
      {children}
    </button>
  );
}

export function Stars({ value, size = "size-4" }: { value: number; size?: string }) {
  return (
    <span className="inline-flex items-center" aria-label={`${value.toFixed(1)} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => {
        const fill = Math.max(0, Math.min(1, value - (i - 1)));
        return (
          <span key={i} className={`relative ${size}`}>
            <Star className={`absolute inset-0 ${size} text-line`} fill="currentColor" strokeWidth={0} />
            <span className="absolute inset-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
              <Star className={`${size} text-[#e0a100]`} fill="currentColor" strokeWidth={0} />
            </span>
          </span>
        );
      })}
    </span>
  );
}

export function Badge({ children, tone = "ink" }: { children: React.ReactNode; tone?: "ink" | "accent" | "member" | "soft" }) {
  const t = {
    ink: "bg-ink text-on-ink",
    accent: "bg-accent text-on-accent",
    member: "bg-member text-on-ink",
    soft: "bg-accent-soft text-accent",
  }[tone];
  return <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${t}`}>{children}</span>;
}

export function badgeTone(b: string): "ink" | "accent" | "member" | "soft" {
  if (/new/i.test(b)) return "member";
  if (/deal|sale/i.test(b)) return "accent";
  return "ink";
}

export function PriceBlock({ price, mrp, size = "md", showMember = true }: { price: number; mrp: number; size?: "sm" | "md" | "lg"; showMember?: boolean }) {
  const off = pctOff(price, mrp);
  const big = { sm: "text-base", md: "text-lg", lg: "text-3xl" }[size];
  return (
    <div className="space-y-1">
      <div className="flex flex-wrap items-baseline gap-x-2">
        <span className={`${big} font-extrabold`}>{inr(price)}</span>
        {off > 0 && <span className="text-sm text-muted line-through">{inr(mrp)}</span>}
        {off > 0 && <span className="text-sm font-bold text-accent">{off}% off</span>}
      </div>
      {showMember && (
        <Link href="/pages/membership-access" className="group inline-flex items-center gap-1 text-xs font-semibold text-member">
          <span>Member price {inr(memberPrice(price))}</span>
          <span className="rounded-full bg-member px-1.5 py-0.5 text-[10px] font-bold text-on-ink transition group-hover:brightness-110">JOIN</span>
          <ChevronRight className="size-3" aria-hidden />
        </Link>
      )}
    </div>
  );
}

export function QtyStepper({ value, onChange, max = 99, label = "Quantity" }: { value: number; onChange: (n: number) => void; max?: number; label?: string }) {
  return (
    <div className="inline-flex h-11 items-center rounded-full border border-line-input" role="group" aria-label={label}>
      <button type="button" className="grid size-11 place-items-center rounded-full hover:bg-surface disabled:opacity-40" onClick={() => onChange(value - 1)} disabled={value <= 1} aria-label="Decrease quantity">
        <Minus className="size-4" aria-hidden />
      </button>
      <span className="w-8 text-center font-bold tabular-nums" aria-live="polite">{value}</span>
      <button type="button" className="grid size-11 place-items-center rounded-full hover:bg-surface disabled:opacity-40" onClick={() => onChange(value + 1)} disabled={value >= max} aria-label="Increase quantity">
        <Plus className="size-4" aria-hidden />
      </button>
    </div>
  );
}

export function Accordion({ items, className = "" }: { items: { q: string; a: string }[]; className?: string }) {
  return (
    <div className={`divide-y divide-line border-y border-line ${className}`}>
      {items.map((f, i) => (
        <details key={i} className="group py-4">
          <summary className="flex items-center justify-between gap-4 font-bold">
            {f.q}
            <Plus className="acc-icon size-5 shrink-0 transition-transform duration-200" aria-hidden />
          </summary>
          <p className="mt-3 text-muted">{f.a}</p>
        </details>
      ))}
    </div>
  );
}

export function Breadcrumbs({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="text-sm text-muted">
      <ol className="flex flex-wrap items-center gap-1">
        {items.map((it, i) => (
          <li key={i} className="flex items-center gap-1">
            {i > 0 && <ChevronRight className="size-3.5" aria-hidden />}
            {it.href ? <Link href={it.href} className="hover:text-ink hover:underline">{it.label}</Link> : <span aria-current="page" className="text-ink">{it.label}</span>}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function SectionHeading({ eyebrow, title, sub, action }: { eyebrow?: string; title: string; sub?: string; action?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4 md:mb-8">
      <div>
        {eyebrow && <p className="mb-1 text-xs font-bold uppercase tracking-[0.2em] text-accent">{eyebrow}</p>}
        <h2 className="text-2xl font-extrabold tracking-tight md:text-4xl">{title}</h2>
        {sub && <p className="mt-2 max-w-2xl text-muted">{sub}</p>}
      </div>
      {action}
    </div>
  );
}

/** Side drawer or centred modal with overlay, Esc to close, body scroll lock. */
export function Overlay({ open, onClose, side = "right", label, children, width = "w-full max-w-[420px]" }: {
  open: boolean; onClose: () => void; side?: "right" | "left" | "center"; label: string; children: React.ReactNode; width?: string;
}) {
  const panel = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    panel.current?.focus();
    return () => { document.body.style.overflow = prev; window.removeEventListener("keydown", onKey); };
  }, [open, onClose]);
  if (!open) return null;
  const pos = side === "right" ? "right-0 top-0 h-full animate-slide-in-right" : side === "left" ? "left-0 top-0 h-full animate-slide-in-left" : "left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 max-h-[90vh] rounded-lg animate-pop";
  return (
    <div className="fixed inset-0 z-[60]">
      <button aria-label="Close" className="absolute inset-0 bg-black/50 animate-[fade-up_200ms_ease_both]" onClick={onClose} tabIndex={-1} />
      <div ref={panel} tabIndex={-1} role="dialog" aria-modal="true" aria-label={label} className={`absolute flex flex-col overflow-hidden bg-bg shadow-pop outline-none ${pos} ${side === "center" ? "w-[min(92vw,520px)]" : width}`}>
        {children}
      </div>
    </div>
  );
}

export function CloseButton({ onClick, label = "Close" }: { onClick: () => void; label?: string }) {
  return (
    <button onClick={onClick} aria-label={label} className="grid size-10 place-items-center rounded-full hover:bg-surface">
      <X className="size-5" aria-hidden />
    </button>
  );
}

export function useIsClient() {
  const [c, setC] = useState(false);
  useEffect(() => setC(true), []);
  return c;
}
