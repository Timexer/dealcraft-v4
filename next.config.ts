import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  // BUG-006 fix: Hide dev indicators in preview environment
  devIndicators: false,
};

export default nextConfig;
