import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["react-markdown", "remark-gfm"],
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.oninple.com" }],
        destination: "https://oninple.com/:path*",
        permanent: true, // 301
      },
    ];
  },
};

export default nextConfig;
