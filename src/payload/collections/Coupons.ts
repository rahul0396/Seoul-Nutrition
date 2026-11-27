import type { CollectionConfig } from "payload";
import { isAdmin, isStaff, noField, nobody } from "../access";
import { revalidateAfterChange, revalidateAfterDelete } from "../hooks/revalidate";

export const Coupons: CollectionConfig = {
  slug: "coupons",
  admin: { group: "Shop", useAsTitle: "code", defaultColumns: ["code", "kind", "value", "minSubtotal", "active", "usedCount", "endsAt"] },
  access: { read: isStaff, create: isAdmin, update: isAdmin, delete: isAdmin },
  hooks: {
    beforeValidate: [({ data }) => (data?.code ? { ...data, code: String(data.code).trim().toUpperCase() } : data)],
    afterChange: [revalidateAfterChange],
    afterDelete: [revalidateAfterDelete],
  },
  fields: [
    { type: "row", fields: [{ name: "code", type: "text", required: true, unique: true, index: true }, { name: "active", type: "checkbox", defaultValue: true }, { name: "showInCart", label: "List it in the cart", type: "checkbox", defaultValue: true }] },
    { name: "description", type: "text", required: true, admin: { description: "Shown to customers, e.g. 10% off your first order" } },
    {
      type: "row",
      fields: [
        { name: "kind", type: "select", required: true, defaultValue: "percent", options: [{ label: "% off", value: "percent" }, { label: "Flat ₹ off", value: "flat" }] },
        { name: "value", type: "number", required: true, min: 0 },
        { name: "minSubtotal", label: "Minimum order (₹)", type: "number", defaultValue: 0, min: 0 },
      ],
    },
    {
      type: "row",
      fields: [
        { name: "startsAt", type: "date" },
        { name: "endsAt", type: "date" },
        { name: "usageLimit", type: "number", min: 0, admin: { description: "Total uses allowed. Empty means no limit." } },
        { name: "usedCount", type: "number", defaultValue: 0, access: { update: noField }, admin: { readOnly: true } },
      ],
    },
  ],
};
