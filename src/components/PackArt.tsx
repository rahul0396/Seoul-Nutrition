import type { Product } from "@/data/types";
import { site } from "@/data/site";

// Placeholder product image: a generated pouch illustration in the product's
// colours. Replace with real photos: put files in public/products/ and render
// <img src={`/products/${product.handle}-${view}.jpg`} /> here instead.

type View = "front" | "back" | "lifestyle" | "scoop";

export function PackArt({ product, view = "front", className = "" }: { product: Product; view?: View; className?: string }) {
  const { from, to, ink } = product.art;
  const id = `g-${product.id}-${view}`;
  const isAccessory = product.categories.includes("accessories");
  const word = product.label.length > 16 ? product.label.slice(0, 15) + "…" : product.label;

  return (
    <svg viewBox="0 0 400 400" className={className} role="img" aria-label={`${product.title} (${view} image placeholder)`}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={from} />
          <stop offset="1" stopColor={to} />
        </linearGradient>
        <radialGradient id={`${id}-bg`} cx="0.5" cy="0.4" r="0.7">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#efebe4" />
        </radialGradient>
      </defs>
      <rect width="400" height="400" fill={view === "lifestyle" ? from : `url(#${id}-bg)`} opacity={view === "lifestyle" ? 0.25 : 1} />
      {view === "scoop" ? (
        <g>
          <ellipse cx="200" cy="270" rx="120" ry="28" fill="#00000014" />
          <path d="M110 200 Q200 320 290 200 Z" fill={`url(#${id})`} />
          <ellipse cx="200" cy="200" rx="90" ry="22" fill={from} />
          <rect x="280" y="190" width="90" height="16" rx="8" fill={to} />
          <text x="200" y="350" textAnchor="middle" fontSize="18" fontWeight="700" fill="#5e584e">One scoop · placeholder</text>
        </g>
      ) : isAccessory ? (
        <g>
          <ellipse cx="200" cy="340" rx="90" ry="14" fill="#00000018" />
          <rect x="140" y="90" width="120" height="250" rx="24" fill={`url(#${id})`} />
          <rect x="150" y="70" width="100" height="36" rx="10" fill={to} />
          <text x="200" y="230" textAnchor="middle" fontSize="20" fontWeight="800" letterSpacing="3" fill={ink}>{site.short}</text>
        </g>
      ) : (
        <g>
          <ellipse cx="200" cy="352" rx="110" ry="14" fill="#00000018" />
          <path d="M112 78 Q200 62 288 78 L300 340 Q200 356 100 340 Z" fill={`url(#${id})`} />
          <path d="M112 78 Q200 62 288 78 L290 104 Q200 90 110 104 Z" fill="#ffffff" opacity="0.18" />
          {view === "back" ? (
            <g fill={ink} opacity="0.85">
              <text x="200" y="140" textAnchor="middle" fontSize="16" fontWeight="800" letterSpacing="2">NUTRITION FACTS</text>
              {[0, 1, 2, 3, 4, 5, 6].map((i) => (
                <rect key={i} x="135" y={160 + i * 22} width={i % 2 ? 100 : 130} height="8" rx="4" opacity="0.6" />
              ))}
            </g>
          ) : (
            <g fill={ink}>
              <text x="200" y="150" textAnchor="middle" fontSize="26" fontWeight="800" letterSpacing="6">{site.short}</text>
              <text x="200" y="174" textAnchor="middle" fontSize="11" fontWeight="600" letterSpacing="3" opacity="0.8">NUTRITION</text>
              <rect x="150" y="196" width="100" height="2" opacity="0.5" />
              <text x="200" y="232" textAnchor="middle" fontSize="17" fontWeight="700">{word}</text>
              <text x="200" y="300" textAnchor="middle" fontSize="12" fontWeight="600" opacity="0.75">{product.variants[0].label}</text>
            </g>
          )}
        </g>
      )}
    </svg>
  );
}
