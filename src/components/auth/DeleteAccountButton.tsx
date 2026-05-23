"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function DeleteAccountButton() {
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleConfirm() {
    setLoading(true);
    setError(null);

    const res = await fetch("/api/auth/delete-account", { method: "DELETE" });
    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? "탈퇴 처리 중 오류가 발생했습니다.");
      setLoading(false);
      return;
    }

    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setShowModal(true)}
        className="text-sm text-red-400 hover:text-red-600 transition-colors"
      >
        회원탈퇴
      </button>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-[#1F2937] rounded-2xl p-6 w-80 shadow-xl">
            <h3 className="text-base font-bold text-[#111111] dark:text-[#F9FAFB] mb-2">회원 탈퇴</h3>
            <p className="text-sm text-gray-500 dark:text-[#9CA3AF] mb-5">
              탈퇴 시 모든 데이터가 영구적으로 삭제되며 복구할 수 없습니다.
            </p>
            {error && (
              <p className="text-xs text-red-500 mb-3">{error}</p>
            )}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => { setShowModal(false); setError(null); }}
                disabled={loading}
                className="flex-1 py-2.5 rounded-full border border-gray-200 dark:border-[#374151] text-sm font-medium text-gray-700 dark:text-[#9CA3AF] hover:bg-gray-50 dark:hover:bg-[#374151] transition-colors disabled:opacity-50"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={loading}
                className="flex-1 py-2.5 rounded-full bg-red-500 hover:bg-red-600 disabled:opacity-60 text-white text-sm font-bold transition-colors"
              >
                {loading ? "처리 중..." : "탈퇴하기"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
