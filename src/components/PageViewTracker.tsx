"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { trackPageView } from "@/app/actions/pageview";

export default function PageViewTracker() {
  const pathname = usePathname();
  useEffect(() => {
    trackPageView(pathname);
  }, [pathname]);
  return null;
}
