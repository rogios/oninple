import Link from "next/link";

export default function CTASection() {
  return (
    <section className="bg-[#E8292E] py-12 sm:py-16">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl sm:text-4xl font-black text-white leading-tight mb-4">
          지금 바로 시작하세요
        </h2>
        <p className="text-white/80 text-base mb-8">
          무료로 프로필 등록 후 광고주와 바로 연결하세요.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/signup?role=influencer"
            className="inline-flex items-center justify-center bg-white text-[#E8292E] font-bold px-8 py-4 rounded-full hover:bg-gray-50 transition-colors text-sm"
          >
            인플루언서로 등록
          </Link>
          <Link
            href="/signup?role=advertiser"
            className="inline-flex items-center justify-center bg-transparent text-white border-2 border-white/40 font-bold px-8 py-4 rounded-full hover:border-white transition-colors text-sm"
          >
            광고주로 시작하기
          </Link>
        </div>
      </div>
    </section>
  );
}
