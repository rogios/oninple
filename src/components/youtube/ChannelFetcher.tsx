"use client";

import { useState } from "react";
import Image from "next/image";
import { Search, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import type { YoutubeChannelInfo } from "@/lib/youtube";
import { formatSubscribers } from "@/lib/youtube";

interface Props {
  onFetched?: (info: YoutubeChannelInfo) => void;
}

export default function ChannelFetcher({ onFetched }: Props) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<YoutubeChannelInfo | null>(null);

  async function handleFetch() {
    const trimmed = url.trim();
    if (!trimmed) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch(`/api/youtube/channel?url=${encodeURIComponent(trimmed)}`);
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "채널 정보를 가져오지 못했습니다.");
        return;
      }

      setResult(data);
      onFetched?.(data);
    } catch {
      setError("네트워크 오류가 발생했습니다. 다시 시도해 주세요.");
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") handleFetch();
  }

  return (
    <div className="w-full space-y-4">
      {/* Input row */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={url}
            onChange={(e) => { setUrl(e.target.value); setError(null); setResult(null); }}
            onKeyDown={handleKeyDown}
            placeholder="https://www.youtube.com/@channel"
            className="w-full pl-4 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:border-[#E8292E] focus:bg-white transition-all"
          />
        </div>
        <button
          onClick={handleFetch}
          disabled={loading || !url.trim()}
          className="flex items-center gap-2 bg-[#111111] hover:bg-[#333] disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold px-5 py-3 rounded-xl text-sm transition-colors shrink-0"
        >
          {loading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Search size={16} />
          )}
          {loading ? "조회 중" : "채널 조회"}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
          <AlertCircle size={15} className="shrink-0" />
          {error}
        </div>
      )}

      {/* Result card */}
      {result && (
        <div className="flex items-start gap-4 bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
          {/* Thumbnail */}
          {result.thumbnailUrl ? (
            <Image
              src={result.thumbnailUrl}
              alt={result.name}
              width={56}
              height={56}
              className="w-14 h-14 rounded-2xl object-cover shrink-0"
            />
          ) : (
            <div className="w-14 h-14 rounded-2xl bg-gray-100 shrink-0" />
          )}

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle2 size={15} className="text-green-500 shrink-0" />
              <span className="font-bold text-[#111111] truncate">{result.name}</span>
            </div>
            {result.handle && (
              <div className="text-xs text-gray-400 mb-2">{result.handle}</div>
            )}
            <div className="flex gap-3">
              <div className="text-center">
                <div className="text-base font-black text-[#111111]">
                  {formatSubscribers(result.subscriberCount)}
                </div>
                <div className="text-[10px] text-gray-400">구독자</div>
              </div>
              <div className="w-px bg-gray-100" />
              <div className="text-center">
                <div className="text-base font-black text-[#111111]">
                  {result.videoCount.toLocaleString()}
                </div>
                <div className="text-[10px] text-gray-400">동영상</div>
              </div>
            </div>
          </div>
        </div>
      )}

      <p className="text-xs text-gray-400">
        지원 형식: youtube.com/@handle · /channel/UCxxx · /user/name
      </p>
    </div>
  );
}
