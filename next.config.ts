import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const pwa = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
});

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  // Explicitly opt into Turbopack to silence Next 16 warning when plugins add webpack config
  turbopack: {},
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "placehold.co",
        port: "",
        pathname: "/**",
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
};

export default pwa(nextConfig);
