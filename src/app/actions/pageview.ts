"use server";

import { createClient } from "@/lib/supabase/server";

export async function trackPageView(page: string = "/") {
  try {
    const supabase = await createClient();
    const { error } = await supabase.from("page_views").insert({ page });
    if (error) console.error("[pageview]", error.message, error.code);
  } catch {
    // 추적 실패는 무시
  }
}
