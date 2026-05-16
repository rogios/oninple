"use client";

import { useState } from "react";
import CreatorCard from "./CreatorCard";
import CreatorModal from "./CreatorModal";
import { MOCK_CREATORS, CATEGORY_LABELS, GRADE_LABELS } from "@/data/mock";
import type { Creator, Platform, Category, GradeKey } from "@/types";

const TABS: { key: Platform; label: string }[] = [
  { key: "youtube", label: "유튜브" },
  { key: "instagram", label: "인스타그램" },
  { key: "tiktok", label: "틱톡" },
  { key: "editor", label: "편집자" },
];

const GRADE_ORDER: GradeKey[] = ["500", "1k", "5k", "10k", "50k", "100k", "500k", "1m", "5m"];

export default function TabSection() {
  const [tab, setTab] = useState<Platform>("youtube");
  const [category, setCategory] = useState<Category | "all">("all");
  const [grade, setGrade] = useState<GradeKey | "all">("all");
  const [selected, setSelected] = useState<Creator | null>(null);

  const filtered = MOCK_CREATORS.filter((c) => {
    if (c.platform !== tab) return false;
    if (category !== "all" && c.category !== category) return false;
    if (grade !== "all" && c.grade !== grade) return false;
    return true;
  });

  const categoryOptions = Array.from(
    new Set(MOCK_CREATORS.filter((c) => c.platform === tab).map((c) => c.category))
  );

  const gradeOptions = GRADE_ORDER.filter((g) =>
    MOCK_CREATORS.some((c) => c.platform === tab && c.grade === g)
  );

  return (
    <section className="bg-gray-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section title */}
        <div className="mb-8">
          <p className="text-xs font-semibold text-[#E8292E] uppercase tracking-wider mb-2">크리에이터</p>
          <h2 className="text-3xl font-black text-[#111111]">파트너를 찾아보세요</h2>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white p-1 rounded-2xl border border-gray-100 w-fit mb-6 shadow-sm">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => { setTab(t.key); setCategory("all"); setGrade("all"); }}
              className="px-5 py-2 rounded-xl text-sm font-semibold transition-all"
              style={{
                backgroundColor: tab === t.key ? "#111111" : "transparent",
                color: tab === t.key ? "white" : "#6b7280",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          {/* Category filter */}
          <div className="flex gap-1.5 flex-wrap">
            <button
              onClick={() => setCategory("all")}
              className="text-xs font-medium px-3 py-1.5 rounded-full border transition-all"
              style={{
                backgroundColor: category === "all" ? "#111111" : "white",
                color: category === "all" ? "white" : "#6b7280",
                borderColor: category === "all" ? "#111111" : "#e5e7eb",
              }}
            >
              전체
            </button>
            {categoryOptions.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c as Category)}
                className="text-xs font-medium px-3 py-1.5 rounded-full border transition-all"
                style={{
                  backgroundColor: category === c ? "#111111" : "white",
                  color: category === c ? "white" : "#6b7280",
                  borderColor: category === c ? "#111111" : "#e5e7eb",
                }}
              >
                {CATEGORY_LABELS[c]}
              </button>
            ))}
          </div>

          {/* Grade filter (not for editor) */}
          {tab !== "editor" && gradeOptions.length > 1 && (
            <div className="flex gap-1.5 flex-wrap">
              <div className="w-px bg-gray-200 mx-1 self-stretch" />
              <button
                onClick={() => setGrade("all")}
                className="text-xs font-medium px-3 py-1.5 rounded-full border transition-all"
                style={{
                  backgroundColor: grade === "all" ? "#E8292E" : "white",
                  color: grade === "all" ? "white" : "#6b7280",
                  borderColor: grade === "all" ? "#E8292E" : "#e5e7eb",
                }}
              >
                전체 등급
              </button>
              {gradeOptions.map((g) => (
                <button
                  key={g}
                  onClick={() => setGrade(g)}
                  className="text-xs font-medium px-3 py-1.5 rounded-full border transition-all"
                  style={{
                    backgroundColor: grade === g ? "#E8292E" : "white",
                    color: grade === g ? "white" : "#6b7280",
                    borderColor: grade === g ? "#E8292E" : "#e5e7eb",
                  }}
                >
                  {GRADE_LABELS[g]}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Cards grid */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {filtered.map((c) => (
              <CreatorCard key={c.id} creator={c} onClick={() => setSelected(c)} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-gray-400 text-sm">
            해당 조건에 맞는 크리에이터가 없습니다.
          </div>
        )}
      </div>

      {/* Modal */}
      <CreatorModal creator={selected} onClose={() => setSelected(null)} />
    </section>
  );
}
