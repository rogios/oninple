import type { Metadata } from "next";
import { createServiceClient } from "@/lib/supabase/service";
import Link from "next/link";
import { Pin } from "lucide-react";

export const metadata: Metadata = {
  title: "공지사항",
  description: "온인플 서비스의 공지사항과 업데이트 소식을 확인하세요.",
  openGraph: {
    title: "공지사항 | ONINPLE",
    description: "온인플 서비스 공지사항",
    url: "https://oninple.com/notices",
  },
  alternates: { canonical: "https://oninple.com/notices" },
};

export const revalidate = 300;

function fmt(d: string) {
  return new Date(d).toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" });
}

export default async function NoticesPage() {
  const supabase = createServiceClient();
  const { data: notices } = await supabase
    .from("notices")
    .select("id, title, is_pinned, created_at")
    .order("is_pinned", { ascending: false })
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-2xl font-black text-[#111111] mb-8">공지사항</h1>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {notices && notices.length > 0 ? (
          <ul className="divide-y divide-gray-50">
            {notices.map((n) => (
              <li key={n.id} className="hover:bg-gray-50/70 transition-colors">
                <div className="flex items-center justify-between gap-4 px-6 py-4">
                  <div className="flex items-center gap-2 min-w-0">
                    {n.is_pinned && (
                      <Pin size={12} className="text-[#E8292E] shrink-0" />
                    )}
                    <Link
                      href={`/notices/${n.id}`}
                      className={`text-sm truncate hover:underline ${n.is_pinned ? "font-bold text-[#111111]" : "font-medium text-gray-700"}`}
                    >
                      {n.title}
                    </Link>
                    {n.is_pinned && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-[#E8292E]/10 text-[#E8292E] shrink-0">
                        공지
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-gray-400 shrink-0">{fmt(n.created_at)}</span>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="py-16 text-center text-gray-400">
            <p className="text-sm">등록된 공지사항이 없습니다</p>
          </div>
        )}
      </div>
    </div>
  );
}
