"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { trackPageView } from "@/app/actions/pageview";

const COOLDOWN_MS = 3 * 60 * 60 * 1000; // 3시간

export default function PageViewTracker() {
  const pathname = usePathname();
  useEffect(() => {
    const key = `pv_last_${pathname}`;
    const last = localStorage.getItem(key);
    const now = Date.now();
    if (last && now - Number(last) < COOLDOWN_MS) return;
    localStorage.setItem(key, String(now));
    trackPageView(pathname);
  }, [pathname]);
  return null;
}
