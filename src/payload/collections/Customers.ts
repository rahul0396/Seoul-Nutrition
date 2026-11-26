import type { CollectionConfig } from "payload";
import { isAdmin, isStaff, nobody } from "../access";

// Shoppers. Created or updated automatically at checkout (guest checkout keyed
// by mobile number). They do not log in to /admin.
export const Customers: CollectionConfig = {
  slug: "customers",
  admin: {
    group: "Orders",
    useAsTitle: "name",
    defaultColumns: ["name", "phone", "email", "isMember", "createdAt"],
    listSearchableFields: ["name", "phone", "email"],
  },
  access: { read: isStaff, create: nobody, update: isStaff, delete: isAdmin },
  fields: [
    { type: "row", fields: [{ name: "name", type: "text", required: true }, { name: "phone", type: "text", required: true, unique: true, index: true }, { name: "email", type: "email" }] },
    {
      name: "addresses",
      type: "array",
      admin: { initCollapsed: true },
      fields: [
        { name: "line1", type: "text", required: true },
        { type: "row", fields: [{ name: "city", type: "text" }, { name: "state", type: "text" }, { name: "pincode", type: "text" }] },
      ],
    },
    { type: "row", fields: [{ name: "isMember", label: "Member", type: "checkbox" }, { name: "memberUntil", type: "date" }] },
    { name: "orders", type: "join", collection: "orders", on: "customer", admin: { defaultColumns: ["orderNumber", "status", "createdAt"] } },
  ],
};
