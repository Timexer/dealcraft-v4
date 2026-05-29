import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  // BUG-006 fix: Hide dev indicators in preview environment
  devIndicators: false,
  experimental: {
    allowedDevOrigins: ['127.0.0.1', 'localhost'],
  },
};

export default nextConfig;
