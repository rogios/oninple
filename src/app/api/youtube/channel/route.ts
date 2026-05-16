import { NextRequest, NextResponse } from "next/server";
import { parseYoutubeUrl, type YoutubeChannelInfo } from "@/lib/youtube";

const YT_API = "https://www.googleapis.com/youtube/v3/channels";

async function fetchChannel(params: Record<string, string>): Promise<YoutubeChannelInfo | null> {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey || apiKey === "여기에_API_키_입력") {
    throw new Error("YOUTUBE_API_KEY가 설정되지 않았습니다.");
  }

  const qs = new URLSearchParams({
    key: apiKey,
    part: "snippet,statistics",
    maxResults: "1",
    ...params,
  });

  const res = await fetch(`${YT_API}?${qs}`, { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error(`YouTube API 오류: ${res.status}`);

  const data = await res.json();
  const item = data.items?.[0];
  if (!item) return null;

  return {
    channelId: item.id,
    name: item.snippet.title,
    handle: item.snippet.customUrl ?? "",
    description: item.snippet.description ?? "",
    thumbnailUrl:
      item.snippet.thumbnails?.high?.url ??
      item.snippet.thumbnails?.medium?.url ??
      item.snippet.thumbnails?.default?.url ?? "",
    subscriberCount: parseInt(item.statistics.subscriberCount ?? "0", 10),
    videoCount: parseInt(item.statistics.videoCount ?? "0", 10),
  };
}

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");
  if (!url) {
    return NextResponse.json({ error: "url 파라미터가 필요합니다." }, { status: 400 });
  }

  const parsed = parseYoutubeUrl(url);
  if (parsed.type === "unknown") {
    return NextResponse.json({ error: "유효하지 않은 YouTube URL입니다." }, { status: 400 });
  }

  try {
    let channel: YoutubeChannelInfo | null = null;

    if (parsed.type === "id") {
      channel = await fetchChannel({ id: parsed.value });
    } else if (parsed.type === "handle") {
      channel = await fetchChannel({ forHandle: `@${parsed.value}` });
    } else if (parsed.type === "username") {
      channel = await fetchChannel({ forUsername: parsed.value });
    }

    if (!channel) {
      return NextResponse.json({ error: "채널을 찾을 수 없습니다." }, { status: 404 });
    }

    return NextResponse.json(channel);
  } catch (err) {
    const message = err instanceof Error ? err.message : "알 수 없는 오류";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
