"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type ChannelInput = {
  platform: "youtube" | "instagram" | "tiktok" | "editor";
  // 공통
  channel_name: string;
  follower_count: number | null;
  categories: string[];
  bio: string;
  profile_image_url: string;
  kakao_open_chat: string;
  avg_views: number | null;
  upload_frequency: string;
  content_format: string;
  can_collaborate: boolean;
  audience_age: string[];
  audience_gender: string;
  content_keywords: string[];
  // YouTube 전용
  channel_url: string;
  video_url_1: string;
  video_url_2: string;
  // Instagram/TikTok 전용
  feed_thumbnail_1: string;
  feed_url_1: string;
  feed_thumbnail_2: string;
  feed_url_2: string;
  // 편집프로듀서 전용
  ai_tools: string[];
  work_fields: string[];
  portfolio_url: string;
};

export async function saveChannel(
  data: ChannelInput
): Promise<{ success?: boolean; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    console.error("[saveChannel] user is null — 인증 세션 없음");
    return { error: "로그인이 필요합니다." };
  }

  console.log("[saveChannel] user.id:", user.id, "| platform:", data.platform);

  const { error } = await supabase.from("channels").insert({
    user_id: user.id,
    ...data,
  });

  if (error) {
    console.error("[saveChannel] insert error:", {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint,
    });
    return { error: `저장에 실패했습니다: ${error.message}` };
  }

  revalidatePath("/mypage");
  return { success: true };
}

export async function updateChannel(
  id: string,
  data: ChannelInput
): Promise<{ success?: boolean; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "로그인이 필요합니다." };

  const { error } = await supabase
    .from("channels")
    .update({ ...data })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    console.error("[updateChannel] error:", { message: error.message, code: error.code });
    return { error: `수정에 실패했습니다: ${error.message}` };
  }

  revalidatePath("/mypage");
  return { success: true };
}

export async function deleteChannel(
  id: string
): Promise<{ success?: boolean; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "로그인이 필요합니다." };

  const { error } = await supabase
    .from("channels")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id); // 본인 채널만 삭제

  if (error) {
    console.error("[deleteChannel] error:", error.message);
    return { error: error.message };
  }

  revalidatePath("/mypage");
  return { success: true };
}
