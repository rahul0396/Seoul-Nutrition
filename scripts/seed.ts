// Copies the starter catalogue in src/data into the database.
//
//   npm run seed            add products, coupons and settings that are missing
//   npm run seed -- --force also overwrite products and coupons that already exist
//
// Safe to run more than once. It never touches orders or customers.

import { getPayload } from "payload";
import config from "@payload-config";
import { products } from "@/data/products";
import { coupons, defaultSettings } from "@/data/site";

const force = process.argv.includes("--force");
const payload = await getPayload({ config });

// On a brand-new database MongoDB is still creating collections and indexes
// for a moment; wait for that, and retry the rare "try again" errors.
const models = (payload.db as unknown as { collections: Record<string, { init(): Promise<unknown> }> }).collections;
await Promise.all(Object.values(models).map((m) => m.init()));
async function retry<T>(fn: () => Promise<T>, tries = 5): Promise<T> {
  for (let i = 1; ; i++) {
    try {
      return await fn();
    } catch (e) {
      const transient = (e as { errorLabelSet?: Set<string> }).errorLabelSet?.has("TransientTransactionError");
      if (!transient || i >= tries) throw e;
      await new Promise((r) => setTimeout(r, 300 * i));
    }
  }
}
const ctx = { skipRevalidate: true };
let created = 0;
let updated = 0;
let skipped = 0;

for (const p of products) {
  const data = {
    title: p.title,
    handle: p.handle,
    status: "active" as const,
    subtitle: p.subtitle,
    label: p.label,
    categories: p.categories as never,
    benefits: p.benefits as never,
    badges: p.badges,
    rank: p.rank,
    newLaunch: !!p.isNew,
    art: p.art,
    ratings: { average: p.rating, count: p.reviewCount, split: [...p.ratingSplit] },
    variants: p.variants.map((v) => ({ label: v.label, sku: v.sku ?? v.id.toUpperCase(), price: v.price, mrp: v.mrp, stock: v.stock })),
    description: p.description.join("\n\n"),
    highlights: p.highlights,
    ingredients: p.ingredients,
    howToTake: p.howToTake,
    faqs: p.faqs,
    labReports: p.labReports.map((r) => ({ title: r.title })),
    specs: Object.entries(p.specs).map(([key, value]) => ({ key, value })),
  };
  const existing = await payload.find({ collection: "products", where: { handle: { equals: p.handle } }, limit: 1, depth: 0, overrideAccess: true });
  if (!existing.docs[0]) {
    await retry(() => payload.create({ collection: "products", data, overrideAccess: true, context: ctx }));
    created++;
  } else if (force) {
    await retry(() => payload.update({ collection: "products", id: existing.docs[0].id, data, overrideAccess: true, context: ctx }));
    updated++;
  } else skipped++;
}

for (const c of coupons) {
  const data = { code: c.code, description: c.description, kind: c.kind, value: c.value, minSubtotal: c.minSubtotal, active: true, showInCart: true };
  const existing = await payload.find({ collection: "coupons", where: { code: { equals: c.code } }, limit: 1, depth: 0, overrideAccess: true });
  if (!existing.docs[0]) await retry(() => payload.create({ collection: "coupons", data, overrideAccess: true, context: ctx }));
  else if (force) await retry(() => payload.update({ collection: "coupons", id: existing.docs[0].id, data, overrideAccess: true, context: ctx }));
}

const settings = await payload.findGlobal({ slug: "settings", depth: 0, overrideAccess: true });
if (force || !settings.announcements?.length) {
  await retry(() => payload.updateGlobal({ slug: "settings", data: defaultSettings, overrideAccess: true, context: ctx }));
}

payload.logger.info(`Seed done. Products: ${created} created, ${updated} updated, ${skipped} already there. Coupons and settings checked.`);
process.exit(0);
