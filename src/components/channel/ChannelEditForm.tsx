"use client";

import { useState, useRef, KeyboardEvent } from "react";
import { twMerge } from "tailwind-merge";
import { useRouter } from "next/navigation";
import { X, Plus, ToggleLeft, ToggleRight, Upload } from "lucide-react";
import { updateChannel, type ChannelInput } from "@/app/actions/channel";
import { createClient } from "@/lib/supabase/client";
import type { YoutubeChannelInfo } from "@/lib/youtube";

// ─── 상수 ────────────────────────────────────────────────────────────────────

const CATEGORIES = [
  { value: "beauty", label: "뷰티/패션" },
  { value: "food", label: "음식/요리" },
  { value: "travel", label: "여행" },
  { value: "gaming", label: "게임" },
  { value: "tech", label: "IT/테크" },
  { value: "education", label: "교육" },
  { value: "sports", label: "스포츠/피트니스" },
  { value: "entertainment", label: "엔터테인먼트" },
  { value: "lifestyle", label: "라이프스타일" },
  { value: "business", label: "비즈니스" },
  { value: "parenting", label: "육아" },
  { value: "other", label: "기타" },
];

const UPLOAD_CYCLES = ["주 3회 이상", "주 1~2회", "월 1~2회", "비정기"];

const CONTENT_FORMATS: Record<string, string[]> = {
  youtube: ["쇼츠 위주", "롱폼 위주", "혼합"],
  instagram: ["피드", "릴스", "혼합"],
  tiktok: ["피드", "영상", "혼합"],
};

const AUDIENCE_AGES = ["10대", "20대", "30대", "40대 이상"];
const AUDIENCE_GENDERS = [
  { value: "male", label: "남성 위주" },
  { value: "female", label: "여성 위주" },
  { value: "mixed", label: "비슷함" },
];

const AI_TOOLS = [
  "Runway", "CapCut AI", "Midjourney", "Grok", "Sora", "ElevenLabs", "ChatGPT", "기타",
];

const WORK_TYPES = [
  "숏폼 편집", "롱폼 편집", "썸네일 디자인", "자막", "AI 보이스", "기타",
];

// ─── 타입 ────────────────────────────────────────────────────────────────────

export type ChannelData = {
  id: string;
  platform: string;
  channel_name: string;
  follower_count: number | null;
  categories: string[] | null;
  can_collaborate: boolean | null;
  profile_image_url: string | null;
  bio: string | null;
  avg_views: number | null;
  upload_frequency: string | null;
  content_format: string | null;
  content_keywords: string[] | null;
  audience_age: string[] | null;
  audience_gender: string | null;
  channel_url: string | null;
  video_url_1: string | null;
  video_url_2: string | null;
  feed_thumbnail_1: string | null;
  feed_url_1: string | null;
  feed_thumbnail_2: string | null;
  feed_url_2: string | null;
  kakao_open_chat: string | null;
  ai_tools: string[] | null;
  work_fields: string[] | null;
  portfolio_url: string | null;
};

interface FormState {
  channel_name: string;
  follower_count: string;
  categories: string[];
  bio: string;
  kakao_open_chat: string;
  avg_views: string;
  upload_frequency: string;
  content_format: string;
  can_collaborate: boolean;
  audience_age: string[];
  audience_gender: string;
  content_keywords: string[];
  channel_url: string;
  video_url_1: string;
  video_url_2: string;
  feed_url_1: string;
  feed_url_2: string;
  ai_tools: string[];
  work_fields: string[];
  portfolio_url: string;
}

// ─── 헬퍼 컴포넌트 ────────────────────────────────────────────────────────────

