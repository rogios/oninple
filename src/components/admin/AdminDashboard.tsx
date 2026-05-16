"use client";

import React, { useState, useTransition, useMemo, Fragment } from "react";
import { AlertTriangle, Trash2, LayoutDashboard, Users, Bell, BookOpen, ShieldCheck, ShieldOff, ChevronDown, ChevronUp } from "lucide-react";
import { warnUser, forceDeleteUser, setChannelVerified } from "@/app/actions/admin";
import { logoutAction } from "@/app/actions/auth";
import NoticesTab from "@/components/admin/NoticesTab";
import type { NoticeRow } from "@/components/admin/NoticesTab";
import BlogTab from "@/components/admin/BlogTab";
import type { PostRow } from "@/components/admin/BlogTab";

// ─── Types ────────────────────────────────────────────────────────────────────

export type DashboardStats = {
  todayMembers: number;
  totalMembers: number;
  totalChannels: number;
  todayViews: number;
  totalViews: number;
  platformMap: Record<string, number>;
  recentMembers: RecentMember[];
  recentChannels: RecentChannel[];
};

export type MemberRow = {
  id: string;
  email: string | null;
  name: string | null;
  role: string | null;
  created_at: string | null;
  warning_count: number;
  channel_count: number;
};

export type AdminChannelRow = {
  id: string;
  user_id: string;
  channel_name: string;
  platform: string;
  is_verified: boolean;
};

type RecentMember = {
  id: string;
  email: string | null;
  name: string | null;
  role: string | null;
  created_at: string | null;
};

type RecentChannel = {
  id: string;
  channel_name: string;
  platform: string;
  follower_count: number | null;
  created_at: string | null;
};

// ─── Constants ────────────────────────────────────────────────────────────────

const PLATFORM_LABELS: Record<string, string> = {
  youtube: "유튜브", instagram: "인스타그램", tiktok: "틱톡", editor: "편집 프로듀서",
};
const PLATFORM_COLORS: Record<string, string> = {
  youtube: "bg-red-50 text-red-600 border border-red-100",
  instagram: "bg-pink-50 text-pink-600 border border-pink-100",
  tiktok: "bg-gray-900 text-white border border-gray-800",
  editor: "bg-violet-50 text-violet-600 border border-violet-100",
};
const ROLE_LABELS: Record<string, string> = {
  influencer: "인플루언서", editor: "편집자", advertiser: "광고주", admin: "관리자",
};

function fmt(d: string | null) {
  if (!d) return "-";
  return new Date(d).toLocaleDateString("ko-KR", { year: "2-digit", month: "2-digit", day: "2-digit" });
}
function fmtNum(n: number | null) {
  if (n == null) return "-";
  if (n >= 10000) return `${+(n / 10000).toFixed(1)}만`;
  if (n >= 1000) return `${+(n / 1000).toFixed(1)}천`;
  return `${n}`;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <p className="text-xs text-gray-400 font-medium mb-1">{label}</p>
      <p className="text-2xl font-black text-[#111111]">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  );
}

