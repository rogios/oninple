"use client";

import React, { useState, useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

export type RawPageView = {
  created_at: string;
  referrer?: string | null;
  page_path?: string | null;
  page?: string | null;
  device_type?: string | null;
};

export type AnalyticsData = {
  dailyViews:      { date: string; count: number }[];
  monthlyViews:    { month: string; count: number }[];
  topReferrers:    { referrer: string; count: number }[];
  topPages:        { page: string; count: number }[];
  deviceBreakdown: { device: string; count: number }[];
  rawRows:         RawPageView[];
};

const DEVICE_COLORS: Record<string, string> = {
  mobile:  "#E8292E",
  desktop: "#3B82F6",
  tablet:  "#F59E0B",
};
const DEVICE_LABELS: Record<string, string> = {
  mobile:  "모바일",
  desktop: "데스크탑",
  tablet:  "태블릿",
};

type StatPeriod = "today" | "month" | "all";

const STAT_PERIOD_LABELS: Record<StatPeriod, string> = {
  today: "오늘",
  month: "한달",
  all: "전체",
};

const STAT_PERIOD_DESC: Record<StatPeriod, string> = {
  today: "오늘 (KST 기준)",
  month: "최근 30일",
  all: "전체 기간",
};

export default function AnalyticsTab({ data }: { data: AnalyticsData }) {
  const [period, setPeriod] = useState<"daily" | "monthly">("daily");
  const [statPeriod, setStatPeriod] = useState<StatPeriod>("today");

  const chartData =
    period === "daily"
      ? data.dailyViews.map((d) => ({ label: d.date, count: d.count }))
      : data.monthlyViews.map((d) => ({ label: d.month, count: d.count }));

  const { filteredReferrers, filteredPages, filteredDevices, filteredCount } = useMemo(() => {
    const KST_OFFSET = 9 * 60 * 60 * 1000;
    const nowKST = new Date(Date.now() + KST_OFFSET);
    const todayStart = new Date(
      Date.UTC(nowKST.getUTCFullYear(), nowKST.getUTCMonth(), nowKST.getUTCDate()) - KST_OFFSET
    );
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const rows = data.rawRows.filter((row) => {
      if (statPeriod === "today") return row.created_at >= todayStart.toISOString();
      if (statPeriod === "month") return row.created_at >= thirtyDaysAgo.toISOString();
      return true;
    });

    const referrerMap = new Map<string, number>();
    const pageMap     = new Map<string, number>();
    const deviceMap   = new Map<string, number>();

    for (const row of rows) {
      const ref = row.referrer ?? "";
      referrerMap.set(ref, (referrerMap.get(ref) ?? 0) + 1);
      const pg = (row.page_path && row.page_path !== "") ? row.page_path : (row.page ?? "/");
      pageMap.set(pg, (pageMap.get(pg) ?? 0) + 1);
      const dev = row.device_type ?? "desktop";
      deviceMap.set(dev, (deviceMap.get(dev) ?? 0) + 1);
    }

    return {
      filteredCount: rows.length,
      filteredReferrers: Array.from(referrerMap.entries())
        .sort((a, b) => b[1] - a[1]).slice(0, 5)
        .map(([referrer, count]) => ({ referrer, count })),
      filteredPages: Array.from(pageMap.entries())
        .sort((a, b) => b[1] - a[1]).slice(0, 5)
        .map(([page, count]) => ({ page, count })),
      filteredDevices: Array.from(deviceMap.entries())
        .map(([device, count]) => ({ device, count }))
        .sort((a, b) => b.count - a.count),
    };
  }, [data.rawRows, statPeriod]);

  const filteredTotalDevices = filteredDevices.reduce((s, d) => s + d.count, 0);

  return (
    <div className="space-y-8">
      {/* 방문자 추이 그래프 */}
      <section className="bg-white dark:bg-[#1F2937] rounded-2xl border border-gray-100 dark:border-[#374151] shadow-sm p-5">
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="text-sm font-bold text-[#111111] dark:text-[#F9FAFB]">방문자 추이</p>
            <p className="text-xs text-gray-400 dark:text-[#6B7280] mt-0.5">
              {period === "daily" ? "최근 30일 (KST 기준)" : "최근 12개월"}
            </p>
          </div>
          <div className="flex gap-1">
            {(["daily", "monthly"] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
                  period === p
                    ? "bg-[#E8292E] text-white"
                    : "bg-gray-100 dark:bg-[#374151] text-gray-600 dark:text-[#9CA3AF] hover:bg-gray-200 dark:hover:bg-[#4B5563]"
                }`}
              >
                {p === "daily" ? "일" : "월"}
              </button>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={chartData} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
            <XAxis
              dataKey="label"
              tick={{ fontSize: 10, fill: "#9CA3AF" }}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fontSize: 10, fill: "#9CA3AF" }}
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1F2937",
                border: "none",
                borderRadius: 8,
                fontSize: 12,
                color: "#F9FAFB",
              }}
              labelStyle={{ color: "#F9FAFB" }}
              itemStyle={{ color: "#E8292E" }}
            />
            <Bar dataKey="count" fill="#E8292E" radius={[4, 4, 0, 0]} name="방문자" />
          </BarChart>
        </ResponsiveContainer>
      </section>

      {/* 기간 필터 */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs text-gray-400 dark:text-[#6B7280] mr-1">기간</span>
        {(["today", "month", "all"] as StatPeriod[]).map((p) => (
          <button
            key={p}
            onClick={() => setStatPeriod(p)}
            className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
              statPeriod === p
                ? "bg-[#E8292E] text-white"
                : "bg-gray-100 dark:bg-[#374151] text-gray-600 dark:text-[#9CA3AF] hover:bg-gray-200 dark:hover:bg-[#4B5563]"
            }`}
          >
            {STAT_PERIOD_LABELS[p]}
          </button>
        ))}
        {statPeriod === "today" && (
          <span className="ml-1 text-xs text-gray-500 dark:text-[#9CA3AF]">
            오늘 총 방문자{" "}
            <span className="font-bold text-[#E8292E]">{filteredCount.toLocaleString()}회</span>
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 유입 경로 TOP 5 */}
        <section className="bg-white dark:bg-[#1F2937] rounded-2xl border border-gray-100 dark:border-[#374151] shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 dark:border-[#374151]">
            <p className="text-sm font-bold text-[#111111] dark:text-[#F9FAFB]">유입 경로 TOP 5</p>
            <p className="text-xs text-gray-400 dark:text-[#6B7280] mt-0.5">referrer 기준 · {STAT_PERIOD_DESC[statPeriod]}</p>
          </div>
          <div className="divide-y divide-gray-50 dark:divide-[#374151]">
            {filteredReferrers.length === 0 ? (
              <p className="px-5 py-6 text-xs text-gray-400 dark:text-[#6B7280] text-center">데이터 없음</p>
            ) : (
              filteredReferrers.map((r, i) => (
                <div key={i} className="px-5 py-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-xs font-bold text-gray-400 w-4 shrink-0">{i + 1}</span>
                    <p className="text-xs text-[#111111] dark:text-[#F9FAFB] truncate">
                      {r.referrer || "(직접 접속)"}
                    </p>
                  </div>
                  <span className="text-xs font-bold text-[#E8292E] shrink-0">{r.count}회</span>
                </div>
              ))
            )}
          </div>
        </section>

        {/* 페이지별 조회수 TOP 5 */}
        <section className="bg-white dark:bg-[#1F2937] rounded-2xl border border-gray-100 dark:border-[#374151] shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 dark:border-[#374151]">
            <p className="text-sm font-bold text-[#111111] dark:text-[#F9FAFB]">페이지별 조회수 TOP 5</p>
            <p className="text-xs text-gray-400 dark:text-[#6B7280] mt-0.5">{STAT_PERIOD_DESC[statPeriod]}</p>
          </div>
          <div className="divide-y divide-gray-50 dark:divide-[#374151]">
            {filteredPages.length === 0 ? (
              <p className="px-5 py-6 text-xs text-gray-400 dark:text-[#6B7280] text-center">데이터 없음</p>
            ) : (
              filteredPages.map((p, i) => (
                <div key={i} className="px-5 py-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-xs font-bold text-gray-400 w-4 shrink-0">{i + 1}</span>
                    <p className="text-xs text-[#111111] dark:text-[#F9FAFB] truncate">{p.page || "/"}</p>
                  </div>
                  <span className="text-xs font-bold text-[#E8292E] shrink-0">{p.count}회</span>
                </div>
              ))
            )}
          </div>
        </section>

        {/* 디바이스 비율 */}
        <section className="bg-white dark:bg-[#1F2937] rounded-2xl border border-gray-100 dark:border-[#374151] shadow-sm p-5">
          <p className="text-sm font-bold text-[#111111] dark:text-[#F9FAFB] mb-1">디바이스 비율</p>
          <p className="text-xs text-gray-400 dark:text-[#6B7280] mb-4">{STAT_PERIOD_DESC[statPeriod]}</p>
          {filteredDevices.length === 0 ? (
            <p className="text-xs text-gray-400 dark:text-[#6B7280] text-center py-10">데이터 없음</p>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={140}>
                <PieChart>
                  <Pie
                    data={filteredDevices}
                    dataKey="count"
                    nameKey="device"
                    cx="50%"
                    cy="50%"
                    outerRadius={60}
                    innerRadius={36}
                  >
                    {filteredDevices.map((d, i) => (
                      <Cell key={i} fill={DEVICE_COLORS[d.device] ?? "#6B7280"} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1F2937",
                      border: "none",
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                    formatter={(value, name) => [
                      `${value}회`,
                      DEVICE_LABELS[name as string] ?? name,
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-3">
                {filteredDevices.map((d) => {
                  const pct = filteredTotalDevices
                    ? Math.round((d.count / filteredTotalDevices) * 100)
                    : 0;
                  return (
                    <div key={d.device} className="flex items-center gap-2">
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: DEVICE_COLORS[d.device] ?? "#6B7280" }}
                      />
                      <span className="text-xs text-gray-600 dark:text-[#9CA3AF]">
                        {DEVICE_LABELS[d.device] ?? d.device}
                      </span>
                      <span className="text-xs font-bold text-[#111111] dark:text-[#F9FAFB] ml-auto">
                        {pct}%
                      </span>
                      <span className="text-xs text-gray-400 dark:text-[#6B7280]">({d.count})</span>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
