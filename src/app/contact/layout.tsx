import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "문의하기",
  description: "온인플 서비스에 대한 문의사항을 남겨주세요. 인플루언서 등록, 광고주 제휴, 편집자 등록 등 빠르게 답변 드리겠습니다.",
  openGraph: {
    title: "문의하기 | ONINPLE",
    description: "온인플 서비스에 대한 문의사항을 남겨주세요.",
    url: "https://oninple.com/contact",
  },
  alternates: { canonical: "https://oninple.com/contact" },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
