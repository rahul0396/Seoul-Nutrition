import type { Product, Variant } from "./types";

// Placeholder catalogue for Seoul Nutrition. Replace titles, copy, prices and
// stock with your real products. Images are generated pack illustrations
// (components/PackArt.tsx) until you add real photos.

const whyWhey = [
  "Each scoop is micro-filtered for a clean, light mix that sits easy on the stomach.",
  "Built for daily training: fast-absorbing protein right after your workout, and a steady top-up on rest days.",
  "No added sugar, no amino spiking, and every batch is tested by an independent lab before it ships.",
];

const proteinFaqs = [
  { q: "When should I take it?", a: "Within an hour after training works best. On rest days, take it with breakfast or as a mid-day snack." },
  { q: "Can I take it with milk?", a: "Yes. Water keeps it lighter on calories; milk makes it creamier and adds extra protein." },
  { q: "Is it safe for beginners?", a: "Yes. Start with one scoop a day and check with your doctor if you have a medical condition." },
  { q: "Does it contain added sugar?", a: "No. It is sweetened with a small amount of stevia and sucralose-free flavouring." },
  { q: "How long does a 1 KG pack last?", a: "About 30 servings, or one month with one scoop a day." },
];

const v = (id: string, label: string, price: number, mrp: number, stock: number): Variant => ({ id, label, price, mrp, stock });

function make(p: Partial<Product> & Pick<Product, "id" | "handle" | "title" | "variants">): Product {
  return {
    subtitle: "",
    label: "",
    categories: [],
    benefits: [],
    badges: [],
    art: { from: "#ebe7e0", to: "#d8d1c6", ink: "#16140f" },
    rating: 4.6,
    reviewCount: 0,
    ratingSplit: [72, 18, 6, 2, 2],
    description: whyWhey,
    highlights: [],
    ingredients: [],
    howToTake: "Mix one scoop (33 g) in 200 to 250 ml of cold water or milk. Shake for 20 seconds.",
    faqs: proteinFaqs,
    labReports: ["Protein content report", "Heavy metals report", "Amino profile report", "FSSAI licence"],
    specs: {},
    rank: 50,
    ...p,
  };
}

const wheySpecs = (flavour: string) => ({
  "Product name": `Seoul Nutrition Whey Protein, ${flavour}`,
  Form: "Powder",
  "Serving size": "33 g (1 scoop)",
  "Servings per 1 KG": "30",
  "Shelf life": "18 months from manufacture",
  Origin: "India",
  "Marketed by": "Seoul Nutrition (replace with your registered entity)",
});

const wheyIngredients = [
  { name: "Whey protein isolate", note: "Filtered to over 90% protein with very little lactose." },
  { name: "Whey protein concentrate", note: "Keeps the natural peptides and a creamier taste." },
  { name: "Digestive enzymes", note: "A blend that helps break protein down comfortably." },
  { name: "Natural flavour", note: "Real flavour extracts, no artificial colour." },
];

