"use client";

import { useEffect } from "react";
import { X, ExternalLink, MessageCircle } from "lucide-react";
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
  creator: Creator | null;
  onClose: () => void;
}

export default function CreatorModal({ creator, onClose }: Props) {
  useEffect(() => {
    if (!creator) return;
    document.body.style.overflow = "hidden";
    const handler = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handler);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handler);
    };
  }, [creator, onClose]);

  if (!creator) return null;

  const isYoutube = creator.platform === "youtube";
  const isEditor = creator.platform === "editor";

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative bg-white w-full sm:max-w-lg sm:rounded-2xl overflow-hidden shadow-2xl max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Blurred header banner */}
        <div
          className="h-24 shrink-0 relative"
          style={{
            background: `linear-gradient(135deg, ${creator.avatarColor}33, ${PLATFORM_COLORS[creator.platform]}22)`,
            backgroundColor: creator.avatarColor + "22",
          }}
        >
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 bg-black/20 hover:bg-black/30 rounded-full flex items-center justify-center text-white transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="overflow-y-auto flex-1">
          <div className="px-5 pb-6">
            {/* Avatar + name row */}
            <div className="flex items-end gap-3 -mt-7 mb-4">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold text-xl border-3 border-white shrink-0"
                style={{ backgroundColor: creator.avatarColor }}
              >
                {creator.avatar}
              </div>
              <div className="pb-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-black text-[#111111] text-base">{creator.name}</span>
                  {creator.available && (
                    <span className="text-[10px] font-semibold bg-green-50 text-green-600 px-2 py-0.5 rounded-full">
                      협업가능
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                  <span
                    className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white"
                    style={{ backgroundColor: PLATFORM_COLORS[creator.platform] }}
                  >
                    {PLATFORM_LABELS[creator.platform]}
                  </span>
                  {!isEditor && (
                    <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                      {GRADE_LABELS[creator.grade]}
                    </span>
                  )}
                  <span className="text-[10px] bg-[#E8292E]/8 text-[#E8292E] px-2 py-0.5 rounded-full">
                    {CATEGORY_LABELS[creator.category]}
                  </span>
                </div>
              </div>
            </div>

            {/* Stats — 3 cells */}
            {!isEditor && (
              <div className="grid grid-cols-3 gap-2 mb-5">
                <div className="bg-gray-50 rounded-xl p-3 text-center">
                  <div className="text-lg font-black text-[#111111]">
                    {formatCount(creator.subscribers)}
                  </div>
                  <div className="text-[10px] text-gray-400 mt-0.5">
                    {isYoutube ? "구독자" : "팔로워"}
                  </div>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 text-center">
                  <div className="text-lg font-black text-[#111111]">
                    {formatCount(creator.avgViews)}
                  </div>
                  <div className="text-[10px] text-gray-400 mt-0.5">
                    {creator.platform === "tiktok" ? "누적 좋아요" : "평균 조회수"}
                  </div>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 text-center">
                  <div className="text-lg font-black text-[#111111]">
                    {isYoutube ? creator.uploadCycle ?? "-" : "-"}
                  </div>
                  <div className="text-[10px] text-gray-400 mt-0.5">업로드 주기</div>
                </div>
              </div>
            )}

            {/* Bio */}
            <div className="mb-5">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">자기소개</h3>
              <p className="text-sm text-gray-700 leading-relaxed">{creator.intro}</p>
            </div>

            {/* Thumbnail placeholders (YouTube only) */}
            {isYoutube && (
              <div className="mb-5">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">대표 영상</h3>
                <div className="grid grid-cols-2 gap-2">
                  {[0, 1].map((i) => (
                    <div
                      key={i}
                      className="aspect-video bg-gray-100 rounded-xl flex items-center justify-center text-gray-300 text-xs"
                    >
                      영상 썸네일
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Detail tags */}
            <div className="space-y-3 mb-6">
              <div>
                <span className="text-xs font-semibold text-gray-400 mr-2">콘텐츠 형식</span>
                <span className="flex flex-wrap gap-1 mt-1">
                  {creator.contentFormat.map((f) => (
                    <span key={f} className="text-xs bg-gray-50 text-gray-600 px-2.5 py-1 rounded-full border border-gray-100">
                      {f}
                    </span>
                  ))}
                </span>
              </div>
              {creator.audienceAge && (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-gray-400">주요 시청자</span>
                  <span className="text-xs text-gray-600">{creator.audienceAge} · {creator.audienceGender}</span>
                </div>
              )}
              {creator.keywords && creator.keywords.length > 0 && (
                <div>
                  <span className="text-xs font-semibold text-gray-400 mr-2">키워드</span>
                  <span className="flex flex-wrap gap-1 mt-1">
                    {creator.keywords.map((k) => (
                      <span key={k} className="text-xs text-[#E8292E] bg-[#E8292E]/8 px-2.5 py-1 rounded-full">
                        #{k}
                      </span>
                    ))}
                  </span>
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex gap-2">
              {creator.channelUrl && (
                <a
                  href={creator.channelUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-1.5 border border-gray-200 hover:border-gray-300 text-[#111111] font-medium py-3 rounded-full text-sm transition-colors"
                >
                  <ExternalLink size={14} />
                  채널 보기
                </a>
              )}
              <a
                href={creator.kakaoLink ?? "#"}
                className="flex-1 flex items-center justify-center gap-1.5 bg-[#FEE500] hover:bg-[#fada00] text-[#111111] font-bold py-3 rounded-full text-sm transition-colors"
              >
                <MessageCircle size={14} />
                카카오 문의
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
