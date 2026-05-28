import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";

// ── 타입 ──────────────────────────────────────────────────────────────────────

export type CategoryVideo = {
  id: string;
  title: string;
  channelTitle: string;
  thumbnail: string;
  viewCount: number;
  duration: string;       // ISO 8601
  durationSeconds: number;
  type: "short" | "long"; // 180초 기준
  publishedAt: string;
};

export type CategoryResult = {
  category: string;
  labelEn: string;
  emoji: string;
  videos: CategoryVideo[];
};

// 카테고리 표시 순서 (DB는 삽입 순서와 무관하므로 명시적 정렬)
const CATEGORY_ORDER = [
  "뷰티/패션",
  "푸드",
  "여행/아웃도어",
  "스포츠/건강",
  "엔터테인먼트",
  "IT/테크",
  "라이프스타일",
  "AI/교육",
  "비즈니스/재테크",
];

// ── 핸들러 ───────────────────────────────────────────────────────────────────

// GitHub Actions가 매일 갱신 → 1시간 캐시로 불필요한 DB 조회 최소화
export const revalidate = 0;

export async function GET() {
  const supabase = createServiceClient();

  const { data, error } = await supabase
    .from("trending_videos")
    .select("id, category, label_en, emoji, videos, updated_at");

  if (error) {
    console.error("[trending-by-category] Supabase 조회 오류:", error.message);
    return NextResponse.json(
      { error: "카테고리 데이터를 불러오지 못했습니다." },
      { status: 500 }
    );
  }

  if (!data || data.length === 0) {
    return NextResponse.json({ categories: [], fetchedAt: null });
  }

  // 정해진 순서로 정렬
  const rowMap = new Map(data.map((row) => [row.category as string, row]));
  const categories: CategoryResult[] = CATEGORY_ORDER
    .map((label) => {
      const row = rowMap.get(label);
      if (!row) return null;
      return {
        category: row.category as string,
        labelEn: (row.label_en as string) ?? "",
        emoji: (row.emoji as string) ?? "",
        videos: (row.videos as CategoryVideo[]) ?? [],
      };
    })
    .filter((c): c is CategoryResult => c !== null);

  // 가장 최근 updated_at
  const fetchedAt = data.reduce<string>((latest, row) => {
    const t = row.updated_at as string;
    return t > latest ? t : latest;
  }, data[0].updated_at as string);

  return NextResponse.json({ categories, fetchedAt });
}
