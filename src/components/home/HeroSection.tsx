"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { MOCK_CREATORS, formatCount } from "@/data/mock";
import type { Creator } from "@/types";

const PROMO_CREATORS = MOCK_CREATORS.filter((c) =>
  ["yt1", "ig1", "tt1", "ed1"].includes(c.id)
);

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

function PromoCard({ creator }: { creator: Creator }) {
  return (
    <div className="bg-white rounded-3xl p-7 shadow-xl border border-gray-100 w-full h-full flex flex-col">
      {/* Profile row */}
      <div className="flex items-center gap-4 mb-5">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center text-white font-black text-xl shrink-0"
          style={{ backgroundColor: creator.avatarColor }}
        >
          {creator.avatar}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="text-base font-black text-[#111111] truncate">{creator.name}</span>
            {creator.available && (
              <span className="text-xs font-semibold bg-green-50 text-green-600 px-2.5 py-0.5 rounded-full shrink-0">
                협업가능
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span
              className="text-xs font-bold px-2.5 py-1 rounded-full text-white shrink-0"
              style={{ backgroundColor: PLATFORM_COLORS[creator.platform] }}
            >
              {PLATFORM_LABELS[creator.platform]}
            </span>
            <span className="text-sm text-gray-400 truncate">{creator.handle}</span>
          </div>
        </div>
      </div>

      {/* Intro */}
      <p className="text-sm text-gray-500 leading-relaxed mb-5">{creator.intro}</p>

      {/* Stats */}
      <div className="flex flex-col gap-3">
        {creator.platform !== "editor" ? (
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 rounded-2xl p-5 text-center">
              <div className="text-3xl font-black text-[#111111]">
                {formatCount(creator.subscribers)}
              </div>
              <div className="text-xs text-gray-400 mt-1">
                {creator.platform === "youtube" ? "구독자" : "팔로워"}
              </div>
            </div>
            <div className="bg-gray-50 rounded-2xl p-5 text-center">
              <div className="text-3xl font-black text-[#111111]">
                {formatCount(creator.avgViews)}
              </div>
              <div className="text-xs text-gray-400 mt-1">평균 조회수</div>
            </div>
          </div>
        ) : (
          <div className="bg-gray-50 rounded-2xl p-5 text-center">
            <div className="text-base font-bold text-[#111111] mb-1">편집 프로듀서</div>
            <div className="text-sm text-gray-400">{creator.contentFormat.join(" · ")}</div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function HeroSection({
  activePlatforms,
  onTogglePlatform,
}: {
  activePlatforms: string[];
  onTogglePlatform: (platform: string) => void;
}) {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % PROMO_CREATORS.length), 3500);
    return () => clearInterval(t);
  }, []);

  return (
    <section
      className="relative overflow-hidden pt-12 pb-8 lg:pt-16 lg:pb-10"
      style={{ background: "linear-gradient(135deg, #E8E8EA 0%, #DFE1EA 100%)" }}
    >
      {/* ── 배경 레이어 ── */}

      {/* 블러 글로우 — 오른쪽 상단 */}
      <div
        className="pointer-events-none absolute -top-20 -right-28 w-[560px] h-[560px] rounded-full"
        style={{ background: "radial-gradient(circle, rgba(255,255,255,0.55) 0%, transparent 68%)", filter: "blur(36px)" }}
      />
      {/* 블러 글로우 — 왼쪽 하단 */}
      <div
        className="pointer-events-none absolute -bottom-16 -left-16 w-[380px] h-[380px] rounded-full"
        style={{ background: "radial-gradient(circle, rgba(255,255,255,0.40) 0%, transparent 70%)", filter: "blur(28px)" }}
      />

      {/* ── 원형 ── */}
      <div className="pointer-events-none absolute -top-16 right-[6%]  w-[340px] h-[340px] rounded-full" style={{ border: "1.5px solid rgba(255,255,255,0.60)" }} />
      <div className="pointer-events-none absolute top-[15%] -left-24   w-[420px] h-[420px] rounded-full" style={{ border: "1px   solid rgba(255,255,255,0.45)" }} />
      <div className="pointer-events-none absolute bottom-[-30px] right-[16%] w-[200px] h-[200px] rounded-full" style={{ border: "1px solid rgba(255,255,255,0.38)" }} />
      <div className="pointer-events-none absolute top-10   left-[10%] w-14 h-14 rounded-full bg-white/45" />
      <div className="pointer-events-none absolute top-[28%] left-[3%]  w-5  h-5  rounded-full bg-white/32" />
      <div className="pointer-events-none absolute top-[55%] left-[8%]  w-8  h-8  rounded-full bg-white/28" />
      <div className="pointer-events-none absolute top-[18%] right-[14%] w-10 h-10 rounded-full bg-white/32" />
      <div className="pointer-events-none absolute top-[42%] right-[5%]  w-7  h-7  rounded-full bg-white/42" />
      <div className="pointer-events-none absolute bottom-10  left-[22%] w-6  h-6  rounded-full bg-white/38" />
      <div className="pointer-events-none absolute bottom-4   right-[38%] w-3  h-3  rounded-full bg-white/48" />

      {/* ── 대각선 점 패턴 ── */}
      <div className="pointer-events-none absolute top-[8%]  left-[32%] w-2   h-2   rounded-full bg-white/40" />
      <div className="pointer-events-none absolute top-[18%] left-[40%] w-2   h-2   rounded-full bg-white/35" />
      <div className="pointer-events-none absolute top-[28%] left-[48%] w-2   h-2   rounded-full bg-white/30" />
      <div className="pointer-events-none absolute top-[38%] left-[56%] w-1.5 h-1.5 rounded-full bg-white/35" />
      <div className="pointer-events-none absolute top-[48%] left-[64%] w-1.5 h-1.5 rounded-full bg-white/28" />
      <div className="pointer-events-none absolute top-[58%] left-[72%] w-2   h-2   rounded-full bg-white/30" />

      {/* ── 라인 ── */}
      {/* 긴 대각선 — 왼쪽 상단에서 우하 방향 */}
      <div className="pointer-events-none absolute top-[3%] left-[6%] w-[260px] h-[2px]"
        style={{ background: "rgba(255,255,255,0.60)", transform: "rotate(34deg)", transformOrigin: "left center" }} />
      {/* 긴 대각선 — 오른쪽 하단 역방향 */}
      <div className="pointer-events-none absolute bottom-[8%] right-[4%] w-[200px] h-[2px]"
        style={{ background: "rgba(255,255,255,0.55)", transform: "rotate(-28deg)", transformOrigin: "right center" }} />
      {/* 중간 대각선 — 중앙 상단 */}
      <div className="pointer-events-none absolute top-[12%] left-[40%] w-[140px] h-[1.5px]"
        style={{ background: "rgba(255,255,255,0.50)", transform: "rotate(18deg)", transformOrigin: "left center" }} />
      {/* 수평 라인 — 왼쪽 중단 */}
      <div className="pointer-events-none absolute top-[50%] left-[2%] w-[100px] h-[1.5px]"
        style={{ background: "rgba(255,255,255,0.52)" }} />
      {/* 짧은 수평 라인 — 하단 중앙 */}
      <div className="pointer-events-none absolute bottom-[20%] left-[42%] w-[90px] h-[1.5px]"
        style={{ background: "rgba(255,255,255,0.50)" }} />
      {/* 수직 라인 — 왼쪽 */}
      <div className="pointer-events-none absolute top-[18%] left-[26%] w-[1.5px] h-[80px]"
        style={{ background: "rgba(255,255,255,0.48)" }} />
      {/* 수직 라인 — 오른쪽 하단 */}
      <div className="pointer-events-none absolute bottom-[14%] right-[22%] w-[1.5px] h-[60px]"
        style={{ background: "rgba(255,255,255,0.45)" }} />

      {/* ── 다이아몬드 (45° 사각형) ── */}
      {/* 큰 다이아몬드 테두리 — 왼쪽 하단 */}
      <div className="pointer-events-none absolute bottom-[10%] left-[12%] w-20 h-20"
        style={{ border: "1.5px solid rgba(255,255,255,0.52)", transform: "rotate(45deg)" }} />
      {/* 중간 다이아몬드 테두리 — 오른쪽 상단 */}
      <div className="pointer-events-none absolute top-[8%] right-[26%] w-12 h-12"
        style={{ border: "1.5px solid rgba(255,255,255,0.48)", transform: "rotate(45deg)" }} />
      {/* 작은 꽉 찬 다이아몬드 — 중앙 */}
      <div className="pointer-events-none absolute top-[60%] left-[36%] w-5 h-5 bg-white/28"
        style={{ transform: "rotate(45deg)" }} />
      {/* 작은 꽉 찬 다이아몬드 — 오른쪽 중단 */}
      <div className="pointer-events-none absolute top-[32%] right-[10%] w-3 h-3 bg-white/35"
        style={{ transform: "rotate(45deg)" }} />

      {/* ── 회전 직사각형 테두리 ── */}
      <div className="pointer-events-none absolute top-[10%] right-[30%] w-14 h-9"
        style={{ border: "1.5px solid rgba(255,255,255,0.45)", transform: "rotate(-14deg)" }} />
      <div className="pointer-events-none absolute bottom-[16%] left-[32%] w-10 h-6"
        style={{ border: "1px solid rgba(255,255,255,0.40)", transform: "rotate(22deg)" }} />

      {/* ── L자 코너 마크 ── */}
      {/* 왼쪽 상단 코너 */}
      <div className="pointer-events-none absolute top-[6%] left-[20%] w-6 h-6"
        style={{ borderTop: "2px solid rgba(255,255,255,0.55)", borderLeft: "2px solid rgba(255,255,255,0.55)" }} />
      {/* 오른쪽 하단 코너 */}
      <div className="pointer-events-none absolute bottom-[12%] right-[16%] w-6 h-6"
        style={{ borderBottom: "2px solid rgba(255,255,255,0.52)", borderRight: "2px solid rgba(255,255,255,0.52)" }} />
      {/* 오른쪽 상단 코너 (작게) */}
      <div className="pointer-events-none absolute top-[24%] right-[32%] w-4 h-4"
        style={{ borderTop: "1.5px solid rgba(255,255,255,0.45)", borderRight: "1.5px solid rgba(255,255,255,0.45)" }} />

      {/* ── 십자(+) ── */}
      <div className="pointer-events-none absolute bottom-[24%] right-[30%] w-8 h-8">
        <div className="absolute top-1/2 left-0 right-0 h-[2px] -translate-y-1/2" style={{ background: "rgba(255,255,255,0.52)" }} />
        <div className="absolute left-1/2 top-0 bottom-0 w-[2px] -translate-x-1/2" style={{ background: "rgba(255,255,255,0.52)" }} />
      </div>
      <div className="pointer-events-none absolute top-[22%] left-[30%] w-6 h-6">
        <div className="absolute top-1/2 left-0 right-0 h-[1.5px] -translate-y-1/2" style={{ background: "rgba(255,255,255,0.42)" }} />
        <div className="absolute left-1/2 top-0 bottom-0 w-[1.5px] -translate-x-1/2" style={{ background: "rgba(255,255,255,0.42)" }} />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* stretch: both columns same height */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-stretch">

          {/* ── Left column ── */}
          <div className="flex flex-col justify-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-[#E8292E]/8 text-[#E8292E] text-xs font-semibold px-3 py-1.5 rounded-full mb-5 w-fit">
              <span className="w-1.5 h-1.5 bg-[#E8292E] rounded-full animate-pulse" />
              한국 인플루언서 무료 디렉토리
            </div>

            {/* Headline */}
            <h1 className="text-5xl sm:text-6xl lg:text-6xl font-extrabold text-[#111111] leading-[1.08] tracking-normal mb-5">
              내 채널을<br />
              <span className="text-[#E8292E]">광고주</span>에게 알리세요
            </h1>

            {/* Sub */}
            <p className="text-base text-gray-500 leading-relaxed mb-7 max-w-md">
              유튜브·인스타그램·틱톡 크리에이터와 AI 편집자를 광고주와 연결하는
              <strong className="text-[#111111]"> 무료 디렉토리</strong> 플랫폼.
              수수료 없이 직접 컨택하세요.
            </p>

            {/* Checklist */}
            <ul className="space-y-2.5 mb-7">
              {checklist.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm text-gray-600">
                  <CheckCircle2 size={16} className="text-[#E8292E] mt-0.5 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>

            {/* Platform tabs */}
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
                        ? "bg-[#111111] text-white hover:bg-[#333]"
                        : "bg-gray-100 text-[#111111] hover:bg-gray-200"
                    }`}
                  >
                    {t.label}
                  </button>
                );
              })}
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap gap-3">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center bg-[#E8292E] hover:bg-[#c9191e] text-white font-bold px-6 py-3 rounded-full text-sm transition-colors"
              >
                무료로 시작하기
              </Link>
              <a
                href="#youtube-section"
                className="inline-flex items-center justify-center border border-gray-200 hover:border-gray-300 text-[#111111] font-medium px-6 py-3 rounded-full text-sm transition-colors"
              >
                인플루언서 탐색 →
              </a>
            </div>
          </div>

          {/* ── Right column ── */}
          <div className="relative flex flex-col">
            {/* Decorative bg */}
            <div className="absolute -inset-6 bg-gradient-to-br from-[#E8292E]/6 via-transparent to-[#111111]/4 rounded-3xl -z-10" />

            {/* Card stack — flex-1 fills column height */}
            <div className="flex-1 relative">
              {PROMO_CREATORS.map((c, i) => (
                <div
                  key={c.id}
                  className="transition-all duration-500 h-full"
                  style={{
                    position: i === 0 ? "relative" : "absolute",
                    top: i === 0 ? undefined : 0,
                    left: i === 0 ? undefined : 0,
                    right: i === 0 ? undefined : 0,
                    bottom: i === 0 ? undefined : 0,
                    opacity: i === idx ? 1 : 0,
                    transform: i === idx ? "translateY(0)" : "translateY(12px)",
                    pointerEvents: i === idx ? "auto" : "none",
                  }}
                >
                  <PromoCard creator={c} />
                </div>
              ))}
            </div>

            {/* Dots */}
            <div className="flex justify-center gap-1.5 mt-5 shrink-0">
              {PROMO_CREATORS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setIdx(i)}
                  className="transition-all duration-200"
                  style={{
                    width: i === idx ? 24 : 6,
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: i === idx ? "#111111" : "#e5e7eb",
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
