"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Pencil, Trash2, Users, CheckCircle2 } from "lucide-react";
import { deleteChannel } from "@/app/actions/channel";

// ─── 상수 ────────────────────────────────────────────────────────────────────

const PLATFORM_CONFIG: Record<
  string,
  { label: string; className: string }
> = {
  youtube: {
    label: "YouTube",
    className: "bg-[#FF0000] text-white",
  },
  instagram: {
    label: "Instagram",
    className: "bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 text-white",
  },
  tiktok: {
    label: "TikTok",
    className: "bg-[#010101] text-white",
  },
  editor: {
    label: "편집 프로듀서",
    className: "bg-[#6C5CE7] text-white",
  },
};

const CATEGORY_LABELS: Record<string, string> = {
  beauty: "뷰티/패션",
  food: "음식/요리",
  travel: "여행",
  gaming: "게임",
  tech: "IT/테크",
  education: "교육",
  sports: "스포츠/피트니스",
  entertainment: "엔터테인먼트",
  lifestyle: "라이프스타일",
  business: "비즈니스",
  parenting: "육아",
  other: "기타",
};

function formatCount(n: number): string {
  if (n >= 10000000) return `${(n / 10000000).toFixed(0)}천만`;
  if (n >= 1000000) return `${(n / 1000000).toFixed(0)}백만`;
  if (n >= 10000) return `${(n / 10000).toFixed(1).replace(".0", "")}만`;
  if (n >= 1000) return `${(n / 1000).toFixed(0)}천`;
  return `${n}`;
}

// ─── 타입 ────────────────────────────────────────────────────────────────────

export type ChannelCardData = {
  id: string;
  platform: string;
  channel_name: string;
  follower_count: number | null;
  categories: string[] | null;
  can_collaborate: boolean | null;
  profile_image_url: string | null;
};

// ─── 컴포넌트 ─────────────────────────────────────────────────────────────────

export default function ChannelCard({ channel }: { channel: ChannelCardData }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  const config = PLATFORM_CONFIG[channel.platform] ?? {
    label: channel.platform,
    className: "bg-gray-500 text-white",
  };

  const isEditor = channel.platform === "editor";
  const followerLabel = channel.platform === "youtube" ? "구독자" : isEditor ? null : "팔로워";

  async function handleDelete() {
    if (!window.confirm(`"${channel.channel_name}" 채널을 삭제하시겠습니까?`)) return;
    setDeleting(true);
    const result = await deleteChannel(channel.id);
    if (result.error) {
      alert(`삭제 실패: ${result.error}`);
      setDeleting(false);
    } else {
      router.refresh();
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-4">
      {/* 상단: 플랫폼 뱃지 + 협업가능 */}
      <div className="flex items-center justify-between">
        <span
          className={`text-xs font-bold px-2.5 py-1 rounded-full ${config.className}`}
        >
          {config.label}
        </span>
        {channel.can_collaborate && (
          <span className="flex items-center gap-1 text-xs font-semibold text-green-600 bg-green-50 px-2.5 py-1 rounded-full">
            <CheckCircle2 size={12} />
            협업 가능
          </span>
        )}
      </div>

      {/* 채널명 + 팔로워 */}
      <div>
        <h3 className="text-base font-bold text-[#111111] leading-snug">
          {channel.channel_name}
        </h3>
        {channel.follower_count != null && followerLabel && (
          <div className="flex items-center gap-1.5 mt-1 text-sm text-gray-500">
            <Users size={13} className="text-gray-400" />
            <span>
              {followerLabel}{" "}
              <span className="font-semibold text-[#111111]">
                {formatCount(channel.follower_count)}
              </span>
            </span>
          </div>
        )}
      </div>

      {/* 카테고리 태그 */}
      {channel.categories && channel.categories.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {channel.categories.slice(0, 4).map((cat) => (
            <span
              key={cat}
              className="text-xs text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full"
            >
              {CATEGORY_LABELS[cat] ?? cat}
            </span>
          ))}
          {channel.categories.length > 4 && (
            <span className="text-xs text-gray-400 px-1">
              +{channel.categories.length - 4}
            </span>
          )}
        </div>
      )}

      {/* 버튼 */}
      <div className="flex gap-2 pt-1">
        <Link
          href={`/mypage/channel/${channel.id}/edit`}
          className="flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50 py-2 rounded-xl transition-colors"
        >
          <Pencil size={13} />
          수정
        </Link>
        <button
          type="button"
          onClick={handleDelete}
          disabled={deleting}
          className="flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold border border-red-100 text-red-500 hover:bg-red-50 py-2 rounded-xl transition-colors disabled:opacity-50"
        >
          <Trash2 size={13} />
          {deleting ? "삭제 중..." : "삭제"}
        </button>
      </div>
    </div>
  );
}
