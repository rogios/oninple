"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

async function assertAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "인증 필요" as const, supabase: null };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") return { error: "권한 없음" as const, supabase: null };
  return { error: null, supabase };
}

export async function warnUser(targetId: string): Promise<{ error?: string }> {
  const { error, supabase } = await assertAdmin();
  if (error || !supabase) return { error };

  const { error: dbError } = await supabase.rpc("increment_warning", { uid: targetId });
  if (dbError) {
    // rpc 없으면 수동 increment
    const { data: current } = await supabase
      .from("profiles")
      .select("warning_count")
      .eq("id", targetId)
      .single();

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ warning_count: (current?.warning_count ?? 0) + 1 })
      .eq("id", targetId);

    if (updateError) return { error: updateError.message };
  }

  revalidatePath("/admin");
  return {};
}

export async function forceDeleteUser(targetId: string): Promise<{ error?: string }> {
  const { error } = await assertAdmin();
  if (error) return { error };

  const serviceClient = createServiceClient();
  const { error: deleteError } = await serviceClient.auth.admin.deleteUser(targetId);
  if (deleteError) return { error: deleteError.message };

  revalidatePath("/admin");
  return {};
}

export async function setChannelVerified(channelId: string, verified: boolean): Promise<{ error?: string }> {
  const { error } = await assertAdmin();
  if (error) return { error };

  const serviceClient = createServiceClient();
  const { error: updateError } = await serviceClient
    .from("channels")
    .update({ is_verified: verified })
    .eq("id", channelId);

  if (updateError) return { error: updateError.message };
  revalidatePath("/admin");
  return {};
}
