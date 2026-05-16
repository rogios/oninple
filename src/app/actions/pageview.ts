"use server";

import { createClient } from "@/lib/supabase/server";

export async function trackPageView(page: string = "/") {
  try {
    const supabase = await createClient();
    await supabase.from("page_views").insert({ page });
  } catch {
    // 추적 실패는 무시
  }
}
