/**
 * YouTube search API로 카테고리별 영상을 가져와 Supabase에 upsert
 *
 * 환경변수 (GitHub Secrets / .env.local):
 *   YOUTUBE_API_KEY
 *   SUPABASE_URL           (or NEXT_PUBLIC_SUPABASE_URL)
 *   SUPABASE_SERVICE_ROLE_KEY
 *
 * 실행:
 *   npx ts-node --project scripts/tsconfig.json scripts/fetch-trending-by-category.ts
 */

import * as fs from "fs";
import * as path from "path";
import { createClient } from "@supabase/supabase-js";
import ws from "ws";

// ── 환경변수 로드 (.env.local 지원) ──────────────────────────────────────────

function loadEnv(): void {
  const envPath = path.join(__dirname, "..", ".env.local");
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, "utf-8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx).trim();
    const val = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, "");
    if (!process.env[key]) process.env[key] = val;
  }
  if (!process.env.SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL) {
    process.env.SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
  }
}

// ── 타입 ─────────────────────────────────────────────────────────────────────

interface CategoryVideo {
  id: string;
  title: string;
  channelTitle: string;
  thumbnail: string;
  viewCount: number;
  duration: string;
  durationSeconds: number;
  type: "short" | "long";
  publishedAt: string;
}

interface Category {
  label: string;
  labelEn: string;
  emoji: string;
  query: string;
}

// ── 카테고리 정의 ─────────────────────────────────────────────────────────────

const CATEGORIES: Category[] = [
  { label: "뷰티/패션",       labelEn: "Beauty & Fashion",   emoji: "💄", query: "뷰티 메이크업 패션" },
  { label: "푸드",             labelEn: "Food & Cooking",     emoji: "🍳", query: "먹방 요리 맛집" },
  { label: "여행/아웃도어",   labelEn: "Travel & Outdoor",   emoji: "✈️", query: "여행 캠핑 아웃도어" },
  { label: "스포츠/건강",     labelEn: "Sports & Health",    emoji: "💪", query: "운동 헬스 스포츠" },
  { label: "엔터테인먼트",   labelEn: "Entertainment",       emoji: "🎭", query: "브이로그 예능 음악" },
  { label: "IT/테크",         labelEn: "IT & Tech",          emoji: "💻", query: "IT 테크 리뷰" },
  { label: "라이프스타일",   labelEn: "Lifestyle",           emoji: "🌿", query: "일상 브이로그 라이프" },
  { label: "AI/교육",          labelEn: "AI & Education",     emoji: "📚", query: "AI 인공지능 챗GPT 클로드 미드저니 교육 강의" },
  { label: "비즈니스/재테크", labelEn: "Business & Finance", emoji: "📈", query: "재테크 투자 창업" },
];

const YT_SEARCH_API = "https://www.googleapis.com/youtube/v3/search";
const YT_VIDEOS_API = "https://www.googleapis.com/youtube/v3/videos";

// ── 유틸 ─────────────────────────────────────────────────────────────────────

function parseDuration(iso: string): number {
  const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!m) return 0;
  return (
    parseInt(m[1] ?? "0", 10) * 3600 +
    parseInt(m[2] ?? "0", 10) * 60 +
    parseInt(m[3] ?? "0", 10)
  );
}

// ── YouTube 검색 ──────────────────────────────────────────────────────────────

interface RawSearchItem {
  id: { videoId: string };
  snippet: {
    title: string;
    channelId: string;
    channelTitle: string;
    publishedAt: string;
    thumbnails: Record<string, { url: string }>;
  };
}

interface RawVideoDetail {
  id: string;
  statistics: { viewCount?: string };
  contentDetails: { duration: string };
}