function Label({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block text-sm font-semibold text-[#111111] mb-1.5">
      {children}
      {required && <span className="text-[#E8292E] ml-0.5">*</span>}
    </label>
  );
}

function Input({
  hasError,
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { hasError?: boolean }) {
  return (
    <input
      {...props}
      className={twMerge(
        "w-full px-4 py-2.5 rounded-xl border text-sm",
        "focus:outline-none focus:ring-2 transition-colors placeholder:text-gray-300",
        hasError
          ? "border-red-400 focus:border-red-400 focus:ring-red-100"
          : "border-gray-200 focus:border-[#E8292E] focus:ring-[#E8292E]/20",
        props.disabled && "opacity-50 cursor-not-allowed bg-gray-50",
        className
      )}
    />
  );
}

function MultiChip({
  options,
  selected,
  onChange,
}: {
  options: { value: string; label: string }[];
  selected: string[];
  onChange: (next: string[]) => void;
}) {
  const toggle = (v: string) =>
    onChange(selected.includes(v) ? selected.filter((x) => x !== v) : [...selected, v]);
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => toggle(o.value)}
          className={[
            "px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors",
            selected.includes(o.value)
              ? "border-[#E8292E] bg-[#E8292E] text-white"
              : "border-gray-200 text-gray-600 hover:border-gray-300",
          ].join(" ")}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function RadioGroup({
  options,
  value,
  onChange,
}: {
  options: { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={[
            "px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors",
            value === o.value
              ? "border-[#E8292E] bg-[#E8292E] text-white"
              : "border-gray-200 text-gray-600 hover:border-gray-300",
          ].join(" ")}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function Field({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div data-field-error={error ? "true" : undefined}>
      <Label required={required}>{label}</Label>
      {children}
      {error && <p className="text-xs text-[#E8292E] mt-1.5">{error}</p>}
    </div>
  );
}

// ─── 메인 컴포넌트 ────────────────────────────────────────────────────────────

export default function ChannelEditForm({
  channel,
  userId,
}: {
  channel: ChannelData;
  userId: string;
}) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const feedThumb1Ref = useRef<HTMLInputElement>(null);
  const feedThumb2Ref = useRef<HTMLInputElement>(null);

  const platform = channel.platform as "youtube" | "instagram" | "tiktok" | "editor";
  const isEditor = platform === "editor";

  const [form, setForm] = useState<FormState>({
    channel_name: channel.channel_name ?? "",
    follower_count: channel.follower_count?.toString() ?? "",
    categories: channel.categories ?? [],
    bio: channel.bio ?? "",
    kakao_open_chat: channel.kakao_open_chat ?? "",
    avg_views: channel.avg_views?.toString() ?? "",
    upload_frequency: channel.upload_frequency ?? "",
    content_format: channel.content_format ?? "",
    can_collaborate: channel.can_collaborate ?? true,
    audience_age: channel.audience_age ?? [],
    audience_gender: channel.audience_gender ?? "",
    content_keywords: channel.content_keywords ?? [],
    channel_url: channel.channel_url ?? "",
    video_url_1: channel.video_url_1 ?? "",
    video_url_2: channel.video_url_2 ?? "",
    feed_url_1: channel.feed_url_1 ?? "",
    feed_url_2: channel.feed_url_2 ?? "",
    ai_tools: channel.ai_tools ?? [],
    work_fields: channel.work_fields ?? [],
    portfolio_url: channel.portfolio_url ?? "",
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(channel.profile_image_url ?? null);
  const [keywordInput, setKeywordInput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [fetchedProfileUrl, setFetchedProfileUrl] = useState<string | null>(null);
  const [fetchingYoutube, setFetchingYoutube] = useState(false);

  type FeedThumb = { url: string; preview: string };
  const [feedThumb1, setFeedThumb1] = useState<FeedThumb | null>(
    channel.feed_thumbnail_1 ? { url: channel.feed_thumbnail_1, preview: channel.feed_thumbnail_1 } : null
  );
  const [feedThumb1Uploading, setFeedThumb1Uploading] = useState(false);
  const [feedThumb2, setFeedThumb2] = useState<FeedThumb | null>(
    channel.feed_thumbnail_2 ? { url: channel.feed_thumbnail_2, preview: channel.feed_thumbnail_2 } : null
  );
  const [feedThumb2Uploading, setFeedThumb2Uploading] = useState(false);
  const [feedUploadError, setFeedUploadError] = useState<string | null>(null);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setFieldErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  function handleKeywordKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key !== "Enter") return;
    e.preventDefault();
    const trimmed = keywordInput.trim();
    if (!trimmed || form.content_keywords.includes(trimmed) || form.content_keywords.length >= 5) return;
    set("content_keywords", [...form.content_keywords, trimmed]);
    setKeywordInput("");
  }

  function removeKeyword(kw: string) {
    set("content_keywords", form.content_keywords.filter((k) => k !== kw));
  }

  async function handleChannelUrlBlur() {
    if (platform !== "youtube" || !form.channel_url.trim()) return;
    setFetchingYoutube(true);
    try {
      const res = await fetch(`/api/youtube/channel?url=${encodeURIComponent(form.channel_url.trim())}`);
      if (res.ok) {
        const info: YoutubeChannelInfo = await res.json();
        if (info?.thumbnailUrl) {
          setFetchedProfileUrl(info.thumbnailUrl);
          setImagePreview(info.thumbnailUrl);
        }
      }
    } catch {
      // 네트워크 오류 시 무시
    }
    setFetchingYoutube(false);
  }

  async function uploadFeedThumb(file: File, index: 1 | 2) {
    setFeedUploadError(null);

    if (file.size > 2 * 1024 * 1024) {
      setFeedUploadError("파일 크기는 2MB 이하여야 합니다.");
      return;
    }

    const dimError = await new Promise<string | null>((resolve) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => { URL.revokeObjectURL(url); resolve(img.width > 500 ? "가로 픽셀이 500px를 초과합니다." : null); };
      img.onerror = () => { URL.revokeObjectURL(url); resolve(null); };
      img.src = url;
    });
    if (dimError) { setFeedUploadError(dimError); return; }

    const preview = URL.createObjectURL(file);
    if (index === 1) setFeedThumb1Uploading(true);
    else setFeedThumb2Uploading(true);

    try {
      const supabase = createClient();

      // 1. 버킷 존재 여부 확인
      const { data: bucketInfo, error: bucketErr } = await supabase.storage.getBucket("channel-images");
      console.log("[uploadFeedThumb] getBucket →", bucketInfo ? `OK (id: ${bucketInfo.id})` : `FAIL: ${JSON.stringify(bucketErr)}`);

      // 2. 업로드 시도
      const ext = file.name.split(".").pop();
      const path = `${userId}/feed_${index}_${Date.now()}.${ext}`;
      console.log("[uploadFeedThumb] uploading → bucket: channel-images, path:", path, "| size:", file.size, "| type:", file.type);

      const { data: uploadData, error } = await supabase.storage
        .from("channel-images")
        .upload(path, file, { upsert: true });

      if (error) {
        console.error("[uploadFeedThumb] upload FAILED →", {
          message: error.message,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          statusCode: (error as any).statusCode,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          errorCode: (error as any).error,
          full: JSON.stringify(error),
        });
        setFeedUploadError(`업로드 실패: ${error.message}`);
        URL.revokeObjectURL(preview);
      } else if (uploadData) {
        console.log("[uploadFeedThumb] upload OK →", uploadData.path);
        const { data: urlData } = supabase.storage.from("channel-images").getPublicUrl(uploadData.path);
        if (index === 1) setFeedThumb1({ url: urlData.publicUrl, preview });
        else setFeedThumb2({ url: urlData.publicUrl, preview });
      }
    } catch (err) {
      console.error("[uploadFeedThumb] unexpected exception:", err);
      setFeedUploadError("업로드 중 오류가 발생했습니다.");
      URL.revokeObjectURL(preview);
    }

    if (index === 1) setFeedThumb1Uploading(false);
    else setFeedThumb2Uploading(false);
  }

  function validate(): boolean {
    const errors: Partial<Record<keyof FormState, string>> = {};

    if (!form.channel_name.trim()) errors.channel_name = "필수 항목입니다.";
    if (!isEditor) {
      if (!form.follower_count) errors.follower_count = "필수 항목입니다.";
      if (!form.avg_views) errors.avg_views = "필수 항목입니다.";
      if (!form.upload_frequency) errors.upload_frequency = "업로드 주기를 선택해주세요.";
      if (!form.content_format) errors.content_format = "콘텐츠 형식을 선택해주세요.";
      if (form.categories.length === 0) errors.categories = "최소 1개 이상 선택해주세요.";
    } else {
      if (form.work_fields.length === 0) errors.work_fields = "최소 1개 이상 선택해주세요.";
    }
    const bioMax = isEditor ? 300 : 500;
    if (form.bio.length > bioMax) errors.bio = `${bioMax}자 이내로 입력해주세요.`;

    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      requestAnimationFrame(() => {
        document.querySelector("[data-field-error]")?.scrollIntoView({ behavior: "smooth", block: "center" });
      });
      return false;
    }
    return true;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setError(null);

    // 새 이미지 업로드
    let profileImageUrl = fetchedProfileUrl ?? channel.profile_image_url ?? "";
    if (imageFile) {
      try {
        const supabase = createClient();
        const ext = imageFile.name.split(".").pop();
        const path = `${userId}/${Date.now()}.${ext}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("channel-images")
          .upload(path, imageFile, { upsert: true });
        if (!uploadError && uploadData) {
          const { data: urlData } = supabase.storage.from("channel-images").getPublicUrl(uploadData.path);
          profileImageUrl = urlData.publicUrl;
        }
      } catch {
        // 이미지 업로드 실패 시 기존 URL 유지
      }
    }

    const payload: ChannelInput = {
      platform,
      channel_name: form.channel_name.trim(),
      follower_count: isEditor ? null : (parseInt(form.follower_count) || null),
      categories: isEditor ? [] : form.categories,
      bio: form.bio.trim(),
      profile_image_url: profileImageUrl,
      kakao_open_chat: form.kakao_open_chat.trim(),
      avg_views: isEditor ? null : (parseInt(form.avg_views) || null),
      upload_frequency: isEditor ? "" : form.upload_frequency,
      content_format: isEditor ? "" : form.content_format,
      can_collaborate: form.can_collaborate,
      audience_age: isEditor ? [] : form.audience_age,
      audience_gender: isEditor ? "" : form.audience_gender,
      content_keywords: form.content_keywords,
      channel_url: isEditor ? "" : form.channel_url.trim(),
      video_url_1: platform === "youtube" ? form.video_url_1.trim() : "",
      video_url_2: platform === "youtube" ? form.video_url_2.trim() : "",
      feed_thumbnail_1: (platform === "instagram" || platform === "tiktok") ? (feedThumb1?.url ?? "") : "",
      feed_url_1: (platform === "instagram" || platform === "tiktok") ? form.feed_url_1.trim() : "",
      feed_thumbnail_2: (platform === "instagram" || platform === "tiktok") ? (feedThumb2?.url ?? "") : "",
      feed_url_2: (platform === "instagram" || platform === "tiktok") ? form.feed_url_2.trim() : "",
      ai_tools: isEditor ? form.ai_tools : [],
      work_fields: isEditor ? form.work_fields : [],
      portfolio_url: isEditor ? form.portfolio_url.trim() : "",
    };

    const result = await updateChannel(channel.id, payload);
    if (result.error) {
      setError(result.error);
      setSubmitting(false);
    } else {
      router.push("/mypage");
    }
  }

  const bioMax = isEditor ? 300 : 500;

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* 프로필 이미지 */}
      <div>
        <Label>프로필 이미지</Label>
        <div className="flex items-center gap-4">
          <div
            onClick={() => fileRef.current?.click()}
            className="w-20 h-20 rounded-2xl border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden cursor-pointer hover:border-[#E8292E]/40 transition-colors bg-gray-50"
          >
            {imagePreview ? (
              <img src={imagePreview} alt="preview" className="w-full h-full object-cover" />
            ) : (
              <Upload size={20} className="text-gray-300" />
            )}
          </div>
          <div>
            <button type="button" onClick={() => fileRef.current?.click()} className="text-sm font-medium text-[#E8292E] hover:underline">
              이미지 변경
            </button>
            <p className="text-xs text-gray-400 mt-1">JPG, PNG 권장 · 선택사항</p>
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
        </div>
      </div>

      {/* 편집프로듀서 전용 필드 */}
      {isEditor ? (
        <>
          <Field label="닉네임" required error={fieldErrors.channel_name}>
            <Input
              hasError={!!fieldErrors.channel_name}
              placeholder="편집자 닉네임을 입력하세요"
              value={form.channel_name}
              onChange={(e) => set("channel_name", e.target.value)}
            />
          </Field>

          <Field label="작업 가능 분야" required error={fieldErrors.work_fields}>
            <MultiChip
              options={WORK_TYPES.map((t) => ({ value: t, label: t }))}
              selected={form.work_fields}
              onChange={(v) => set("work_fields", v)}
            />
          </Field>

          <Field label="보유 AI 툴">
            <MultiChip
              options={AI_TOOLS.map((t) => ({ value: t, label: t }))}
              selected={form.ai_tools}
              onChange={(v) => set("ai_tools", v)}
            />
          </Field>

          <Field label={`자기소개 (${form.bio.length}/${bioMax})`} error={fieldErrors.bio}>
            <textarea
              rows={4}
              maxLength={bioMax}
              placeholder="작업 스타일, 경력, 강점 등을 소개해주세요"
              value={form.bio}
              onChange={(e) => set("bio", e.target.value)}
              className={twMerge(
                "w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 transition-colors resize-none placeholder:text-gray-300",
                fieldErrors.bio
                  ? "border-red-400 focus:border-red-400 focus:ring-red-100"
                  : "border-gray-200 focus:border-[#E8292E] focus:ring-[#E8292E]/20"
              )}
            />
          </Field>

          <Field label="포트폴리오 링크">
            <Input type="url" placeholder="https://" value={form.portfolio_url} onChange={(e) => set("portfolio_url", e.target.value)} />
          </Field>

          <Field label="카카오 오픈채팅 링크">
            <Input type="url" placeholder="https://open.kakao.com/..." value={form.kakao_open_chat} onChange={(e) => set("kakao_open_chat", e.target.value)} />
          </Field>
        </>
      ) : (
        <>
          <Field label={platform === "youtube" ? "채널명" : "계정명"} required error={fieldErrors.channel_name}>
            <Input
              hasError={!!fieldErrors.channel_name}
              placeholder={platform === "youtube" ? "채널 이름" : "@계정명"}
              value={form.channel_name}
              onChange={(e) => set("channel_name", e.target.value)}
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label={platform === "youtube" ? "구독자 수" : "팔로워 수"} required error={fieldErrors.follower_count}>
              <Input
                hasError={!!fieldErrors.follower_count}
                type="number"
                min={0}
                placeholder="숫자만 입력"
                value={form.follower_count}
                onChange={(e) => set("follower_count", e.target.value)}
              />
            </Field>
            <Field label="평균 조회수" required error={fieldErrors.avg_views}>
              <Input
                hasError={!!fieldErrors.avg_views}
                type="number"
                min={0}
                placeholder="숫자만 입력"
                value={form.avg_views}
                onChange={(e) => set("avg_views", e.target.value)}
              />
            </Field>
          </div>

          <Field label="콘텐츠 분야" required error={fieldErrors.categories}>
            <MultiChip options={CATEGORIES} selected={form.categories} onChange={(v) => set("categories", v)} />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="업로드 주기" required error={fieldErrors.upload_frequency}>
              <RadioGroup
                options={UPLOAD_CYCLES.map((c) => ({ value: c, label: c }))}
                value={form.upload_frequency}
                onChange={(v) => set("upload_frequency", v)}
              />
            </Field>
            <Field label="콘텐츠 형식" required error={fieldErrors.content_format}>
              <RadioGroup
                options={(CONTENT_FORMATS[platform] ?? []).map((c) => ({ value: c, label: c }))}
                value={form.content_format}
                onChange={(v) => set("content_format", v)}
              />
            </Field>
          </div>

          <Field label={`자기소개 (${form.bio.length}/${bioMax})`} error={fieldErrors.bio}>
            <textarea
              rows={4}
              maxLength={bioMax}
              placeholder="채널 소개, 콘텐츠 특징, 광고 협업 경험 등을 자유롭게 작성해주세요"
              value={form.bio}
              onChange={(e) => set("bio", e.target.value)}
              className={twMerge(
                "w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 transition-colors resize-none placeholder:text-gray-300",
                fieldErrors.bio
                  ? "border-red-400 focus:border-red-400 focus:ring-red-100"
                  : "border-gray-200 focus:border-[#E8292E] focus:ring-[#E8292E]/20"
              )}
            />
          </Field>

          <Field label="카카오 오픈채팅 링크">
            <Input type="url" placeholder="https://open.kakao.com/..." value={form.kakao_open_chat} onChange={(e) => set("kakao_open_chat", e.target.value)} />
          </Field>

          {platform === "youtube" && (
            <>
              <Field label="채널 링크">
                <div className="relative">
                  <Input
                    type="url"
                    placeholder="https://youtube.com/@..."
                    value={form.channel_url}
                    onChange={(e) => set("channel_url", e.target.value)}
                    onBlur={handleChannelUrlBlur}
                  />
                  {fetchingYoutube && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-gray-300 border-t-[#E8292E] rounded-full animate-spin" />
                  )}
                </div>
                {fetchedProfileUrl && !fetchingYoutube && (
                  <p className="text-xs text-green-600 mt-1.5">✓ 채널 프로필 이미지를 가져왔습니다</p>
                )}
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="대표 영상 URL 1">
                  <Input type="url" placeholder="https://youtu.be/..." value={form.video_url_1} onChange={(e) => set("video_url_1", e.target.value)} />
                </Field>
                <Field label="대표 영상 URL 2">
                  <Input type="url" placeholder="https://youtu.be/..." value={form.video_url_2} onChange={(e) => set("video_url_2", e.target.value)} />
                </Field>
              </div>
            </>
          )}

          {(platform === "instagram" || platform === "tiktok") && (<>
            <Field label={platform === "instagram" ? "인스타그램 채널 URL" : "틱톡 채널 URL"}>
              <Input
                type="url"
                placeholder={
                  platform === "instagram"
                    ? "https://www.instagram.com/아이디"
                    : "https://www.tiktok.com/@아이디"
                }
                value={form.channel_url}
                onChange={(e) => set("channel_url", e.target.value)}
              />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>대표 피드 1</Label>
                <div
                  onClick={() => feedThumb1Ref.current?.click()}
                  className="aspect-video rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden cursor-pointer hover:border-[#E8292E]/40 transition-colors bg-gray-50"
                >
                  {feedThumb1Uploading ? (
                    <div className="w-5 h-5 border-2 border-gray-300 border-t-[#E8292E] rounded-full animate-spin" />
                  ) : feedThumb1 ? (
                    <img src={feedThumb1.preview} alt="피드 1" className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center gap-1 px-2 text-center">
                      <Upload size={16} className="text-gray-300" />
                      <span className="text-[10px] text-gray-300 leading-tight">권장 가로 500px 이하 / 최대 2MB</span>
                    </div>
                  )}
                </div>
                <input
                  ref={feedThumb1Ref}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadFeedThumb(f, 1); }}
                />
                <Input
                  type="url"
                  placeholder="피드 URL"
                  disabled={!feedThumb1 || feedThumb1Uploading}
                  value={form.feed_url_1}
                  onChange={(e) => set("feed_url_1", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>대표 피드 2</Label>
                <div
                  onClick={() => feedThumb2Ref.current?.click()}
                  className="aspect-video rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden cursor-pointer hover:border-[#E8292E]/40 transition-colors bg-gray-50"
                >
                  {feedThumb2Uploading ? (
                    <div className="w-5 h-5 border-2 border-gray-300 border-t-[#E8292E] rounded-full animate-spin" />
                  ) : feedThumb2 ? (
                    <img src={feedThumb2.preview} alt="피드 2" className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center gap-1 px-2 text-center">
                      <Upload size={16} className="text-gray-300" />
                      <span className="text-[10px] text-gray-300 leading-tight">권장 가로 500px 이하 / 최대 2MB</span>
                    </div>
                  )}
                </div>
                <input
                  ref={feedThumb2Ref}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadFeedThumb(f, 2); }}
                />
                <Input
                  type="url"
                  placeholder="피드 URL"
                  disabled={!feedThumb2 || feedThumb2Uploading}
                  value={form.feed_url_2}
                  onChange={(e) => set("feed_url_2", e.target.value)}
                />
              </div>
            </div>
            {feedUploadError && (
              <p className="text-xs text-[#E8292E] mt-1">{feedUploadError}</p>
            )}
          </>)}

          <div className="bg-gray-50 rounded-2xl p-5 space-y-4">
            <p className="text-sm font-semibold text-[#111111]">주요 시청자 정보</p>
            <Field label="연령대 (복수 선택)">
              <MultiChip
                options={AUDIENCE_AGES.map((a) => ({ value: a, label: a }))}
                selected={form.audience_age}
                onChange={(v) => set("audience_age", v)}
              />
            </Field>
            <Field label="성별 비율">
              <RadioGroup options={AUDIENCE_GENDERS} value={form.audience_gender} onChange={(v) => set("audience_gender", v)} />
            </Field>
          </div>
        </>
      )}

      {/* 콘텐츠 키워드 */}
      <Field label="콘텐츠 키워드 (최대 5개)">
        <div className="space-y-2">
          {form.content_keywords.length < 5 && (
            <div className="relative">
              <Input
                placeholder="키워드 입력 후 Enter"
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
                onKeyDown={handleKeywordKeyDown}
              />
              <Plus size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300" />
            </div>
          )}
          {form.content_keywords.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {form.content_keywords.map((kw) => (
                <span key={kw} className="flex items-center gap-1.5 bg-[#111111] text-white text-xs font-medium px-3 py-1.5 rounded-full">
                  {kw}
                  <button type="button" onClick={() => removeKeyword(kw)}><X size={12} /></button>
                </span>
              ))}
            </div>
          )}
        </div>
      </Field>

      {/* 협업 가능 여부 */}
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
        <div>
          <p className="text-sm font-semibold text-[#111111]">협업 가능</p>
          <p className="text-xs text-gray-400 mt-0.5">광고주에게 협업 가능 상태를 표시합니다</p>
        </div>
        <button type="button" onClick={() => set("can_collaborate", !form.can_collaborate)} className="text-[#E8292E] transition-colors">
          {form.can_collaborate ? <ToggleRight size={36} /> : <ToggleLeft size={36} className="text-gray-300" />}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl">{error}</div>
      )}

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={() => router.push("/mypage")}
          className="flex-1 py-3 rounded-full border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
        >
          취소
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="flex-1 py-3 rounded-full bg-[#E8292E] hover:bg-[#c9191e] disabled:opacity-60 text-white text-sm font-bold transition-colors"
        >
          {submitting ? "저장 중..." : "저장하기"}
        </button>
      </div>
    </form>
  );
}
