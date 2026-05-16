"use client";

import { useState } from "react";
import { deleteAccount } from "@/app/actions/auth";

export default function DeleteAccountButton() {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    if (!window.confirm("정말 탈퇴하시겠습니까? 모든 데이터가 삭제됩니다.")) return;
    setLoading(true);
    const result = await deleteAccount();
    if (result?.error) {
      alert(`탈퇴 실패: ${result.error}`);
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className="text-sm text-red-400 hover:text-red-600 transition-colors disabled:opacity-50"
    >
      {loading ? "처리 중..." : "회원탈퇴"}
    </button>
  );
}
