/**
 * analyticsRaw 쿼리 검증 스크립트
 * 실행: npx ts-node --skip-project scripts/check-analytics.ts
 */

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://gdldlvhcsmqcokfcvmre.supabase.co";
const SERVICE_ROLE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdkbGRsdmhjc21xY29rZmN2bXJlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODc2Nzc3NCwiZXhwIjoyMDk0MzQzNzc0fQ.-cVedeZsRPz8jAURxX7N6soOYvDUlVTaWkIHDrSeVtY";

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function main() {
  const KST_OFFSET = 9 * 60 * 60 * 1000;
  const nowKST = new Date(Date.now() + KST_OFFSET);
  const twelveMonthsAgo = new Date(Date.now() - 366 * 24 * 60 * 60 * 1000);

  // KST 오늘 자정 (UTC 기준)
  const todayStart = new Date(
    Date.UTC(nowKST.getUTCFullYear(), nowKST.getUTCMonth(), nowKST.getUTCDate()) - KST_OFFSET
  );
  const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);

  console.log("─".repeat(50));
  console.log("현재 UTC    :", new Date().toISOString());
  console.log("현재 KST    :", nowKST.toISOString().replace("T", " ").slice(0, 19), "(UTC+9 시뮬)");
  console.log("오늘 KST 시작:", todayStart.toISOString(), "(= KST 00:00)");
  console.log("오늘 KST 끝 :", todayEnd.toISOString(),   "(= KST 24:00)");
  console.log("─".repeat(50));

  // ── 쿼리 (admin/page.tsx와 동일 조건 — 페이지네이션) ───────
  const PAGE = 1000;
  const rows: { created_at: string; page?: string | null }[] = [];
  let from = 0;
  while (true) {
    const { data, error } = await supabase
      .from("page_views")
      .select("created_at, page")
      .gte("created_at", twelveMonthsAgo.toISOString())
      .order("created_at", { ascending: true })
      .range(from, from + PAGE - 1);

    if (error) {
      console.error("❌ Supabase 오류:", error.message);
      process.exit(1);
    }

    const batch = data ?? [];
    rows.push(...batch);
    console.log(`  페이지 ${from / PAGE + 1}: ${batch.length}건 수신 (누계 ${rows.length}건)`);
    if (batch.length < PAGE) break;
    from += PAGE;
  }

  // ── 오늘 KST 건수 ──────────────────────────────────────────
  const todayRows = rows.filter((row) => {
    const t = new Date(row.created_at).getTime();
    return t >= todayStart.getTime() && t < todayEnd.getTime();
  });

  // ── 출력 ───────────────────────────────────────────────────
  console.log(`✅ 총 건수 (limit 10000):  ${rows.length}건`);
  console.log(`✅ 오늘 KST 05/27 건수:   ${todayRows.length}건`);
  console.log();

  if (rows.length > 0) {
    console.log("첫 번째 row created_at :", rows[0].created_at);
    console.log("마지막 row created_at  :", rows[rows.length - 1].created_at);
  }

  if (todayRows.length > 0) {
    console.log();
    console.log("오늘 첫 번째 row:", todayRows[0].created_at, "|", todayRows[0].page);
    console.log("오늘 마지막 row :", todayRows[todayRows.length - 1].created_at, "|", todayRows[todayRows.length - 1].page);
  }

  console.log("─".repeat(50));

  // limit 경고
  if (rows.length === 10000) {
    console.warn("⚠️  결과가 정확히 10000건 — limit에 걸렸을 수 있습니다. limit을 늘리세요.");
  }
  if (rows.length === 1000) {
    console.warn("⚠️  결과가 정확히 1000건 — 기본 PostgREST limit이 적용됐습니다!");
  }
}

main();
