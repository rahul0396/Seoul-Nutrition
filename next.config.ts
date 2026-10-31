import type { NextConfig } from "next";

// STATIC_EXPORT=1 builds a static preview (out/). Leave it off for normal hosting.
const isExport = process.env.STATIC_EXPORT === "1";

const nextConfig: NextConfig = {
  ...(isExport ? { output: "export", trailingSlash: true, images: { unoptimized: true } } : {}),
};

export default nextConfig;
