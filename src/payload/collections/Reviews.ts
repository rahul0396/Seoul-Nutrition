import type { CollectionConfig } from "payload";
import { isAdmin, isStaff, nobody } from "../access";
import { revalidateAfterChange, revalidateAfterDelete } from "../hooks/revalidate";

// Customer reviews. Submitted from the product page, shown only after someone
// on your team ticks "Approved".
export const Reviews: CollectionConfig = {
  slug: "reviews",
  admin: { group: "Content", useAsTitle: "title", defaultColumns: ["title", "product", "rating", "approved", "createdAt"] },
  access: { read: isStaff, create: nobody, update: isStaff, delete: isAdmin },
  hooks: { afterChange: [revalidateAfterChange], afterDelete: [revalidateAfterDelete] },
  fields: [
    { type: "row", fields: [{ name: "product", type: "relationship", relationTo: "products", required: true }, { name: "rating", type: "number", required: true, min: 1, max: 5 }, { name: "approved", type: "checkbox", defaultValue: false }] },
    { name: "title", type: "text", required: true },
    { name: "body", type: "textarea", required: true },
    { type: "row", fields: [{ name: "author", type: "text", required: true }, { name: "phone", type: "text", admin: { description: "Not shown publicly." } }] },
  ],
};