export const products: Product[] = [
  make({
    id: "p1", handle: "whey-isolate-double-chocolate", rank: 1,
    title: "Whey Protein Isolate, 27 g Protein, Double Chocolate",
    subtitle: "Light, fast-absorbing isolate for daily recovery",
    label: "Double Chocolate", categories: ["whey-protein", "whey-protein-isolate", "protein-powders"],
    benefits: ["sports-performance", "weight-management"], badges: ["Bestseller"],
    art: { from: "#4a2c21", to: "#2a1712", ink: "#ffffff" }, rating: 4.7, reviewCount: 684,
    variants: [v("p1-1", "1 KG", 2899, 3999, 120), v("p1-2", "2 KG", 5399, 7998, 46)],
    highlights: ["27 g protein per scoop", "6 g BCAA", "Low lactose", "No added sugar", "Lab tested every batch", "Mixes in 20 seconds"],
    ingredients: wheyIngredients, specs: wheySpecs("Double Chocolate"),
  }),
  make({
    id: "p2", handle: "whey-isolate-cold-coffee", rank: 2,
    title: "Whey Protein Isolate, 27 g Protein, Cold Coffee",
    subtitle: "Café-style coffee flavour with real Arabica extract",
    label: "Cold Coffee", categories: ["whey-protein", "whey-protein-isolate", "protein-powders"],
    benefits: ["sports-performance", "energy"], badges: ["Highly reordered"],
    art: { from: "#8a5a3b", to: "#4f3324", ink: "#ffffff" }, rating: 4.6, reviewCount: 412,
    variants: [v("p2-1", "1 KG", 2899, 3999, 80), v("p2-2", "2 KG", 5399, 7998, 0)],
    highlights: ["27 g protein per scoop", "Real coffee extract", "Low lactose", "No added sugar", "Lab tested every batch", "Mixes in 20 seconds"],
    ingredients: wheyIngredients, specs: wheySpecs("Cold Coffee"),
  }),
  make({
    id: "p3", handle: "whey-blend-kesar-pista", rank: 3, isNew: true,
    title: "Whey Protein Blend, 25 g Protein, Kesar Pista",
    subtitle: "A desi flavour made for everyday protein",
    label: "Kesar Pista", categories: ["whey-protein", "whey-protein-concentrate", "protein-powders"],
    benefits: ["sports-performance"], badges: ["New launch"],
    art: { from: "#e9b949", to: "#c98a1b", ink: "#16140f" }, rating: 4.8, reviewCount: 96,
    variants: [v("p3-1", "1 KG", 2399, 3299, 60), v("p3-2", "2 KG", 4499, 6598, 22)],
    highlights: ["25 g protein per scoop", "Real saffron and pistachio", "With digestive enzymes", "No added sugar", "Lab tested every batch", "Great with milk"],
    ingredients: wheyIngredients, specs: wheySpecs("Kesar Pista"),
  }),
  make({
    id: "p4", handle: "whey-concentrate-unflavoured", rank: 6,
    title: "Raw Whey Protein Concentrate, 24 g Protein, Unflavoured",
    subtitle: "Nothing added. Blend it into anything",
    label: "Unflavoured", categories: ["whey-protein", "whey-protein-concentrate", "protein-powders"],
    benefits: ["sports-performance", "weight-management"], badges: ["2 KG value deal"],
    art: { from: "#f4f1ea", to: "#dcd5c7", ink: "#16140f" }, rating: 4.5, reviewCount: 238,
    variants: [v("p4-1", "1 KG", 1899, 2599, 140), v("p4-2", "2 KG", 3499, 5198, 75)],
    highlights: ["24 g protein per scoop", "Single ingredient", "No sweetener", "No added sugar", "Lab tested every batch", "Use in smoothies and atta"],
    ingredients: [{ name: "Whey protein concentrate", note: "80% protein, nothing else added." }], specs: wheySpecs("Unflavoured"),
  }),
  make({
    id: "p5", handle: "whey-isolate-strawberry", rank: 8, isNew: true,
    title: "Whey Protein Isolate, 26 g Protein, Strawberry Shake",
    subtitle: "Fruity and light, like a milkshake without the sugar",
    label: "Strawberry", categories: ["whey-protein", "whey-protein-isolate", "protein-powders"],
    benefits: ["sports-performance", "skin-hair"], badges: ["New launch"],
    art: { from: "#f29bab", to: "#d85a74", ink: "#16140f" }, rating: 4.6, reviewCount: 54,
    variants: [v("p5-1", "1 KG", 2899, 3999, 0), v("p5-2", "2 KG", 5399, 7998, 0)],
    highlights: ["26 g protein per scoop", "Real strawberry powder", "Low lactose", "No added sugar", "Lab tested every batch", "Mixes in 20 seconds"],
    ingredients: wheyIngredients, specs: wheySpecs("Strawberry"),
  }),
  make({
    id: "p6", handle: "plant-protein-chocolate", rank: 9,
    title: "Plant Protein, 25 g Protein, Chocolate",
    subtitle: "Pea and brown rice protein for a full amino profile",
    label: "Chocolate", categories: ["plant-protein", "protein-powders"],
    benefits: ["gut-health", "weight-management"], badges: [],
    art: { from: "#6f8f4e", to: "#3f5a2a", ink: "#ffffff" }, rating: 4.4, reviewCount: 171,
    variants: [v("p6-1", "500 G", 1499, 1999, 55), v("p6-2", "1 KG", 2699, 3799, 30)],
    highlights: ["25 g protein per scoop", "Vegan", "Dairy free", "With fibre", "Lab tested every batch", "No bloating formula"],
    ingredients: [{ name: "Pea protein isolate", note: "Rich in arginine and BCAAs." }, { name: "Brown rice protein", note: "Completes the amino profile." }],
  }),
  make({
    id: "p7", handle: "creatine-monohydrate-unflavoured", rank: 4,
    title: "Creatine Monohydrate, 3 g per Serving, Unflavoured",
    subtitle: "Micronised creatine for strength and power",
    label: "Unflavoured", categories: ["creatine"], benefits: ["sports-performance", "energy"], badges: ["Bestseller"],
    art: { from: "#2c3e50", to: "#16212c", ink: "#ffffff" }, rating: 4.7, reviewCount: 520,
    variants: [v("p7-1", "100 G", 549, 799, 200), v("p7-2", "250 G", 1199, 1699, 90)],
    highlights: ["3 g creatine per serving", "Micronised for easy mixing", "Single ingredient", "No fillers", "Lab tested every batch", "Vegan"],
    ingredients: [{ name: "Creatine monohydrate", note: "The most studied form of creatine." }],
    howToTake: "Mix 3 g (one level scoop) in water or your protein shake once a day, every day, including rest days.",
    faqs: [{ q: "Do I need a loading phase?", a: "No. 3 g a day reaches the same level in about four weeks." }, { q: "Will it cause water retention?", a: "Some water is drawn into muscle, which is normal and not bloating." }],
  }),
  make({
    id: "p8", handle: "marine-collagen-orange", rank: 7,
    title: "Marine Collagen Peptides, 5 g, Orange",
    subtitle: "Type 1 and 3 collagen with vitamin C",
    label: "Orange", categories: ["collagen"], benefits: ["skin-hair", "bone-joint"], badges: [],
    art: { from: "#ffb36b", to: "#f0803c", ink: "#16140f" }, rating: 4.5, reviewCount: 302,
    variants: [v("p8-1", "200 G", 1299, 1799, 70), v("p8-2", "Pack of 2", 2399, 3598, 40)],
    highlights: ["5 g collagen per serving", "With vitamin C", "Type 1 and 3", "No added sugar", "Lab tested every batch", "Dissolves clear"],
    ingredients: [{ name: "Hydrolysed marine collagen", note: "Small peptides that absorb well." }, { name: "Vitamin C", note: "Supports the body's own collagen production." }],
    howToTake: "Mix one scoop in 200 ml of water once a day, ideally in the morning.",
  }),
  make({
    id: "p9", handle: "magnesium-glycinate-capsules", rank: 5,
    title: "Magnesium Glycinate, 60 Capsules",
    subtitle: "Gentle magnesium for sleep and muscle relaxation",
    label: "60 capsules", categories: ["vitamins-minerals"], benefits: ["sleep-stress", "bone-joint"], badges: ["Highly reordered"],
    art: { from: "#7f8fc9", to: "#4c5a99", ink: "#ffffff" }, rating: 4.6, reviewCount: 389,
    variants: [v("p9-1", "Pack of 1", 699, 999, 150), v("p9-2", "Pack of 2", 1299, 1998, 80)],
    highlights: ["Chelated for absorption", "Gentle on the stomach", "Vegan capsules", "No fillers", "Lab tested every batch", "Take at night"],
    ingredients: [{ name: "Magnesium bisglycinate", note: "Magnesium bound to glycine for better absorption." }],
    howToTake: "Take one capsule with water after dinner.",
  }),
  make({
    id: "p10", handle: "daily-multivitamin-tablets", rank: 10,
    title: "Daily Multivitamin for Active Adults, 60 Tablets",
    subtitle: "25 vitamins and minerals in one tablet",
    label: "60 tablets", categories: ["vitamins-minerals"], benefits: ["immunity", "energy"], badges: [],
    art: { from: "#f6d365", to: "#fda085", ink: "#16140f" }, rating: 4.4, reviewCount: 145,
    variants: [v("p10-1", "Pack of 1", 599, 899, 110), v("p10-2", "Pack of 2", 1099, 1798, 60)],
    highlights: ["25 nutrients", "With B12 and D3", "Vegan", "No added sugar", "Lab tested every batch", "Once a day"],
    ingredients: [{ name: "Vitamin D3", note: "Supports immunity and bones." }, { name: "Vitamin B12", note: "Supports energy." }, { name: "Zinc", note: "Supports immunity." }],
    howToTake: "Take one tablet with breakfast.",
  }),
  make({
    id: "p11", handle: "omega-3-fish-oil", rank: 12,
    title: "Omega 3 Fish Oil, 1000 mg, 60 Softgels",
    subtitle: "High-EPA fish oil, triple filtered",
    label: "60 softgels", categories: ["vitamins-minerals"], benefits: ["bone-joint", "immunity"], badges: [],
    art: { from: "#7dd3e8", to: "#2b8fb3", ink: "#16140f" }, rating: 4.3, reviewCount: 98,
    variants: [v("p11-1", "Pack of 1", 649, 999, 0), v("p11-2", "Pack of 2", 1199, 1998, 0)],
    highlights: ["1000 mg fish oil", "High EPA and DHA", "No fishy burps", "Triple filtered", "Lab tested every batch", "With vitamin E"],
    ingredients: [{ name: "Fish oil", note: "Sourced from small cold-water fish." }],
    howToTake: "Take one softgel with lunch.",
  }),
  make({
    id: "p12", handle: "electrolyte-hydration-lemon", rank: 11,
    title: "Electrolyte Hydration Mix, Lemon Lime, 20 Sachets",
    subtitle: "Five electrolytes, zero sugar",
    label: "Lemon Lime", categories: ["electrolytes"], benefits: ["sports-performance", "energy"], badges: [],
    art: { from: "#d4f06b", to: "#8cc63f", ink: "#16140f" }, rating: 4.5, reviewCount: 211,
    variants: [v("p12-1", "20 sachets", 499, 699, 160), v("p12-2", "Pack of 2", 949, 1398, 70)],
    highlights: ["5 electrolytes", "Zero sugar", "With vitamin C", "No artificial colour", "Lab tested every batch", "For workouts and travel"],
    ingredients: [{ name: "Sodium, potassium, magnesium, calcium, chloride", note: "Replaces what you lose in sweat." }],
    howToTake: "Mix one sachet in 500 ml of water. Sip during or after exercise.",
  }),
  make({
    id: "p13", handle: "probiotic-fibre-gut-mix", rank: 14,
    title: "Gut Fibre Mix with Probiotics, Unflavoured",
    subtitle: "Daily prebiotic fibre and 10 billion CFU",
    label: "Unflavoured", categories: ["vitamins-minerals"], benefits: ["gut-health", "weight-management"], badges: [],
    art: { from: "#b8e0c8", to: "#6fb58e", ink: "#16140f" }, rating: 4.4, reviewCount: 77,
    variants: [v("p13-1", "200 G", 799, 1099, 50)],
    highlights: ["5 g fibre", "10 billion CFU", "Tasteless", "Dissolves fully", "Lab tested every batch", "Kid friendly"],
    ingredients: [{ name: "Inulin and resistant dextrin", note: "Feeds the good bacteria in your gut." }, { name: "Probiotic blend", note: "Three well-studied strains." }],
    howToTake: "Stir one scoop into water, juice or dal once a day.",
  }),
  make({
    id: "p14", handle: "ashwagandha-sleep-gummies", rank: 13,
    title: "Ashwagandha and Melatonin Sleep Gummies, 30 Gummies",
    subtitle: "Wind down without feeling groggy",
    label: "Berry", categories: ["vitamins-minerals"], benefits: ["sleep-stress"], badges: [],
    art: { from: "#b79ee6", to: "#7a5bc4", ink: "#ffffff" }, rating: 4.3, reviewCount: 133,
    variants: [v("p14-1", "30 gummies", 599, 899, 90)],
    highlights: ["Ashwagandha extract", "Low-dose melatonin", "Sugar free", "Vegan", "Lab tested every batch", "Non habit forming"],
    ingredients: [{ name: "Ashwagandha root extract", note: "An adaptogen used for stress." }, { name: "Melatonin", note: "Helps you fall asleep." }],
    howToTake: "Chew one gummy 30 minutes before bed.",
  }),
  make({
    id: "p15", handle: "shaker-bottle-700ml", rank: 15,
    title: "Seoul Shaker Bottle, 700 ml, Black",
    subtitle: "Leak-proof shaker with a steel mixing ball",
    label: "Accessory", categories: ["accessories"], benefits: [], badges: [],
    art: { from: "#3a3a3a", to: "#111111", ink: "#ffffff" }, rating: 4.6, reviewCount: 66,
    variants: [v("p15-1", "700 ml", 399, 599, 300)],
    highlights: ["Leak proof", "BPA free", "Steel mixing ball", "Dishwasher safe", "Measurement marks", "Carry loop"],
    ingredients: [], description: ["A sturdy, leak-proof shaker for your daily protein.", "Steel ball whisks out every lump in seconds."],
    howToTake: "Add liquid first, then powder. Close the lid and shake.", faqs: [], labReports: [],
  }),
  make({
    id: "p16", handle: "gym-duffel-bag", rank: 16,
    title: "Seoul Training Duffel Bag",
    subtitle: "Shoe compartment, wet pocket, 32 litres",
    label: "Accessory", categories: ["accessories"], benefits: [], badges: [],
    art: { from: "#8c1d22", to: "#4a0d10", ink: "#ffffff" }, rating: 4.5, reviewCount: 21,
    variants: [v("p16-1", "32 L", 1299, 1999, 25)],
    highlights: ["32 litres", "Shoe compartment", "Wet pocket", "Water resistant", "Padded strap", "One year warranty"],
    ingredients: [], description: ["A training bag sized for gym, office and weekends."], howToTake: "", faqs: [], labReports: [],
  }),
];

export const getProduct = (handle: string) => products.find((p) => p.handle === handle);
export const getVariant = (id: string) => {
  for (const p of products) {
    const found = p.variants.find((x) => x.id === id);
    if (found) return { product: p, variant: found };
  }
  return undefined;
};
