"use client";

import { useState } from "react";
import Link from "next/link";

export type InAppPlatform =
  | "kakaotalk"
  | "instagram"
  | "naver"
  | "line"
  | "facebook"
  | "x"
  | "other";

const PLATFORM_NAMES: Record<InAppPlatform, string> = {
  kakaotalk: "카카오톡",
  instagram: "인스타그램",
  naver: "네이버",
  line: "라인",
  facebook: "페이스북",
  x: "X (트위터)",
  other: "앱",
};

export function detectInAppPlatform(): InAppPlatform | null {
  if (typeof navigator === "undefined") return null;
  const ua = navigator.userAgent;
  if (/KAKAOTALK/i.test(ua)) return "kakaotalk";
  if (/Instagram/i.test(ua)) return "instagram";
  if (/NAVER/i.test(ua)) return "naver";
  if (/Line\//i.test(ua)) return "line";
  if (/FBAN|FBAV|FB_IAB/i.test(ua)) return "facebook";
  if (/Twitter/i.test(ua)) return "x";
  // Android 일반 WebView
  if (/; wv\)/i.test(ua)) return "other";
  return null;
}

export default function InAppBrowserNotice({ platform }: { platform: InAppPlatform }) {
  const [copied, setCopied] = useState(false);

  async function copyUrl() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // clipboard API를 사용할 수 없는 경우 무시
    }
  }

  const platformName = PLATFORM_NAMES[platform];

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-8">
        <Link href="/" className="inline-block mb-6">
          <span className="text-2xl font-black text-[#E8292E]">ONINPLE</span>
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center space-y-5">
        {/* 경고 아이콘 */}
        <div className="w-14 h-14 mx-auto bg-amber-50 rounded-full flex items-center justify-center">
          <svg
            width="26"
            height="26"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#F59E0B"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        </div>

        <div className="space-y-1.5">
          <h2 className="text-base font-bold text-[#111111]">
            외부 브라우저에서 로그인해주세요
          </h2>
          <p className="text-sm text-gray-500 leading-relaxed">
            {platformName} 내 브라우저에서는
            <br />
            Google 로그인이 지원되지 않아요.
          </p>
        </div>

        {/* 열기 방법 안내 */}
        <div className="bg-gray-50 rounded-xl p-4 text-left space-y-2">
          <p className="text-xs font-semibold text-[#111111]">이렇게 열어주세요</p>
          {platform === "kakaotalk" ? (
            <ol className="text-xs text-gray-600 space-y-1.5 list-decimal list-inside leading-relaxed">
              <li>
                화면 우측 하단 <strong>공유(⬆) 버튼</strong>을 탭하세요
              </li>
              <li>
                <strong>Safari로 열기</strong> 또는{" "}
                <strong>기본 브라우저로 열기</strong>를 선택하세요
              </li>
            </ol>
          ) : (
            <ol className="text-xs text-gray-600 space-y-1.5 list-decimal list-inside leading-relaxed">
              <li>
                화면 우측 상단 <strong>··· (더보기)</strong> 버튼을 탭하세요
              </li>
              <li>
                <strong>기본 브라우저로 열기</strong> 또는{" "}
                <strong>Safari / Chrome으로 열기</strong>를 선택하세요
              </li>
            </ol>
          )}
        </div>

        {/* URL 복사 버튼 */}
        <button
          onClick={copyUrl}
          className={[
            "w-full py-3 rounded-full text-sm font-semibold transition-colors",
            copied
              ? "bg-green-500 text-white"
              : "bg-[#111111] text-white hover:bg-gray-800",
          ].join(" ")}
        >
          {copied ? "✓ URL이 복사되었어요" : "URL 복사하기"}
        </button>

        <p className="text-xs text-gray-400">
          복사한 URL을 Safari 또는 Chrome에 붙여넣어 접속해주세요
        </p>
      </div>
    </div>
  );
}
