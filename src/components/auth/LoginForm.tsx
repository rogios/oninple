"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { signInWithGoogle } from "@/app/actions/auth";
import InAppBrowserNotice, {
  detectInAppPlatform,
  type InAppPlatform,
} from "./InAppBrowserNotice";

export default function LoginForm() {
  const [inAppPlatform, setInAppPlatform] = useState<InAppPlatform | null>(null);

  useEffect(() => {
    setInAppPlatform(detectInAppPlatform());
  }, []);

  if (inAppPlatform) {
    return <InAppBrowserNotice platform={inAppPlatform} />;
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-8">
        <Link href="/" className="inline-block mb-6">
          <span className="text-2xl font-black text-[#E8292E]">ONINPLE</span>
        </Link>
        <h1 className="text-2xl font-bold text-[#111111]">로그인</h1>
        <p className="text-sm text-gray-500 mt-1">구글 계정으로 로그인하세요</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
        <form action={signInWithGoogle}>
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-3 border border-gray-200 rounded-full py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 18 18">
              <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z" />
              <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2.04a4.8 4.8 0 0 1-7.18-2.54H1.83v2.07A8 8 0 0 0 8.98 17z" />
              <path fill="#FBBC05" d="M4.5 10.48A4.8 4.8 0 0 1 4.5 7.52V5.45H1.83a8 8 0 0 0 0 7.1z" />
              <path fill="#EA4335" d="M8.98 3.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 1.83 5.45L4.5 7.52c.56-1.67 2.11-4.34 4.48-4.34z" />
            </svg>
            Google로 계속하기
          </button>
        </form>
      </div>

      <p className="text-center text-sm text-gray-500 mt-6">
        계정이 없으신가요?{" "}
        <Link href="/signup" className="text-[#E8292E] font-semibold hover:underline">
          회원가입
        </Link>
      </p>
    </div>
  );
}
