"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import { Search, X, Users, Eye, Heart, BadgeCheck, Clock, Film, ChevronDown } from "lucide-react";
import CTASection from "./CTASection";
import ProfileModal from "./ProfileModal";
import { CATEGORY_TREE, CATEGORY_ALL_LABELS, getParentKey } from "@/lib/categories";

// ─── Types ─────────────────────────────────────────────────────────────────────

export type DirectoryChannel = {
  id: string;
  platform: string;
  channel_name: string;
  follower_count: number | null;
  categories: string[] | null;
  can_collaborate: boolean | null;
  profile_image_url: string | null;
  bio: string | null;
  avg_views: number | null;
  upload_frequency: string | null;
  content_format: string | null;
  content_keywords: string[] | null;
  audience_age: string[] | null;
  audience_gender: string | null;
  channel_url: string | null;
  video_url_1: string | null;
  video_url_2: string | null;
  feed_thumbnail_1: string | null;
  feed_thumbnail_2: string | null;
  feed_url_1: string | null;
  feed_url_2: string | null;
  kakao_open_chat: string | null;
  ai_tools: string[] | null;
  work_fields: string[] | null;
  portfolio_url: string | null;
  is_verified: boolean | null;
};

// ─── Constants (exported for ProfileModal) ────────────────────────────────────

export const TIER_STYLES: Record<string, string> = {
  gold: "bg-yellow-50 text-yellow-700 border border-yellow-300",
  silver: "bg-gray-100 text-gray-600 border border-gray-300",
  bronze: "bg-amber-50 text-amber-700 border border-amber-400",
  blue: "bg-blue-50 text-blue-700 border border-blue-200",
  green: "bg-green-50 text-green-700 border border-green-200",
  orange: "bg-orange-50 text-orange-600 border border-orange-200",
  white: "bg-white text-gray-500 border border-gray-200",
};

export const TIER_LABELS: Record<string, string> = {
  gold: "골드", silver: "실버", bronze: "브론즈",
  blue: "블루", green: "그린", orange: "오렌지", white: "화이트",
};


const TIER_TABS: { key: string; label: string; min?: number }[] = [
  { key: "all", label: "전체" },
  { key: "gold", label: "골드(100만+)", min: 1000000 },
  { key: "silver", label: "실버(50만+)", min: 500000 },
  { key: "bronze", label: "브론즈(10만+)", min: 100000 },
  { key: "blue", label: "블루(1만+)", min: 10000 },
  { key: "green", label: "그린(5천+)", min: 5000 },
  { key: "orange", label: "오렌지(1천+)", min: 1000 },
  { key: "white", label: "화이트(1천미만)" },
];


const AVATAR_COLORS: Record<string, string> = {
  youtube: "#FF0000", instagram: "#E1306C", tiktok: "#010101", editor: "#6C5CE7",
};

// ─── Helpers (exported for ProfileModal) ─────────────────────────────────────

export function formatCount(n: number | null | undefined): string {
  if (n == null) return "-";
  if (n >= 100000000) return `${(n / 100000000).toFixed(0)}억`;
  if (n >= 10000) return `${+(n / 10000).toFixed(1)}만`;
  if (n >= 1000) return `${+(n / 1000).toFixed(1)}천`;
  return `${n}`;
}

export function getTierKey(n: number | null): string {
  if (n == null) return "white";
  if (n >= 1000000) return "gold";
  if (n >= 500000) return "silver";
  if (n >= 100000) return "bronze";
  if (n >= 10000) return "blue";
  if (n >= 5000) return "green";
  if (n >= 1000) return "orange";
  return "white";
}

function matchesTier(ch: DirectoryChannel, key: string): boolean {
  if (key === "all") return true;
  const n = ch.follower_count ?? 0;
  if (key === "white") return n < 1000;
  const tab = TIER_TABS.find((t) => t.key === key);
  return n >= (tab?.min ?? 0);
}

