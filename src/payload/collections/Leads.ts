import type { CollectionConfig } from "payload";
import { isAdmin, isStaff, nobody } from "../access";

// Every form on the site lands here: contact, free consultation, back-in-stock
// requests and newsletter sign-ups.
export const Leads: CollectionConfig = {
  slug: "leads",
  admin: { group: "Content", useAsTitle: "name", defaultColumns: ["kind", "name", "phone", "email", "product", "handled", "createdAt"] },
  defaultSort: "-createdAt",
  access: { read: isStaff, create: nobody, update: isStaff, delete: isAdmin },
  fields: [
    {
      type: "row",
      fields: [
        {
          name: "kind",
          type: "select",
          required: true,
          options: [
            { label: "Contact", value: "contact" },
            { label: "Consultation", value: "consult" },
            { label: "Back in stock", value: "notify" },
            { label: "Newsletter", value: "newsletter" },
          ],
        },
        { name: "handled", type: "checkbox" },
      ],
    },
    { type: "row", fields: [{ name: "name", type: "text" }, { name: "phone", type: "text" }, { name: "email", type: "email" }] },
    { type: "row", fields: [{ name: "product", label: "Product (back in stock)", type: "text" }, { name: "goal", type: "text" }] },
    { name: "message", type: "textarea" },
  ],
};
