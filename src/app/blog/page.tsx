import type { Metadata } from "next";
import { createServiceClient } from "@/lib/supabase/service";
import Link from "next/link";
import { CalendarDays } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "블로그",
  description: "온인플 팀의 인플루언서 마케팅 인사이트, 크리에이터 트렌드, 서비스 소식을 전달합니다.",
  openGraph: {
    title: "온인플 블로그 | ONINPLE",
    description: "인플루언서 마케팅 인사이트와 크리에이터 트렌드",
    url: "https://oninple.com/blog",
  },
  alternates: { canonical: "https://oninple.com/blog" },
};

function fmt(d: string) {
  return new Date(d).toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" });
}

export default async function BlogPage() {
  const supabase = createServiceClient();
  const { data: posts } = await supabase
    .from("posts")
    .select("id, title, summary, thumbnail, category, slug, created_at")
    .eq("published", true)
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-10">
        <h1 className="text-2xl font-black text-[#111111] dark:text-[#F9FAFB]">블로그</h1>
        <p className="text-sm text-gray-400 dark:text-[#6B7280] mt-1">온인플 팀의 인사이트와 소식</p>
      </div>

      {posts && posts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              className="group bg-white dark:bg-[#1F2937] rounded-2xl border border-gray-100 dark:border-[#374151] shadow-sm overflow-hidden hover:shadow-md hover:border-gray-200 dark:hover:border-[#4B5563] transition-all duration-200 flex flex-col"
            >
              {/* 썸네일 */}
              <div className="aspect-video w-full bg-gray-100 dark:bg-[#374151] shrink-0 overflow-hidden">
                {post.thumbnail ? (
                  <img
                    src={post.thumbnail}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-3xl font-black text-gray-200 dark:text-[#4B5563]">O</span>
                  </div>
                )}
              </div>

              {/* 내용 */}
              <div className="p-5 flex flex-col gap-2 flex-1">
                {post.category && (
                  <span className="text-[10px] font-semibold text-[#E8292E] uppercase tracking-wide">
                    {post.category}
                  </span>
                )}
                <h2 className="text-sm font-bold text-[#111111] dark:text-[#F9FAFB] leading-snug line-clamp-2 group-hover:text-[#E8292E] transition-colors">
                  {post.title}
                </h2>
                {post.summary && (
                  <p className="text-xs text-gray-700 dark:text-[#9CA3AF] leading-relaxed line-clamp-2 flex-1">
                    {post.summary}
                  </p>
                )}
                <div className="flex items-center gap-1 text-[11px] text-gray-400 dark:text-[#6B7280] mt-1">
                  <CalendarDays size={11} />
                  {fmt(post.created_at)}
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-[#1F2937] rounded-2xl border border-gray-100 dark:border-[#374151] shadow-sm py-20 text-center text-gray-400 dark:text-[#6B7280]">
          <p className="text-sm">아직 게시된 글이 없습니다</p>
        </div>
      )}
    </div>
  );
}
