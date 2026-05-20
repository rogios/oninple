import { createServiceClient } from "@/lib/supabase/service";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, CalendarDays } from "lucide-react";
import type { Metadata } from "next";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export const dynamic = "force-dynamic";

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
          className="inline-flex items-center gap-1 text-xs text-gray-700 dark:text-[#9CA3AF] hover:text-[#111111] dark:hover:text-[#F9FAFB] transition-colors mb-8"
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
              <p className="text-sm text-gray-700 dark:text-[#9CA3AF] mt-3 leading-relaxed">{post.summary}</p>
            )}
            <div className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-[#6B7280] mt-4">
              <CalendarDays size={13} />
              {fmt(post.created_at)}
            </div>
          </header>

          {/* 본문 */}
          <div className="text-sm text-gray-700 dark:text-[#9CA3AF] leading-relaxed">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h1: ({ children }) => (
                  <h1 className="text-2xl font-black text-[#111111] dark:text-[#F9FAFB] mt-10 mb-4">{children}</h1>
                ),
                h2: ({ children }) => (
                  <h2 className="text-lg font-bold text-[#111111] dark:text-[#F9FAFB] mt-8 mb-3">{children}</h2>
                ),
                h3: ({ children }) => (
                  <h3 className="text-base font-bold text-[#111111] dark:text-[#F9FAFB] mt-6 mb-2">{children}</h3>
                ),
                p: ({ children }) => (
                  <p className="mb-5 leading-relaxed">{children}</p>
                ),
                strong: ({ children }) => (
                  <strong className="font-bold text-[#111111] dark:text-[#F9FAFB]">{children}</strong>
                ),
                em: ({ children }) => (
                  <em className="italic">{children}</em>
                ),
                a: ({ href, children }) => {
                  const isInternal = href?.includes("oninple.com") || href?.startsWith("/");
                  return (
                    <a
                      href={href}
                      className="text-[#E8292E] hover:underline underline-offset-2"
                      {...(isInternal
                        ? { target: "_self" }
                        : { target: "_blank", rel: "noopener noreferrer" }
                      )}
                    >
                      {children}
                    </a>
                  );
                },
                ul: ({ children }) => (
                  <ul className="list-disc pl-6 mb-5 space-y-1.5">{children}</ul>
                ),
                ol: ({ children }) => (
                  <ol className="list-decimal pl-6 mb-5 space-y-1.5">{children}</ol>
                ),
                li: ({ children }) => (
                  <li className="leading-relaxed">{children}</li>
                ),
                blockquote: ({ children }) => (
                  <blockquote className="border-l-4 border-[#E8292E] pl-5 my-5 text-gray-500 dark:text-[#6B7280] italic">
                    {children}
                  </blockquote>
                ),
                pre: ({ children }) => (
                  <pre className="bg-gray-100 dark:bg-[#1F2937] border border-gray-200 dark:border-[#374151] rounded-xl p-4 my-5 overflow-x-auto text-xs leading-relaxed">
                    {children}
                  </pre>
                ),
                code: ({ children, className }) => (
                  className
                    ? <code className="font-mono">{children}</code>
                    : <code className="bg-gray-100 dark:bg-[#374151] rounded px-1.5 py-0.5 text-xs font-mono">{children}</code>
                ),
                hr: () => (
                  <hr className="border-gray-200 dark:border-[#374151] my-8" />
                ),
              }}
            >
              {post.content}
            </ReactMarkdown>
          </div>
        </article>
      </div>
    </>
  );
}