function matchesSearch(ch: DirectoryChannel, q: string): boolean {
  const trimmed = q.trim();
  if (!trimmed) return true;
  const s = trimmed.toLowerCase();
  return (
    (ch.channel_name ?? "").toLowerCase().includes(s) ||
    (ch.bio?.toLowerCase().includes(s) ?? false) ||
    (ch.content_keywords?.some((k) => k.toLowerCase().includes(s)) ?? false) ||
    (ch.categories?.some((c) => (CATEGORY_ALL_LABELS[c] ?? c).toLowerCase().includes(s)) ?? false)
  );
}

/** 1차 or 2차 카테고리 key로 채널 필터링 */
function matchesCategory(ch: DirectoryChannel, key: string): boolean {
  if (key === "all") return true;
  const cats = ch.categories ?? [];
  if (cats.includes(key)) return true;
  // key가 1차 카테고리이면 → 해당 2차 서브 or 레거시 key 포함 여부 확인
  const parent = CATEGORY_TREE.find((p) => p.key === key);
  if (parent) {
    return (
      parent.sub.some((s) => cats.includes(s.key)) ||
      (parent.legacyKeys ?? []).some((lk) => cats.includes(lk))
    );
  }
  return false;
}

// ─── Platform Logos ───────────────────────────────────────────────────────────

function YoutubeLogo() {
  return (
    <svg height="20" viewBox="0 0 29 20" xmlns="http://www.w3.org/2000/svg">
      <path d="M27.9727 3.12324C27.6435 1.89323 26.6768 0.926623 25.4468 0.597366C23.2197 0 14.285 0 14.285 0C14.285 0 5.35042 0 3.12323 0.597366C1.89323 0.926623 0.926623 1.89323 0.597366 3.12324C0 5.35042 0 10 0 10C0 10 0 14.6496 0.597366 16.8768C0.926623 18.1068 1.89323 19.0734 3.12323 19.4026C5.35042 20 14.285 20 14.285 20C14.285 20 23.2197 20 25.4468 19.4026C26.6768 19.0734 27.6435 18.1068 27.9727 16.8768C28.5701 14.6496 28.5701 10 28.5701 10C28.5701 10 28.5701 5.35042 27.9727 3.12324Z" fill="#FF0000"/>
      <path d="M11.4253 14.2854L18.8477 10.0004L11.4253 5.71533V14.2854Z" fill="white"/>
    </svg>
  );
}

function InstagramLogo() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="ig-dir" cx="30%" cy="107%" r="150%">
          <stop offset="0%" stopColor="#ffd600" />
          <stop offset="10%" stopColor="#ff7a00" />
          <stop offset="50%" stopColor="#ff0069" />
          <stop offset="90%" stopColor="#d300c5" />
          <stop offset="100%" stopColor="#7638fa" />
        </radialGradient>
      </defs>
      <rect width="24" height="24" rx="6" fill="url(#ig-dir)" />
      <rect x="2.5" y="2.5" width="19" height="19" rx="4.5" fill="none" stroke="white" strokeWidth="1.5" />
      <circle cx="12" cy="12" r="4.5" fill="none" stroke="white" strokeWidth="1.8" />
      <circle cx="17.5" cy="6.5" r="1.3" fill="white" />
    </svg>
  );
}

function TikTokLogo() {
  return (
    <svg width="18" height="22" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.79 1.52V6.74a4.85 4.85 0 01-1.02-.05z"
        fill="#010101"
      />
    </svg>
  );
}

function EditorIcon() {
  return (
    <div className="w-6 h-6 rounded-md bg-[#6C5CE7] flex items-center justify-center shrink-0">
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </div>
  );
}

// ─── Card Components ──────────────────────────────────────────────────────────

