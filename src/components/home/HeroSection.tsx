"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

// ── Slide 1: 무료 ─────────────────────────────────────────────────────────────
function Slide1() {
  return (
    <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-2">
        <div className="p-8 lg:p-10 flex flex-col justify-center">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#E8292E] bg-[#E8292E]/8 px-3 py-1.5 rounded-full w-fit mb-6">
            🎁 모든 기능 무료
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-[#111111] leading-tight mb-4">
            등록부터 연결까지<br />
            <span className="text-[#E8292E]">모두 무료</span>
          </h2>
          <p className="text-sm text-gray-500 leading-relaxed mb-6">
            중간 수수료 없이 카카오 DM으로 직접 연결됩니다
          </p>
          <ul className="space-y-3 mb-6">
            <li className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#E8292E] text-white text-[10px] font-black flex items-center justify-center shrink-0 leading-tight text-center">
                FREE
              </div>
              <span className="text-sm text-gray-700">등록·이용·연결 모두 무료</span>
            </li>
            <li className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#E8292E] text-white text-base font-black flex items-center justify-center shrink-0">
                %
              </div>
              <span className="text-sm text-gray-700">중간 수수료 0원</span>
            </li>
          </ul>
          <div className="bg-yellow-50 border border-yellow-200 rounded-2xl px-4 py-3 text-xs text-yellow-800 leading-relaxed">
            카카오 오픈채팅으로 빠르고 간편하게!<br />
            별도 수수료 없이 직접 소통하세요
          </div>
        </div>

        <div className="hidden lg:flex bg-gray-50 rounded-r-3xl p-10 flex-col items-center justify-center gap-5">
          <span className="text-xs font-bold text-[#E8292E] bg-[#E8292E]/10 px-3 py-1 rounded-full">
            ALL FREE
          </span>
          <div className="text-7xl font-black text-[#E8292E] leading-none tracking-tighter">
            FREE
          </div>
          <div className="flex items-center w-full max-w-xs gap-1.5">
            <div className="bg-white border-2 border-gray-200 rounded-xl px-3 py-2 text-xs font-bold text-gray-700 text-center whitespace-nowrap">
              광고주
            </div>
            <div className="flex-1 border-b-2 border-dashed border-[#E8292E]/40" />
            <span className="text-[#E8292E] font-black">›</span>
            <div className="bg-[#E8292E] rounded-xl px-3 py-2 text-xs font-bold text-white text-center whitespace-nowrap">
              ON인플
            </div>
            <span className="text-[#E8292E] font-black">›</span>
            <div className="flex-1 border-b-2 border-dashed border-[#E8292E]/40" />
            <div className="bg-white border-2 border-gray-200 rounded-xl px-3 py-2 text-xs font-bold text-gray-700 text-center leading-tight">
              크리에이터<br />편집자
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 w-full max-w-xs">
            {["안전한 직접 거래", "빠른 응답", "맞춤 매칭", "정보 보호"].map((f) => (
              <div key={f} className="bg-white rounded-xl p-3 text-center text-xs font-semibold text-gray-600 border border-gray-100 shadow-sm">
                {f}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Slide 2: 디렉토리 ──────────────────────────────────────────────────────────
function Slide2() {
  return (
    <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-2">
        <div className="p-8 lg:p-10 flex flex-col justify-center">
          <h2 className="text-3xl sm:text-4xl font-black text-[#111111] leading-tight mb-4">
            인플루언서와<br />
            광고주를<br />
            <span className="text-[#E8292E]">직접 연결</span>합니다
          </h2>
          <p className="text-sm text-gray-500 leading-relaxed mb-5">
            유튜브·인스타그램·틱톡 크리에이터를 한 곳에서 탐색하고 바로 연결하세요
          </p>
          <div className="flex gap-2 flex-wrap mb-5">
            <span className="text-xs font-bold text-white bg-[#FF0000] px-3 py-1.5 rounded-full">YouTube</span>
            <span className="text-xs font-bold text-white bg-gradient-to-r from-purple-500 to-pink-500 px-3 py-1.5 rounded-full">Instagram</span>
            <span className="text-xs font-bold text-white bg-[#010101] px-3 py-1.5 rounded-full">TikTok</span>
          </div>
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#E8292E] bg-[#E8292E]/8 px-3 py-1.5 rounded-full w-fit">
            🎁 무료 디렉토리
          </span>
        </div>

        <div className="hidden lg:flex bg-gray-50 rounded-r-3xl p-8 flex-col gap-3 justify-center">
          <div className="bg-white border border-gray-200 rounded-xl px-4 py-2.5 flex items-center gap-2 shadow-sm">
            <svg className="w-3.5 h-3.5 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
            <span className="text-xs text-gray-400 flex-1">크리에이터 검색...</span>
            <span className="bg-gray-100 rounded-lg px-2 py-1 text-xs text-gray-500 font-medium">필터 ▾</span>
          </div>
          {[
            { bg: "#E1306C", label: "뷰", name: "뷰티나나", catLabel: "뷰티패션", catCls: "bg-gradient-to-r from-purple-500 to-pink-500", sub: "14.2만", avg: "4.5만" },
            { bg: "#FF0000", label: "여", name: "여행에미치다", catLabel: "여행", catCls: "bg-[#FF0000]", sub: "8.7만", avg: "3.2만" },
          ].map((c) => (
            <div key={c.name} className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-sm shrink-0"
                  style={{ backgroundColor: c.bg }}
                >
                  {c.label}
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-bold text-[#111111] truncate">{c.name}</div>
                  <span className={`text-[10px] text-white px-2 py-0.5 rounded-full ${c.catCls}`}>
                    {c.catLabel}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-gray-50 rounded-lg p-2 text-center">
                  <div className="text-sm font-black text-[#111111]">{c.sub}</div>
                  <div className="text-[10px] text-gray-400">구독자</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-2 text-center">
                  <div className="text-sm font-black text-[#111111]">{c.avg}</div>
                  <div className="text-[10px] text-gray-400">평균조회수</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Slide 3: AI 편집자 ─────────────────────────────────────────────────────────
function Slide3() {
  return (
    <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-2">
        <div className="p-8 lg:p-10 flex flex-col justify-center">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#6C5CE7] bg-[#6C5CE7]/10 px-3 py-1.5 rounded-full w-fit mb-6">
            ✦ AI 편집자 특화 플랫폼
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-[#111111] leading-tight mb-4">
            AI 편집 실력을<br />
            <span className="text-[#6C5CE7]">자유롭게</span><br />
            어필하세요
          </h2>
          <p className="text-sm text-gray-500 leading-relaxed mb-5">
            Runway·Sora·CapCut 등 AI 영상 편집 전문가 등록 가능
          </p>
          <div className="flex gap-2 flex-wrap mb-6">
            {["Runway", "Sora", "CapCut", "Premiere Pro"].map((tool) => (
              <span key={tool} className="text-xs font-semibold text-gray-700 bg-gray-100 border border-gray-200 px-3 py-1.5 rounded-full">
                {tool}
              </span>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: "🤖", label: "AI 툴 활용 가능" },
              { icon: "🎬", label: "포트폴리오 등록" },
              { icon: "🤝", label: "의뢰 매칭 기회 확대" },
            ].map((f) => (
              <div key={f.label} className="text-center">
                <div className="text-2xl mb-1.5">{f.icon}</div>
                <div className="text-[10px] text-gray-500 leading-tight">{f.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="hidden lg:flex bg-[#1a1a2e] rounded-r-3xl p-10 flex-col">
          <div className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-4">
            Before / After
          </div>
          <div className="flex flex-col gap-3 flex-1">
            <div className="bg-[#2a2a3e] rounded-2xl p-4">
              <div className="text-xs font-semibold text-gray-400 mb-3">BEFORE</div>
              <div className="flex items-end gap-1 h-12 mb-3">
                {[65, 45, 78, 38, 58, 70, 42].map((h, i) => (
                  <div key={i} className="flex-1 rounded-sm bg-[#3a3a5e]" style={{ height: `${h}%` }} />
                ))}
              </div>
              <div className="text-xs text-gray-500">일반 편집 · 3일 소요</div>
            </div>
            <div className="text-center text-[#6C5CE7] text-base font-black">↓ AI</div>
            <div className="bg-[#2a2a3e] border border-[#6C5CE7]/50 rounded-2xl p-4">
              <div className="text-xs font-semibold text-[#6C5CE7] mb-3">AFTER AI</div>
              <div className="flex items-end gap-1 h-12 mb-3">
                {[88, 92, 85, 96, 90, 94, 87].map((h, i) => (
                  <div key={i} className="flex-1 rounded-sm bg-[#6C5CE7]" style={{ height: `${h}%` }} />
                ))}
              </div>
              <div className="text-xs text-[#6C5CE7]">AI 편집 · 당일 완성</div>
            </div>
          </div>
          <div className="mt-5 text-center text-xs text-gray-400 leading-relaxed">
            AI 기술로 더 빠르고, 더 완성도 높은 영상 제작
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
const heroTabs = [
  { label: "유튜브", platform: "youtube" },
  { label: "인스타그램", platform: "instagram" },
  { label: "틱톡", platform: "tiktok" },
  { label: "편집자", platform: "editor" },
];

export default function HeroSection({
  activePlatforms,
  onTogglePlatform,
}: {
  activePlatforms: string[];
  onTogglePlatform: (platform: string) => void;
}) {
  const [slide, setSlide] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setSlide((s) => (s + 1) % 3), 5000);
    return () => clearInterval(t);
  }, []);

  return (
    <section
      className="relative overflow-hidden pt-12 pb-8 lg:pt-16 lg:pb-10"
      style={{ background: "linear-gradient(135deg, #E8E8EA 0%, #DFE1EA 100%)" }}
    >
      {/* ── 배경 레이어 ── */}
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
      <div className="pointer-events-none absolute top-[60%] left-[36%] w-5 h-5 bg-white/28"
        style={{ transform: "rotate(45deg)" }} />
      <div className="pointer-events-none absolute top-[32%] right-[10%] w-3 h-3 bg-white/35"
        style={{ transform: "rotate(45deg)" }} />
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

      {/* ── 콘텐츠 ── */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* 슬라이드 (CSS grid overlap: all share the same cell) */}
        <div className="grid">
          {([<Slide1 key={0} />, <Slide2 key={1} />, <Slide3 key={2} />]).map((content, i) => (
            <div
              key={i}
              className="col-start-1 row-start-1 transition-opacity duration-500"
              style={{
                opacity: slide === i ? 1 : 0,
                pointerEvents: slide === i ? "auto" : "none",
              }}
            >
              {content}
            </div>
          ))}
        </div>

        {/* 점 인디케이터 */}
        <div className="flex justify-center gap-2 mt-5">
          {[0, 1, 2].map((i) => (
            <button
              key={i}
              type="button"
              onClick={() => setSlide(i)}
              className="transition-all duration-300"
              style={{
                width: slide === i ? 24 : 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: slide === i ? "#E8292E" : "#d1d5db",
              }}
            />
          ))}
        </div>

        {/* 플랫폼 필터 + CTA */}
        <div className="flex flex-col items-center gap-4 mt-6">
          <div className="flex flex-wrap justify-center gap-2">
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
                      : "bg-white/80 text-[#111111] hover:bg-white"
                  }`}
                >
                  {t.label}
                </button>
              );
            })}
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center bg-[#E8292E] hover:bg-[#c9191e] text-white font-bold px-6 py-3 rounded-full text-sm transition-colors"
            >
              무료로 시작하기
            </Link>
            <a
              href="#youtube-section"
              className="inline-flex items-center justify-center border border-gray-300 hover:border-gray-400 text-[#111111] font-medium px-6 py-3 rounded-full text-sm transition-colors bg-white/60 backdrop-blur-sm"
            >
              인플루언서 탐색 →
            </a>
          </div>
        </div>

      </div>
    </section>
  );
}
