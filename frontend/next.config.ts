import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    allowedDevOrigins: ["localhost:3000"]
  }
};


export default nextConfig;