async function fetchCategoryVideos(
  cat: Category,
  apiKey: string,
  weekAgo: string
): Promise<CategoryVideo[]> {
  const qs = new URLSearchParams({
    key: apiKey,
    part: "snippet",
    q: cat.query,
    type: "video",
    regionCode: "KR",
    order: "viewCount",
    maxResults: "8",
    publishedAfter: weekAgo,
    relevanceLanguage: "ko",
  });

  const attempt = async (): Promise<RawSearchItem[]> => {
    const res = await fetch(`${YT_SEARCH_API}?${qs}`);
    if (!res.ok) throw new Error(`search.list HTTP ${res.status}`);
    const data = await res.json() as { items?: RawSearchItem[] };
    return data.items ?? [];
  };

  let items: RawSearchItem[];
  try {
    items = await attempt();
  } catch (e) {
    console.warn(`  [재시도] ${cat.label}: ${e}`);
    try {
      items = await attempt();
    } catch (e2) {
      console.error(`  [실패] ${cat.label}: ${e2}`);
      return [];
    }
  }

  // videoId 수집
  const videoIds = items
    .map((item) => item.id?.videoId)
    .filter((id): id is string => Boolean(id));

  if (videoIds.length === 0) return [];

  // videos.list 배치 조회 (statistics + contentDetails)
  const detailMap = new Map<string, RawVideoDetail>();
  const dqs = new URLSearchParams({
    key: apiKey,
    part: "statistics,contentDetails",
    id: videoIds.join(","),
  });
  try {
    const res = await fetch(`${YT_VIDEOS_API}?${dqs}`);
    if (res.ok) {
      const data = await res.json() as { items?: RawVideoDetail[] };
      for (const item of data.items ?? []) {
        detailMap.set(item.id, item);
      }
    }
  } catch {
    console.warn(`  [경고] ${cat.label} videos.list 실패 — 기본값 사용`);
  }

  // channelId 중복 제거 후 최대 4개
  const seenChannelIds = new Set<string>();
  const videos: CategoryVideo[] = [];

  for (const item of items) {
    if (!item.id?.videoId) continue;

    const channelId = item.snippet.channelId;
    if (seenChannelIds.has(channelId)) continue;
    seenChannelIds.add(channelId);

    const videoId = item.id.videoId;
    const detail = detailMap.get(videoId);
    const duration = detail?.contentDetails?.duration ?? "PT0S";
    const durationSeconds = parseDuration(duration);
    const t = item.snippet.thumbnails;

    videos.push({
      id: videoId,
      title: item.snippet.title,
      channelTitle: item.snippet.channelTitle,
      thumbnail: t?.high?.url ?? t?.medium?.url ?? t?.default?.url ?? "",
      viewCount: parseInt(detail?.statistics?.viewCount ?? "0", 10),
      duration,
      durationSeconds,
      type: durationSeconds <= 180 ? "short" : "long",
      publishedAt: item.snippet.publishedAt,
    });

    if (videos.length === 4) break;
  }

  return videos;
}

// ── 메인 ─────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  loadEnv();

  const apiKey = process.env.YOUTUBE_API_KEY;
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!apiKey) throw new Error("YOUTUBE_API_KEY가 설정되지 않았습니다.");
  if (!supabaseUrl) throw new Error("SUPABASE_URL이 설정되지 않았습니다.");
  if (!supabaseKey) throw new Error("SUPABASE_SERVICE_ROLE_KEY가 설정되지 않았습니다.");

  const supabase = createClient(supabaseUrl, supabaseKey, {
    realtime: { transport: ws },
  });
  const weekAgo = new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString();

  console.log(`\n[fetch-trending-by-category] 시작 — ${new Date().toISOString()}`);
  console.log(`최근 7일 기준: ${weekAgo}\n`);

  let successCount = 0;

  for (const cat of CATEGORIES) {
    console.log(`▶ ${cat.label} (${cat.labelEn})`);

    const videos = await fetchCategoryVideos(cat, apiKey, weekAgo);
    console.log(`  수집: ${videos.length}개`);

    const { error } = await supabase.from("trending_videos").upsert(
      {
        id: cat.label,
        category: cat.label,
        label_en: cat.labelEn,
        emoji: cat.emoji,
        videos,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" }
    );

    if (error) {
      console.error(`  [Supabase 오류] ${error.message}`);
    } else {
      console.log(`  ✓ upsert 완료`);
      successCount++;
    }
  }

  console.log(
    `\n완료: ${successCount}/${CATEGORIES.length}개 카테고리 업데이트 — ${new Date().toISOString()}\n`
  );

  if (successCount === 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("[치명적 오류]", err);
  process.exit(1);
});
