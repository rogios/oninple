import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["react-markdown", "remark-gfm"],
  images: {
    remotePatterns: [
      // YouTube 동영상 썸네일
      { protocol: "https", hostname: "i.ytimg.com" },
      // YouTube 채널 아바타
      { protocol: "https", hostname: "yt3.ggpht.com" },
      { protocol: "https", hostname: "yt3.googleusercontent.com" },
    ],
  },
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
