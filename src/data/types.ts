export type Variant = {
  id: string;
  label: string; // "1 KG", "Pack of 2"
  price: number; // INR, selling price
  mrp: number; // INR, printed MRP
  stock: number;
};

export type Faq = { q: string; a: string };

export type Product = {
  id: string;
  handle: string;
  title: string;
  subtitle: string;
  label: string; // flavour or short tag shown above the card title
  categories: string[]; // category collection handles
  benefits: string[]; // benefit collection handles
  badges: string[];
  art: { from: string; to: string; ink: string }; // placeholder pack art colours
  rating: number;
  reviewCount: number;
  ratingSplit: [number, number, number, number, number]; // % of 5,4,3,2,1 stars
  variants: Variant[];
  description: string[];
  highlights: string[];
  ingredients: { name: string; note: string }[];
  howToTake: string;
  faqs: Faq[];
  labReports: string[];
  specs: Record<string, string>;
  rank: number; // best-selling order, lower is better
  isNew?: boolean;
};

export type Collection = {
  handle: string;
  title: string;
  group: "category" | "benefit" | "special";
  intro: string;
  icon: string; // lucide icon name, see components/Icon.tsx
  match: (p: Product) => boolean;
  seo?: {
    compare?: { head: string[]; rows: string[][] };
    blocks?: { title: string; body: string }[];
    faqs?: Faq[];
  };
};

export type Coupon = {
  code: string;
  kind: "percent" | "flat";
  value: number;
  minSubtotal: number;
  description: string;
};

export type Review = {
  productHandle: string;
  rating: number;
  title: string;
  body: string;
  author: string;
  date: string;
};
