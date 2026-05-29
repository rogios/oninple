"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";

type TrendingVideo = {
  title: string;
  channelTitle: string;
  thumbnail?: string;
  viewCount?: number;
};

const checklist = [
  "수수료 없이 카카오·DM으로 직접 컨택",
  "유튜브·인스타·틱톡 한 곳에서 탐색",
  "AI 편집자까지 무료 디렉토리 제공",
  "구글 이메일 한 번으로 즉시 등록",
];

const heroTabs = [
  { label: "유튜브", platform: "youtube" },
  { label: "인스타그램", platform: "instagram" },
  { label: "틱톡", platform: "tiktok" },
  { label: "편집자", platform: "editor" },
];

const RANK_COLORS = ["#E8292E", "#FF6B35", "#FFB800", "#aaaaaa", "#aaaaaa"];
const CAT_TABS    = ["전체", "뷰티", "푸드", "여행", "스포츠", "IT", "엔터"];

const MOCK_VIDEOS: TrendingVideo[] = [
  { title: "이번 주 가장 핫한 뷰티 트렌드 TOP 10",  channelTitle: "뷰티나나",  viewCount: 120000 },
  { title: "서울 숨은 맛집 총정리 먹방 브이로그",    channelTitle: "먹방대왕",  viewCount: 87000  },
  { title: "ChatGPT로 여행 일정 짜는 방법 가이드",   channelTitle: "AI여행러", viewCount: 65000  },
  { title: "요즘 핫한 스포츠 브랜드 착용 하울",      channelTitle: "패션인싸",  viewCount: 48000  },
  { title: "2025 재테크 전략 총정리 주식 ETF 추천",  channelTitle: "머니클래스", viewCount: 39000 },
];

function formatViews(n?: number): string {
  if (!n) return "";
  if (n >= 10000) return `${(n / 10000).toFixed(1)}만`;
  return n.toLocaleString();
}

