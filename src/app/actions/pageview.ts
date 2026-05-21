"use server";

import { createClient } from "@/lib/supabase/server";

export async function trackPageView(
  page: string = "/",
  referrer: string = "",
  page_path: string = "",
  device_type: string = "desktop"
) {
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("page_views")
      .insert({ page, referrer, page_path, device_type });
    if (error) console.error("[pageview]", error.message, error.code);
  } catch {
    // 추적 실패는 무시
  }
}
