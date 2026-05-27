import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { redirect } from "next/navigation";
import AdminDashboard from "@/components/admin/AdminDashboard";
import type { DashboardStats, MemberRow, AdminChannelRow } from "@/components/admin/AdminDashboard";
import type { NoticeRow } from "@/components/admin/NoticesTab";
import type { PostRow } from "@/components/admin/BlogTab";
import type { AnalyticsData, RawPageView } from "@/components/admin/AnalyticsTab";

// PostgREST 서버 max_rows=1000 한도를 페이지네이션으로 우회
async function fetchAllPageViews(
  service: ReturnType<typeof createServiceClient>,
  since: string
): Promise<RawPageView[]> {
  const PAGE = 1000;
  const all: RawPageView[] = [];
  let from = 0;
  while (true) {
    const { data, error } = await service
      .from("page_views")
      .select("created_at, referrer, page, page_path, device_type")
      .gte("created_at", since)
      .order("created_at", { ascending: true })
      .range(from, from + PAGE - 1);
    if (error || !data || data.length === 0) break;
    all.push(...(data as RawPageView[]));
    if (data.length < PAGE) break;  // 마지막 페이지
    from += PAGE;
  }
  return all;
}

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

  // ─ 날짜 (KST 00:00 기준 — KST = UTC+9, KST 자정 = UTC 전날 15:00:00)
  const KST_OFFSET = 9 * 60 * 60 * 1000;
  const nowKST = new Date(Date.now() + KST_OFFSET);
  const todayStart = new Date(
    Date.UTC(nowKST.getUTCFullYear(), nowKST.getUTCMonth(), nowKST.getUTCDate()) - KST_OFFSET
  );
  const todayISO = todayStart.toISOString();
  const twelveMonthsAgo = new Date(Date.now() - 366 * 24 * 60 * 60 * 1000);

  // ─ 병렬 쿼리 (모두 service client — RLS 우회)
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
    { data: allNotices },
    { data: allPosts },
    analyticsRaw,
  ] = await Promise.all([
    service.from("profiles").select("*", { count: "exact", head: true }),
    service.from("profiles").select("*", { count: "exact", head: true }).gte("created_at", todayISO),
    service.from("channels").select("*", { count: "exact", head: true }),
    service.from("page_views").select("*", { count: "exact", head: true }).gte("created_at", todayISO),
    service.from("page_views").select("*", { count: "exact", head: true }),
    service.from("channels").select("platform"),
    service.from("profiles").select("id, email, name, role, created_at").order("created_at", { ascending: false }).limit(10),
    service.from("channels").select("id, channel_name, platform, follower_count, created_at").order("created_at", { ascending: false }).limit(10),
    service.from("profiles").select("id, email, name, role, created_at, warning_count").order("created_at", { ascending: false }),
    service.from("notices").select("id, title, content, is_pinned, created_at").order("created_at", { ascending: false }),
    service.from("posts").select("id, title, content, thumbnail, summary, category, slug, published, created_at").order("created_at", { ascending: false }),
    // PostgREST max_rows=1000 우회: 1000건씩 페이지네이션
    fetchAllPageViews(service, twelveMonthsAgo.toISOString()),
  ]);

  // allChannels: is_verified 컬럼 없을 경우 fallback
  type RawChannel = { id: string; user_id: string; channel_name: string; platform: string; is_verified?: boolean | null };
  let allChannels: RawChannel[] = [];
  {
    const { data: d1, error: e1 } = await service
      .from("channels")
      .select("id, user_id, channel_name, platform, is_verified");
    if (!e1 && d1) {
      allChannels = d1 as RawChannel[];
    } else {
      const { data: d2 } = await service
        .from("channels")
        .select("id, user_id, channel_name, platform");
      allChannels = (d2 as RawChannel[]) ?? [];
    }
  }

  // 플랫폼별 집계
  const platformMap: Record<string, number> = { youtube: 0, instagram: 0, tiktok: 0, editor: 0 };
  for (const ch of platformRaw ?? []) {
    if (ch.platform in platformMap) platformMap[ch.platform]++;
  }

  // 유저별 채널 수 집계
  const channelCountMap: Record<string, number> = {};
  for (const ch of allChannels) {
    if (ch.user_id) channelCountMap[ch.user_id] = (channelCountMap[ch.user_id] ?? 0) + 1;
  }

  // ─ 방문자 분석 집계 (KST 기준)
  const dailyMap = new Map<string, number>();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(Date.now() + KST_OFFSET - i * 24 * 60 * 60 * 1000);
    dailyMap.set(
      `${String(d.getUTCMonth() + 1).padStart(2, "0")}/${String(d.getUTCDate()).padStart(2, "0")}`,
      0
    );
  }
  const monthlyMap = new Map<string, number>();
  for (let i = 11; i >= 0; i--) {
    const d = new Date(Date.UTC(nowKST.getUTCFullYear(), nowKST.getUTCMonth() - i, 1));
    monthlyMap.set(`${d.getUTCMonth() + 1}월`, 0);
  }
  const referrerMap = new Map<string, number>();
  const pageMap    = new Map<string, number>();
  const deviceMap  = new Map<string, number>();

  // [DEBUG] analyticsRaw 쿼리 결과 확인 — 로컬 npm run dev 콘솔에서 확인
  console.log("[analyticsRaw] 총 건수:", analyticsRaw.length);
  console.log("[analyticsRaw] 마지막 row created_at:", analyticsRaw[analyticsRaw.length - 1]?.created_at ?? "(없음)");

  for (const row of analyticsRaw) {
    const kst = new Date(new Date(row.created_at).getTime() + KST_OFFSET);
    const dayKey   = `${String(kst.getUTCMonth() + 1).padStart(2, "0")}/${String(kst.getUTCDate()).padStart(2, "0")}`;
    const monthKey = `${kst.getUTCMonth() + 1}월`;
    if (dailyMap.has(dayKey))   dailyMap.set(dayKey,   (dailyMap.get(dayKey)   ?? 0) + 1);
    if (monthlyMap.has(monthKey)) monthlyMap.set(monthKey, (monthlyMap.get(monthKey) ?? 0) + 1);
    const ref = row.referrer ?? "";
    referrerMap.set(ref, (referrerMap.get(ref) ?? 0) + 1);
    const pg = (row.page_path && row.page_path !== "") ? row.page_path : (row.page ?? "/");
    pageMap.set(pg, (pageMap.get(pg) ?? 0) + 1);
    const dev = row.device_type ?? "desktop";
    deviceMap.set(dev, (deviceMap.get(dev) ?? 0) + 1);
  }

  const analytics: AnalyticsData = {
    dailyViews:      Array.from(dailyMap.entries()).map(([date, count]) => ({ date, count })),
    monthlyViews:    Array.from(monthlyMap.entries()).map(([month, count]) => ({ month, count })),
    topReferrers:    Array.from(referrerMap.entries()).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([referrer, count]) => ({ referrer, count })),
    topPages:        Array.from(pageMap.entries()).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([page, count]) => ({ page, count })),
    deviceBreakdown: Array.from(deviceMap.entries()).map(([device, count]) => ({ device, count })).sort((a, b) => b.count - a.count),
    rawRows:         analyticsRaw,
  };

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

  const channels: AdminChannelRow[] = allChannels.map((ch) => ({
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
      analytics={analytics}
      currentUserId={user.id}
      currentUserEmail={user.email ?? ""}
    />
  );
}
