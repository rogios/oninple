"use client";

import { useState, useTransition } from "react";
import { Pencil, Trash2, Plus, X, Check, Eye, EyeOff } from "lucide-react";
import { createPost, updatePost, deletePost, togglePublish } from "@/app/actions/blog";

// ─── Type ─────────────────────────────────────────────────────────────────────

export type PostRow = {
  id: string;
  title: string;
  content: string;
  thumbnail: string | null;
  summary: string;
  category: string;
  slug: string;
  published: boolean;
  created_at: string;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(d: string) {
  return new Date(d).toLocaleDateString("ko-KR", { year: "2-digit", month: "2-digit", day: "2-digit" });
}

function toSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9가-힣-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

// ─── Post Form ────────────────────────────────────────────────────────────────

type FormData = {
  title: string;
  slug: string;
  category: string;
  summary: string;
  thumbnail: string;
  content: string;
  published: boolean;
};

function PostForm({
  initial,
  onSubmit,
  onCancel,
  isPending,
}: {
  initial?: PostRow;
  onSubmit: (d: FormData) => void;
  onCancel: () => void;
  isPending: boolean;
}) {
  const [f, setF] = useState<FormData>({
    title: initial?.title ?? "",
    slug: initial?.slug ?? "",
    category: initial?.category ?? "",
    summary: initial?.summary ?? "",
    thumbnail: initial?.thumbnail ?? "",
    content: initial?.content ?? "",
    published: initial?.published ?? false,
  });

  function set(key: keyof FormData, value: string | boolean) {
    setF((prev) => ({ ...prev, [key]: value }));
  }

  const inputCls = "w-full text-sm border border-gray-200 dark:border-[#374151] rounded-xl px-4 py-2.5 focus:outline-none focus:border-gray-400 dark:focus:border-[#9CA3AF] bg-white dark:bg-[#1F2937] text-[#111111] dark:text-[#F9FAFB] placeholder:text-gray-300 dark:placeholder:text-[#6B7280]";
  const labelCls = "text-xs font-semibold text-gray-700 dark:text-[#9CA3AF] block mb-1.5";

  return (
    <div className="bg-gray-50 dark:bg-[#374151] border border-gray-200 dark:border-[#4B5563] rounded-2xl p-5 space-y-4">
      <p className="text-sm font-bold text-[#111111] dark:text-[#F9FAFB]">{initial ? "글 수정" : "새 글 작성"}</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>제목</label>
          <input
            type="text"
            value={f.title}
            onChange={(e) => set("title", e.target.value)}
            placeholder="글 제목"
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>
            슬러그 (URL)
            <button
              type="button"
              onClick={() => set("slug", toSlug(f.title))}
              className="ml-2 text-[10px] text-[#E8292E] hover:underline font-normal"
            >
              제목에서 생성
            </button>
          </label>
          <input
            type="text"
            value={f.slug}
            onChange={(e) => set("slug", e.target.value)}
            placeholder="url-friendly-slug"
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>카테고리</label>
          <input
            type="text"
            value={f.category}
            onChange={(e) => set("category", e.target.value)}
            placeholder="예: 마케팅, 트렌드"
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>썸네일 이미지 URL (선택)</label>
          <input
            type="text"
            value={f.thumbnail}
            onChange={(e) => set("thumbnail", e.target.value)}
            placeholder="https://..."
            className={inputCls}
          />
        </div>
      </div>

      <div>
        <label className={labelCls}>요약</label>
        <textarea
          value={f.summary}
          onChange={(e) => set("summary", e.target.value)}
          placeholder="글 목록에 표시될 짧은 요약"
          rows={2}
          className={`${inputCls} resize-none`}
        />
      </div>

      <div>
        <label className={labelCls}>본문</label>
        <textarea
          value={f.content}
          onChange={(e) => set("content", e.target.value)}
          placeholder="글 본문을 입력하세요"
          rows={12}
          className={`${inputCls} resize-y leading-relaxed`}
        />
      </div>

      <label className="flex items-center gap-2 cursor-pointer select-none">
        <div
          onClick={() => set("published", !f.published)}
          className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${
            f.published ? "bg-[#E8292E] border-[#E8292E]" : "border-gray-300 dark:border-[#4B5563]"
          }`}
        >
          {f.published && <Check size={11} className="text-white" strokeWidth={3} />}
        </div>
        <span className="text-xs font-semibold text-gray-700 dark:text-[#9CA3AF]">바로 공개</span>
      </label>

      <div className="flex gap-2 pt-1">
        <button
          onClick={onCancel}
          disabled={isPending}
          className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 dark:text-[#9CA3AF] border border-gray-200 dark:border-[#374151] px-4 py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-[#1F2937] transition-colors disabled:opacity-50"
        >
          <X size={13} /> 취소
        </button>
        <button
          onClick={() => onSubmit(f)}
          disabled={isPending || !f.title.trim() || !f.slug.trim()}
          className="flex items-center gap-1.5 text-xs font-semibold text-white bg-[#111111] px-4 py-2 rounded-xl hover:bg-[#333] transition-colors disabled:opacity-40"
        >
          <Check size={13} /> {isPending ? "저장 중..." : "저장"}
        </button>
      </div>
    </div>
  );
}

// ─── Delete Confirm ───────────────────────────────────────────────────────────

function DeleteConfirm({ title, onConfirm, onCancel, isPending }: {
  title: string;
  onConfirm: () => void;
  onCancel: () => void;
  isPending: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="bg-white dark:bg-[#1F2937] rounded-2xl shadow-xl p-6 w-full max-w-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center shrink-0">
            <Trash2 size={18} className="text-[#E8292E]" />
          </div>
          <div>
            <p className="text-sm font-bold text-[#111111] dark:text-[#F9FAFB]">글 삭제</p>
            <p className="text-xs text-gray-400 dark:text-[#6B7280] mt-0.5">이 작업은 되돌릴 수 없습니다</p>
          </div>
        </div>
        <p className="text-sm text-gray-700 dark:text-[#9CA3AF] mb-6">
          <span className="font-semibold text-[#111111] dark:text-[#F9FAFB]">"{title}"</span>을(를) 삭제하시겠습니까?
        </p>
        <div className="flex gap-2">
          <button onClick={onCancel} disabled={isPending}
            className="flex-1 text-sm font-semibold text-gray-700 dark:text-[#9CA3AF] border border-gray-200 dark:border-[#374151] py-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-[#374151] transition-colors disabled:opacity-50">
            취소
          </button>
          <button onClick={onConfirm} disabled={isPending}
            className="flex-1 text-sm font-semibold text-white bg-[#E8292E] py-2.5 rounded-xl hover:bg-[#c9191e] transition-colors disabled:opacity-50">
            {isPending ? "삭제 중..." : "삭제"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function BlogTab({ initialPosts }: { initialPosts: PostRow[] }) {
  const [posts, setPosts] = useState(initialPosts);
  const [formMode, setFormMode] = useState<"none" | "create" | "edit">("none");
  const [editTarget, setEditTarget] = useState<PostRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<PostRow | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [, startTransition] = useTransition();

  function closeForm() {
    setFormMode("none");
    setEditTarget(null);
  }

  async function handleCreate(data: FormData) {
    setIsPending(true);
    const result = await createPost(data);
    if (!result.error) {
      const newPost: PostRow = {
        id: `temp-${Date.now()}`,
        ...data,
        thumbnail: data.thumbnail || null,
        created_at: new Date().toISOString(),
      };
      setPosts((prev) => [newPost, ...prev]);
      closeForm();
    }
    setIsPending(false);
  }

  async function handleUpdate(data: FormData) {
    if (!editTarget) return;
    setIsPending(true);
    const result = await updatePost(editTarget.id, data);
    if (!result.error) {
      setPosts((prev) =>
        prev.map((p) => p.id === editTarget.id
          ? { ...p, ...data, thumbnail: data.thumbnail || null }
          : p
        )
      );
      closeForm();
    }
    setIsPending(false);
  }

  async function handleDelete(post: PostRow) {
    setIsPending(true);
    const result = await deletePost(post.id);
    if (!result.error) {
      setPosts((prev) => prev.filter((p) => p.id !== post.id));
    }
    setIsPending(false);
    setDeleteTarget(null);
  }

  function handleTogglePublish(post: PostRow) {
    startTransition(async () => {
      const result = await togglePublish(post.id, post.published);
      if (!result.error) {
        setPosts((prev) =>
          prev.map((p) => p.id === post.id ? { ...p, published: !p.published } : p)
        );
      }
    });
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-[#111111] dark:text-[#F9FAFB]">블로그 관리</p>
            <p className="text-xs text-gray-400 dark:text-[#6B7280] mt-0.5">{posts.length}개</p>
          </div>
          {formMode === "none" && (
            <button
              onClick={() => { setEditTarget(null); setFormMode("create"); }}
              className="flex items-center gap-1.5 text-xs font-semibold text-white bg-[#111111] px-4 py-2 rounded-xl hover:bg-[#333] transition-colors"
            >
              <Plus size={13} /> 새 글 작성
            </button>
          )}
        </div>

        {formMode === "create" && (
          <PostForm onSubmit={handleCreate} onCancel={closeForm} isPending={isPending} />
        )}
        {formMode === "edit" && editTarget && (
          <PostForm initial={editTarget} onSubmit={handleUpdate} onCancel={closeForm} isPending={isPending} />
        )}

        <div className="bg-white dark:bg-[#1F2937] rounded-2xl border border-gray-100 dark:border-[#374151] shadow-sm overflow-hidden">
          {/* 데스크탑 */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-gray-50 dark:bg-[#374151] border-b border-gray-100 dark:border-[#4B5563]">
                <tr>
                  {["제목", "카테고리", "공개여부", "등록일", "관리"].map((h) => (
                    <th key={h} className="text-left px-5 py-3 font-semibold text-gray-700 dark:text-[#9CA3AF]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-[#374151]">
                {posts.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50/50 dark:hover:bg-[#374151]/50 transition-colors">
                    <td className="px-5 py-3">
                      <p className="font-semibold text-[#111111] dark:text-[#F9FAFB] truncate max-w-xs">{p.title}</p>
                      <p className="text-gray-400 dark:text-[#6B7280] text-[10px] mt-0.5">/blog/{p.slug}</p>
                    </td>
                    <td className="px-5 py-3">
                      {p.category ? (
                        <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-gray-100 dark:bg-[#374151] text-gray-700 dark:text-[#9CA3AF]">
                          {p.category}
                        </span>
                      ) : <span className="text-gray-300 dark:text-[#4B5563]">-</span>}
                    </td>
                    <td className="px-5 py-3">
                      <button
                        onClick={() => handleTogglePublish(p)}
                        className={`flex items-center gap-1 text-[10px] font-semibold px-2.5 py-1 rounded-full border transition-colors ${
                          p.published
                            ? "bg-green-50 text-green-600 border-green-200 hover:bg-green-100"
                            : "bg-gray-100 text-gray-500 border-gray-200 hover:bg-gray-200"
                        }`}
                      >
                        {p.published ? <><Eye size={9} /> 공개</> : <><EyeOff size={9} /> 비공개</>}
                      </button>
                    </td>
                    <td className="px-5 py-3 text-gray-700 dark:text-[#9CA3AF]">{fmt(p.created_at)}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => { setEditTarget(p); setFormMode("edit"); }}
                          className="p-1.5 rounded-lg text-blue-500 hover:bg-blue-50 transition-colors"
                          title="수정"
                        >
                          <Pencil size={13} />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(p)}
                          className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                          title="삭제"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {posts.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-5 py-12 text-center text-gray-400">
                      작성된 글이 없습니다
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* 모바일 */}
          <div className="md:hidden divide-y divide-gray-50 dark:divide-[#374151]">
            {posts.map((p) => (
              <div key={p.id} className="px-4 py-4 flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-[#111111] dark:text-[#F9FAFB] truncate mb-0.5">{p.title}</p>
                  <p className="text-[11px] text-gray-400 dark:text-[#6B7280] truncate">/blog/{p.slug}</p>
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    {p.category && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 dark:bg-[#374151] text-gray-700 dark:text-[#9CA3AF]">{p.category}</span>
                    )}
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${p.published ? "bg-green-50 text-green-600" : "bg-gray-100 dark:bg-[#374151] text-gray-700 dark:text-[#9CA3AF]"}`}>
                      {p.published ? "공개" : "비공개"}
                    </span>
                    <span className="text-[10px] text-gray-400 dark:text-[#6B7280]">{fmt(p.created_at)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => { setEditTarget(p); setFormMode("edit"); }}
                    className="p-1.5 rounded-lg text-blue-500 hover:bg-blue-50 transition-colors">
                    <Pencil size={13} />
                  </button>
                  <button onClick={() => setDeleteTarget(p)}
                    className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
            {posts.length === 0 && (
              <p className="px-5 py-10 text-center text-xs text-gray-400">작성된 글이 없습니다</p>
            )}
          </div>
        </div>
      </div>

      {deleteTarget && (
        <DeleteConfirm
          title={deleteTarget.title}
          onConfirm={() => handleDelete(deleteTarget)}
          onCancel={() => setDeleteTarget(null)}
          isPending={isPending}
        />
      )}
    </>
  );
}
