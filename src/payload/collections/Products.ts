import { APIError, type CollectionBeforeChangeHook, type CollectionConfig, type FieldHook } from "payload";
import { collections } from "@/data/collections";
import { isAdmin, isAdminField, isStaff, userRole } from "../access";
import { revalidateAfterChange, revalidateAfterDelete } from "../hooks/revalidate";

const categoryOptions = collections.filter((c) => c.group === "category").map((c) => ({ label: c.title.replace(" for Muscle Gain and Recovery", ""), value: c.handle }));
const benefitOptions = collections.filter((c) => c.group === "benefit").map((c) => ({ label: c.title, value: c.handle }));

const slugify = (s: string) =>
  s.toLowerCase().normalize("NFKD").replace(/[^\w\s-]/g, "").trim().replace(/[\s_-]+/g, "-").replace(/^-+|-+$/g, "");

const handleFromTitle: FieldHook = ({ value, data, operation }) => {
  if (typeof value === "string" && value.trim()) return slugify(value);
  if (operation === "create" && data?.title) return slugify(String(data.title));
  return value;
};

// Staff may change stock, but only an admin may add or remove pack sizes.
const staffKeepsPackSizes: CollectionBeforeChangeHook = ({ data, originalDoc, req, operation }) => {
  if (operation !== "update" || !req.user || userRole(req.user) === "admin" || !data.variants) return data;
  const ids = (rows: { id?: string | null }[] | undefined) => (rows ?? []).map((r) => r.id).sort().join(",");
  if (ids(data.variants) !== ids(originalDoc?.variants)) throw new APIError("Only an admin can add or remove pack sizes.", 403, null, true);
  return data;
};

export const Products: CollectionConfig = {
  slug: "products",
  admin: {
    group: "Shop",
    useAsTitle: "title",
    defaultColumns: ["title", "status", "categories", "rank", "updatedAt"],
    listSearchableFields: ["title", "handle", "label"],
    description: "Everything shown on the store. Changes go live within seconds of saving.",
    preview: (doc) => (doc?.handle ? `/products/${doc.handle}` : null),
  },
  access: {
    // The storefront reads through the server (overrideAccess), so the public API
    // only ever exposes active products.
    read: ({ req }) => (req.user ? true : { status: { equals: "active" } }),
    create: isAdmin,
    update: isStaff, // staff can update stock; price fields below are admin-only
    delete: isAdmin,
  },
  hooks: { beforeChange: [staffKeepsPackSizes], afterChange: [revalidateAfterChange], afterDelete: [revalidateAfterDelete] },
  defaultSort: "rank",
  fields: [
    {
      type: "tabs",
      tabs: [
        {
          label: "Basics",
          fields: [
            { name: "title", type: "text", required: true, access: { update: isAdminField } },
            {
              type: "row",
              fields: [
                {
                  name: "status",
                  type: "select",
                  required: true,
                  defaultValue: "draft",
                  options: [
                    { label: "Active (on the store)", value: "active" },
                    { label: "Draft (hidden)", value: "draft" },
                    { label: "Archived", value: "archived" },
                  ],
                  access: { update: isAdminField },
                },
                {
                  name: "handle",
                  type: "text",
                  unique: true,
                  index: true,
                  admin: { description: "URL: /products/<handle>. Leave empty to build it from the title." },
                  hooks: { beforeValidate: [handleFromTitle] },
                  access: { update: isAdminField },
                },
              ],
            },
            { name: "subtitle", type: "text" },
            { name: "label", type: "text", admin: { description: "Short tag above the card title, usually the flavour." } },
            {
              name: "variants",
              label: "Pack sizes and stock",
              type: "array",
              required: true,
              minRows: 1,
              labels: { singular: "Pack size", plural: "Pack sizes" },
              admin: { initCollapsed: false },
              fields: [
                {
                  type: "row",
                  fields: [
                    { name: "label", type: "text", required: true, admin: { placeholder: "1 KG", width: "25%" }, access: { update: isAdminField } },
                    { name: "sku", type: "text", admin: { width: "25%" }, access: { update: isAdminField } },
                    { name: "price", label: "Selling price (₹)", type: "number", required: true, min: 0, admin: { width: "25%" }, access: { update: isAdminField } },
                    { name: "mrp", label: "MRP (₹)", type: "number", required: true, min: 0, admin: { width: "25%" }, access: { update: isAdminField } },
                  ],
                },
                {
                  type: "row",
                  fields: [
                    { name: "stock", type: "number", required: true, min: 0, defaultValue: 0, admin: { width: "25%", description: "Goes down automatically when orders are placed." } },
                    { name: "weightGrams", label: "Shipping weight (g)", type: "number", min: 0, admin: { width: "25%" } },
                  ],
                },
              ],
            },
            { name: "images", type: "upload", relationTo: "media", hasMany: true, admin: { description: "First image is the main photo. Up to 4 are used in the gallery." } },
          ],
        },
        {
          label: "Where it shows",
          fields: [
            { name: "categories", type: "select", hasMany: true, options: categoryOptions },
            { name: "benefits", type: "select", hasMany: true, options: benefitOptions },
            { name: "badges", type: "text", hasMany: true, admin: { description: "For example: Bestseller, New launch" } },
            {
              type: "row",
              fields: [
                { name: "rank", type: "number", defaultValue: 50, admin: { description: "Best-seller order. Lower shows first." } },
                { name: "newLaunch", label: "Mark as new", type: "checkbox" },
              ],
            },
          ],
        },
        {
          label: "Details",
          fields: [
            { name: "description", type: "textarea", admin: { description: "Leave a blank line between paragraphs." } },
            { name: "highlights", type: "text", hasMany: true },
            { name: "ingredients", type: "array", fields: [{ type: "row", fields: [{ name: "name", type: "text", required: true }, { name: "note", type: "text" }] }] },
            { name: "howToTake", type: "textarea" },
            { name: "faqs", label: "FAQs", type: "array", fields: [{ name: "q", label: "Question", type: "text", required: true }, { name: "a", label: "Answer", type: "textarea", required: true }] },
            { name: "labReports", type: "array", fields: [{ type: "row", fields: [{ name: "title", type: "text", required: true }, { name: "file", type: "upload", relationTo: "media" }] }] },
            { name: "specs", type: "array", fields: [{ type: "row", fields: [{ name: "key", label: "Label", type: "text", required: true }, { name: "value", type: "text", required: true }] }] },
          ],
        },
        {
          label: "Look and ratings",
          fields: [
            {
              name: "art",
              label: "Placeholder pack colours (used until you upload photos)",
              type: "group",
              fields: [{ type: "row", fields: [{ name: "from", type: "text", defaultValue: "#ebe7e0" }, { name: "to", type: "text", defaultValue: "#d8d1c6" }, { name: "ink", type: "text", defaultValue: "#16140f" }] }],
            },
            {
              name: "ratings",
              type: "group",
              admin: { description: "Shown on the product page. Update these from your approved reviews." },
              fields: [
                { type: "row", fields: [{ name: "average", type: "number", min: 0, max: 5, defaultValue: 0 }, { name: "count", type: "number", min: 0, defaultValue: 0 }] },
                { name: "split", label: "% of 5, 4, 3, 2, 1 stars", type: "number", hasMany: true, minRows: 0, maxRows: 5 },
              ],
            },
          ],
        },
      ],
    },
  ],
};
