"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

async function assertAdmin(): Promise<boolean> {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return false;
    // profiles 조회는 service 클라이언트로 RLS 우회 (anon key로는 RLS에 막힐 수 있음)
    const service = createServiceClient();
    const { data: profile } = await service.from("profiles").select("role").eq("id", user.id).single();
    return profile?.role === "admin";
  } catch {
    return false;
  }
}

function revalidateBlog(slug?: string) {
  revalidatePath("/admin");
  revalidatePath("/blog");
  if (slug) revalidatePath(`/blog/${slug}`);
}

export async function createPost(data: {
  title: string;
  content: string;
  thumbnail: string;
  summary: string;
  category: string;
  slug: string;
  published: boolean;
}): Promise<{ error?: string }> {
  if (!(await assertAdmin())) return { error: "권한 없음" };
  const service = createServiceClient();
  const { error } = await service.from("posts").insert(data);
  if (error) return { error: error.message };
  revalidateBlog(data.slug);
  return {};
}

export async function updatePost(
  id: string,
  data: {
    title: string;
    content: string;
    thumbnail: string;
    summary: string;
    category: string;
    slug: string;
    published: boolean;
  }
): Promise<{ error?: string }> {
  if (!(await assertAdmin())) return { error: "권한 없음" };
  const service = createServiceClient();
  const { error } = await service.from("posts").update(data).eq("id", id);
  if (error) return { error: error.message };
  revalidateBlog(data.slug);
  return {};
}

export async function deletePost(id: string): Promise<{ error?: string }> {
  if (!(await assertAdmin())) return { error: "권한 없음" };
  const service = createServiceClient();
  const { error } = await service.from("posts").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidateBlog();
  return {};
}

export async function togglePublish(id: string, current: boolean): Promise<{ error?: string }> {
  if (!(await assertAdmin())) return { error: "권한 없음" };
  const service = createServiceClient();
  const { error } = await service.from("posts").update({ published: !current }).eq("id", id);
  if (error) return { error: error.message };
  revalidateBlog();
  return {};
}
