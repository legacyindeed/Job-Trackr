import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // Firebase auth sometimes redirects to /signin — catch it
      { source: '/signin', destination: '/login', permanent: true },
      { source: '/sign-in', destination: '/login', permanent: true },
      { source: '/sign-up', destination: '/signup', permanent: true },
    ];
  },
};

export default nextConfig;
