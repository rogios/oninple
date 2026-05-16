export type YoutubeChannelInfo = {
  channelId: string;
  name: string;
  handle: string;
  description: string;
  thumbnailUrl: string;
  subscriberCount: number;
  videoCount: number;
};

export type YoutubeUrlType =
  | { type: "id"; value: string }
  | { type: "handle"; value: string }
  | { type: "username"; value: string }
  | { type: "unknown" };

/**
 * YouTube URL에서 채널 식별자를 추출한다.
 * 지원 형식:
 *   https://www.youtube.com/channel/UCxxxxxx
 *   https://www.youtube.com/@handle
 *   https://www.youtube.com/user/username
 *   https://www.youtube.com/c/customname  (handle로 시도)
 */
export function parseYoutubeUrl(raw: string): YoutubeUrlType {
  const trimmed = raw.trim().replace(/\/$/, "");

  // bare channel ID (UC로 시작하는 24자)
  if (/^UC[\w-]{22}$/.test(trimmed)) {
    return { type: "id", value: trimmed };
  }

  let url: URL;
  try {
    url = new URL(trimmed.startsWith("http") ? trimmed : `https://${trimmed}`);
  } catch {
    return { type: "unknown" };
  }

  const path = url.pathname;

  // /channel/UCxxxxxx
  const channelMatch = path.match(/^\/channel\/(UC[\w-]{22})$/);
  if (channelMatch) return { type: "id", value: channelMatch[1] };

  // /@handle
  const handleMatch = path.match(/^\/@([\w.-]+)$/);
  if (handleMatch) return { type: "handle", value: handleMatch[1] };

  // /user/username
  const userMatch = path.match(/^\/user\/([\w.-]+)$/);
  if (userMatch) return { type: "username", value: userMatch[1] };

  // /c/customname — handle로 시도
  const customMatch = path.match(/^\/c\/([\w.-]+)$/);
  if (customMatch) return { type: "handle", value: customMatch[1] };

  return { type: "unknown" };
}

export function formatSubscribers(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(".0", "")}백만`;
  if (n >= 10_000) return `${(n / 10_000).toFixed(1).replace(".0", "")}만`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}천`;
  return `${n}`;
}

export async function getYoutubeChannelInfo(
  channelUrl: string
): Promise<YoutubeChannelInfo | null> {
  const apiKey = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;
  console.log("[YouTube] API key present:", !!apiKey, apiKey ? `(${apiKey.slice(0, 8)}...)` : "(missing)");
  if (!apiKey) {
    console.error("[YouTube] NEXT_PUBLIC_YOUTUBE_API_KEY is not defined");
    return null;
  }

  const parsed = parseYoutubeUrl(channelUrl);
  console.log("[YouTube] parseYoutubeUrl:", channelUrl, "→", parsed);
  if (parsed.type === "unknown") {
    console.warn("[YouTube] URL 파싱 실패 — 지원되지 않는 형식:", channelUrl);
    return null;
  }

  const base = "https://www.googleapis.com/youtube/v3/channels";
  let query: string;

  if (parsed.type === "id") {
    query = `part=snippet%2Cstatistics&id=${parsed.value}&key=${apiKey}`;
  } else if (parsed.type === "handle") {
    query = `part=snippet%2Cstatistics&forHandle=%40${parsed.value}&key=${apiKey}`;
  } else {
    query = `part=snippet%2Cstatistics&forUsername=${parsed.value}&key=${apiKey}`;
  }

  const requestUrl = `${base}?${query}`;
  console.log("[YouTube] 요청 URL:", requestUrl.replace(apiKey, "***KEY***"));

  try {
    const res = await fetch(requestUrl);
    console.log("[YouTube] 응답 status:", res.status, res.statusText);

    if (!res.ok) {
      const errBody = await res.text();
      console.error("[YouTube] API 오류 응답:", res.status, errBody);
      return null;
    }

    const data = await res.json();
    console.log("[YouTube] 응답 데이터:", JSON.stringify(data, null, 2));

    const item = data.items?.[0];
    if (!item) {
      console.warn("[YouTube] items 없음 — 채널을 찾을 수 없음");
      return null;
    }

    const t = item.snippet.thumbnails;
    console.log("[YouTube] thumbnails:", t);
    const thumbnailUrl = t?.high?.url ?? t?.medium?.url ?? t?.default?.url ?? "";
    console.log("[YouTube] thumbnailUrl:", thumbnailUrl);

    return {
      channelId: item.id ?? "",
      name: item.snippet.title ?? "",
      handle: item.snippet.customUrl ?? "",
      description: item.snippet.description ?? "",
      thumbnailUrl,
      subscriberCount: parseInt(item.statistics?.subscriberCount ?? "0", 10),
      videoCount: parseInt(item.statistics?.videoCount ?? "0", 10),
    };
  } catch (err) {
    console.error("[YouTube] fetch 예외:", err);
    return null;
  }
}
