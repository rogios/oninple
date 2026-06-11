"use client";

import { useEffect, useRef, useState } from "react";
import { Link2, Check } from "lucide-react";

export default function BlogPostActions({ slug }: { slug: string }) {
  const tracked = useRef(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (tracked.current) return;
    tracked.current = true;
    fetch("/api/blog/view", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug }),
    }).catch(() => {});
  }, [slug]);

  async function handleShare() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      fetch("/api/blog/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug }),
      }).catch(() => {});
    } catch {
      // fallback
    }
  }

  return (
    <div className="flex items-center gap-3 mt-10 pt-8 border-t border-gray-100 dark:border-[#374151]">
      <button
        onClick={handleShare}
        className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 dark:text-[#9CA3AF] border border-gray-200 dark:border-[#374151] px-4 py-2 rounded-xl hover:bg-gray-50 dark:hover:bg-[#374151] transition-colors"
      >
        {copied ? <Check size={13} className="text-green-500" /> : <Link2 size={13} />}
        {copied ? "복사되었습니다" : "링크 복사"}
      </button>
    </div>
  );
}
