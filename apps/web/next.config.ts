import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The public site is fully static, so it is exported to plain files and
  // served by Azure Static Web Apps. Revisit when server features are needed.
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
