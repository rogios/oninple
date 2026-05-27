"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { Loader2, AlertCircle, Play, X } from "lucide-react";
import type { TrendingVideo } from "@/app/api/youtube/trending/route";
import type { CategoryResult, CategoryVideo } from "@/app/api/youtube/trending-by-category/route";

// ── 유틸 ─────────────────────────────────────────────────────────────────────

function formatViews(n: number): string {
  if (n >= 100_000_000) return `${(n / 100_000_000).toFixed(1)}억`;
  if (n >= 10_000) return `${(n / 10_000).toFixed(1).replace(/\.0$/, "")}만`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}천`;
  return `${n}`;
}

function formatDuration(iso: string): string {
  const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!m) return "--:--";
  const h = parseInt(m[1] ?? "0", 10);
  const min = parseInt(m[2] ?? "0", 10);
  const sec = parseInt(m[3] ?? "0", 10);
  if (h > 0)
    return `${h}:${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  return `${min}:${String(sec).padStart(2, "0")}`;
}

function timeAgo(dateStr: string): string {
  const days = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86_400_000);
  if (days === 0) return "오늘";
  if (days < 7) return `${days}일 전`;
  if (days < 30) return `${Math.floor(days / 7)}주 전`;
  if (days < 365) return `${Math.floor(days / 30)}개월 전`;
  return `${Math.floor(days / 365)}년 전`;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

// ── 공유 카드 컴포넌트 ────────────────────────────────────────────────────────

