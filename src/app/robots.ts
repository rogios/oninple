import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/mypage/", "/admin/", "/login/", "/signup/", "/role-select/"],
    },
    sitemap: "https://oninple.com/sitemap.xml",
  };
}
