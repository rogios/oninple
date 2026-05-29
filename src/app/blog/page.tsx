import type { Metadata } from "next";
import { createServiceClient } from "@/lib/supabase/service";
import BlogList from "@/components/blog/BlogList";

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
        <BlogList posts={posts} />
      ) : (
        <div className="bg-white dark:bg-[#1F2937] rounded-2xl border border-gray-100 dark:border-[#374151] shadow-sm py-20 text-center text-gray-400 dark:text-[#6B7280]">
          <p className="text-sm">아직 게시된 글이 없습니다</p>
        </div>
      )}
    </div>
  );
}
