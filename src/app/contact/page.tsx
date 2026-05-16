"use client";

import { useState } from "react";
import { CheckCircle, Send, AlertCircle } from "lucide-react";

const INQUIRY_TYPES = [
  "인플루언서 등록 문의",
  "광고주 문의",
  "편집자 문의",
  "기타",
];

type Status = "idle" | "submitting" | "success" | "error";

export default function ContactPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    type: "",
    message: "",
  });
  const [status, setStatus] = useState<Status>("idle");

  function set(key: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("submitting");

    try {
      const res = await fetch("https://formspree.io/f/mrejnokd", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          inquiryType: form.type,
          message: form.message,
        }),
      });

      if (res.ok) {
        setStatus("success");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  const inputCls =
    "w-full text-sm border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-[#111111] bg-white transition-colors placeholder:text-gray-300";
  const labelCls = "block text-xs font-semibold text-gray-600 mb-2";

  if (status === "success") {
    return (
      <div className="max-w-lg mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
        <div className="flex justify-center mb-5">
          <CheckCircle size={48} className="text-[#E8292E]" strokeWidth={1.5} />
        </div>
        <h2 className="text-xl font-black text-[#111111] mb-3">문의가 접수되었습니다</h2>
        <p className="text-sm text-gray-500 leading-relaxed">
          빠른 시일 내에 입력하신 이메일로 답변 드리겠습니다.<br />
          감사합니다.
        </p>
        <button
          onClick={() => { setForm({ name: "", email: "", type: "", message: "" }); setStatus("idle"); }}
          className="mt-8 text-xs font-semibold text-gray-500 border border-gray-200 hover:border-gray-300 px-5 py-2.5 rounded-full transition-colors"
        >
          새 문의 작성
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* 헤더 */}
      <div className="mb-10">
        <h1 className="text-2xl font-black text-[#111111]">문의하기</h1>
        <p className="text-sm text-gray-400 mt-1.5">
          궁금한 점이 있으시면 언제든지 문의해주세요. 빠르게 답변 드리겠습니다.
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8 space-y-5">

          {/* 이름 + 이메일 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className={labelCls}>
                이름 <span className="text-[#E8292E]">*</span>
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder="홍길동"
                required
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>
                이메일 <span className="text-[#E8292E]">*</span>
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                placeholder="example@email.com"
                required
                className={inputCls}
              />
            </div>
          </div>

          {/* 문의 유형 */}
          <div>
            <label className={labelCls}>문의 유형</label>
            <select
              value={form.type}
              onChange={(e) => set("type", e.target.value)}
              className={`${inputCls} appearance-none cursor-pointer`}
            >
              <option value="">선택해주세요</option>
              {INQUIRY_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          {/* 문의 내용 */}
          <div>
            <label className={labelCls}>
              문의 내용 <span className="text-[#E8292E]">*</span>
            </label>
            <textarea
              value={form.message}
              onChange={(e) => set("message", e.target.value)}
              placeholder="문의 내용을 자세히 입력해주세요."
              required
              rows={7}
              className={`${inputCls} resize-none leading-relaxed`}
            />
          </div>

          {/* 에러 메시지 */}
          {status === "error" && (
            <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
              <AlertCircle size={14} className="shrink-0" />
              전송 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.
            </div>
          )}

          {/* 제출 버튼 */}
          <button
            type="submit"
            disabled={status === "submitting" || !form.name.trim() || !form.email.trim() || !form.message.trim()}
            className="w-full flex items-center justify-center gap-2 bg-[#E8292E] hover:bg-[#c9191e] text-white text-sm font-semibold py-3.5 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {status === "submitting" ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                전송 중...
              </>
            ) : (
              <>
                <Send size={15} />
                문의 보내기
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
