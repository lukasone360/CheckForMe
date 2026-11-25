import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config) => {
    config.resolve.alias.canvas = false;
    config.resolve.alias.encoding = false;
    return config;
  },
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "checkforme.vercel.app" }],
        destination: "https://checkforme.org/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