// ── 오른쪽 슬라이드 0: 급상승 트렌드 ───────────────────────────────────────
function Slide0() {
  const router = useRouter();
  const [allCategories, setAllCategories] = useState<Array<{ category: string; videos: TrendingVideo[] }>>([]);

  useEffect(() => {
    fetch("/api/youtube/trending-by-category")
      .then((r) => r.json())
      .then((data) => {
        const cats = (data.categories ?? []).map((c: { category: string; videos: TrendingVideo[] }) => ({
          category: c.category,
          videos: c.videos ?? [],
        }));
        if (cats.length > 0) setAllCategories(cats);
      })
      .catch(() => {});
  }, []);

  const displayVideos: TrendingVideo[] = (() => {
    if (allCategories.length === 0) return MOCK_VIDEOS;
    const out: TrendingVideo[] = [];
    for (const cat of allCategories) {
      if (cat.videos.length > 0) out.push(cat.videos[0]);
      if (out.length >= 5) break;
    }
    return out.length >= 5 ? out : MOCK_VIDEOS;
  })();

  const now   = new Date();
  const dateLabel = `${String(now.getMonth() + 1).padStart(2, "0")}.${String(now.getDate()).padStart(2, "0")}`;

  return (
    <div
      role="link"
      tabIndex={0}
      onClick={() => router.push("/trending")}
      onKeyDown={(e) => e.key === "Enter" && router.push("/trending")}
      className="w-full h-full flex flex-col overflow-hidden shadow-xl"
      style={{ background: "#1a1f2e", borderRadius: 16, padding: 20, cursor: "pointer" }}
    >
      {/* ── 상단 헤더 ── */}
      <div className="flex items-center gap-4 mb-4">
        {/* 날짜: 시각적 포인트 */}
        <div style={{ color: "#ef4444", fontSize: 36, fontWeight: 700, lineHeight: 1, letterSpacing: "-0.5px", flexShrink: 0 }}>
          {dateLabel}
        </div>
        {/* 타이틀 + 서브텍스트 */}
        <div>
          <div style={{ color: "white", fontSize: 15, fontWeight: 500, lineHeight: 1.3 }}>
            이번 주 급상승 영상
          </div>
          <div style={{ color: "rgba(255,255,255,0.35)", fontSize: 11, marginTop: 3 }}>
            매일 업데이트
          </div>
        </div>
      </div>

      {/* ── 카테고리 탭 ── */}
      <div
        className="flex gap-1.5 mb-4 overflow-x-auto"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" } as React.CSSProperties}
        onClick={(e) => e.stopPropagation()}
      >
        {CAT_TABS.map((tab) => (
          <span
            key={tab}
            className="shrink-0"
            style={{
              fontSize: 12,
              padding: "4px 12px",
              borderRadius: 20,
              border: tab === "전체"
                ? "1px solid #E8292E"
                : "1px solid rgba(255,255,255,0.15)",
              color: tab === "전체" ? "#E8292E" : "white",
              whiteSpace: "nowrap",
              cursor: "default",
            }}
          >
            {tab}
          </span>
        ))}
      </div>

      {/* ── 랭킹 리스트 ── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {displayVideos.slice(0, 5).map((v, i) => (
          <div key={i}>
            {i > 0 && (
              <div style={{ height: 1, background: "rgba(255,255,255,0.06)" }} />
            )}
            <div className="flex items-center gap-3" style={{ padding: "11px 0" }}>
              {/* 순위 */}
              <span
                className="shrink-0 text-center"
                style={{ color: RANK_COLORS[i], fontSize: 20, fontWeight: 700, lineHeight: 1, width: 20 }}
              >
                {i + 1}
              </span>
              {/* 썸네일 */}
              {v.thumbnail ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={v.thumbnail}
                  alt=""
                  className="shrink-0 object-cover"
                  style={{ width: 48, height: 36, borderRadius: 8 }}
                />
              ) : (
                <div
                  className="shrink-0 flex items-center justify-center"
                  style={{ width: 48, height: 36, borderRadius: 8, background: "#252d3d" }}
                >
                  <svg viewBox="0 0 24 24" fill="white" style={{ width: 14, height: 14, opacity: 0.45 }}>
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              )}
              {/* 텍스트 */}
              <div style={{ minWidth: 0, flex: 1 }}>
                <div
                  className="truncate"
                  style={{ color: "white", fontSize: 13, fontWeight: 500, lineHeight: 1.3, marginBottom: 3 }}
                >
                  {v.title}
                </div>
                <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 11 }}>
                  {v.channelTitle}{v.viewCount ? ` · ${formatViews(v.viewCount)}` : ""}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── 하단 버튼 ── */}
      <Link
        href="/trending"
        onClick={(e) => e.stopPropagation()}
        className="flex items-center justify-center transition-colors hover:bg-white/5"
        style={{
          color: "white",
          fontSize: 13,
          border: "1px solid rgba(255,255,255,0.15)",
          borderRadius: 8,
          padding: "10px 0",
          marginTop: 12,
          textDecoration: "none",
        }}
      >
        모든 트렌드 보기 ›
      </Link>
    </div>
  );
}

