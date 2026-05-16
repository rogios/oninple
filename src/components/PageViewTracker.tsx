"use client";

import { useEffect } from "react";
import { trackPageView } from "@/app/actions/pageview";

export default function PageViewTracker({ page = "/" }: { page?: string }) {
  useEffect(() => {
    trackPageView(page);
  }, [page]);
  return null;
}
