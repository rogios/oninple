import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";

export async function POST(req: NextRequest) {
  const { slug } = await req.json();
  if (!slug || typeof slug !== "string") {
    return NextResponse.json({ error: "slug is required" }, { status: 400 });
  }

  const supabase = createServiceClient();
  const { data: post } = await supabase
    .from("posts")
    .select("share_count")
    .eq("slug", slug)
    .single();

  if (!post) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  await supabase
    .from("posts")
    .update({ share_count: (post.share_count ?? 0) + 1 })
    .eq("slug", slug);

  return NextResponse.json({ ok: true });
}
