import type { GlobalConfig } from "payload";
import { anyone, isAdmin } from "../access";
import { revalidateGlobal } from "../hooks/revalidate";

// Store-wide rules an admin can change without touching code.
export const Settings: GlobalConfig = {
  slug: "settings",
  label: "Store settings",
  admin: { group: "Settings" },
  access: { read: anyone, update: isAdmin },
  hooks: { afterChange: [revalidateGlobal] },
  fields: [
    {
      name: "announcements",
      label: "Announcement bar",
      type: "array",
      fields: [{ type: "row", fields: [{ name: "text", type: "text", required: true }, { name: "href", label: "Link", type: "text", defaultValue: "/" }] }],
    },
    {
      name: "shipping",
      type: "group",
      fields: [
        {
          type: "row",
          fields: [
            { name: "freeAbove", label: "Free shipping above (₹)", type: "number", required: true, defaultValue: 499, min: 0 },
            { name: "fee", label: "Shipping fee (₹)", type: "number", required: true, defaultValue: 49, min: 0 },
            { name: "prepaidExtra", label: "Extra % off when paying online", type: "number", required: true, defaultValue: 5, min: 0, max: 50 },
          ],
        },
      ],
    },
    {
      name: "cod",
      label: "Cash on delivery",
      type: "group",
      fields: [
        {
          type: "row",
          fields: [
            { name: "enabled", label: "Offer COD", type: "checkbox", defaultValue: true },
            { name: "maxOrderValue", label: "Max COD order (₹, 0 = no limit)", type: "number", defaultValue: 5000, min: 0 },
          ],
        },
      ],
    },
    {
      name: "membership",
      type: "group",
      fields: [
        {
          type: "row",
          fields: [
            { name: "price", label: "Price (₹)", type: "number", required: true, defaultValue: 149, min: 0 },
            { name: "mrp", label: "MRP (₹)", type: "number", required: true, defaultValue: 299, min: 0 },
            { name: "months", type: "number", required: true, defaultValue: 3, min: 1 },
            { name: "discount", label: "Member % off", type: "number", required: true, defaultValue: 15, min: 0, max: 90 },
          ],
        },
      ],
    },
    {
      name: "milestones",
      label: "Free-gift milestones",
      type: "array",
      admin: { description: "Shown in the cart, e.g. 2 items: free shaker bottle. Add the gift to the parcel by hand when packing." },
      fields: [{ type: "row", fields: [{ name: "items", label: "Items in cart", type: "number", required: true, min: 1 }, { name: "reward", type: "text", required: true }] }],
    },
  ],
};
