"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { CalendarDays } from "lucide-react";

type Post = {
  id: string;
  title: string;
  summary: string | null;
  thumbnail: string | null;
  category: string | null;
  slug: string;
  created_at: string;
};

function fmt(d: string) {
  return new Date(d).toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" });
}

function getPageSize(): number {
  if (typeof window === "undefined") return 15;
  if (window.innerWidth >= 1024) return 15; // lg: 3cols × 5rows
  if (window.innerWidth >= 768) return 10;  // md: 2cols × 5rows
  return 5;                                  // mobile: 1col × 5rows
}

export default function BlogList({ posts }: { posts: Post[] }) {
  const [pageSize, setPageSize] = useState(15);
  const [count, setCount] = useState(15);

  useEffect(() => {
    const size = getPageSize();
    setPageSize(size);
    setCount(size);
  }, []);

  const visible = posts.slice(0, count);
  const hasMore = count < posts.length;

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {visible.map((post) => (
          <Link
            key={post.id}
            href={`/blog/${post.slug}`}
            className="group bg-white dark:bg-[#1F2937] rounded-2xl border border-gray-100 dark:border-[#374151] shadow-sm overflow-hidden hover:shadow-md hover:border-gray-200 dark:hover:border-[#4B5563] transition-all duration-200 flex flex-col"
          >
            <div className="aspect-video w-full bg-gray-100 dark:bg-[#374151] shrink-0 overflow-hidden">
              {post.thumbnail ? (
                // eslint-disable-next-line @next/next/no-img-element
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

      {hasMore && (
        <div className="flex justify-center mt-10">
          <button
            type="button"
            onClick={() => setCount((c) => c + pageSize)}
            className="px-8 py-2.5 rounded-full border border-gray-200 dark:border-[#374151] text-sm font-medium text-gray-700 dark:text-[#9CA3AF] hover:border-gray-300 dark:hover:border-[#4B5563] hover:bg-gray-50 dark:hover:bg-[#374151] transition-colors"
          >
            더보기
          </button>
        </div>
      )}
    </>
  );
}
