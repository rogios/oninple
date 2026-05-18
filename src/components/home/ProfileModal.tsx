"use client";

import { useEffect, useState } from "react";
import { X, ExternalLink, MessageCircle, Flag, BadgeCheck } from "lucide-react";
import type { DirectoryChannel } from "./ChannelDirectory";
import { formatCount, getTierKey, TIER_STYLES, TIER_LABELS } from "./ChannelDirectory";

const PLATFORM_INFO: Record<string, { label: string; style: string }> = {
  youtube: { label: "YouTube", style: "bg-[#FF0000] text-white" },
  instagram: { label: "Instagram", style: "bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 text-white" },
  tiktok: { label: "TikTok", style: "bg-[#010101] text-white" },
  editor: { label: "편집프로듀서", style: "bg-[#6C5CE7] text-white" },
};

const CATEGORY_LABELS: Record<string, string> = {
  beauty: "뷰티/패션", food: "음식/요리", travel: "여행", gaming: "게임",
  tech: "IT/테크", education: "교육", sports: "스포츠/피트니스",
  entertainment: "엔터테인먼트", lifestyle: "라이프스타일", business: "비즈니스",
  parenting: "육아", other: "기타",
};

const AVATAR_COLORS: Record<string, string> = {
  youtube: "#FF0000", instagram: "#E1306C", tiktok: "#010101", editor: "#6C5CE7",
};

function getYoutubeId(url: string | null | undefined): string | null {
  if (!url) return null;
  const m =
    url.match(/youtube\.com\/watch\?v=([^&]+)/) ||
    url.match(/youtu\.be\/([^?/]+)/) ||
    url.match(/youtube\.com\/shorts\/([^?/]+)/);
  return m ? m[1] : null;
}

