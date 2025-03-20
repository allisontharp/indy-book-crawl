import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
  },
  // Enable module resolution from root
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
    };
    return config;
  },
  // Strict mode for better development
  reactStrictMode: true,
  // Experimental features
  experimental: {
    typedRoutes: true,
  },
};

export default nextConfig;
