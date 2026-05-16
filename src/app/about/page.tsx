import Link from "next/link";
import { Check, Users, Video, Megaphone, Star, Globe, MessageCircle } from "lucide-react";

// ─── Hero ──────────────────────────────────────────────────────────────────────

function Hero() {
  return (
    <section className="bg-[#111111] text-white py-24 sm:py-32">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <p className="text-xs font-semibold tracking-widest text-[#E8292E] uppercase mb-6">
          인플루언서 디렉토리 플랫폼, 온인플
        </p>
        <h1 className="text-3xl sm:text-5xl font-black leading-tight tracking-tight mb-8">
          <span className="text-[#E8292E]">인플루언서</span>를 위하고,<br />
          <span className="text-[#E8292E]">프로듀서</span>에게 기회를 주고,<br />
          <span className="text-[#E8292E]">광고주</span>에게 도움이 되는 플랫폼
        </h1>
        <p className="text-base sm:text-lg text-gray-400 leading-relaxed mb-10 max-w-2xl mx-auto">
          좋은 콘텐츠는 더 많은 기회를 만들고,<br className="hidden sm:block" />
          그 기회는 연결에서 시작됩니다.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/signup"
            className="inline-flex items-center justify-center gap-2 bg-[#E8292E] hover:bg-[#c9191e] text-white text-sm font-semibold px-7 py-3 rounded-full transition-colors"
          >
            프로필 등록하기 →
          </Link>
          <Link
            href="/influencers"
            className="inline-flex items-center justify-center gap-2 border border-white/30 hover:border-white text-white text-sm font-semibold px-7 py-3 rounded-full transition-colors"
          >
            인플루언서 찾아보기 →
          </Link>
        </div>
      </div>
    </section>
  );
}

// ─── Connection Section ────────────────────────────────────────────────────────

const CONNECTION_CARDS = [
  {
    icon: <Users size={22} className="text-[#E8292E]" />,
    title: "인플루언서",
    benefits: [
      "프로필 등록으로 자연스럽게 홍보",
      "다른 크리에이터의 콘텐츠로 레퍼런스 탐색",
      "광고주의 픽을 받을 수 있는 기회",
    ],
  },
  {
    icon: <Video size={22} className="text-[#E8292E]" />,
    title: "편집 프로듀서",
    benefits: [
      "비용 부담 없이 재능을 홍보",
      "포트폴리오로 실력 어필",
      "필요로 하는 사람들과 직접 연결",
    ],
  },
  {
    icon: <Megaphone size={22} className="text-[#E8292E]" />,
    title: "광고주",
    benefits: [
      "카테고리, 플랫폼, 등급별 검색",
      "잘 활성화된 디렉토리에서 딱 맞는 인플루언서 탐색",
      "중간 수수료 없이 직접 연결",
    ],
  },
];

function ConnectionSection() {
  return (
    <section className="py-20 sm:py-28 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <p className="text-xs font-semibold tracking-widest text-[#E8292E] uppercase mb-3">For Everyone</p>
          <h2 className="text-2xl sm:text-3xl font-black text-[#111111]">온인플이 만드는 연결</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {CONNECTION_CARDS.map((card) => (
            <div
              key={card.title}
              className="border border-gray-100 rounded-2xl p-7 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="w-11 h-11 rounded-xl bg-[#E8292E]/8 flex items-center justify-center mb-5">
                {card.icon}
              </div>
              <h3 className="text-base font-black text-[#111111] mb-5">{card.title}</h3>
              <ul className="space-y-3">
                {card.benefits.map((b) => (
                  <li key={b} className="flex items-start gap-2.5">
                    <span className="mt-0.5 w-4 h-4 rounded-full bg-[#E8292E]/10 flex items-center justify-center shrink-0">
                      <Check size={9} className="text-[#E8292E]" strokeWidth={3} />
                    </span>
                    <span className="text-sm text-gray-600 leading-snug">{b}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Features Section ──────────────────────────────────────────────────────────

const FEATURES = [
  {
    icon: <Star size={20} className="text-[#E8292E]" />,
    title: "무료 디렉토리",
    desc: "누구나 무료로 등록하고 이용할 수 있습니다. 추가 비용이나 숨겨진 요금은 없습니다.",
  },
  {
    icon: <Globe size={20} className="text-[#E8292E]" />,
    title: "멀티 플랫폼 지원",
    desc: "유튜브, 인스타그램, 틱톡은 물론 편집 프로듀서까지 한 곳에서 탐색할 수 있습니다.",
  },
  {
    icon: <MessageCircle size={20} className="text-[#E8292E]" />,
    title: "직접 연결 시스템",
    desc: "카카오 오픈채팅으로 빠르고 쉽게, 중간 단계 없이 직접 연결됩니다.",
  },
];

function FeaturesSection() {
  return (
    <section className="py-20 sm:py-28 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <p className="text-xs font-semibold tracking-widest text-[#E8292E] uppercase mb-3">Why Oninple</p>
          <h2 className="text-2xl sm:text-3xl font-black text-[#111111]">온인플의 특별한 특징</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {FEATURES.map((f) => (
            <div key={f.title} className="bg-white rounded-2xl p-7 border border-gray-100 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-[#E8292E]/8 flex items-center justify-center mb-5">
                {f.icon}
              </div>
              <h3 className="text-base font-black text-[#111111] mb-2">{f.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── CTA ───────────────────────────────────────────────────────────────────────

function CTA() {
  return (
    <section className="bg-[#111111] text-white py-20 sm:py-28">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-2xl sm:text-3xl font-black leading-snug mb-8">
          지금 바로 온인플에서<br />
          <span className="text-[#E8292E]">새로운 기회</span>를 발견하세요
        </h2>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/signup"
            className="inline-flex items-center justify-center gap-2 bg-[#E8292E] hover:bg-[#c9191e] text-white text-sm font-semibold px-7 py-3 rounded-full transition-colors"
          >
            프로필 등록하기 →
          </Link>
          <Link
            href="/influencers"
            className="inline-flex items-center justify-center gap-2 border border-white/30 hover:border-white text-white text-sm font-semibold px-7 py-3 rounded-full transition-colors"
          >
            인플루언서 찾아보기 →
          </Link>
        </div>
      </div>
    </section>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function AboutPage() {
  return (
    <>
      <Hero />
      <ConnectionSection />
      <FeaturesSection />
      <CTA />
    </>
  );
}
