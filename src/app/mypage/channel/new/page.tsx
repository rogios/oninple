import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ChannelNewForm from "@/components/channel/ChannelNewForm";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export const metadata = {
  title: "채널 등록 | ONINPLE",
};

export default async function ChannelNewPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const userRole = (profile?.role ?? "influencer") as string;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex items-center gap-3 mb-8">
        <Link
          href="/mypage"
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-[#111111] transition-colors"
        >
          <ChevronLeft size={16} />
          마이페이지
        </Link>
        <span className="text-gray-300">/</span>
        <span className="text-sm font-semibold text-[#111111]">채널 등록</span>
      </div>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#111111]">
          {userRole === "editor" ? "편집 프로듀서 등록" : "채널 등록"}
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          {userRole === "editor"
            ? "내 편집 서비스를 디렉토리에 등록하세요"
            : "내 채널을 디렉토리에 등록하세요"}
        </p>
      </div>

      <div className="bg-white dark:bg-[#1F2937] rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
        <ChannelNewForm userId={user.id} userRole={userRole} />
      </div>
    </div>
  );
}
