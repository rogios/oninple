import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ChannelEditForm, { type ChannelData } from "@/components/channel/ChannelEditForm";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export const metadata = {
  title: "채널 수정 | ONINPLE",
};

const PLATFORM_LABELS: Record<string, string> = {
  youtube: "유튜브",
  instagram: "인스타그램",
  tiktok: "틱톡",
  editor: "편집 프로듀서",
};

export default async function ChannelEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: channel } = await supabase
    .from("channels")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!channel) notFound();

  const platformLabel = PLATFORM_LABELS[channel.platform] ?? channel.platform;

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
        <span className="text-sm font-semibold text-[#111111]">채널 수정</span>
      </div>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#111111]">{platformLabel} 수정</h1>
        <p className="text-sm text-gray-500 mt-1">등록된 정보를 수정합니다</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
        <ChannelEditForm channel={channel as ChannelData} userId={user.id} />
      </div>
    </div>
  );
}
