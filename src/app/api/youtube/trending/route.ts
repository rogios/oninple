import { NextResponse } from "next/server";

const YT_API = "https://www.googleapis.com/youtube/v3/videos";

export type TrendingVideo = {
  id: string;
  title: string;
  channelTitle: string;
  thumbnail: string;
  viewCount: number;
  /** ISO 8601 duration (예: "PT4M50S") */
  duration: string;
  durationSeconds: number;
  /** 3분(180초) 이하 → "short", 초과 → "long" */
  type: "short" | "long";
  publishedAt: string;
};

/** ISO 8601 duration 문자열을 초(seconds)로 변환 */
function parseDuration(iso: string): number {
  const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!m) return 0;
  return (
    parseInt(m[1] ?? "0", 10) * 3600 +
    parseInt(m[2] ?? "0", 10) * 60 +
    parseInt(m[3] ?? "0", 10)
  );
}

export async function GET() {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "YOUTUBE_API_KEY가 설정되지 않았습니다." },
      { status: 500 }
    );
  }

  const qs = new URLSearchParams({
    key: apiKey,
    part: "snippet,statistics,contentDetails",
    chart: "mostPopular",
    regionCode: "KR",
    maxResults: "32",
  });

  const res = await fetch(`${YT_API}?${qs}`, { next: { revalidate: 3600 } });

  if (!res.ok) {
    const detail = await res.text();
    return NextResponse.json(
      { error: `YouTube API 오류: ${res.status}`, detail },
      { status: 502 }
    );
  }

  const data = await res.json();

  type RawItem = {
    id: string;
    snippet: {
      title: string;
      channelTitle: string;
      publishedAt: string;
      thumbnails: Record<string, { url: string }>;
    };
    statistics: { viewCount?: string };
    contentDetails: { duration: string };
  };

  const videos: TrendingVideo[] = (data.items ?? []).map((item: RawItem) => {
    const duration = item.contentDetails.duration;
    const durationSeconds = parseDuration(duration);
    const t = item.snippet.thumbnails;

    return {
      id: item.id,
      title: item.snippet.title,
      channelTitle: item.snippet.channelTitle,
      thumbnail:
        t?.maxres?.url ??
        t?.standard?.url ??
        t?.high?.url ??
        t?.medium?.url ??
        t?.default?.url ??
        "",
      viewCount: parseInt(item.statistics.viewCount ?? "0", 10),
      duration,
      durationSeconds,
      type: durationSeconds <= 180 ? "short" : "long",
      publishedAt: item.snippet.publishedAt,
    };
  });

  return NextResponse.json({
    videos,
    total: videos.length,
    fetchedAt: new Date().toISOString(),
  });
}
