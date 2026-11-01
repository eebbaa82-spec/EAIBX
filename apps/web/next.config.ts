import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The public site is fully static, so it is exported to plain files and
  // served by Azure Static Web Apps. Revisit when server features are needed.
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  // Set only for the GitHub Pages preview, which lives under /EAIBX/.
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || undefined,
};

export default nextConfig;
