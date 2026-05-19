"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateRole } from "@/app/actions/profile";

const ROLES = [
  {
    value: "influencer",
    label: "인플루언서",
    desc: "유튜브·인스타그램·틱톡 크리에이터",
    icon: "🎬",
    disabled: false,
  },
  {
    value: "editor",
    label: "편집 프로듀서",
    desc: "AI 영상편집·모션그래픽 전문가",
    icon: "✂️",
    disabled: false,
  },
  {
    value: "advertiser",
    label: "광고주",
    desc: "브랜드·마케터·대행사",
    icon: "📢",
    disabled: true,
    badge: "오픈 예정",
  },
];

export default function RoleSelectForm() {
  const [selected, setSelected] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit() {
    if (!selected) return;
    setSubmitting(true);
    setError(null);

    const result = await updateRole(selected);
    if (result.error) {
      setError(result.error);
      setSubmitting(false);
    } else {
      router.push("/mypage");
    }
  }

  return (
    <div className="w-full max-w-lg mx-auto">
      <div className="text-center mb-10">
        <span className="text-2xl font-black text-[#E8292E]">ONINPLE</span>
        <h1 className="text-2xl font-bold text-[#111111] dark:text-[#F9FAFB] mt-4 mb-2">
          어떤 역할로 이용하시나요?
        </h1>
        <p className="text-sm text-gray-700 dark:text-[#9CA3AF]">
          이후 마이페이지에서 언제든 변경할 수 있어요
        </p>
      </div>

      <div className="flex flex-col gap-3 mb-8">
        {ROLES.map((role) => (
          <button
            key={role.value}
            type="button"
            disabled={role.disabled}
            onClick={() => !role.disabled && setSelected(role.value)}
            className={[
              "relative flex items-center gap-4 p-5 rounded-2xl border-2 text-left transition-all",
              role.disabled
                ? "border-gray-100 dark:border-[#374151] bg-gray-50 dark:bg-[#374151] cursor-not-allowed opacity-60"
                : selected === role.value
                ? "border-[#E8292E] bg-[#E8292E]/4 shadow-sm"
                : "border-gray-200 dark:border-[#374151] hover:border-gray-300 dark:hover:border-[#4B5563] bg-white dark:bg-[#1F2937] cursor-pointer",
            ].join(" ")}
          >
            <span className="text-3xl shrink-0">{role.icon}</span>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-base font-bold text-[#111111] dark:text-[#F9FAFB]">
                  {role.label}
                </span>
                {role.badge && (
                  <span className="text-xs font-semibold bg-gray-100 dark:bg-[#374151] text-gray-700 dark:text-[#9CA3AF] px-2 py-0.5 rounded-full">
                    {role.badge}
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-400 dark:text-[#6B7280] mt-0.5">{role.desc}</p>
            </div>
            {/* 선택 표시 */}
            <div
              className={[
                "w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center transition-colors",
                selected === role.value
                  ? "border-[#E8292E] bg-[#E8292E]"
                  : "border-gray-300 dark:border-[#4B5563]",
              ].join(" ")}
            >
              {selected === role.value && (
                <div className="w-2 h-2 rounded-full bg-white" />
              )}
            </div>
          </button>
        ))}
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl mb-4">
          {error}
        </div>
      )}

      <button
        type="button"
        onClick={handleSubmit}
        disabled={!selected || submitting}
        className="w-full bg-[#E8292E] hover:bg-[#c9191e] disabled:opacity-50 text-white font-bold py-3 rounded-full text-sm transition-colors"
      >
        {submitting ? "저장 중..." : "선택 완료"}
      </button>
    </div>
  );
}
