import type { CollectionConfig } from "payload";
import { isAdmin, isAdminField, isAdminOrSelf } from "../access";

// People who can log in to /admin. Customers do not log in here.
export const Users: CollectionConfig = {
  slug: "users",
  labels: { singular: "Team member", plural: "Team" },
  auth: { tokenExpiration: 60 * 60 * 24 * 7, maxLoginAttempts: 10, lockTime: 10 * 60 * 1000 },
  admin: { useAsTitle: "email", defaultColumns: ["name", "email", "role"], group: "Settings" },
  access: {
    read: isAdminOrSelf,
    create: isAdmin,
    update: isAdminOrSelf,
    delete: isAdmin,
    admin: ({ req }) => !!req.user,
  },
  hooks: {
    beforeChange: [
      // The very first account created at /admin becomes the admin.
      async ({ data, operation, req }) => {
        if (operation === "create") {
          // Not passed `req`: MongoDB cannot count inside a transaction.
          const { docs } = await req.payload.find({ collection: "users", limit: 1, depth: 0, pagination: false, overrideAccess: true });
          if (docs.length === 0) data.role = "admin";
        }
        return data;
      },
    ],
  },
  fields: [
    { name: "name", type: "text", required: true },
    {
      name: "role",
      type: "select",
      required: true,
      defaultValue: "staff",
      saveToJWT: true,
      access: { update: isAdminField },
      options: [
        { label: "Admin (everything)", value: "admin" },
        { label: "Staff (orders, stock, reviews)", value: "staff" },
      ],
      admin: { description: "Staff can work on orders and stock but cannot change prices, coupons or settings." },
    },
  ],
};
