import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "온인플 - 인플루언서 무료 디렉토리";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          backgroundColor: "#000000",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "sans-serif",
          padding: "80px",
        }}
      >
        {/* 로고 */}
        <div
          style={{
            fontSize: 96,
            fontWeight: 900,
            color: "#ffffff",
            letterSpacing: "-2px",
            lineHeight: 1,
            marginBottom: 24,
          }}
        >
          ON인플
        </div>

        {/* 부제 */}
        <div
          style={{
            fontSize: 40,
            fontWeight: 700,
            color: "#E8292E",
            marginBottom: 28,
            letterSpacing: "-0.5px",
          }}
        >
          인플루언서 무료 디렉토리
        </div>

        {/* 구분선 */}
        <div
          style={{
            width: 60,
            height: 3,
            backgroundColor: "#E8292E",
            marginBottom: 28,
            borderRadius: 2,
          }}
        />

        {/* 설명 */}
        <div
          style={{
            fontSize: 24,
            color: "#9ca3af",
            textAlign: "center",
            lineHeight: 1.6,
            maxWidth: 800,
          }}
        >
          수수료 없이 크리에이터·편집자·광고주를 연결하는 무료 플랫폼
        </div>

        {/* 플랫폼 태그 */}
        <div
          style={{
            display: "flex",
            gap: 16,
            marginTop: 48,
          }}
        >
          {["YouTube", "Instagram", "TikTok", "편집 프로듀서"].map((tag) => (
            <div
              key={tag}
              style={{
                fontSize: 18,
                color: "#6b7280",
                backgroundColor: "#1a1a1a",
                padding: "8px 20px",
                borderRadius: 999,
                border: "1px solid #333333",
              }}
            >
              {tag}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  );
}
