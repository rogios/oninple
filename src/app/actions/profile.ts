"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function updateRole(
  role: string
): Promise<{ success?: boolean; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "로그인이 필요합니다." };

  const { error } = await supabase.from("profiles").upsert({
    id: user.id,
    name: user.user_metadata?.full_name ?? null,
    email: user.email ?? null,
    avatar_url: user.user_metadata?.avatar_url ?? null,
    role,
    role_selected: true,
    updated_at: new Date().toISOString(),
  });

  if (error) {
    console.error("profiles upsert error:", error);
    return { error: `저장에 실패했습니다: ${error.message}` };
  }

  revalidatePath("/", "layout");
  return { success: true };
}