// ── 오른쪽 슬라이드 1: 모두 무료 ────────────────────────────────────────────
function Slide1() {
  return (
    <div className="bg-white dark:bg-[#1F2937] rounded-3xl shadow-xl border border-gray-100 dark:border-[#374151] w-full h-full overflow-hidden">
      <div className="grid grid-cols-1 sm:grid-cols-2 h-full">
        {/* 왼쪽: 텍스트 */}
        <div className="p-6 flex flex-col justify-center">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#E8292E] bg-[#E8292E]/8 px-3 py-1.5 rounded-full w-fit mb-4">
            🎁 모든 기능 무료
          </span>
          <h3 className="text-xl font-black text-[#111111] dark:text-[#F9FAFB] leading-tight mb-2">
            등록부터 연결까지<br />
            <span className="text-[#E8292E]">모두 무료</span>
          </h3>
          <p className="text-xs text-gray-700 dark:text-[#9CA3AF] leading-relaxed mb-4">
            중간 수수료 없이 카카오 DM으로 직접 연결됩니다
          </p>
          <ul className="space-y-2.5 mb-4">
            <li className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#E8292E] text-white text-[9px] font-black flex items-center justify-center shrink-0 leading-tight text-center">FREE</div>
              <span className="text-xs text-gray-700 dark:text-[#9CA3AF]">등록·이용·연결 모두 무료</span>
            </li>
            <li className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#E8292E] text-white text-sm font-black flex items-center justify-center shrink-0">%</div>
              <span className="text-xs text-gray-700 dark:text-[#9CA3AF]">중간 수수료 0원</span>
            </li>
          </ul>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-xl px-3 py-2.5 text-[11px] text-yellow-800 dark:text-yellow-300 leading-relaxed">
            카카오 오픈채팅으로 빠르고 간편하게!<br />
            별도 수수료 없이 직접 소통하세요
          </div>
        </div>
        {/* 오른쪽: 비주얼 */}
        <div className="bg-gray-50 dark:bg-[#111827] sm:rounded-r-3xl p-6 flex flex-col items-center justify-center gap-4">
          <span className="text-xs font-bold text-[#E8292E] bg-[#E8292E]/10 px-3 py-1 rounded-full">ALL FREE</span>
          <div className="text-5xl font-black text-[#E8292E] leading-none tracking-tighter">FREE</div>
          {/* 플로우 */}
          <div className="flex items-center w-full gap-1">
            <div className="bg-white dark:bg-[#1F2937] border-2 border-gray-200 dark:border-[#374151] rounded-lg px-2 py-1.5 text-[10px] font-bold text-gray-700 dark:text-[#9CA3AF] text-center whitespace-nowrap shrink-0">광고주</div>
            <div className="flex-1 border-b-2 border-dashed border-[#E8292E]/40" />
            <span className="text-[#E8292E] font-black text-xs shrink-0">›</span>
            <div className="bg-[#E8292E] rounded-lg px-2 py-1.5 text-[10px] font-bold text-white text-center whitespace-nowrap shrink-0">ON인플</div>
            <span className="text-[#E8292E] font-black text-xs shrink-0">›</span>
            <div className="flex-1 border-b-2 border-dashed border-[#E8292E]/40" />
            <div className="bg-white dark:bg-[#1F2937] border-2 border-gray-200 dark:border-[#374151] rounded-lg px-2 py-1.5 text-[10px] font-bold text-gray-700 dark:text-[#9CA3AF] text-center leading-tight shrink-0">크리에이터<br />편집자</div>
          </div>
          {/* 4개 특징 */}
          <div className="grid grid-cols-2 gap-1.5 w-full">
            {["안전한 직접 거래", "빠른 응답", "맞춤 매칭", "정보 보호"].map((f) => (
              <div key={f} className="bg-white dark:bg-[#1F2937] rounded-lg p-2.5 text-center text-[10px] font-semibold text-gray-700 dark:text-[#9CA3AF] border border-gray-100 dark:border-[#374151]">
                {f}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── 오른쪽 슬라이드 2: 직접 연결 ────────────────────────────────────────────
function Slide2() {
  return (
    <div className="bg-white dark:bg-[#1F2937] rounded-3xl shadow-xl border border-gray-100 dark:border-[#374151] w-full h-full overflow-hidden">
      <div className="grid grid-cols-1 sm:grid-cols-2 h-full">
        {/* 왼쪽: 텍스트 */}
        <div className="p-6 flex flex-col justify-center">
          <h3 className="text-xl font-black text-[#111111] dark:text-[#F9FAFB] leading-tight mb-2">
            인플루언서와 광고주를<br />
            <span className="text-[#E8292E]">직접 연결</span>합니다
          </h3>
          <p className="text-xs text-gray-700 dark:text-[#9CA3AF] leading-relaxed mb-4">
            유튜브·인스타그램·틱톡 크리에이터를 한 곳에서 탐색하고 바로 연결하세요
          </p>
          <div className="flex gap-1.5 flex-wrap mb-4">
            <span className="text-[10px] font-bold text-white bg-[#FF0000] px-2.5 py-1 rounded-full">YouTube</span>
            <span className="text-[10px] font-bold text-white bg-gradient-to-r from-purple-500 to-pink-500 px-2.5 py-1 rounded-full">Instagram</span>
            <span className="text-[10px] font-bold text-white bg-[#010101] px-2.5 py-1 rounded-full">TikTok</span>
          </div>
          <span className="inline-flex items-center gap-1 text-xs font-bold text-[#E8292E] bg-[#E8292E]/8 px-3 py-1.5 rounded-full w-fit">
            🎁 무료 디렉토리
          </span>
        </div>
        {/* 오른쪽: 목업 */}
        <div className="bg-gray-50 dark:bg-[#111827] sm:rounded-r-3xl p-5 flex flex-col gap-2.5 justify-center">
          <div className="bg-white dark:bg-[#1F2937] border border-gray-200 dark:border-[#374151] rounded-xl px-3 py-2 flex items-center gap-2">
            <svg className="w-3 h-3 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
            <span className="text-[10px] text-gray-400 dark:text-[#6B7280] flex-1">크리에이터 검색...</span>
            <span className="bg-gray-100 dark:bg-[#374151] rounded px-1.5 py-0.5 text-[10px] text-gray-700 dark:text-[#9CA3AF]">필터 ▾</span>
          </div>
          {[
            { bg: "#E1306C", label: "뷰", name: "뷰티나나", catLabel: "뷰티패션", catCls: "bg-gradient-to-r from-purple-500 to-pink-500", sub: "14.2만", avg: "4.5만" },
            { bg: "#FF0000", label: "여", name: "여행에미치다", catLabel: "여행", catCls: "bg-[#FF0000]", sub: "8.7만", avg: "3.2만" },
          ].map((c) => (
            <div key={c.name} className="bg-white dark:bg-[#1F2937] border border-gray-100 dark:border-[#374151] rounded-2xl p-3">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-black text-xs shrink-0" style={{ backgroundColor: c.bg }}>
                  {c.label}
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-[#111111] dark:text-[#F9FAFB] truncate">{c.name}</div>
                  <span className={`text-[9px] text-white px-1.5 py-0.5 rounded-full ${c.catCls}`}>{c.catLabel}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                <div className="bg-gray-50 dark:bg-[#111827] rounded p-1.5 text-center">
                  <div className="text-xs font-black text-[#111111] dark:text-[#F9FAFB]">{c.sub}</div>
                  <div className="text-[9px] text-gray-400 dark:text-[#6B7280]">구독자</div>
                </div>
                <div className="bg-gray-50 dark:bg-[#111827] rounded p-1.5 text-center">
                  <div className="text-xs font-black text-[#111111] dark:text-[#F9FAFB]">{c.avg}</div>
                  <div className="text-[9px] text-gray-400 dark:text-[#6B7280]">평균조회수</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── 오른쪽 슬라이드 3: AI 편집자 ────────────────────────────────────────────
function Slide3() {
  return (
    <div className="bg-white dark:bg-[#1F2937] rounded-3xl shadow-xl border border-gray-100 dark:border-[#374151] w-full h-full overflow-hidden">
      <div className="grid grid-cols-1 sm:grid-cols-2 h-full">
        {/* 왼쪽: 텍스트 */}
        <div className="p-6 flex flex-col justify-center">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#6C5CE7] bg-[#6C5CE7]/10 px-3 py-1.5 rounded-full w-fit mb-4">
            ✦ AI 편집자 특화 플랫폼
          </span>
          <h3 className="text-xl font-black text-[#111111] dark:text-[#F9FAFB] leading-tight mb-2">
            AI 편집 실력을<br />
            <span className="text-[#6C5CE7]">자유롭게</span><br />
            어필하세요
          </h3>
          <p className="text-xs text-gray-700 dark:text-[#9CA3AF] leading-relaxed mb-4">
            Runway·Sora·CapCut 등 AI 영상 편집 전문가 등록 가능
          </p>
          <div className="flex gap-1.5 flex-wrap mb-4">
            {["Runway", "Sora", "CapCut", "Premiere Pro"].map((tool) => (
              <span key={tool} className="text-[10px] font-semibold text-gray-700 dark:text-[#9CA3AF] bg-gray-100 dark:bg-[#374151] border border-gray-200 dark:border-[#374151] px-2.5 py-1 rounded-full">
                {tool}
              </span>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[
              { icon: "🤖", label: "AI 툴 활용 가능" },
              { icon: "🎬", label: "포트폴리오 등록" },
              { icon: "🤝", label: "의뢰 매칭 기회 확대" },
            ].map((f) => (
              <div key={f.label} className="text-center">
                <div className="text-xl mb-1">{f.icon}</div>
                <div className="text-[9px] text-gray-700 dark:text-[#9CA3AF] leading-tight">{f.label}</div>
              </div>
            ))}
          </div>
        </div>
        {/* 오른쪽: 다크 Before/After 목업 */}
        <div className="bg-[#1a1a2e] sm:rounded-r-3xl p-5 flex flex-col">
          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Before / After</div>
          <div className="flex flex-col gap-2.5 flex-1">
            <div className="bg-[#2a2a3e] rounded-xl p-3">
              <div className="text-[10px] font-semibold text-gray-400 mb-2">BEFORE</div>
              <div className="flex items-end gap-1 h-10">
                {[65, 45, 78, 38, 58, 70, 42].map((h, i) => (
                  <div key={i} className="flex-1 rounded-sm bg-[#3a3a5e]" style={{ height: `${h}%` }} />
                ))}
              </div>
              <div className="text-[10px] text-gray-500 mt-2">일반 편집 · 3일 소요</div>
            </div>
            <div className="text-center text-[#6C5CE7] text-xs font-black">↓ AI</div>
            <div className="bg-[#2a2a3e] border border-[#6C5CE7]/50 rounded-xl p-3">
              <div className="text-[10px] font-semibold text-[#6C5CE7] mb-2">AFTER AI</div>
              <div className="flex items-end gap-1 h-10">
                {[88, 92, 85, 96, 90, 94, 87].map((h, i) => (
                  <div key={i} className="flex-1 rounded-sm bg-[#6C5CE7]" style={{ height: `${h}%` }} />
                ))}
              </div>
              <div className="text-[10px] text-[#6C5CE7] mt-2">AI 편집 · 당일 완성</div>
            </div>
          </div>
          <div className="mt-4 text-center text-[10px] text-gray-400 leading-relaxed">
            AI 기술로 더 빠르고, 더 완성도 높은 영상 제작
          </div>
        </div>
      </div>
    </div>
  );
}

// ── 메인 ─────────────────────────────────────────────────────────────────────
const SLIDES = [Slide0, Slide1, Slide2, Slide3];

export default function HeroSection({
  activePlatforms,
  onTogglePlatform,
}: {
  activePlatforms: string[];
  onTogglePlatform: (platform: string) => void;
}) {
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % SLIDES.length), 5000);
    return () => clearInterval(t);
  }, [paused]);

  return (
    <section
      className="relative overflow-hidden pt-12 pb-8 lg:pt-16 lg:pb-10"
      style={{ background: "var(--hero-bg)" }}
    >
      {/* ── 배경 레이어 ── */}
      <div className="dark:opacity-40 sm:dark:opacity-100">
      <div className="pointer-events-none absolute -top-20 -right-28 w-[560px] h-[560px] rounded-full"
        style={{ background: "radial-gradient(circle, rgba(255,255,255,0.55) 0%, transparent 68%)", filter: "blur(36px)" }} />
      <div className="pointer-events-none absolute -bottom-16 -left-16 w-[380px] h-[380px] rounded-full"
        style={{ background: "radial-gradient(circle, rgba(255,255,255,0.40) 0%, transparent 70%)", filter: "blur(28px)" }} />
      <div className="pointer-events-none absolute -top-16 right-[6%] w-[340px] h-[340px] rounded-full" style={{ border: "1.5px solid rgba(255,255,255,0.60)" }} />
      <div className="pointer-events-none absolute top-[15%] -left-24 w-[420px] h-[420px] rounded-full" style={{ border: "1px solid rgba(255,255,255,0.45)" }} />
      <div className="pointer-events-none absolute bottom-[-30px] right-[16%] w-[200px] h-[200px] rounded-full" style={{ border: "1px solid rgba(255,255,255,0.38)" }} />
      <div className="pointer-events-none absolute top-10 left-[10%] w-14 h-14 rounded-full bg-white/45" />
      <div className="pointer-events-none absolute top-[28%] left-[3%] w-5 h-5 rounded-full bg-white/32" />
      <div className="pointer-events-none absolute top-[55%] left-[8%] w-8 h-8 rounded-full bg-white/28" />
      <div className="pointer-events-none absolute top-[18%] right-[14%] w-10 h-10 rounded-full bg-white/32" />
      <div className="pointer-events-none absolute top-[42%] right-[5%] w-7 h-7 rounded-full bg-white/42" />
      <div className="pointer-events-none absolute bottom-10 left-[22%] w-6 h-6 rounded-full bg-white/38" />
      <div className="pointer-events-none absolute bottom-4 right-[38%] w-3 h-3 rounded-full bg-white/48" />
      <div className="pointer-events-none absolute top-[8%] left-[32%] w-2 h-2 rounded-full bg-white/40" />
      <div className="pointer-events-none absolute top-[18%] left-[40%] w-2 h-2 rounded-full bg-white/35" />
      <div className="pointer-events-none absolute top-[28%] left-[48%] w-2 h-2 rounded-full bg-white/30" />
      <div className="pointer-events-none absolute top-[38%] left-[56%] w-1.5 h-1.5 rounded-full bg-white/35" />
      <div className="pointer-events-none absolute top-[48%] left-[64%] w-1.5 h-1.5 rounded-full bg-white/28" />
      <div className="pointer-events-none absolute top-[58%] left-[72%] w-2 h-2 rounded-full bg-white/30" />
      <div className="pointer-events-none absolute top-[3%] left-[6%] w-[260px] h-[2px]"
        style={{ background: "rgba(255,255,255,0.60)", transform: "rotate(34deg)", transformOrigin: "left center" }} />
      <div className="pointer-events-none absolute bottom-[8%] right-[4%] w-[200px] h-[2px]"
        style={{ background: "rgba(255,255,255,0.55)", transform: "rotate(-28deg)", transformOrigin: "right center" }} />
      <div className="pointer-events-none absolute top-[12%] left-[40%] w-[140px] h-[1.5px]"
        style={{ background: "rgba(255,255,255,0.50)", transform: "rotate(18deg)", transformOrigin: "left center" }} />
      <div className="pointer-events-none absolute top-[50%] left-[2%] w-[100px] h-[1.5px]" style={{ background: "rgba(255,255,255,0.52)" }} />
      <div className="pointer-events-none absolute bottom-[20%] left-[42%] w-[90px] h-[1.5px]" style={{ background: "rgba(255,255,255,0.50)" }} />
      <div className="pointer-events-none absolute top-[18%] left-[26%] w-[1.5px] h-[80px]" style={{ background: "rgba(255,255,255,0.48)" }} />
      <div className="pointer-events-none absolute bottom-[14%] right-[22%] w-[1.5px] h-[60px]" style={{ background: "rgba(255,255,255,0.45)" }} />
      <div className="pointer-events-none absolute bottom-[10%] left-[12%] w-20 h-20"
        style={{ border: "1.5px solid rgba(255,255,255,0.52)", transform: "rotate(45deg)" }} />
      <div className="pointer-events-none absolute top-[8%] right-[26%] w-12 h-12"
        style={{ border: "1.5px solid rgba(255,255,255,0.48)", transform: "rotate(45deg)" }} />
      <div className="pointer-events-none absolute top-[60%] left-[36%] w-5 h-5 bg-white/28" style={{ transform: "rotate(45deg)" }} />
      <div className="pointer-events-none absolute top-[32%] right-[10%] w-3 h-3 bg-white/35" style={{ transform: "rotate(45deg)" }} />
      <div className="pointer-events-none absolute top-[10%] right-[30%] w-14 h-9"
        style={{ border: "1.5px solid rgba(255,255,255,0.45)", transform: "rotate(-14deg)" }} />
      <div className="pointer-events-none absolute bottom-[16%] left-[32%] w-10 h-6"
        style={{ border: "1px solid rgba(255,255,255,0.40)", transform: "rotate(22deg)" }} />
      <div className="pointer-events-none absolute top-[6%] left-[20%] w-6 h-6"
        style={{ borderTop: "2px solid rgba(255,255,255,0.55)", borderLeft: "2px solid rgba(255,255,255,0.55)" }} />
      <div className="pointer-events-none absolute bottom-[12%] right-[16%] w-6 h-6"
        style={{ borderBottom: "2px solid rgba(255,255,255,0.52)", borderRight: "2px solid rgba(255,255,255,0.52)" }} />
      <div className="pointer-events-none absolute top-[24%] right-[32%] w-4 h-4"
        style={{ borderTop: "1.5px solid rgba(255,255,255,0.45)", borderRight: "1.5px solid rgba(255,255,255,0.45)" }} />
      <div className="pointer-events-none absolute bottom-[24%] right-[30%] w-8 h-8">
        <div className="absolute top-1/2 left-0 right-0 h-[2px] -translate-y-1/2" style={{ background: "rgba(255,255,255,0.52)" }} />
        <div className="absolute left-1/2 top-0 bottom-0 w-[2px] -translate-x-1/2" style={{ background: "rgba(255,255,255,0.52)" }} />
      </div>
      <div className="pointer-events-none absolute top-[22%] left-[30%] w-6 h-6">
        <div className="absolute top-1/2 left-0 right-0 h-[1.5px] -translate-y-1/2" style={{ background: "rgba(255,255,255,0.42)" }} />
        <div className="absolute left-1/2 top-0 bottom-0 w-[1.5px] -translate-x-1/2" style={{ background: "rgba(255,255,255,0.42)" }} />
      </div>
      </div>

      {/* ── 콘텐츠 ── */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-stretch">

          {/* ── 왼쪽 컬럼 (기존 그대로) ── */}
          <div className="flex flex-col justify-center">
            <div className="inline-flex items-center gap-2 bg-[#E8292E]/8 text-[#E8292E] text-xs font-semibold px-3 py-1.5 rounded-full mb-5 w-fit">
              <span className="w-1.5 h-1.5 bg-[#E8292E] rounded-full animate-pulse" />
              한국 인플루언서 무료 디렉토리
            </div>
            <h1 className="text-4xl sm:text-6xl lg:text-6xl font-extrabold text-[#111111] dark:text-[#F9FAFB] leading-[1.08] tracking-normal mb-5">
              내 채널을<br />
              <span className="text-[#E8292E]">광고주</span>에게 알리세요
            </h1>
            <p className="text-base text-gray-700 dark:text-[#9CA3AF] leading-relaxed mb-7 max-w-md">
              유튜브·인스타그램·틱톡 크리에이터와 AI 편집자를 광고주와 연결하는
              <strong className="text-[#111111] dark:text-[#F9FAFB]"> 무료 디렉토리</strong> 플랫폼.
              수수료 없이 직접 컨택하세요.
            </p>
            <ul className="space-y-2.5 mb-7">
              {checklist.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm text-gray-700 dark:text-[#9CA3AF]">
                  <CheckCircle2 size={16} className="text-[#E8292E] mt-0.5 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            <div className="flex flex-wrap gap-2 mb-4">
              {heroTabs.map((t) => {
                const isOn = activePlatforms.includes(t.platform);
                return (
                  <button
                    key={t.platform}
                    type="button"
                    onClick={() => onTogglePlatform(t.platform)}
                    className={`text-sm font-semibold px-4 py-2 rounded-full transition-colors ${
                      isOn
                        ? "bg-[#111111] dark:bg-[#F9FAFB] text-white dark:text-[#111111] hover:bg-[#333] dark:hover:bg-gray-200"
                        : "bg-gray-100 dark:bg-[#374151] text-[#111111] dark:text-[#F9FAFB] hover:bg-gray-200 dark:hover:bg-[#4B5563]"
                    }`}
                  >
                    {t.label}
                  </button>
                );
              })}
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center bg-[#E8292E] hover:bg-[#c9191e] text-white font-bold px-6 py-3 rounded-full text-sm transition-colors"
              >
                무료로 시작하기
              </Link>
              <Link
                href="/trending"
                className="inline-flex items-center justify-center border border-gray-200 dark:border-[#374151] hover:border-gray-300 dark:hover:border-[#4B5563] text-[#111111] dark:text-[#F9FAFB] font-medium px-6 py-3 rounded-full text-sm transition-colors"
              >
                🔥 급상승 영상 보기 →
              </Link>
            </div>
          </div>

          {/* ── 오른쪽 컬럼 (슬라이드 교체) ── */}
          <div
            className="hidden sm:flex relative flex-col"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
          >
            <div className="absolute -inset-6 bg-gradient-to-br from-[#E8292E]/6 via-transparent to-[#111111]/4 rounded-3xl -z-10" />

            {/* 슬라이드 스택 (CSS grid overlap으로 높이 고정) */}
            <div className="flex-1 grid relative">
              {/* 왼쪽 화살표 */}
              <button
                type="button"
                aria-label="이전 슬라이드"
                onClick={() => setIdx((i) => (i - 1 + SLIDES.length) % SLIDES.length)}
                className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 flex items-center justify-center text-gray-700 dark:text-white opacity-30 hover:opacity-70 transition-opacity"
              >
                <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </button>
              {/* 오른쪽 화살표 */}
              <button
                type="button"
                aria-label="다음 슬라이드"
                onClick={() => setIdx((i) => (i + 1) % SLIDES.length)}
                className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 flex items-center justify-center text-gray-700 dark:text-white opacity-30 hover:opacity-70 transition-opacity"
              >
                <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </button>
              {SLIDES.map((SlideComp, i) => (
                <div
                  key={i}
                  className="col-start-1 row-start-1 transition-opacity duration-500"
                  style={{
                    opacity: i === idx ? 1 : 0,
                    pointerEvents: i === idx ? "auto" : "none",
                  }}
                >
                  <SlideComp />
                </div>
              ))}
            </div>

            {/* 점 인디케이터 */}
            <div className="flex justify-center gap-1.5 mt-5 shrink-0">
              {SLIDES.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setIdx(i)}
                  className="transition-all duration-200"
                  style={{
                    width: i === idx ? 24 : 6,
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: i === idx ? "#E8292E" : "#e5e7eb",
                  }}
                />
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
