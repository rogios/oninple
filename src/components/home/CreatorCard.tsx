import type { Creator } from "@/types";
import { CATEGORY_LABELS, GRADE_LABELS, formatCount } from "@/data/mock";

const PLATFORM_COLORS: Record<string, string> = {
  youtube: "#FF0000",
  instagram: "#E1306C",
  tiktok: "#010101",
  editor: "#6C5CE7",
};
const PLATFORM_LABELS: Record<string, string> = {
  youtube: "YouTube",
  instagram: "Instagram",
  tiktok: "TikTok",
  editor: "편집자",
};

interface Props {
  creator: Creator;
  onClick: () => void;
}

export default function CreatorCard({ creator, onClick }: Props) {
  const isEditor = creator.platform === "editor";

  return (
    <button
      onClick={onClick}
      className="group text-left w-full bg-white border border-gray-100 rounded-2xl p-4 hover:border-[#E8292E]/30 hover:shadow-md transition-all"
    >
      {/* Top badges */}
      <div className="flex items-center gap-1.5 mb-3 flex-wrap">
        <span
          className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white"
          style={{ backgroundColor: PLATFORM_COLORS[creator.platform] }}
        >
          {PLATFORM_LABELS[creator.platform]}
        </span>
        {!isEditor && (
          <span className="text-[10px] font-semibold bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
            {GRADE_LABELS[creator.grade]}
          </span>
        )}
        {creator.available ? (
          <span className="text-[10px] font-semibold bg-green-50 text-green-600 px-2 py-0.5 rounded-full">
            협업가능
          </span>
        ) : (
          <span className="text-[10px] font-semibold bg-gray-50 text-gray-400 px-2 py-0.5 rounded-full">
            협업불가
          </span>
        )}
      </div>

      {/* Profile */}
      <div className="flex items-center gap-3 mb-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0"
          style={{ backgroundColor: creator.avatarColor }}
        >
          {creator.avatar}
        </div>
        <div className="min-w-0">
          <div className="text-sm font-bold text-[#111111] truncate">{creator.name}</div>
          <div className="text-xs text-gray-400 truncate">{creator.handle}</div>
        </div>
      </div>

      {/* Intro */}
      <p className="text-xs text-gray-500 leading-relaxed mb-3 line-clamp-2">{creator.intro}</p>

      {/* Stats */}
      {!isEditor ? (
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="bg-gray-50 rounded-lg p-2 text-center">
            <div className="text-sm font-black text-[#111111]">{formatCount(creator.subscribers)}</div>
            <div className="text-[10px] text-gray-400">
              {creator.platform === "youtube" ? "구독자" : "팔로워"}
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-2 text-center">
            <div className="text-sm font-black text-[#111111]">{formatCount(creator.avgViews)}</div>
            <div className="text-[10px] text-gray-400">
              {creator.platform === "tiktok" ? "🤍 누적 좋아요" : "👁 평균 조회수"}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-gray-50 rounded-lg p-2 mb-3 text-center">
          <div className="text-xs font-semibold text-[#111111]">편집 프로듀서</div>
        </div>
      )}

      {/* Upload cycle (YouTube only) */}
      {creator.platform === "youtube" && creator.uploadCycle && (
        <div className="flex items-center gap-1.5 mb-3 text-xs text-gray-500">
          <span className="text-gray-300">•</span>
          업로드 {creator.uploadCycle}
        </div>
      )}

      {/* Category + content format tags */}
      <div className="flex flex-wrap gap-1">
        <span className="text-[10px] bg-[#E8292E]/8 text-[#E8292E] px-2 py-0.5 rounded-full font-medium">
          {CATEGORY_LABELS[creator.category]}
        </span>
        {creator.contentFormat.slice(0, 2).map((f) => (
          <span key={f} className="text-[10px] bg-gray-50 text-gray-500 px-2 py-0.5 rounded-full">
            {f}
          </span>
        ))}
      </div>
    </button>
  );
}
