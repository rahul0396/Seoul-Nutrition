import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildConfig } from "payload";
import { mongooseAdapter } from "@payloadcms/db-mongodb";
import { vercelBlobStorage } from "@payloadcms/storage-vercel-blob";
import sharp from "sharp";
import { Users } from "./payload/collections/Users";
import { Media } from "./payload/collections/Media";
import { Products } from "./payload/collections/Products";
import { Orders } from "./payload/collections/Orders";
import { Customers } from "./payload/collections/Customers";
import { Coupons } from "./payload/collections/Coupons";
import { Reviews } from "./payload/collections/Reviews";
import { Leads } from "./payload/collections/Leads";
import { Settings } from "./payload/globals/Settings";

const dirname = path.dirname(fileURLToPath(import.meta.url));

export default buildConfig({
  secret: process.env.PAYLOAD_SECRET || "",
  serverURL: process.env.NEXT_PUBLIC_SITE_URL || "",
  db: mongooseAdapter({ url: process.env.DATABASE_URI || "" }),
  sharp,
  admin: {
    user: Users.slug,
    meta: { titleSuffix: " · Seoul Nutrition admin" },
    importMap: { baseDir: dirname },
    components: { beforeDashboard: ["@/payload/components/DashboardStats#DashboardStats"] },
  },
  collections: [Orders, Customers, Products, Coupons, Media, Reviews, Leads, Users],
  globals: [Settings],
  graphQL: { disable: true },
  typescript: { outputFile: path.resolve(dirname, "payload-types.ts") },
  plugins: [
    // Uploads go to Vercel Blob when BLOB_READ_WRITE_TOKEN is set (needed on
    // Vercel, whose disk is wiped on every deploy). Locally they go to /media.
    vercelBlobStorage({
      enabled: !!process.env.BLOB_READ_WRITE_TOKEN,
      collections: { media: true },
      token: process.env.BLOB_READ_WRITE_TOKEN || "",
    }),
  ],
});
