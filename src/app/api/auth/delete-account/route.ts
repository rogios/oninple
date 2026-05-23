import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

export async function DELETE() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const serviceClient = createServiceClient();

  const { error: channelsError } = await serviceClient
    .from("channels")
    .delete()
    .eq("user_id", user.id);

  if (channelsError) {
    return NextResponse.json({ error: channelsError.message }, { status: 500 });
  }

  const { error: profilesError } = await serviceClient
    .from("profiles")
    .delete()
    .eq("id", user.id);

  if (profilesError) {
    return NextResponse.json({ error: profilesError.message }, { status: 500 });
  }

  const { error: authError } = await serviceClient.auth.admin.deleteUser(user.id);

  if (authError) {
    return NextResponse.json({ error: authError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
