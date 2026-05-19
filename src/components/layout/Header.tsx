"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import { Menu, X, User, LogOut, ChevronDown, LayoutDashboard, Sun, Moon } from "lucide-react";
import { cn } from "@/lib/utils";
import { logoutAction } from "@/app/actions/auth";
import { useTheme } from "@/components/ThemeProvider";
import type { User as SupabaseUser } from "@supabase/supabase-js";

const navLinks = [
  { label: "소개", href: "/about" },
  { label: "문의", href: "/contact" },
  { label: "공지사항", href: "/notices" },
];

interface HeaderProps {
  user: SupabaseUser | null;
  isAdmin?: boolean;
}

export default function Header({ user, isAdmin = false }: HeaderProps) {
  const [open, setOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { isDark, toggle } = useTheme();

  const displayName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split("@")[0] ||
    "사용자";

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownOpen]);

  return (
    <header className="sticky top-0 z-50 bg-white/95 dark:bg-[#111827]/95 backdrop-blur border-b border-gray-100 dark:border-[#374151]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="shrink-0">
          <Image src="/logo.png" alt="온인플" width={120} height={40} priority className="dark:hidden" />
          <Image src="/logo-dark.png" alt="온인플" width={120} height={40} priority className="hidden dark:block" />
        </Link>

        {/* Desktop nav + Auth area */}
        <div className="hidden md:flex items-center gap-6">
          {navLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-sm font-medium text-gray-600 dark:text-[#9CA3AF] hover:text-[#E8292E] dark:hover:text-[#E8292E] transition-colors"
            >
              {l.label}
            </Link>
          ))}
          <div className="flex items-center gap-2">
            {/* Dark mode toggle */}
            <button
              onClick={toggle}
              aria-label={isDark ? "라이트 모드로 전환" : "다크 모드로 전환"}
              className="p-1.5 rounded-lg text-gray-500 dark:text-[#9CA3AF] hover:bg-gray-100 dark:hover:bg-[#1F2937] transition-colors"
            >
              {isDark ? <Sun size={17} /> : <Moon size={17} />}
            </button>

            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-1.5 text-sm font-medium text-gray-700 dark:text-[#F9FAFB] hover:text-[#111111] dark:hover:text-white px-3 py-1.5 rounded-lg hover:bg-gray-50 dark:hover:bg-[#1F2937] transition-colors"
                >
                  <User size={16} className="text-gray-400 dark:text-[#6B7280]" />
                  {displayName}
                  <ChevronDown
                    size={14}
                    className={cn(
                      "text-gray-400 dark:text-[#6B7280] transition-transform duration-150",
                      dropdownOpen && "rotate-180"
                    )}
                  />
                </button>
                {dropdownOpen && (
                  <div className="absolute right-0 top-full mt-1.5 w-36 bg-white dark:bg-[#1F2937] rounded-xl border border-gray-100 dark:border-[#374151] shadow-lg py-1 z-50">
                    {isAdmin && (
                      <>
                        <Link
                          href="/admin"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2 px-4 py-2.5 text-sm text-[#E8292E] font-semibold hover:bg-red-50 dark:hover:bg-[#374151] transition-colors"
                        >
                          <LayoutDashboard size={14} className="text-[#E8292E]" />
                          관리자
                        </Link>
                        <div className="mx-3 border-t border-gray-100 dark:border-[#374151]" />
                      </>
                    )}
                    <Link
                      href="/mypage"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 dark:text-[#F9FAFB] hover:bg-gray-50 dark:hover:bg-[#374151] transition-colors"
                    >
                      <User size={14} className="text-gray-400 dark:text-[#6B7280]" />
                      마이페이지
                    </Link>
                    <div className="mx-3 border-t border-gray-100 dark:border-[#374151]" />
                    <form action={logoutAction}>
                      <button
                        type="submit"
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-500 dark:text-[#9CA3AF] hover:bg-gray-50 dark:hover:bg-[#374151] transition-colors"
                      >
                        <LogOut size={14} className="text-gray-400 dark:text-[#6B7280]" />
                        로그아웃
                      </button>
                    </form>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm font-medium text-gray-600 dark:text-[#9CA3AF] hover:text-[#111111] dark:hover:text-white px-3 py-1.5 transition-colors"
                >
                  로그인
                </Link>
                <Link
                  href="/signup"
                  className="text-sm font-semibold text-white bg-[#E8292E] hover:bg-[#c9191e] px-4 py-1.5 rounded-full transition-colors"
                >
                  회원가입
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Mobile right: theme toggle + menu */}
        <div className="md:hidden flex items-center gap-1">
          <button
            onClick={toggle}
            aria-label={isDark ? "라이트 모드로 전환" : "다크 모드로 전환"}
            className="p-1.5 text-gray-500 dark:text-[#9CA3AF]"
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button
            className="p-1.5 text-gray-600 dark:text-[#9CA3AF]"
            onClick={() => setOpen(!open)}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={cn(
          "md:hidden border-t border-gray-100 dark:border-[#374151] bg-white dark:bg-[#111827] overflow-hidden transition-all duration-200",
          open ? "max-h-96" : "max-h-0"
        )}
      >
        <div className="px-4 py-3 flex flex-col gap-1">
          {navLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="text-sm font-medium text-gray-700 dark:text-[#F9FAFB] py-2.5 border-b border-gray-50 dark:border-[#374151]"
            >
              {l.label}
            </Link>
          ))}
          {user ? (
            <div className="flex flex-col gap-2 pt-3">
              {isAdmin && (
                <Link
                  href="/admin"
                  onClick={() => setOpen(false)}
                  className="w-full text-center text-sm font-semibold text-[#E8292E] border border-[#E8292E] py-2 rounded-full hover:bg-red-50 dark:hover:bg-[#374151] transition-colors flex items-center justify-center gap-1.5"
                >
                  <LayoutDashboard size={14} />
                  관리자 대시보드
                </Link>
              )}
              <div className="flex gap-2">
                <Link
                  href="/mypage"
                  onClick={() => setOpen(false)}
                  className="flex-1 text-center text-sm border border-gray-200 dark:border-[#374151] dark:text-[#F9FAFB] py-2 rounded-full"
                >
                  마이페이지
                </Link>
                <form action={logoutAction} className="flex-1">
                  <button
                    type="submit"
                    className="w-full text-sm font-semibold text-white bg-[#E8292E] py-2 rounded-full"
                  >
                    로그아웃
                  </button>
                </form>
              </div>
            </div>
          ) : (
            <div className="flex gap-2 pt-3">
              <Link
                href="/login"
                className="flex-1 text-center text-sm border border-gray-200 dark:border-[#374151] dark:text-[#F9FAFB] py-2 rounded-full"
              >
                로그인
              </Link>
              <Link
                href="/signup"
                className="flex-1 text-center text-sm font-semibold text-white bg-[#E8292E] py-2 rounded-full"
              >
                회원가입
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
