import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { logoutAction } from "@/app/actions/auth";
import Link from "next/link";
import { LogOut, User, Plus, ExternalLink } from "lucide-react";
import ChannelCard, { type ChannelCardData } from "@/components/channel/ChannelCard";
import DeleteAccountButton from "@/components/auth/DeleteAccountButton";

export const metadata = {
  title: "마이페이지 | ONINPLE",
};

const ROLE_LABELS: Record<string, string> = {
  influencer: "인플루언서",
  editor: "편집프로듀서",
  advertiser: "광고주",
};

const ROLE_BADGE_STYLES: Record<string, string> = {
  influencer: "bg-[#E8292E]/10 text-[#E8292E]",
  editor: "bg-gray-800/10 text-gray-800",
  advertiser: "bg-orange-500/10 text-orange-500",
};

export default async function MyPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const displayName =
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.email?.split("@")[0] ||
    "사용자";

  const avatarLetter = displayName.charAt(0).toUpperCase();

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const role = profile?.role as string | undefined;

  const { data: channels } = await supabase
    .from("channels")
    .select("id, platform, channel_name, follower_count, avg_views, bio, categories, can_collaborate, profile_image_url, is_verified")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="text-2xl font-bold text-[#111111] dark:text-[#F9FAFB] mb-8">마이페이지</h1>

      {/* Profile card */}
      <div className="bg-white dark:bg-[#1F2937] rounded-2xl border border-gray-100 dark:border-[#374151] shadow-sm p-6 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-[#E8292E] flex items-center justify-center text-white text-2xl font-black shrink-0">
            {avatarLetter}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-lg font-bold text-[#111111] dark:text-[#F9FAFB]">{displayName}</span>
              {role && ROLE_LABELS[role] && (
                <span
                  className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${ROLE_BADGE_STYLES[role] ?? "bg-gray-100 text-gray-600"}`}
                >
                  {ROLE_LABELS[role]}
                </span>
              )}
            </div>
            <p className="text-sm text-gray-400 dark:text-[#6B7280] mt-0.5 truncate">{user.email}</p>
          </div>
        </div>
      </div>

      {/* My listings */}
      <div className="bg-white dark:bg-[#1F2937] rounded-2xl border border-gray-100 dark:border-[#374151] shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-[#111111] dark:text-[#F9FAFB]">내 등록 정보</h2>
          <Link
            href="/mypage/channel/new"
            className="flex items-center gap-1.5 text-xs font-semibold text-[#E8292E] hover:underline"
          >
            <Plus size={13} />
            등록하기
          </Link>
        </div>
        {channels && channels.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {(channels as ChannelCardData[]).map((ch) => (
              <ChannelCard key={ch.id} channel={ch} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-400">
            <User size={32} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm dark:text-[#9CA3AF]">아직 등록된 프로필이 없습니다.</p>
            <p className="text-xs mt-1 dark:text-[#6B7280]">내 채널이나 서비스를 무료로 등록해보세요.</p>
          </div>
        )}
      </div>

      {/* Quick links */}
      <div className="bg-white dark:bg-[#1F2937] rounded-2xl border border-gray-100 dark:border-[#374151] shadow-sm p-6 mb-6">
        <h2 className="text-base font-bold text-[#111111] mb-3">바로가기</h2>
        <div className="grid grid-cols-2 gap-3">
          <a
            href="/#youtube-section"
            className="flex items-center gap-2 p-3 rounded-xl border border-gray-100 dark:border-[#374151] hover:border-gray-200 dark:hover:border-[#4B5563] text-sm text-gray-700 dark:text-[#F9FAFB] transition-colors"
          >
            <ExternalLink size={15} className="text-gray-400" />
            인플루언서 탐색
          </a>
          <a
            href="/#editor-section"
            className="flex items-center gap-2 p-3 rounded-xl border border-gray-100 dark:border-[#374151] hover:border-gray-200 dark:hover:border-[#4B5563] text-sm text-gray-700 dark:text-[#F9FAFB] transition-colors"
          >
            <ExternalLink size={15} className="text-gray-400" />
            편집자 탐색
          </a>
        </div>
      </div>

      {/* Account management */}
      <div className="bg-white dark:bg-[#1F2937] rounded-2xl border border-gray-100 dark:border-[#374151] shadow-sm p-6 mb-6">
        <h2 className="text-base font-bold text-[#111111] mb-4">계정 관리</h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-[#F9FAFB]">회원탈퇴</p>
            <p className="text-xs text-gray-400 dark:text-[#6B7280] mt-0.5">계정과 모든 데이터가 영구 삭제됩니다</p>
          </div>
          <DeleteAccountButton />
        </div>
      </div>

      {/* Logout */}
      <form action={logoutAction}>
        <button
          type="submit"
          className="flex items-center gap-2 text-sm text-gray-500 dark:text-[#9CA3AF] hover:text-[#111111] dark:hover:text-[#F9FAFB] transition-colors"
        >
          <LogOut size={15} />
          로그아웃
        </button>
      </form>
    </div>
  );
}
