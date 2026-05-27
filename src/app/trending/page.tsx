import type { Metadata } from "next";
import TrendingClient from "./TrendingClient";

export const metadata: Metadata = {
  title: "급상승 트렌딩",
  description:
    "이번 주 한국 유튜브 인기 급상승 영상 Top 20. 숏폼·롱폼으로 필터하여 탐색하세요.",
  openGraph: {
    title: "이번 주 급상승 영상 | ONINPLE",
    description: "한국 유튜브 인기 급상승 Top 20 — 숏폼·롱폼 필터 제공",
    url: "https://oninple.com/trending",
  },
  alternates: { canonical: "https://oninple.com/trending" },
};

export default function TrendingPage() {
  return <TrendingClient />;
}
