"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { trackPageView } from "@/app/actions/pageview";

const COOLDOWN_MS = 3 * 60 * 60 * 1000;

function getDeviceType(): "mobile" | "tablet" | "desktop" {
  const ua = navigator.userAgent;
  if (/tablet|ipad|playbook|silk/i.test(ua)) return "tablet";
  if (/mobile|iphone|ipod|android|blackberry|opera mini|windows ce|palm|smartphone|iemobile/i.test(ua))
    return "mobile";
  return "desktop";
}

export default function PageViewTracker() {
  const pathname = usePathname();
  useEffect(() => {
    const key = `pv_last_${pathname}`;
    const last = localStorage.getItem(key);
    const now = Date.now();
    if (last && now - Number(last) < COOLDOWN_MS) return;
    localStorage.setItem(key, String(now));
    trackPageView(pathname, document.referrer, pathname, getDeviceType());
  }, [pathname]);
  return null;
}
