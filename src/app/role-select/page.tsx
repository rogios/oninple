import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import RoleSelectForm from "@/components/auth/RoleSelectForm";

export const metadata = {
  title: "역할 선택 | ONINPLE",
};

export default async function RoleSelectPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // 이미 역할을 선택한 경우 마이페이지로
  const { data: profile } = await supabase
    .from("profiles")
    .select("role_selected")
    .eq("id", user.id)
    .single();

  if (profile?.role_selected) redirect("/mypage");

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
      <RoleSelectForm />
    </div>
  );
}
