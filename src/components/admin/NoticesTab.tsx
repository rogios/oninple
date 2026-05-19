"use client";

import { useState, useTransition } from "react";
import { Pin, PinOff, Pencil, Trash2, Plus, X, Check } from "lucide-react";
import { createNotice, updateNotice, deleteNotice, togglePin } from "@/app/actions/notices";

// ─── Type (exported for admin/page.tsx) ──────────────────────────────────────

export type NoticeRow = {
  id: string;
  title: string;
  content: string;
  is_pinned: boolean;
  created_at: string;
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmt(d: string) {
  return new Date(d).toLocaleDateString("ko-KR", { year: "2-digit", month: "2-digit", day: "2-digit" });
}

// ─── Notice Form ──────────────────────────────────────────────────────────────

function NoticeForm({
  initial,
  onSubmit,
  onCancel,
  isPending,
}: {
  initial?: NoticeRow;
  onSubmit: (title: string, content: string, is_pinned: boolean) => void;
  onCancel: () => void;
  isPending: boolean;
}) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [content, setContent] = useState(initial?.content ?? "");
  const [isPinned, setIsPinned] = useState(initial?.is_pinned ?? false);

  return (
    <div className="bg-gray-50 dark:bg-[#374151] border border-gray-200 dark:border-[#4B5563] rounded-2xl p-5 space-y-4">
      <p className="text-sm font-bold text-[#111111] dark:text-[#F9FAFB]">
        {initial ? "공지사항 수정" : "새 공지사항 작성"}
      </p>

      <div>
        <label className="text-xs font-semibold text-gray-700 dark:text-[#9CA3AF] block mb-1.5">제목</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="공지 제목을 입력하세요"
          className="w-full text-sm border border-gray-200 dark:border-[#374151] rounded-xl px-4 py-2.5 focus:outline-none focus:border-gray-400 dark:focus:border-[#9CA3AF] bg-white dark:bg-[#1F2937] text-[#111111] dark:text-[#F9FAFB] placeholder:text-gray-300 dark:placeholder:text-[#6B7280]"
        />
      </div>

      <div>
        <label className="text-xs font-semibold text-gray-700 dark:text-[#9CA3AF] block mb-1.5">내용</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="공지 내용을 입력하세요"
          rows={6}
          className="w-full text-sm border border-gray-200 dark:border-[#374151] rounded-xl px-4 py-2.5 focus:outline-none focus:border-gray-400 dark:focus:border-[#9CA3AF] bg-white dark:bg-[#1F2937] text-[#111111] dark:text-[#F9FAFB] placeholder:text-gray-300 dark:placeholder:text-[#6B7280] resize-none leading-relaxed"
        />
      </div>

      <label className="flex items-center gap-2 cursor-pointer select-none">
        <div
          onClick={() => setIsPinned((v) => !v)}
          className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${
            isPinned ? "bg-[#E8292E] border-[#E8292E]" : "border-gray-300 dark:border-[#4B5563]"
          }`}
        >
          {isPinned && <Check size={11} className="text-white" strokeWidth={3} />}
        </div>
        <span className="text-xs font-semibold text-gray-700 dark:text-[#9CA3AF]">상단 고정</span>
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
          onClick={() => onSubmit(title, content, isPinned)}
          disabled={isPending || !title.trim() || !content.trim()}
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
            <p className="text-sm font-bold text-[#111111] dark:text-[#F9FAFB]">공지사항 삭제</p>
            <p className="text-xs text-gray-400 dark:text-[#6B7280] mt-0.5">이 작업은 되돌릴 수 없습니다</p>
          </div>
        </div>
        <p className="text-sm text-gray-700 dark:text-[#9CA3AF] mb-6">
          <span className="font-semibold text-[#111111] dark:text-[#F9FAFB]">"{title}"</span> 을(를) 삭제하시겠습니까?
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

export default function NoticesTab({ initialNotices }: { initialNotices: NoticeRow[] }) {
  const [notices, setNotices] = useState(initialNotices);
  const [formMode, setFormMode] = useState<"none" | "create" | "edit">("none");
  const [editTarget, setEditTarget] = useState<NoticeRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<NoticeRow | null>(null);
  const [, startTransition] = useTransition();
  const [isPending, setIsPending] = useState(false);

  function openCreate() {
    setEditTarget(null);
    setFormMode("create");
  }

  function openEdit(notice: NoticeRow) {
    setEditTarget(notice);
    setFormMode("edit");
  }

  function closeForm() {
    setFormMode("none");
    setEditTarget(null);
  }

  async function handleCreate(title: string, content: string, is_pinned: boolean) {
    setIsPending(true);
    const result = await createNotice(title, content, is_pinned);
    if (!result.error) {
      const newNotice: NoticeRow = {
        id: `temp-${Date.now()}`,
        title, content, is_pinned,
        created_at: new Date().toISOString(),
      };
      setNotices((prev) => [newNotice, ...prev]);
      closeForm();
    }
    setIsPending(false);
  }

  async function handleUpdate(title: string, content: string, is_pinned: boolean) {
    if (!editTarget) return;
    setIsPending(true);
    const result = await updateNotice(editTarget.id, title, content, is_pinned);
    if (!result.error) {
      setNotices((prev) =>
        prev.map((n) => n.id === editTarget.id ? { ...n, title, content, is_pinned } : n)
      );
      closeForm();
    }
    setIsPending(false);
  }

  async function handleDelete(notice: NoticeRow) {
    setIsPending(true);
    const result = await deleteNotice(notice.id);
    if (!result.error) {
      setNotices((prev) => prev.filter((n) => n.id !== notice.id));
    }
    setIsPending(false);
    setDeleteTarget(null);
  }

  async function handleTogglePin(notice: NoticeRow) {
    startTransition(async () => {
      const result = await togglePin(notice.id, notice.is_pinned);
      if (!result.error) {
        setNotices((prev) =>
          prev.map((n) => n.id === notice.id ? { ...n, is_pinned: !n.is_pinned } : n)
        );
      }
    });
  }

  const sorted = [...notices].sort((a, b) => {
    if (a.is_pinned !== b.is_pinned) return a.is_pinned ? -1 : 1;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  return (
    <>
      <div className="space-y-4">
        {/* 헤더 */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-[#111111] dark:text-[#F9FAFB]">공지사항 관리</p>
            <p className="text-xs text-gray-400 dark:text-[#6B7280] mt-0.5">{notices.length}개</p>
          </div>
          {formMode === "none" && (
            <button
              onClick={openCreate}
              className="flex items-center gap-1.5 text-xs font-semibold text-white bg-[#111111] px-4 py-2 rounded-xl hover:bg-[#333] transition-colors"
            >
              <Plus size={13} /> 새 공지 작성
            </button>
          )}
        </div>

        {/* 작성/수정 폼 */}
        {formMode === "create" && (
          <NoticeForm
            onSubmit={handleCreate}
            onCancel={closeForm}
            isPending={isPending}
          />
        )}
        {formMode === "edit" && editTarget && (
          <NoticeForm
            initial={editTarget}
            onSubmit={handleUpdate}
            onCancel={closeForm}
            isPending={isPending}
          />
        )}

        {/* 테이블 */}
        <div className="bg-white dark:bg-[#1F2937] rounded-2xl border border-gray-100 dark:border-[#374151] shadow-sm overflow-hidden">
          {/* 데스크탑 */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-gray-50 dark:bg-[#374151] border-b border-gray-100 dark:border-[#4B5563]">
                <tr>
                  {["제목", "등록일", "상단고정", "관리"].map((h) => (
                    <th key={h} className={`text-left px-5 py-3 font-semibold text-gray-700 dark:text-[#9CA3AF] ${h === "관리" ? "w-28" : ""}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-[#374151]">
                {sorted.map((n) => (
                  <tr key={n.id} className="hover:bg-gray-50/50 dark:hover:bg-[#374151]/50 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        {n.is_pinned && <Pin size={11} className="text-[#E8292E] shrink-0" />}
                        <span className="font-semibold text-[#111111] dark:text-[#F9FAFB] truncate max-w-xs">{n.title}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-gray-700 dark:text-[#9CA3AF]">{fmt(n.created_at)}</td>
                    <td className="px-5 py-3">
                      <button
                        onClick={() => handleTogglePin(n)}
                        className={`flex items-center gap-1 text-[10px] font-semibold px-2.5 py-1 rounded-full border transition-colors ${
                          n.is_pinned
                            ? "bg-[#E8292E]/10 text-[#E8292E] border-[#E8292E]/20 hover:bg-[#E8292E]/20"
                            : "bg-gray-100 text-gray-500 border-gray-200 hover:bg-gray-200"
                        }`}
                      >
                        {n.is_pinned ? <><Pin size={9} /> 고정됨</> : <><PinOff size={9} /> 고정 해제</>}
                      </button>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEdit(n)}
                          className="p-1.5 rounded-lg text-blue-500 hover:bg-blue-50 transition-colors"
                          title="수정"
                        >
                          <Pencil size={13} />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(n)}
                          className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                          title="삭제"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {sorted.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-5 py-12 text-center text-gray-400">
                      공지사항이 없습니다
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* 모바일 */}
          <div className="md:hidden divide-y divide-gray-50 dark:divide-[#374151]">
            {sorted.map((n) => (
              <div key={n.id} className="px-4 py-4 flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    {n.is_pinned && <Pin size={10} className="text-[#E8292E] shrink-0" />}
                    <p className="text-xs font-bold text-[#111111] dark:text-[#F9FAFB] truncate">{n.title}</p>
                  </div>
                  <p className="text-[11px] text-gray-400 dark:text-[#6B7280]">{fmt(n.created_at)}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => handleTogglePin(n)}
                    className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                    {n.is_pinned ? <Pin size={13} className="text-[#E8292E]" /> : <PinOff size={13} className="text-gray-400" />}
                  </button>
                  <button onClick={() => openEdit(n)}
                    className="p-1.5 rounded-lg text-blue-500 hover:bg-blue-50 transition-colors">
                    <Pencil size={13} />
                  </button>
                  <button onClick={() => setDeleteTarget(n)}
                    className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
            {sorted.length === 0 && (
              <p className="px-5 py-10 text-center text-xs text-gray-400">공지사항이 없습니다</p>
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
