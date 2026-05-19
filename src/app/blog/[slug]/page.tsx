import { createServiceClient } from "@/lib/supabase/service";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, CalendarDays } from "lucide-react";
import type { Metadata } from "next";

function fmt(d: string) {
  return new Date(d).toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" });
}

async function getPost(slug: string) {
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("posts")
    .select("id, title, content, thumbnail, summary, category, slug, published, created_at")
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();
  return data;
}

// ─── SEO Metadata ─────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return { title: "글을 찾을 수 없습니다" };

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://oninple.com";
  const url = `${siteUrl}/blog/${post.slug}`;

  return {
    title: post.title,
    description: post.summary || post.title,
    openGraph: {
      title: post.title,
      description: post.summary || post.title,
      url,
      type: "article",
      publishedTime: post.created_at,
      ...(post.thumbnail ? { images: [{ url: post.thumbnail }] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.summary || post.title,
      ...(post.thumbnail ? { images: [post.thumbnail] } : {}),
    },
    alternates: { canonical: url },
  };
}

// ─── JSON-LD ──────────────────────────────────────────────────────────────────

function JsonLd({ post }: { post: NonNullable<Awaited<ReturnType<typeof getPost>>> }) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://oninple.com";
  const schema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.summary || post.title,
    datePublished: post.created_at,
    dateModified: post.created_at,
    url: `${siteUrl}/blog/${post.slug}`,
    publisher: {
      "@type": "Organization",
      name: "온인플",
      url: siteUrl,
    },
    ...(post.thumbnail ? { image: post.thumbnail } : {}),
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  return (
    <>
      <JsonLd post={post} />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link
          href="/blog"
          className="inline-flex items-center gap-1 text-xs text-gray-500 dark:text-[#9CA3AF] hover:text-[#111111] dark:hover:text-[#F9FAFB] transition-colors mb-8"
        >
          <ChevronLeft size={14} />
          블로그 목록
        </Link>

        <article>
          {/* 썸네일 */}
          {post.thumbnail && (
            <div className="aspect-video w-full bg-gray-100 dark:bg-[#374151] rounded-2xl overflow-hidden mb-8">
              <img src={post.thumbnail} alt={post.title} className="w-full h-full object-cover" />
            </div>
          )}

          {/* 헤더 */}
          <header className="mb-8 pb-8 border-b border-gray-100 dark:border-[#374151]">
            {post.category && (
              <p className="text-xs font-semibold text-[#E8292E] uppercase tracking-widest mb-3">
                {post.category}
              </p>
            )}
            <h1 className="text-2xl sm:text-3xl font-black text-[#111111] dark:text-[#F9FAFB] leading-snug">
              {post.title}
            </h1>
            {post.summary && (
              <p className="text-sm text-gray-500 dark:text-[#9CA3AF] mt-3 leading-relaxed">{post.summary}</p>
            )}
            <div className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-[#6B7280] mt-4">
              <CalendarDays size={13} />
              {fmt(post.created_at)}
            </div>
          </header>

          {/* 본문 */}
          <div className="text-sm text-gray-700 dark:text-[#9CA3AF] leading-relaxed whitespace-pre-wrap">
            {post.content}
          </div>
        </article>
      </div>
    </>
  );
}
