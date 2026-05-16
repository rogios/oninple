import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      // profiles 테이블에서 role_selected 확인
      const { data: profile } = await supabase
        .from("profiles")
        .select("role_selected")
        .eq("id", data.user.id)
        .single();

      if (!profile?.role_selected) {
        return NextResponse.redirect(`${origin}/role-select`);
      }

      return NextResponse.redirect(`${origin}/mypage`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=callback`);
}
