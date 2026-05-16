"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

async function assertAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  return profile?.role === "admin";
}

export async function createNotice(
  title: string,
  content: string,
  is_pinned: boolean
): Promise<{ error?: string }> {
  if (!(await assertAdmin())) return { error: "권한 없음" };

  const service = createServiceClient();
  const { error } = await service.from("notices").insert({ title, content, is_pinned });
  if (error) return { error: error.message };

  revalidatePath("/admin");
  revalidatePath("/notices");
  return {};
}

export async function updateNotice(
  id: string,
  title: string,
  content: string,
  is_pinned: boolean
): Promise<{ error?: string }> {
  if (!(await assertAdmin())) return { error: "권한 없음" };

  const service = createServiceClient();
  const { error } = await service.from("notices").update({ title, content, is_pinned }).eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/admin");
  revalidatePath("/notices");
  revalidatePath(`/notices/${id}`);
  return {};
}

export async function deleteNotice(id: string): Promise<{ error?: string }> {
  if (!(await assertAdmin())) return { error: "권한 없음" };

  const service = createServiceClient();
  const { error } = await service.from("notices").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/admin");
  revalidatePath("/notices");
  return {};
}

export async function togglePin(id: string, current: boolean): Promise<{ error?: string }> {
  if (!(await assertAdmin())) return { error: "권한 없음" };

  const service = createServiceClient();
  const { error } = await service.from("notices").update({ is_pinned: !current }).eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/admin");
  revalidatePath("/notices");
  return {};
}
