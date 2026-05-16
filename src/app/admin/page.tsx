import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { redirect } from "next/navigation";
import AdminDashboard from "@/components/admin/AdminDashboard";
import type { DashboardStats, MemberRow, AdminChannelRow } from "@/components/admin/AdminDashboard";
import type { NoticeRow } from "@/components/admin/NoticesTab";
import type { PostRow } from "@/components/admin/BlogTab";

export default async function AdminPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") redirect("/");

  // RLS를 우회해 전체 데이터를 읽기 위해 service client 사용
  const service = createServiceClient();

  // ─ 날짜
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayISO = todayStart.toISOString();

  // ─ 병렬 쿼리
  const [
    { count: totalMembers },
    { count: todayMembers },
    { count: totalChannels },
    { count: todayViews },
    { count: totalViews },
    { data: platformRaw },
    { data: recentMembers },
    { data: recentChannels },
    { data: allMembers },
    { data: allChannels },
    { data: allNotices },
    { data: allPosts },
  ] = await Promise.all([
    service.from("profiles").select("*", { count: "exact", head: true }),
    service.from("profiles").select("*", { count: "exact", head: true }).gte("created_at", todayISO),
    supabase.from("channels").select("*", { count: "exact", head: true }),
    supabase.from("page_views").select("*", { count: "exact", head: true }).gte("created_at", todayISO),
    supabase.from("page_views").select("*", { count: "exact", head: true }),
    supabase.from("channels").select("platform"),
    service.from("profiles").select("id, email, name, role, created_at").order("created_at", { ascending: false }).limit(10),
    supabase.from("channels").select("id, channel_name, platform, follower_count, created_at").order("created_at", { ascending: false }).limit(10),
    service.from("profiles").select("id, email, name, role, created_at, warning_count").order("created_at", { ascending: false }),
    service.from("channels").select("id, user_id, channel_name, platform, is_verified"),
    service.from("notices").select("id, title, content, is_pinned, created_at").order("created_at", { ascending: false }),
    service.from("posts").select("id, title, content, thumbnail, summary, category, slug, published, created_at").order("created_at", { ascending: false }),
  ]);

  // 플랫폼별 집계
  const platformMap: Record<string, number> = { youtube: 0, instagram: 0, tiktok: 0, editor: 0 };
  for (const ch of platformRaw ?? []) {
    if (ch.platform in platformMap) platformMap[ch.platform]++;
  }

  // 유저별 채널 수 집계
  const channelCountMap: Record<string, number> = {};
  for (const ch of allChannels ?? []) {
    if (ch.user_id) channelCountMap[ch.user_id] = (channelCountMap[ch.user_id] ?? 0) + 1;
  }

  const stats: DashboardStats = {
    todayMembers: todayMembers ?? 0,
    totalMembers: totalMembers ?? 0,
    totalChannels: totalChannels ?? 0,
    todayViews: todayViews ?? 0,
    totalViews: totalViews ?? 0,
    platformMap,
    recentMembers: (recentMembers ?? []) as DashboardStats["recentMembers"],
    recentChannels: (recentChannels ?? []) as DashboardStats["recentChannels"],
  };

  const channels: AdminChannelRow[] = (allChannels ?? []).map((ch) => ({
    id: ch.id,
    user_id: ch.user_id,
    channel_name: ch.channel_name,
    platform: ch.platform,
    is_verified: ch.is_verified ?? false,
  }));

  const members: MemberRow[] = (allMembers ?? []).map((m) => ({
    id: m.id,
    email: m.email,
    name: m.name,
    role: m.role,
    created_at: m.created_at,
    warning_count: m.warning_count ?? 0,
    channel_count: channelCountMap[m.id] ?? 0,
  }));

  const notices: NoticeRow[] = (allNotices ?? []).map((n) => ({
    id: n.id,
    title: n.title,
    content: n.content,
    is_pinned: n.is_pinned,
    created_at: n.created_at,
  }));

  const posts: PostRow[] = (allPosts ?? []).map((p) => ({
    id: p.id,
    title: p.title,
    content: p.content,
    thumbnail: p.thumbnail ?? null,
    summary: p.summary,
    category: p.category,
    slug: p.slug,
    published: p.published,
    created_at: p.created_at,
  }));

  return (
    <AdminDashboard
      stats={stats}
      members={members}
      channels={channels}
      notices={notices}
      posts={posts}
      currentUserId={user.id}
      currentUserEmail={user.email ?? ""}
    />
  );
}
