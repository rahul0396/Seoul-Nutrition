import type { CollectionConfig } from "payload";
import { anyone, isStaff } from "../access";

// Product photos and lab-report PDFs. Stored on disk in development and in
// Vercel Blob in production (see payload.config.ts).
export const Media: CollectionConfig = {
  slug: "media",
  labels: { singular: "File", plural: "Media" },
  admin: { group: "Shop", defaultColumns: ["filename", "alt", "updatedAt"] },
  access: { read: anyone, create: isStaff, update: isStaff, delete: isStaff },
  upload: {
    staticDir: "media",
    mimeTypes: ["image/*", "application/pdf"],
    imageSizes: [
      { name: "thumb", width: 200, height: 200, position: "centre" },
      { name: "card", width: 600, height: 600, position: "centre" },
      { name: "large", width: 1400 },
    ],
    adminThumbnail: "thumb",
  },
  fields: [{ name: "alt", type: "text", label: "Alt text", admin: { description: "Describe the image for screen readers and Google." } }],
};
