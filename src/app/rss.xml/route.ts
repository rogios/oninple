import { createServiceClient } from "@/lib/supabase/service";

const BASE_URL = "https://oninple.com";

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const supabase = createServiceClient();

  const { data: posts } = await supabase
    .from("posts")
    .select("title, slug, summary, category, thumbnail, created_at")
    .eq("published", true)
    .order("created_at", { ascending: false })
    .limit(50);

  const items = (posts ?? [])
    .map((post) => {
      const url = `${BASE_URL}/blog/${post.slug}`;
      const pubDate = new Date(post.created_at).toUTCString();
      const description = escapeXml(post.summary ?? post.title ?? "");
      const title = escapeXml(post.title ?? "");

      return `
    <item>
      <title>${title}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <description>${description}</description>
      <pubDate>${pubDate}</pubDate>
      ${post.category ? `<category>${escapeXml(post.category)}</category>` : ""}
      ${post.thumbnail ? `<enclosure url="${escapeXml(post.thumbnail)}" type="image/jpeg" length="0" />` : ""}
    </item>`;
    })
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>온인플 블로그</title>
    <link>${BASE_URL}/blog</link>
    <description>인플루언서 마케팅 인사이트 — 온인플</description>
    <language>ko</language>
    <atom:link href="${BASE_URL}/rss.xml" rel="self" type="application/rss+xml" />
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
    },
  });
}
