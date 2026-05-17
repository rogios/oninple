import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Banner from "@/components/layout/Banner";
import Footer from "@/components/layout/Footer";
import { createClient } from "@/lib/supabase/server";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  icons: { icon: "/favicon.png" },
  title: "ONINPLE | 인플루언서·편집자·광고주 무료 디렉토리",
  description:
    "유튜브·인스타그램·틱톡 크리에이터와 AI 편집자를 광고주와 연결하는 무료 디렉토리. 수수료 없이 직접 컨택.",
  keywords: ["인플루언서", "유튜버", "광고주", "AI 편집자", "온인플", "ONINPLE"],
  openGraph: {
    title: "ONINPLE | 인플루언서 무료 디렉토리",
    description: "수수료 없이 크리에이터·편집자·광고주를 연결하는 무료 플랫폼",
    type: "website",
    locale: "ko_KR",
  },
  other: {
    "naver-site-verification": "e9b9a33d8301ff1d415a9f3ab27863f94aceae39",
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let isAdmin = false;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    isAdmin = profile?.role === "admin";
  }

  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-white text-[#111111]">
        <Banner />
        <Header user={user} isAdmin={isAdmin} />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