export default function ProfileModal({
  channel,
  onClose,
}: {
  channel: DirectoryChannel;
  onClose: () => void;
}) {
  const isEditor = channel.platform === "editor";
  const tierKey = getTierKey(channel.follower_count);
  const platform = PLATFORM_INFO[channel.platform] ?? { label: channel.platform, style: "bg-gray-500 text-white" };
  const vid1 = getYoutubeId(channel.video_url_1);
  const vid2 = getYoutubeId(channel.video_url_2);
  const avatarBg = AVATAR_COLORS[channel.platform] ?? "#9ca3af";
  const initial = channel.channel_name.charAt(0).toUpperCase();
  const [bioExpanded, setBioExpanded] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-hidden"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto overflow-x-hidden shadow-2xl [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{ touchAction: "pan-y" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Hero + Avatar wrapper */}
        <div className="relative">
          {/* Hero */}
          <div className="h-28 rounded-t-2xl overflow-hidden bg-gradient-to-br from-[#111111] to-[#333333]">
            {channel.profile_image_url && (
              <img
                src={channel.profile_image_url}
                alt=""
                className="absolute inset-0 w-full h-full object-cover blur-xl scale-125 opacity-60"
              />
            )}
            <div className="absolute inset-0 bg-black/30" />
            <div className="absolute top-3 left-4 flex gap-1.5">
              <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${platform.style}`}>
                {platform.label}
              </span>
              {!isEditor && (
                <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${TIER_STYLES[tierKey]}`}>
                  {TIER_LABELS[tierKey]}
                </span>
              )}
            </div>
            <button
              onClick={onClose}
              className="absolute top-3 right-3 w-8 h-8 bg-black/40 hover:bg-black/60 text-white rounded-full flex items-center justify-center transition-colors"
            >
              <X size={15} />
            </button>
          </div>
          {/* Avatar — hero/본문 경계에 걸치도록 배치 */}
          <div
            className="absolute -bottom-12 left-1/2 -translate-x-1/2 w-24 h-24 rounded-full border-4 border-white overflow-hidden flex items-center justify-center text-white font-black text-2xl shadow-lg shrink-0"
            style={{ backgroundColor: avatarBg }}
          >
            {channel.profile_image_url
              ? <img src={channel.profile_image_url} alt={channel.channel_name} className="w-full h-full object-cover" />
              : initial
            }
          </div>
        </div>

        {/* Content */}
        <div className="px-6 pb-6 pt-14 min-w-0 overflow-x-hidden">
          {/* Name + tags */}
          <div className="text-center mb-5">
            <div className="flex items-center justify-center gap-1.5 mb-2">
              <h2 className="text-xl font-black text-[#111111]">{channel.channel_name}</h2>
              {channel.is_verified && (
                <div className="group relative cursor-default shrink-0">
                  <BadgeCheck size={20} className="text-[#1D9E75]" />
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 w-max hidden group-hover:block bg-white border border-gray-100 shadow-md text-xs text-gray-500 px-2.5 py-1.5 rounded-lg z-10 pointer-events-none">
                    본인 소유가 확인된 채널입니다
                  </div>
                </div>
              )}
            </div>
            <div className="flex items-center justify-center gap-1.5 flex-wrap min-w-0 w-full">
              <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${platform.style}`}>
                {platform.label}
              </span>
              {channel.categories?.map((cat) => (
                <span key={cat} className="text-xs text-gray-500 bg-gray-100 px-2.5 py-0.5 rounded-full">
                  {CATEGORY_LABELS[cat] ?? cat}
                </span>
              ))}
              {channel.can_collaborate ? (
                <span className="text-xs font-semibold text-green-600 bg-green-50 border border-green-200 px-2.5 py-0.5 rounded-full">협업가능</span>
              ) : (
                <span className="text-xs font-semibold text-gray-400 bg-gray-50 border border-gray-200 px-2.5 py-0.5 rounded-full">협업마감</span>
              )}
            </div>
          </div>

          {/* Stats (influencer) */}
          {!isEditor && (
            <div className="grid grid-cols-3 gap-2 mb-5">
              {[
                { value: formatCount(channel.follower_count), label: channel.platform === "youtube" ? "구독자" : "팔로워", red: true },
                { value: formatCount(channel.avg_views), label: "평균조회수", red: false },
                { value: channel.upload_frequency ?? "-", label: "업로드주기", red: false },
              ].map(({ value, label, red }) => (
                <div key={label} className="bg-gray-50 rounded-xl p-3 text-center">
                  <div className={`text-base font-black leading-tight ${red ? "text-[#E8292E]" : "text-[#111111]"}`}>
                    {value}
                  </div>
                  <div className="text-[10px] text-gray-400 mt-0.5">{label}</div>
                </div>
              ))}
            </div>
          )}

          {/* Bio */}
          {channel.bio && (
            <div className="mb-5">
              <p className={`text-sm text-gray-600 leading-relaxed ${bioExpanded ? "" : "line-clamp-3"}`}>
                {channel.bio}
              </p>
              <button
                type="button"
                onClick={() => setBioExpanded((v) => !v)}
                className="text-xs font-semibold mt-1.5 hover:underline text-[#E8292E]"
              >
                {bioExpanded ? "접기" : "더보기"}
              </button>
            </div>
          )}

          {/* YouTube video thumbnails */}
          {(vid1 || vid2) && (
            <div className="mb-5">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">대표 영상</p>
              <div className="grid grid-cols-2 gap-2">
                {[vid1, vid2].filter(Boolean).map((vid, i) => (
                  <a
                    key={i}
                    href={`https://www.youtube.com/watch?v=${vid}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block rounded-xl overflow-hidden aspect-video bg-gray-100 hover:opacity-90 transition-opacity"
                  >
                    <img
                      src={`https://img.youtube.com/vi/${vid}/mqdefault.jpg`}
                      alt={`영상 ${i + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Instagram / TikTok feed thumbnails */}
          {(channel.platform === "instagram" || channel.platform === "tiktok") &&
            (channel.feed_thumbnail_1 || channel.feed_thumbnail_2) && (
            <div className="mb-5">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">대표 피드</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { thumb: channel.feed_thumbnail_1, url: channel.feed_url_1 },
                  { thumb: channel.feed_thumbnail_2, url: channel.feed_url_2 },
                ].filter(({ thumb }) => !!thumb).map(({ thumb, url }, i) =>
                  url ? (
                    <a
                      key={i}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block rounded-xl overflow-hidden aspect-square bg-gray-100 hover:opacity-90 transition-opacity"
                    >
                      <img src={thumb!} alt={`피드 ${i + 1}`} className="w-full h-full object-cover" />
                    </a>
                  ) : (
                    <div key={i} className="rounded-xl overflow-hidden aspect-square bg-gray-100">
                      <img src={thumb!} alt={`피드 ${i + 1}`} className="w-full h-full object-cover" />
                    </div>
                  )
                )}
              </div>
            </div>
          )}

          {/* Editor: work fields + AI tools */}
          {isEditor && (
            <div className="space-y-4 mb-5">
              {channel.work_fields && channel.work_fields.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">작업 분야</p>
                  <div className="flex gap-1.5 flex-wrap">
                    {channel.work_fields.map((f) => (
                      <span key={f} className="text-xs text-[#6C5CE7] bg-[#6C5CE7]/10 px-2.5 py-1 rounded-full font-medium">{f}</span>
                    ))}
                  </div>
                </div>
              )}
              {channel.ai_tools && channel.ai_tools.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">보유 AI 툴</p>
                  <div className="flex gap-1.5 flex-wrap">
                    {channel.ai_tools.map((t) => (
                      <span key={t} className="text-xs text-gray-700 bg-gray-100 px-2.5 py-1 rounded-full">{t}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Influencer extra info */}
          {!isEditor && (
            <div className="space-y-2.5 mb-5 text-sm">
              {channel.content_format && (
                <div className="flex gap-3">
                  <span className="text-gray-400 w-20 shrink-0">콘텐츠 형식</span>
                  <span className="text-gray-700">{channel.content_format}</span>
                </div>
              )}
              {channel.audience_gender && (
                <div className="flex gap-3">
                  <span className="text-gray-400 w-20 shrink-0">주요 시청자</span>
                  <span className="text-gray-700">
                    {channel.audience_gender}
                    {channel.audience_age?.length ? ` · ${channel.audience_age.join(", ")}` : ""}
                  </span>
                </div>
              )}
              {channel.content_keywords && channel.content_keywords.length > 0 && (
                <div className="flex gap-3">
                  <span className="text-gray-400 w-20 shrink-0">키워드</span>
                  <div className="flex flex-wrap gap-1">
                    {channel.content_keywords.map((kw) => (
                      <span key={kw} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{kw}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Action buttons */}
          <div className="flex flex-col gap-2.5">
            {channel.channel_url && (
              <a
                href={channel.channel_url}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center justify-center gap-2 w-full py-3 rounded-xl border-2 font-semibold text-sm transition-colors ${
                  channel.platform === "instagram"
                    ? "border-pink-500 text-pink-500 hover:bg-pink-50"
                    : channel.platform === "tiktok"
                    ? "border-[#010101] text-[#010101] hover:bg-gray-50"
                    : "border-[#FF0000] text-[#FF0000] hover:bg-red-50"
                }`}
              >
                <ExternalLink size={15} />
                {channel.platform === "instagram"
                  ? "인스타그램 채널 보기"
                  : channel.platform === "tiktok"
                  ? "틱톡 채널 보기"
                  : "유튜브 채널 보기"}
              </a>
            )}
            {isEditor && channel.portfolio_url && (
              <a
                href={channel.portfolio_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border-2 border-[#6C5CE7] text-[#6C5CE7] font-semibold text-sm hover:bg-purple-50 transition-colors"
              >
                <ExternalLink size={15} />
                포트폴리오 보기
              </a>
            )}
            {channel.kakao_open_chat && (
              channel.is_verified ? (
                <a
                  href={channel.kakao_open_chat}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-[#FEE500] text-[#3A1D1D] font-bold text-sm hover:bg-yellow-300 transition-colors"
                >
                  <MessageCircle size={15} />
                  카카오로 문의하기
                </a>
              ) : (
                <button
                  type="button"
                  disabled
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-gray-100 text-gray-400 font-bold text-sm cursor-not-allowed"
                >
                  <MessageCircle size={15} />
                  본인 채널 소유 확인 후 이용 가능
                </button>
              )
            )}
          </div>

          <div className="flex justify-end mt-4">
            <button type="button" className="flex items-center gap-1 text-xs text-gray-300 hover:text-gray-500 transition-colors">
              <Flag size={11} />
              신고하기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
