import type { Collection } from "./types";
import { products } from "./products";

const cat = (h: string) => (p: { categories: string[] }) => p.categories.includes(h);
const ben = (h: string) => (p: { benefits: string[] }) => p.benefits.includes(h);

const proteinFaqs = [
  { q: "Isolate or concentrate: which should I pick?", a: "Isolate has more protein and less lactose per scoop. Concentrate is creamier and costs less. Both build muscle." },
  { q: "How much protein do I need a day?", a: "Most active adults do well with 1.2 to 2 g per kg of body weight, split across meals." },
  { q: "Can women take whey protein?", a: "Yes. Protein needs are about body weight and activity, not gender." },
  { q: "Will whey make me bulky?", a: "No. Muscle gain comes from training and total calories. Whey is just food-grade protein." },
  { q: "Do you test for amino spiking?", a: "Yes. Every batch is tested for its real protein content by an independent lab." },
];

export const collections: Collection[] = [
  // Categories
  {
    handle: "shop-all", title: "Shop All", group: "special", icon: "LayoutGrid",
    intro: "Every Seoul Nutrition product in one place.", match: () => true,
  },
  {
    handle: "protein-powders", title: "Protein Powders", group: "category", icon: "Dumbbell",
    intro: "Whey and plant protein for recovery, strength and everyday nutrition.", match: cat("protein-powders"),
  },
  {
    handle: "whey-protein", title: "Whey Protein for Muscle Gain and Recovery", group: "category", icon: "Dumbbell",
    intro: "Clean, lab-tested whey that mixes fast and sits easy on the stomach. Pick isolate for the most protein per scoop, or a blend for everyday value.",
    match: (p) => cat("whey-protein")(p) || p.categories.includes("accessories") || p.categories.includes("creatine"),
    seo: {
      compare: {
        head: ["", "Isolate", "Blend", "Raw concentrate"],
        rows: [
          ["Protein per scoop", "26 to 27 g", "25 g", "24 g"],
          ["Lactose", "Very low", "Low", "Moderate"],
          ["Best for", "Lean goals, sensitive stomach", "Everyday training", "Cooking and smoothies"],
          ["Flavours", "Chocolate, Coffee, Strawberry", "Kesar Pista", "Unflavoured"],
          ["Price from", "₹2,899", "₹2,399", "₹1,899"],
        ],
      },
      blocks: [
        { title: "Faster recovery", body: "Whey is absorbed quickly, so your muscles get amino acids when they need them most, right after training." },
        { title: "Easy daily protein", body: "One scoop adds 24 to 27 g of protein to your day, which is hard to get from dal and roti alone." },
        { title: "Light on the gut", body: "Micro-filtered whey with digestive enzymes means less bloating than regular concentrate." },
        { title: "How to use it", body: "One scoop after your workout. On rest days, have it with breakfast. Consistency matters more than timing." },
        { title: "Who it is for", body: "Gym-goers, runners, busy professionals and anyone falling short of their daily protein. Speak to your doctor if you have a kidney condition." },
      ],
      faqs: proteinFaqs,
    },
  },
  { handle: "whey-protein-isolate", title: "Whey Protein Isolate", group: "category", icon: "Dumbbell", intro: "The most protein per scoop with the least lactose.", match: cat("whey-protein-isolate") },
  { handle: "whey-protein-concentrate", title: "Whey Protein Concentrate", group: "category", icon: "Dumbbell", intro: "Creamy, great-value whey for everyday training.", match: cat("whey-protein-concentrate") },
  { handle: "plant-protein", title: "Plant Protein", group: "category", icon: "Leaf", intro: "Vegan protein from pea and brown rice.", match: cat("plant-protein") },
  { handle: "creatine", title: "Creatine", group: "category", icon: "Zap", intro: "Micronised creatine monohydrate for strength.", match: cat("creatine") },
  { handle: "collagen", title: "Collagen", group: "category", icon: "Sparkles", intro: "Collagen peptides for skin, hair and joints.", match: cat("collagen") },
  { handle: "vitamins-minerals", title: "Vitamins and Minerals", group: "category", icon: "Pill", intro: "Daily essentials to fill the gaps in your diet.", match: cat("vitamins-minerals") },
  { handle: "electrolytes", title: "Electrolytes", group: "category", icon: "Droplets", intro: "Sugar-free hydration for workouts and hot days.", match: cat("electrolytes") },
  { handle: "accessories", title: "Accessories", group: "category", icon: "ShoppingBag", intro: "Shakers, bags and gear.", match: cat("accessories") },
  { handle: "new-launch", title: "New Launches", group: "special", icon: "BadgePlus", intro: "The latest from Seoul Nutrition.", match: (p) => !!p.isNew },
  // Benefits
  { handle: "sports-performance", title: "Sports and Performance", group: "benefit", icon: "Trophy", intro: "Train harder and recover faster.", match: ben("sports-performance") },
  { handle: "weight-management", title: "Weight Management", group: "benefit", icon: "Scale", intro: "High protein, low sugar support for your goals.", match: ben("weight-management") },
  { handle: "gut-health", title: "Gut Health", group: "benefit", icon: "Apple", intro: "Fibre and probiotics for better digestion.", match: ben("gut-health") },
  { handle: "sleep-stress", title: "Sleep and Stress", group: "benefit", icon: "Moon", intro: "Wind down and sleep deeper.", match: ben("sleep-stress") },
  { handle: "immunity", title: "Immunity", group: "benefit", icon: "Shield", intro: "Everyday immune support.", match: ben("immunity") },
  { handle: "skin-hair", title: "Skin and Hair", group: "benefit", icon: "Sparkles", intro: "Beauty from the inside.", match: ben("skin-hair") },
  { handle: "energy", title: "Energy", group: "benefit", icon: "BatteryCharging", intro: "Steady energy without the crash.", match: ben("energy") },
  { handle: "bone-joint", title: "Bone and Joint", group: "benefit", icon: "Bone", intro: "Support for joints and bones.", match: ben("bone-joint") },
];

export const getCollection = (handle: string) => collections.find((c) => c.handle === handle);
export const productsIn = (handle: string) => {
  const c = getCollection(handle);
  return c ? products.filter(c.match) : [];
};
export const categoryCollections = collections.filter((c) => c.group === "category" && !c.handle.startsWith("whey-protein-"));
export const benefitCollections = collections.filter((c) => c.group === "benefit");
