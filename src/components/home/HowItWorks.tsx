const steps = [
  {
    number: "01",
    title: "무료 프로필 등록",
    description:
      "인플루언서, AI 편집자, 광고주 중 원하는 역할로 프로필을 만드세요. 기본 플랜은 영원히 무료입니다.",
    color: "#E8292E",
  },
  {
    number: "02",
    title: "검색 & 발견",
    description:
      "카테고리, 팔로워 수, 플랫폼, 위치로 필터링해 원하는 파트너를 빠르게 찾으세요.",
    color: "#111111",
  },
  {
    number: "03",
    title: "연결 & 협업",
    description:
      "마음에 드는 크리에이터 또는 브랜드에게 직접 연락해 협업을 시작하세요.",
    color: "#E8292E",
  },
];

export default function HowItWorks() {
  return (
    <section className="bg-[#111111] py-20 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <p className="text-xs font-semibold text-[#E8292E] uppercase tracking-wider mb-3">
            이용 방법
          </p>
          <h2 className="text-3xl sm:text-4xl font-black">
            3단계로 시작하는<br />인플루언서 마케팅
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          {/* Connecting line (desktop) */}
          <div className="hidden md:block absolute top-8 left-1/3 right-1/3 h-px bg-gray-700 -translate-y-1/2" />

          {steps.map((step, i) => (
            <div key={i} className="relative bg-white/5 rounded-2xl p-8 border border-white/10">
              <div
                className="text-5xl font-black mb-4 leading-none"
                style={{ color: step.color }}
              >
                {step.number}
              </div>
              <h3 className="text-lg font-bold mb-3">{step.title}</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
