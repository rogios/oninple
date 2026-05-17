import type { Metadata } from "next";
import { createServiceClient } from "@/lib/supabase/service";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, Pin } from "lucide-react";

export const revalidate = 300;

const SITE_URL = "https://oninple.com";
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function fmt(d: string) {
  return new Date(d).toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  if (!UUID_RE.test(id)) return { title: "공지사항" };

  const supabase = createServiceClient();
  const { data: notice } = await supabase
    .from("notices")
    .select("title, content, created_at")
    .eq("id", id)
    .maybeSingle();

  if (!notice) return { title: "공지사항을 찾을 수 없습니다" };

  const url = `${SITE_URL}/notices/${id}`;
  const description = notice.content.slice(0, 160).replace(/\n/g, " ");

  return {
    title: notice.title,
    description,
    openGraph: {
      title: notice.title,
      description,
      url,
      type: "article",
      publishedTime: notice.created_at,
    },
    alternates: { canonical: url },
  };
}

function JsonLd({ id, title, content, created_at }: { id: string; title: string; content: string; created_at: string }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: title,
    description: content.slice(0, 160).replace(/\n/g, " "),
    datePublished: created_at,
    url: `${SITE_URL}/notices/${id}`,
    publisher: {
      "@type": "Organization",
      name: "온인플",
      url: SITE_URL,
    },
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export default async function NoticeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  if (!UUID_RE.test(id)) notFound();

  const supabase = createServiceClient();
  const { data: notice } = await supabase
    .from("notices")
    .select("id, title, content, is_pinned, created_at")
    .eq("id", id)
    .maybeSingle();

  if (!notice) notFound();

  return (
    <>
      <JsonLd id={notice.id} title={notice.title} content={notice.content} created_at={notice.created_at} />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link
          href="/notices"
          className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-[#111111] transition-colors mb-8"
        >
          <ChevronLeft size={14} />
          공지사항 목록
        </Link>

        <article className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
          <div className="mb-6 pb-6 border-b border-gray-100">
            {notice.is_pinned && (
              <div className="flex items-center gap-2 mb-3">
                <Pin size={13} className="text-[#E8292E]" />
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#E8292E]/10 text-[#E8292E]">
                  공지
                </span>
              </div>
            )}
            <h1 className="text-xl font-black text-[#111111] leading-snug">{notice.title}</h1>
            <p className="text-xs text-gray-400 mt-2">{fmt(notice.created_at)}</p>
          </div>

          <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
            {notice.content}
          </div>
        </article>
      </div>
    </>
  );
}