function WarningBadge({ count }: { count: number }) {
  if (count === 0) return (
    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-green-50 text-green-600 border border-green-100">정상</span>
  );
  if (count <= 2) return (
    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-orange-50 text-orange-600 border border-orange-100">경고 {count}회</span>
  );
  return (
    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-red-50 text-[#E8292E] border border-red-100">위험 {count}회</span>
  );
}

// ─── Delete Confirm Modal ─────────────────────────────────────────────────────

function DeleteModal({
  target,
  onConfirm,
  onCancel,
  isPending,
}: {
  target: MemberRow;
  onConfirm: () => void;
  onCancel: () => void;
  isPending: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center shrink-0">
            <Trash2 size={18} className="text-[#E8292E]" />
          </div>
          <div>
            <p className="text-sm font-bold text-[#111111]">강제탈퇴 확인</p>
            <p className="text-xs text-gray-400 mt-0.5">이 작업은 되돌릴 수 없습니다</p>
          </div>
        </div>
        <p className="text-sm text-gray-600 mb-1">
          <span className="font-semibold text-[#111111]">{target.name ?? target.email ?? "회원"}</span>
          ({target.email}) 계정을 삭제하시겠습니까?
        </p>
        <p className="text-xs text-gray-400 mb-6">등록된 채널, 프로필 등 모든 데이터가 삭제됩니다.</p>
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            disabled={isPending}
            className="flex-1 text-sm font-semibold text-gray-600 border border-gray-200 py-2.5 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            취소
          </button>
          <button
            onClick={onConfirm}
            disabled={isPending}
            className="flex-1 text-sm font-semibold text-white bg-[#E8292E] py-2.5 rounded-xl hover:bg-[#c9191e] transition-colors disabled:opacity-50"
          >
            {isPending ? "삭제 중..." : "탈퇴 처리"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Dashboard Tab ────────────────────────────────────────────────────────────

function DashboardTab({ stats }: { stats: DashboardStats }) {
  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-xs font-bold text-gray-400 mb-3 uppercase tracking-wide">핵심 지표</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          <StatCard label="오늘 가입자" value={stats.todayMembers} sub="명" />
          <StatCard label="전체 회원" value={stats.totalMembers} sub="명" />
          <StatCard label="전체 채널 등록" value={stats.totalChannels} sub="개" />
          <StatCard label="오늘 방문자" value={stats.todayViews} sub="회" />
          <StatCard label="누적 방문자" value={stats.totalViews} sub="회" />
        </div>
      </section>

      <section>
        <h2 className="text-xs font-bold text-gray-400 mb-3 uppercase tracking-wide">플랫폼별 채널</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {Object.entries(stats.platformMap).map(([platform, count]) => (
            <div key={platform} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${PLATFORM_COLORS[platform] ?? "bg-gray-100 text-gray-600"}`}>
                {PLATFORM_LABELS[platform] ?? platform}
              </span>
              <p className="text-2xl font-black text-[#111111] mt-3">{count}</p>
              <p className="text-xs text-gray-400">개</p>
            </div>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <p className="text-sm font-bold text-[#111111]">최근 가입 회원</p>
            <p className="text-xs text-gray-400 mt-0.5">최신 10명</p>
          </div>
          <div className="divide-y divide-gray-50">
            {stats.recentMembers.length ? stats.recentMembers.map((m) => (
              <div key={m.id} className="px-5 py-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-[#111111] truncate">{m.name ?? m.email ?? "-"}</p>
                  <p className="text-[11px] text-gray-400 truncate">{m.email ?? "-"}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[10px] font-semibold bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                    {ROLE_LABELS[m.role ?? ""] ?? m.role ?? "-"}
                  </span>
                  <span className="text-[11px] text-gray-400">{fmt(m.created_at)}</span>
                </div>
              </div>
            )) : (
              <p className="px-5 py-6 text-xs text-gray-400 text-center">데이터 없음</p>
            )}
          </div>
        </section>

        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <p className="text-sm font-bold text-[#111111]">최근 등록 채널</p>
            <p className="text-xs text-gray-400 mt-0.5">최신 10개</p>
          </div>
          <div className="divide-y divide-gray-50">
            {stats.recentChannels.length ? stats.recentChannels.map((ch) => (
              <div key={ch.id} className="px-5 py-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-[#111111] truncate">{ch.channel_name}</p>
                  <p className="text-[11px] text-gray-400">
                    {ch.follower_count != null ? `${fmtNum(ch.follower_count)} 팔로워` : "-"}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${PLATFORM_COLORS[ch.platform] ?? "bg-gray-100 text-gray-600"}`}>
                    {PLATFORM_LABELS[ch.platform] ?? ch.platform}
                  </span>
                  <span className="text-[11px] text-gray-400">{fmt(ch.created_at)}</span>
                </div>
              </div>
            )) : (
              <p className="px-5 py-6 text-xs text-gray-400 text-center">데이터 없음</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

// ─── Members Tab ──────────────────────────────────────────────────────────────

function MembersTab({
  initialMembers,
  channels: initialChannels,
  currentUserId,
}: {
  initialMembers: MemberRow[];
  channels: AdminChannelRow[];
  currentUserId: string;
}) {
  const [members, setMembers] = useState(initialMembers);
  const [channels, setChannels] = useState(initialChannels);
  const [deleteTarget, setDeleteTarget] = useState<MemberRow | null>(null);
  const [warningPending, setWarningPending] = useState<string | null>(null);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [expandedMemberId, setExpandedMemberId] = useState<string | null>(null);
  const [, startDeleteTransition] = useTransition();

  const channelsByMember = useMemo(() => {
    const map: Record<string, AdminChannelRow[]> = {};
    for (const ch of channels) {
      if (!map[ch.user_id]) map[ch.user_id] = [];
      map[ch.user_id].push(ch);
    }
    return map;
  }, [channels]);

  async function handleWarn(member: MemberRow) {
    setWarningPending(member.id);
    const result = await warnUser(member.id);
    if (!result.error) {
      setMembers((prev) =>
        prev.map((m) => m.id === member.id ? { ...m, warning_count: m.warning_count + 1 } : m)
      );
    }
    setWarningPending(null);
  }

  function handleDeleteConfirm() {
    if (!deleteTarget) return;
    const targetId = deleteTarget.id;
    startDeleteTransition(async () => {
      const result = await forceDeleteUser(targetId);
      if (!result.error) {
        setMembers((prev) => prev.filter((m) => m.id !== targetId));
      }
      setDeleteTarget(null);
    });
  }

  async function handleVerify(channelId: string, verified: boolean) {
    setVerifyingId(channelId);
    const result = await setChannelVerified(channelId, verified);
    if (!result.error) {
      setChannels((prev) =>
        prev.map((ch) => ch.id === channelId ? { ...ch, is_verified: verified } : ch)
      );
    }
    setVerifyingId(null);
  }

  function toggleExpand(memberId: string) {
    setExpandedMemberId((prev) => (prev === memberId ? null : memberId));
  }

  return (
    <>
      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-[#111111]">전체 회원</p>
            <p className="text-xs text-gray-400 mt-0.5">{members.length}명</p>
          </div>
        </div>

        {/* 데스크탑 테이블 */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {["이름", "이메일", "역할", "가입일", "채널등록수", "상태", "관리"].map((h) => (
                  <th key={h} className="text-left px-5 py-3 font-semibold text-gray-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {members.map((m) => {
                const memberChannels = channelsByMember[m.id] ?? [];
                return (
                  <Fragment key={m.id}>
                    <tr className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-5 py-3 font-semibold text-[#111111] max-w-[120px] truncate">{m.name ?? "-"}</td>
                      <td className="px-5 py-3 text-gray-500 max-w-[180px] truncate">{m.email ?? "-"}</td>
                      <td className="px-5 py-3">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          m.role === "admin" ? "bg-[#E8292E]/10 text-[#E8292E]" : "bg-gray-100 text-gray-600"
                        }`}>
                          {ROLE_LABELS[m.role ?? ""] ?? m.role ?? "-"}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-gray-500">{fmt(m.created_at)}</td>
                      <td className="px-5 py-3 text-gray-500 text-center">{m.channel_count}</td>
                      <td className="px-5 py-3"><WarningBadge count={m.warning_count} /></td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          {m.id !== currentUserId && m.role !== "admin" && (
                            <>
                              <button
                                onClick={() => handleWarn(m)}
                                disabled={warningPending === m.id}
                                title="경고"
                                className="p-1.5 rounded-lg text-orange-500 hover:bg-orange-50 transition-colors disabled:opacity-40"
                              >
                                <AlertTriangle size={14} />
                              </button>
                              <button
                                onClick={() => setDeleteTarget(m)}
                                title="강제탈퇴"
                                className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                              >
                                <Trash2 size={14} />
                              </button>
                            </>
                          )}
                          {memberChannels.length > 0 && (
                            <button
                              onClick={() => toggleExpand(m.id)}
                              title="채널 인증 관리"
                              className="p-1.5 rounded-lg text-blue-500 hover:bg-blue-50 transition-colors"
                            >
                              {expandedMemberId === m.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                    {expandedMemberId === m.id && memberChannels.length > 0 && (
                      <tr className="bg-blue-50/20">
                        <td colSpan={7} className="px-5 py-3">
                          <div className="space-y-2">
                            {memberChannels.map((ch) => (
                              <div key={ch.id} className="flex items-center justify-between gap-3 bg-white rounded-xl px-4 py-2.5 border border-gray-100">
                                <div className="flex items-center gap-2 min-w-0">
                                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${PLATFORM_COLORS[ch.platform] ?? "bg-gray-100 text-gray-600"}`}>
                                    {PLATFORM_LABELS[ch.platform] ?? ch.platform}
                                  </span>
                                  <span className="text-xs font-semibold text-[#111111] truncate">{ch.channel_name}</span>
                                  {ch.is_verified && (
                                    <span className="text-[10px] font-semibold text-green-600 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full shrink-0">✅ 본인확인</span>
                                  )}
                                </div>
                                <button
                                  onClick={() => handleVerify(ch.id, !ch.is_verified)}
                                  disabled={verifyingId === ch.id}
                                  className={`flex items-center gap-1 text-[11px] font-semibold px-3 py-1.5 rounded-lg transition-colors disabled:opacity-40 shrink-0 ${
                                    ch.is_verified
                                      ? "text-red-600 hover:bg-red-50"
                                      : "text-green-600 hover:bg-green-50"
                                  }`}
                                >
                                  {ch.is_verified ? (
                                    <><ShieldOff size={12} /> 인증 취소</>
                                  ) : (
                                    <><ShieldCheck size={12} /> 인증 승인</>
                                  )}
                                </button>
                              </div>
                            ))}
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
              {members.length === 0 && (
                <tr><td colSpan={7} className="px-5 py-10 text-center text-gray-400">회원 없음</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* 모바일 카드 */}
        <div className="md:hidden divide-y divide-gray-50">
          {members.map((m) => {
            const memberChannels = channelsByMember[m.id] ?? [];
            return (
              <div key={m.id} className="px-4 py-4 flex flex-col gap-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <p className="text-xs font-bold text-[#111111] truncate">{m.name ?? m.email ?? "-"}</p>
                      <WarningBadge count={m.warning_count} />
                    </div>
                    <p className="text-[11px] text-gray-400 truncate">{m.email ?? "-"}</p>
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                        {ROLE_LABELS[m.role ?? ""] ?? m.role ?? "-"}
                      </span>
                      <span className="text-[10px] text-gray-400">채널 {m.channel_count}개</span>
                      <span className="text-[10px] text-gray-400">{fmt(m.created_at)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {m.id !== currentUserId && m.role !== "admin" && (
                      <>
                        <button
                          onClick={() => handleWarn(m)}
                          disabled={warningPending === m.id}
                          className="p-2 rounded-xl text-orange-500 hover:bg-orange-50 transition-colors disabled:opacity-40"
                        >
                          <AlertTriangle size={15} />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(m)}
                          className="p-2 rounded-xl text-red-500 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 size={15} />
                        </button>
                      </>
                    )}
                    {memberChannels.length > 0 && (
                      <button
                        onClick={() => toggleExpand(m.id)}
                        className="p-2 rounded-xl text-blue-500 hover:bg-blue-50 transition-colors"
                      >
                        {expandedMemberId === m.id ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                      </button>
                    )}
                  </div>
                </div>
                {expandedMemberId === m.id && memberChannels.length > 0 && (
                  <div className="space-y-1.5">
                    {memberChannels.map((ch) => (
                      <div key={ch.id} className="flex items-center justify-between gap-2 bg-gray-50 rounded-xl px-3 py-2 border border-gray-100">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${PLATFORM_COLORS[ch.platform] ?? "bg-gray-100 text-gray-600"}`}>
                            {PLATFORM_LABELS[ch.platform] ?? ch.platform}
                          </span>
                          <span className="text-[11px] font-semibold text-[#111111] truncate">{ch.channel_name}</span>
                          {ch.is_verified && <span className="text-[10px] shrink-0">✅</span>}
                        </div>
                        <button
                          onClick={() => handleVerify(ch.id, !ch.is_verified)}
                          disabled={verifyingId === ch.id}
                          className={`text-[10px] font-semibold px-2 py-1 rounded-lg shrink-0 transition-colors disabled:opacity-40 ${
                            ch.is_verified
                              ? "text-red-600 bg-red-50 hover:bg-red-100"
                              : "text-green-600 bg-green-50 hover:bg-green-100"
                          }`}
                        >
                          {ch.is_verified ? "인증취소" : "인증승인"}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
          {members.length === 0 && (
            <p className="px-5 py-10 text-center text-xs text-gray-400">회원 없음</p>
          )}
        </div>
      </section>

      {deleteTarget && (
        <DeleteModal
          target={deleteTarget}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)}
          isPending={false}
        />
      )}
    </>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

type Tab = "dashboard" | "members" | "notices" | "blog";

export default function AdminDashboard({
  stats,
  members,
  channels,
  notices,
  posts,
  currentUserId,
  currentUserEmail,
}: {
  stats: DashboardStats;
  members: MemberRow[];
  channels: AdminChannelRow[];
  notices: NoticeRow[];
  posts: PostRow[];
  currentUserId: string;
  currentUserEmail: string;
}) {
  const [tab, setTab] = useState<Tab>("dashboard");

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: "dashboard", label: "대시보드",     icon: <LayoutDashboard size={14} /> },
    { key: "members",   label: "회원관리",     icon: <Users size={14} /> },
    { key: "notices",   label: "공지사항 관리", icon: <Bell size={14} /> },
    { key: "blog",      label: "블로그 관리",   icon: <BookOpen size={14} /> },
  ];

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* 헤더 */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <div>
              <h1 className="text-base font-black text-[#111111]">관리자 대시보드</h1>
              <p className="text-[11px] text-gray-400">{currentUserEmail}</p>
            </div>
            <form action={logoutAction}>
              <button
                type="submit"
                className="text-xs font-semibold text-gray-500 border border-gray-200 hover:border-gray-300 px-4 py-2 rounded-full transition-colors"
              >
                로그아웃
              </button>
            </form>
          </div>

          {/* 탭 */}
          <div className="flex gap-1 -mb-px">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`flex items-center gap-1.5 text-xs font-semibold px-4 py-3 border-b-2 transition-colors ${
                  tab === t.key
                    ? "border-[#E8292E] text-[#E8292E]"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                {t.icon}
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 콘텐츠 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {tab === "dashboard" && <DashboardTab stats={stats} />}
        {tab === "members"   && <MembersTab initialMembers={members} channels={channels} currentUserId={currentUserId} />}
        {tab === "notices"   && <NoticesTab initialNotices={notices} />}
        {tab === "blog"      && <BlogTab initialPosts={posts} />}
      </div>
    </div>
  );
}