function getYoutubeId(url: string | null | undefined): string | null {
  if (!url) return null;
  const m =
    url.match(/youtube\.com\/watch\?v=([^&]+)/) ||
    url.match(/youtu\.be\/([^?/]+)/) ||
    url.match(/youtube\.com\/shorts\/([^?/]+)/);
  return m ? m[1] : null;
}

function Avatar({ ch, size }: { ch: DirectoryChannel; size: number }) {
  const bg = AVATAR_COLORS[ch.platform] ?? "#9ca3af";
  if (ch.profile_image_url) {
    return (
      <img
        src={ch.profile_image_url}
        alt={ch.channel_name}
        className="rounded-full object-cover shrink-0"
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <div
      className="rounded-full flex items-center justify-center text-white font-black shrink-0"
      style={{ width: size, height: size, backgroundColor: bg, fontSize: size * 0.38 }}
    >
      {ch.channel_name.charAt(0).toUpperCase()}
    </div>
  );
}

function CollabBadge({ can }: { can: boolean | null }) {
  return can ? (
    <span className="text-[10px] font-semibold text-green-600 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">협업가능</span>
  ) : (
    <span className="text-[10px] font-semibold text-gray-400 dark:text-[#6B7280] bg-gray-50 dark:bg-[#374151] border border-gray-200 dark:border-[#4B5563] px-2 py-0.5 rounded-full">협업마감</span>
  );
}

function InfluencerCard({ ch, onClick }: { ch: DirectoryChannel; onClick: () => void }) {
  const tierKey = getTierKey(ch.follower_count);

  const vid = ch.platform === "youtube" ? getYoutubeId(ch.video_url_1) : null;
  const thumbUrl =
    vid
      ? `https://img.youtube.com/vi/${vid}/mqdefault.jpg`
      : ch.feed_thumbnail_1 ?? null;

  return (
    <button
      type="button"
      onClick={onClick}
      className="bg-white dark:bg-[#1F2937] rounded-2xl border border-gray-100 dark:border-[#374151] shadow-sm overflow-hidden flex flex-col text-left hover:shadow-md hover:border-gray-200 dark:hover:border-[#4B5563] transition-all duration-200 w-full"
    >
      {/* 본문 */}
      <div className="relative p-4 flex flex-col gap-3 flex-1">
        {ch.is_verified && (
          <div className="group absolute top-3 right-3 cursor-default z-10">
            <BadgeCheck size={16} className="text-[#1D9E75]" />
            <div className="absolute top-full right-0 mt-1.5 w-max hidden group-hover:block bg-white dark:bg-[#1F2937] border border-gray-100 dark:border-[#374151] shadow-md text-xs text-gray-700 dark:text-[#9CA3AF] px-2.5 py-1.5 rounded-lg pointer-events-none">
              본인 소유가 확인된 채널입니다
            </div>
          </div>
        )}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${TIER_STYLES[tierKey]}`}>
            {TIER_LABELS[tierKey]}
          </span>
          <CollabBadge can={ch.can_collaborate} />
        </div>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-100 dark:bg-[#374151] shrink-0">
            {ch.profile_image_url ? (
              <img src={ch.profile_image_url} alt={ch.channel_name} className="w-full h-full object-cover" />
            ) : (
              <div
                className="w-full h-full flex items-center justify-center text-white font-black"
                style={{ backgroundColor: AVATAR_COLORS[ch.platform] ?? "#9ca3af", fontSize: 18 }}
              >
                {ch.channel_name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0 space-y-0.5">
            <p className="font-bold text-sm text-[#111111] dark:text-[#F9FAFB] truncate leading-snug">{ch.channel_name}</p>
            <p className="flex items-center gap-1 text-xs text-gray-700 dark:text-[#9CA3AF]">
              <Users size={11} className="text-gray-400 dark:text-[#6B7280] shrink-0" />
              <span className="hidden sm:inline">{ch.platform === "youtube" ? "구독자" : "팔로워"}</span>
              <span className="font-semibold text-red-500">{formatCount(ch.follower_count)}</span>
            </p>
            {ch.avg_views != null && (
              <p className="flex items-center gap-1 text-xs text-gray-700 dark:text-[#9CA3AF]">
                {ch.platform === "tiktok"
                  ? <Heart size={11} className="text-gray-400 dark:text-[#6B7280] shrink-0" />
                  : <Eye size={11} className="text-gray-400 dark:text-[#6B7280] shrink-0" />}
                <span className="hidden sm:inline">
                  {ch.platform === "tiktok" ? "누적 좋아요" : "평균 조회수"}
                </span>
                <span className="font-semibold text-red-500">{formatCount(ch.avg_views)}</span>
              </p>
            )}
          </div>
        </div>
        {ch.bio && (
          <p className="text-xs text-gray-700 dark:text-[#9CA3AF] leading-relaxed line-clamp-2">{ch.bio}</p>
        )}
        {(ch.upload_frequency || ch.content_format) && (
          <div className="flex items-center gap-2 text-[11px] text-gray-400 dark:text-[#6B7280]">
            {ch.upload_frequency && <span className="flex items-center gap-1"><Clock size={10} />{ch.upload_frequency}</span>}
            {ch.content_format && <span className="flex items-center gap-1"><Film size={10} />{ch.content_format}</span>}
          </div>
        )}
        {ch.categories && ch.categories.length > 0 && (
          <div className="flex gap-1 flex-wrap">
            {ch.categories.slice(0, 2).map((cat) => (
              <span key={cat} className="text-[10px] text-gray-700 dark:text-[#9CA3AF] bg-gray-100 dark:bg-[#374151] px-2 py-0.5 rounded-full">
                {CATEGORY_ALL_LABELS[cat] ?? cat}
              </span>
            ))}
          </div>
        )}
      </div>
      {thumbUrl && (
        <div className="aspect-video w-full shrink-0 overflow-hidden">
          <img src={thumbUrl} alt="대표 영상" className="w-full h-full object-cover object-center" />
        </div>
      )}
    </button>
  );
}

function EditorCard({ ch, onClick }: { ch: DirectoryChannel; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="bg-white dark:bg-[#1F2937] rounded-2xl border border-gray-100 dark:border-[#374151] shadow-sm overflow-hidden flex flex-col text-left hover:shadow-md hover:border-gray-200 dark:hover:border-[#4B5563] transition-all duration-200 w-full"
    >
      {/* 본문 */}
      <div className="relative p-4 flex flex-col gap-3 flex-1">
        {ch.is_verified && (
          <div className="group absolute top-3 right-3 cursor-default z-10">
            <BadgeCheck size={16} className="text-[#1D9E75]" />
            <div className="absolute top-full right-0 mt-1.5 w-max hidden group-hover:block bg-white dark:bg-[#1F2937] border border-gray-100 dark:border-[#374151] shadow-md text-xs text-gray-700 dark:text-[#9CA3AF] px-2.5 py-1.5 rounded-lg pointer-events-none">
              본인 소유가 확인된 채널입니다
            </div>
          </div>
        )}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-100 dark:bg-[#374151] shrink-0">
            {ch.profile_image_url ? (
              <img src={ch.profile_image_url} alt={ch.channel_name} className="w-full h-full object-cover" />
            ) : (
              <div
                className="w-full h-full flex items-center justify-center text-white font-black"
                style={{ backgroundColor: AVATAR_COLORS[ch.platform] ?? "#9ca3af", fontSize: 18 }}
              >
                {ch.channel_name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm text-[#111111] dark:text-[#F9FAFB] truncate mb-1">{ch.channel_name}</p>
            <CollabBadge can={ch.can_collaborate} />
          </div>
        </div>
        {ch.bio && <p className="text-xs text-gray-700 dark:text-[#9CA3AF] leading-relaxed line-clamp-2">{ch.bio}</p>}
        {ch.work_fields && ch.work_fields.length > 0 && (
          <div className="flex gap-1 flex-wrap">
            {ch.work_fields.slice(0, 3).map((f) => (
              <span key={f} className="text-[10px] text-[#6C5CE7] bg-[#6C5CE7]/10 px-2 py-0.5 rounded-full font-medium">{f}</span>
            ))}
          </div>
        )}
        {ch.ai_tools && ch.ai_tools.length > 0 && (
          <div className="flex gap-1 flex-wrap">
            {ch.ai_tools.slice(0, 3).map((t) => (
              <span key={t} className="text-[10px] text-gray-700 dark:text-[#9CA3AF] bg-gray-100 dark:bg-[#374151] px-2 py-0.5 rounded-full">{t}</span>
            ))}
          </div>
        )}
      </div>
    </button>
  );
}

// ─── Platform Section ─────────────────────────────────────────────────────────

type FilterState = { category: string; tier: string };

function PlatformSection({
  id, platform, logo, title, channels, search, isActive, isEditor, cols, onCardClick,
}: {
  id: string;
  platform: string;
  logo: React.ReactNode;
  title: string;
  channels: DirectoryChannel[];
  search: string;
  isActive: boolean;
  isEditor?: boolean;
  cols: number;
  onCardClick: (ch: DirectoryChannel) => void;
}) {
  const [f, setF] = useState<FilterState>({ category: "all", tier: "all" });
  const [tierOpen, setTierOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const perPage = cols * 3;
  const [visibleCount, setVisibleCount] = useState(perPage);

  // ─ 2차 카테고리 드롭다운
  const isMobile = cols < 5;
  const [hoveredParent, setHoveredParent] = useState<string | null>(null);
  const [expandedParent, setExpandedParent] = useState<string | null>(null);
  const [dropdownLeft, setDropdownLeft] = useState(0);
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const filterRef = useRef<HTMLDivElement>(null);

  // 드롭다운 left 위치 계산 — 버튼 기준, 화면 밖 나가지 않도록 클램프
  const DROPDOWN_WIDTH = 300;
  function calcLeft(e: React.MouseEvent<HTMLButtonElement>): number {
    if (!filterRef.current) return 0;
    const btnRect = e.currentTarget.getBoundingClientRect();
    const contRect = filterRef.current.getBoundingClientRect();
    const raw = btnRect.left - contRect.left;
    const max = contRect.width - DROPDOWN_WIDTH;
    return Math.min(Math.max(0, raw), Math.max(0, max));
  }

  // PC hover: 탭 → 드롭다운으로 마우스 이동 시 닫히지 않도록 딜레이
  function onParentMouseEnter(key: string, e: React.MouseEvent<HTMLButtonElement>) {
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    setDropdownLeft(calcLeft(e));
    setHoveredParent(key);
  }
  function onParentMouseLeave() {
    hoverTimerRef.current = setTimeout(() => setHoveredParent(null), 120);
  }
  function onSubPanelMouseEnter() {
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
  }
  function onSubPanelMouseLeave() {
    hoverTimerRef.current = setTimeout(() => setHoveredParent(null), 120);
  }

  // 어떤 부모 카테고리의 드롭다운을 표시할지
  const activeSubParent = isMobile ? expandedParent : hoveredParent;

  // 현재 선택된 카테고리 key가 어느 1차에 속하는지
  const activePrimaryKey = getParentKey(f.category);

  function handleParentTabClick(key: string, e: React.MouseEvent<HTMLButtonElement>) {
    setF((s) => ({ ...s, category: key }));
    if (isMobile) {
      const willExpand = expandedParent !== key;
      if (willExpand) setDropdownLeft(calcLeft(e));
      setExpandedParent(willExpand ? key : null);
    }
  }

  function handleSubClick(key: string) {
    setF((s) => ({ ...s, category: key }));
    if (isMobile) setExpandedParent(null);
    else setHoveredParent(null);
  }

  useEffect(() => {
    setVisibleCount(cols * 3);
  }, [cols, f]);

  useEffect(() => {
    return () => {
      if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!tierOpen) return;
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setTierOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [tierOpen]);

  const filtered = useMemo(
    () =>
      channels.filter(
        (ch) =>
          (isEditor || matchesTier(ch, f.tier)) &&
          matchesCategory(ch, f.category)
      ),
    [channels, f, isEditor]
  );

  const visible = filtered.slice(0, visibleCount);
  const hasMore = filtered.length > visibleCount;

  // 플랫폼 토글 off이면 섹션 숨김
  if (!isActive) return null;
  // 검색 중이고 이 플랫폼에 결과 없으면 섹션 전체 숨김
  if (search.trim() && channels.length === 0) return null;

  return (
    <section id={id} className="py-12 border-t border-gray-100 dark:border-[#374151]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 mb-6">
          {logo}
          <h2 className="text-xl font-black text-[#111111] dark:text-[#F9FAFB]">{title}</h2>
          <span className="text-sm text-gray-400 dark:text-[#6B7280]">({channels.length}명 등록)</span>
        </div>

        {/* Tier dropdown + 1차 카테고리 탭 */}
        <div className="relative" ref={filterRef}>
          <div className="flex items-center gap-2">
            {!isEditor && (
              <div className="relative shrink-0" ref={dropdownRef}>
                <button
                  onClick={() => setTierOpen((v) => !v)}
                  className={`flex items-center gap-1 text-xs font-semibold px-3.5 py-1.5 rounded-full border transition-colors ${
                    f.tier !== "all"
                      ? "bg-[#E8292E] text-white border-[#E8292E]"
                      : "bg-[#111111] dark:bg-[#374151] text-white border-[#111111] dark:border-[#374151] hover:bg-[#333333] dark:hover:bg-[#4B5563] hover:border-[#333333] dark:hover:border-[#4B5563]"
                  }`}
                >
                  {f.tier === "all" ? "등급" : TIER_TABS.find((t) => t.key === f.tier)?.label.split("(")[0]}
                  <ChevronDown size={12} className={`transition-transform ${tierOpen ? "rotate-180" : ""}`} />
                </button>
                {tierOpen && (
                  <div className="absolute left-0 top-full mt-1.5 bg-white dark:bg-[#1F2937] border border-gray-200 dark:border-[#374151] rounded-xl shadow-lg z-20 min-w-[160px] py-1 overflow-hidden">
                    {TIER_TABS.map((tab) => (
                      <button
                        key={tab.key}
                        onClick={() => { setF((s) => ({ ...s, tier: tab.key })); setTierOpen(false); }}
                        className={`w-full text-left text-xs font-semibold px-4 py-2 transition-colors ${
                          f.tier === tab.key
                            ? "bg-[#E8292E]/10 text-[#E8292E]"
                            : "text-gray-700 dark:text-[#F9FAFB] hover:bg-gray-50 dark:hover:bg-[#374151]"
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 1차 카테고리 탭 (스크롤) */}
            <div className="flex gap-1.5 overflow-x-auto pb-1 min-w-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {/* 전체 */}
              <button
                onClick={() => { setF((s) => ({ ...s, category: "all" })); setExpandedParent(null); }}
                className={`shrink-0 text-xs font-semibold px-3.5 py-1.5 rounded-full transition-colors ${
                  f.category === "all"
                    ? "bg-[#111111] dark:bg-[#F9FAFB] text-white dark:text-[#111111]"
                    : "bg-gray-100 dark:bg-[#374151] text-gray-700 dark:text-[#9CA3AF] hover:bg-gray-200 dark:hover:bg-[#4B5563]"
                }`}
              >
                전체
              </button>

              {/* 1차 카테고리 */}
              {CATEGORY_TREE.map((parent) => {
                const isActive = activePrimaryKey === parent.key;
                return (
                  <button
                    key={parent.key}
                    onClick={(e) => handleParentTabClick(parent.key, e)}
                    onMouseEnter={(e) => !isMobile && onParentMouseEnter(parent.key, e)}
                    onMouseLeave={() => !isMobile && onParentMouseLeave()}
                    className={`shrink-0 flex items-center gap-0.5 text-xs font-semibold px-3.5 py-1.5 rounded-full transition-colors ${
                      isActive
                        ? "bg-[#111111] dark:bg-[#F9FAFB] text-white dark:text-[#111111]"
                        : "bg-gray-100 dark:bg-[#374151] text-gray-700 dark:text-[#9CA3AF] hover:bg-gray-200 dark:hover:bg-[#4B5563]"
                    }`}
                  >
                    {parent.label}
                    <ChevronDown
                      size={10}
                      className={`transition-transform duration-150 ${
                        isMobile && expandedParent === parent.key ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2차 카테고리 드롭다운 — absolute, 탭 버튼 바로 아래 */}
          {activeSubParent && (
            <div
              style={{ left: dropdownLeft, width: DROPDOWN_WIDTH }}
              className="absolute top-[calc(100%+6px)] z-30 bg-white dark:bg-[#1e2130] border border-gray-200 dark:border-white/10 rounded-xl shadow-xl p-3"
              onMouseEnter={() => !isMobile && onSubPanelMouseEnter()}
              onMouseLeave={() => !isMobile && onSubPanelMouseLeave()}
            >
              <div className="flex flex-wrap gap-1.5">
                {CATEGORY_TREE.find((p) => p.key === activeSubParent)?.sub.map((sub) => (
                  <button
                    key={sub.key}
                    onClick={() => handleSubClick(sub.key)}
                    className={`text-[11px] font-medium px-3 py-1.5 rounded-xl border transition-colors ${
                      f.category === sub.key
                        ? "bg-[#111111] dark:bg-white/15 text-white dark:text-white border-transparent"
                        : "bg-white dark:bg-transparent border-gray-200 dark:border-white/10 text-gray-600 dark:text-[#9CA3AF] hover:bg-gray-50 dark:hover:bg-white/10 hover:border-gray-300 dark:hover:border-transparent hover:text-gray-800 dark:hover:text-white"
                    }`}
                  >
                    {sub.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Cards */}
        <div className="mt-4">
          {filtered.length > 0 ? (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                {visible.map((ch) =>
                  isEditor
                    ? <EditorCard key={ch.id} ch={ch} onClick={() => onCardClick(ch)} />
                    : <InfluencerCard key={ch.id} ch={ch} onClick={() => onCardClick(ch)} />
                )}
              </div>
              {hasMore && (
                <div className="flex justify-center mt-6">
                  <button
                    onClick={() => setVisibleCount((v) => v + perPage)}
                    className="text-sm font-semibold text-gray-700 dark:text-[#9CA3AF] border border-gray-200 dark:border-[#374151] hover:border-gray-300 dark:hover:border-[#4B5563] px-6 py-2.5 rounded-full transition-colors"
                  >
                    더보기
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-16 text-gray-400 dark:text-[#6B7280]">
              <p className="text-sm">{search.trim() ? "검색 결과가 없습니다" : "등록된 채널이 없습니다"}</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

const SECTIONS = [
  { id: "youtube-section",   platform: "youtube",   title: "유튜브 크리에이터",    logo: <YoutubeLogo />,   isEditor: false },
  { id: "instagram-section", platform: "instagram", title: "인스타그램 크리에이터", logo: <InstagramLogo />, isEditor: false },
  { id: "tiktok-section",    platform: "tiktok",    title: "틱톡 크리에이터",      logo: <TikTokLogo />,    isEditor: false },
  { id: "editor-section",    platform: "editor",    title: "편집 프로듀서",         logo: <EditorIcon />,    isEditor: true  },
];

export default function ChannelDirectory({
  channels,
  activePlatforms,
}: {
  channels: DirectoryChannel[];
  activePlatforms?: string[];
}) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<DirectoryChannel | null>(null);
  const [cols, setCols] = useState(5);

  useEffect(() => {
    function update() {
      setCols(window.innerWidth >= 1024 ? 5 : 2);
    }
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // ─ 1단계: 전체 채널을 검색어로 필터링
  const filteredChannels = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return channels;
    const result = channels.filter((ch) =>
      (ch.channel_name ?? "").toLowerCase().includes(q) ||
      (ch.bio ?? "").toLowerCase().includes(q) ||
      (ch.content_keywords ?? []).some((k) => k.toLowerCase().includes(q)) ||
      (ch.categories ?? []).some((c) => (CATEGORY_ALL_LABELS[c] ?? c).toLowerCase().includes(q))
    );
    console.log(`[검색] "${search}" → ${result.length}/${channels.length}개 매칭`);
    return result;
  }, [channels, search]);

  // ─ 2단계: 필터링된 채널을 플랫폼별로 분리
  const byPlatform = useMemo(() => {
    const m: Record<string, DirectoryChannel[]> = {
      "youtube-section": [],
      "instagram-section": [],
      "tiktok-section": [],
      "editor-section": [],
    };
    for (const ch of filteredChannels) {
      const key = `${ch.platform}-section`;
      if (key in m) m[key].push(ch);
    }
    return m;
  }, [filteredChannels]);

  function handleSearchKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key !== "Enter") return;
    const first = SECTIONS.find((s) => byPlatform[s.id].length > 0);
    if (first) {
      document.getElementById(first.id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  return (
    <div className="bg-[#F3F4F6] dark:bg-[#111827]">
      {/* Sticky search */}
      <div className="bg-white dark:bg-[#111827] border-b border-gray-100 dark:border-[#374151] sticky top-14 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="relative max-w-sm">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-[#6B7280] pointer-events-none" />
            <input
              type="text"
              placeholder="채널명, 키워드로 검색"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              className="w-full pl-9 pr-9 py-2 text-sm border border-gray-200 dark:border-[#374151] rounded-full focus:outline-none focus:border-gray-400 dark:focus:border-[#4B5563] bg-gray-50 dark:bg-[#1F2937] focus:bg-white dark:focus:bg-[#1F2937] text-[#111111] dark:text-[#F9FAFB] placeholder:text-gray-400 dark:placeholder:text-[#6B7280] transition-colors"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-[#6B7280] hover:text-gray-600 dark:hover:text-[#9CA3AF]">
                <X size={13} />
              </button>
            )}
          </div>
        </div>
      </div>

      {search.trim() && filteredChannels.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 text-gray-400 dark:text-[#6B7280]">
          <Search size={32} className="mb-4 opacity-30" />
          <p className="text-base font-semibold">검색 결과가 없습니다</p>
          <p className="text-sm mt-1">
            <span className="text-[#111111] dark:text-[#F9FAFB] font-medium">"{search}"</span>에 맞는 채널이 없어요
          </p>
        </div>
      ) : (
        <>
          <div id="influencers" />
          {SECTIONS.map((s) => (
            <React.Fragment key={s.id}>
              {s.id === "editor-section" && <div id="editors" />}
              <PlatformSection
                id={s.id}
                platform={s.platform}
                logo={s.logo}
                title={s.title}
                channels={byPlatform[s.id]}
                search={search}
                isActive={activePlatforms ? activePlatforms.includes(s.platform) : true}
                isEditor={s.isEditor}
                cols={cols}
                onCardClick={setSelected}
              />
            </React.Fragment>
          ))}
        </>
      )}

      <CTASection />

      {selected && <ProfileModal channel={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