/** 아코디언 확대 상태 카드 — 유튜브 iframe 임베드 + 영상 정보 */
function ExpandedCard({
  video,
  onClose,
}: {
  video: TrendingVideo | CategoryVideo;
  onClose: (e: React.MouseEvent) => void;
}) {
  return (
    <div className="relative bg-[#0D1117] rounded-2xl overflow-hidden shadow-2xl ring-2 ring-[#E8292E]/50">
      {/* ✕ 닫기 */}
      <button
        type="button"
        onClick={onClose}
        aria-label="닫기"
        className="absolute top-2.5 right-2.5 z-10 w-7 h-7 rounded-full bg-black/70 hover:bg-black text-white flex items-center justify-center transition-colors"
      >
        <X size={13} strokeWidth={2.5} />
      </button>

      {/* YouTube iframe 16:9 */}
      <div className="aspect-video w-full bg-black">
        <iframe
          src={`https://www.youtube.com/embed/${video.id}?autoplay=1&rel=0`}
          className="w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          title={video.title}
        />
      </div>

      {/* 영상 정보 */}
      <div className="px-4 py-3.5">
        <h3 className="text-sm font-bold text-white line-clamp-2 mb-2 leading-snug">
          {video.title}
        </h3>
        <div className="flex items-center justify-between flex-wrap gap-y-1 gap-x-3">
          <span className="text-xs text-gray-400 truncate">{video.channelTitle}</span>
          <div className="flex items-center gap-3 text-xs text-gray-400 shrink-0">
            <span>👁 {formatViews(video.viewCount)}</span>
            <span>{formatDate(video.publishedAt)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/** 기본 썸네일 카드 */
function NormalCard({
  video,
  rank,
}: {
  video: TrendingVideo | CategoryVideo;
  rank?: number; // undefined 이면 순위 뱃지 미표시
}) {
  const rankBadge =
    rank === 1 ? "bg-[#E8292E] text-white" :
    rank === 2 ? "bg-gray-700 text-white" :
    rank === 3 ? "bg-amber-600 text-white" :
    "bg-black/60 text-white";

  return (
    <>
      <div className="relative aspect-video rounded-2xl overflow-hidden bg-gray-100 dark:bg-[#1F2937] mb-3 shadow-sm group-hover:shadow-md transition-shadow">
        {video.thumbnail ? (
          <Image
            src={video.thumbnail}
            alt={video.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 50vw, 25vw"
            unoptimized
          />
        ) : (
          <div className="w-full h-full bg-gray-200 dark:bg-[#374151] flex items-center justify-center">
            <Play size={24} className="text-gray-400" />
          </div>
        )}

        {/* 순위 뱃지 (rank가 있을 때만) */}
        {rank !== undefined && (
          <div className="absolute top-2 left-2">
            <span className={`text-xs font-black px-2 py-0.5 rounded-lg ${rankBadge}`}>
              #{rank}
            </span>
          </div>
        )}

        {/* 재생 시간 */}
        <div className="absolute bottom-2 right-2 bg-black/80 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
          {formatDuration(video.duration)}
        </div>

        {/* 호버 플레이 오버레이 */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
          <div className="w-11 h-11 rounded-full bg-white/0 group-hover:bg-white/25 transition-all flex items-center justify-center">
            <Play
              size={18}
              className="text-white opacity-0 group-hover:opacity-100 transition-opacity ml-0.5"
              fill="white"
            />
          </div>
        </div>
      </div>

      <h3 className="text-sm font-bold text-[#111111] dark:text-[#F9FAFB] line-clamp-2 mb-1 group-hover:text-[#E8292E] dark:group-hover:text-[#E8292E] transition-colors leading-snug">
        {video.title}
      </h3>
      <div className="flex items-center justify-between gap-1 text-xs text-gray-500 dark:text-[#6B7280]">
        <span className="truncate">{video.channelTitle}</span>
        <span className="shrink-0 font-medium">👁 {formatViews(video.viewCount)}</span>
      </div>
      <div className="text-[11px] text-gray-400 dark:text-[#4B5563] mt-0.5">
        {timeAgo(video.publishedAt)}
      </div>
    </>
  );
}

/** 아코디언 그리드 — 메인 트렌딩 + 카테고리 공통 사용 */
function AccordionGrid({
  videos,
  selectedId,
  onSelect,
  showRank = false,
}: {
  videos: (TrendingVideo | CategoryVideo)[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  showRank?: boolean;
}) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 items-start">
      {videos.map((video, idx) => {
        const isSelected = video.id === selectedId;
        return (
          <div
            key={video.id}
            onClick={() => onSelect(isSelected ? null : video.id)}
            className={[
              "group cursor-pointer",
              isSelected ? "col-span-2 lg:col-span-2" : "col-span-1",
            ].join(" ")}
          >
            {isSelected ? (
              <ExpandedCard
                video={video}
                onClose={(e) => {
                  e.stopPropagation();
                  onSelect(null);
                }}
              />
            ) : (
              <NormalCard
                video={video}
                rank={showRank ? idx + 1 : undefined}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── 스켈레톤 ─────────────────────────────────────────────────────────────────

function CardSkeleton() {
  return (
    <div className="col-span-1 animate-pulse">
      <div className="aspect-video rounded-2xl bg-gray-200 dark:bg-[#1F2937] mb-3" />
      <div className="h-3.5 bg-gray-200 dark:bg-[#1F2937] rounded mb-2 w-4/5" />
      <div className="h-3 bg-gray-200 dark:bg-[#1F2937] rounded w-3/5" />
    </div>
  );
}

function CategorySkeleton() {
  return (
    <div className="mb-12 animate-pulse">
      <div className="h-6 bg-gray-200 dark:bg-[#1F2937] rounded w-40 mb-5" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

// ── 메인 ─────────────────────────────────────────────────────────────────────

export default function TrendingClient() {
  const [videos, setVideos] = useState<TrendingVideo[]>([]);
  const [fetchedAt, setFetchedAt] = useState("");
  const [trendLoading, setTrendLoading] = useState(true);
  const [trendError, setTrendError] = useState<string | null>(null);

  const [categories, setCategories] = useState<CategoryResult[]>([]);
  const [catLoading, setCatLoading] = useState(true);
  const [catError, setCatError] = useState<string | null>(null);

  /** 메인 + 카테고리 전역 선택 ID */
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // 급상승 영상 fetch
  const fetchTrending = useCallback(() => {
    setTrendLoading(true);
    setTrendError(null);
    fetch("/api/youtube/trending")
      .then((r) => {
        if (!r.ok) throw new Error(`API 오류: ${r.status}`);
        return r.json();
      })
      .then((d) => {
        setVideos(d.videos ?? []);
        setFetchedAt(d.fetchedAt ?? "");
      })
      .catch((e: Error) => setTrendError(e.message ?? "데이터를 불러오지 못했습니다."))
      .finally(() => setTrendLoading(false));
  }, []);

  // 업종별 베스트 fetch
  const fetchCategories = useCallback(() => {
    setCatLoading(true);
    setCatError(null);
    fetch("/api/youtube/trending-by-category")
      .then((r) => {
        if (!r.ok) throw new Error(`API 오류: ${r.status}`);
        return r.json();
      })
      .then((d) => setCategories(d.categories ?? []))
      .catch((e: Error) => setCatError(e.message ?? "카테고리 데이터를 불러오지 못했습니다."))
      .finally(() => setCatLoading(false));
  }, []);

  useEffect(() => {
    fetchTrending();
    fetchCategories();
  }, [fetchTrending, fetchCategories]);

  // ESC 키로 닫기
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedId(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-[#111827]">

      {/* ── 히어로 헤더 ── */}
      <div className="bg-[#111111] pt-14 pb-12 px-4">
        <div className="max-w-6xl mx-auto">
          <p className="text-xs font-semibold tracking-widest text-[#E8292E] uppercase mb-3">
            YouTube Trending · Korea
          </p>
          <h1 className="text-3xl sm:text-4xl font-black text-white mb-3 leading-tight">
            이번 주 급상승 영상
          </h1>
          <p className="text-sm text-gray-400">
            한국 유튜브 인기 급상승 Top 32
            {fetchedAt && (
              <span className="ml-2 opacity-60">· {timeAgo(fetchedAt)} 업데이트</span>
            )}
          </p>
        </div>
      </div>

      {/* ── 급상승 영상 그리드 ── */}
      <div className="max-w-6xl mx-auto px-4 pt-10 pb-6">
        {trendLoading && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 items-start">
            {Array.from({ length: 8 }).map((_, i) => <CardSkeleton key={i} />)}
          </div>
        )}

        {!trendLoading && trendError && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <AlertCircle size={36} className="text-red-400" />
            <p className="text-sm text-gray-500 dark:text-[#6B7280]">{trendError}</p>
            <button type="button" onClick={fetchTrending}
              className="text-sm font-semibold text-[#E8292E] hover:underline flex items-center gap-1.5">
              <Loader2 size={14} /> 다시 시도
            </button>
          </div>
        )}

        {!trendLoading && !trendError && (
          <AccordionGrid
            videos={videos}
            selectedId={selectedId}
            onSelect={setSelectedId}
            showRank
          />
        )}
      </div>

      {/* ── 업종별 베스트 ── */}
      <div className="border-t border-gray-100 dark:border-[#1F2937]">
        <div className="max-w-6xl mx-auto px-4 py-10">

          {/* 섹션 헤더 */}
          <div className="mb-10">
            <p className="text-xs font-semibold tracking-widest text-[#E8292E] uppercase mb-2">
              Category Best
            </p>
            <h2 className="text-2xl font-black text-[#111111] dark:text-[#F9FAFB]">
              업종별 베스트
            </h2>
            <p className="text-sm text-gray-500 dark:text-[#6B7280] mt-1">
              최근 7일 · 카테고리별 조회수 상위 영상
            </p>
          </div>

          {/* 카테고리 로딩 */}
          {catLoading && (
            <>
              {Array.from({ length: 3 }).map((_, i) => (
                <CategorySkeleton key={i} />
              ))}
            </>
          )}

          {/* 카테고리 에러 */}
          {!catLoading && catError && (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <AlertCircle size={32} className="text-red-400" />
              <p className="text-sm text-gray-500 dark:text-[#6B7280]">{catError}</p>
              <button type="button" onClick={fetchCategories}
                className="text-sm font-semibold text-[#E8292E] hover:underline flex items-center gap-1.5">
                <Loader2 size={14} /> 다시 시도
              </button>
            </div>
          )}

          {/* 카테고리 목록 */}
          {!catLoading && !catError && (
            <div className="space-y-12">
              {categories.map((cat) => (
                <div key={cat.category}>
                  {/* 카테고리 타이틀 */}
                  <div className="flex items-center gap-3 mb-5">
                    <div className="shrink-0">
                      <h3 className="text-xl font-bold text-[#111111] dark:text-[#F9FAFB] leading-tight">
                        {cat.category}
                      </h3>
                      <p className="text-xs font-semibold text-[#E8292E] mt-0.5 tracking-wide">
                        {cat.labelEn}
                      </p>
                    </div>
                    <div className="flex-1 h-px bg-gray-200 dark:bg-white/10" />
                  </div>

                  {/* 카드 그리드 (아코디언) */}
                  {cat.videos.length === 0 ? (
                    <p className="text-sm text-gray-400 dark:text-[#4B5563] py-4">
                      이번 주 영상 데이터를 불러오지 못했습니다.
                    </p>
                  ) : (
                    <AccordionGrid
                      videos={cat.videos}
                      selectedId={selectedId}
                      onSelect={setSelectedId}
                    />
                  )}
                </div>
              ))}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
