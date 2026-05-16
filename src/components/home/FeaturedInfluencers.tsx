import Link from "next/link";

const influencers = [
  {
    id: "1",
    name: "김민지",
    handle: "@minji_beauty",
    category: "뷰티/패션",
    platforms: ["youtube", "instagram"],
    followers: "142만",
    avatar: "MJ",
    color: "#FF6B9D",
    verified: true,
  },
  {
    id: "2",
    name: "이준혁",
    handle: "@jun_food",
    category: "푸드/요리",
    platforms: ["youtube", "instagram"],
    followers: "89만",
    avatar: "JH",
    color: "#FF8C42",
    verified: true,
  },
  {
    id: "3",
    name: "박서연",
    handle: "@seoyeon_travel",
    category: "여행/라이프",
    platforms: ["instagram", "tiktok"],
    followers: "210만",
    avatar: "SY",
    color: "#4ECDC4",
    verified: true,
  },
  {
    id: "4",
    name: "최동현",
    handle: "@donghyun_game",
    category: "게임/IT",
    platforms: ["youtube"],
    followers: "67만",
    avatar: "DH",
    color: "#7B5EA7",
    verified: false,
  },
  {
    id: "5",
    name: "정하은",
    handle: "@haeun_fit",
    category: "피트니스",
    platforms: ["instagram", "tiktok"],
    followers: "53만",
    avatar: "HE",
    color: "#E8292E",
    verified: true,
  },
  {
    id: "6",
    name: "강태양",
    handle: "@taeyang_edu",
    category: "교육/정보",
    platforms: ["youtube"],
    followers: "31만",
    avatar: "TY",
    color: "#F7B731",
    verified: false,
  },
];

function PlatformIcon({ platform }: { platform: string }) {
  if (platform === "youtube") return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="text-red-500">
      <path d="M23.495 6.205a3.007 3.007 0 0 0-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 0 0 .527 6.205a31.247 31.247 0 0 0-.522 5.805 31.247 31.247 0 0 0 .522 5.783 3.007 3.007 0 0 0 2.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 0 0 2.088-2.088 31.247 31.247 0 0 0 .5-5.783 31.247 31.247 0 0 0-.5-5.805zM9.609 15.601V8.408l6.264 3.602z"/>
    </svg>
  );
  if (platform === "instagram") return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="text-pink-500">
      <rect x="2" y="2" width="20" height="20" rx="5" stroke="currentColor" strokeWidth="2"/>
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2"/>
      <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor"/>
    </svg>
  );
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="text-[#111111]">
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.79 1.52V6.76a4.85 4.85 0 01-1.02-.07z"/>
    </svg>
  );
}

export default function FeaturedInfluencers() {
  return (
    <section className="bg-white py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-xs font-semibold text-[#E8292E] uppercase tracking-wider mb-2">
              인플루언서
            </p>
            <h2 className="text-3xl sm:text-4xl font-black text-[#111111]">
              주목받는<br />크리에이터
            </h2>
          </div>
          <Link
            href="/influencers"
            className="hidden sm:block text-sm font-medium text-gray-500 hover:text-[#E8292E] transition-colors"
          >
            전체 보기 →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {influencers.map((inf) => (
            <Link
              key={inf.id}
              href={`/influencers/${inf.id}`}
              className="group bg-white border border-gray-100 rounded-2xl p-5 hover:border-gray-200 hover:shadow-lg transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  {/* Avatar */}
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-sm shrink-0"
                    style={{ backgroundColor: inf.color }}
                  >
                    {inf.avatar}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-[#111111] text-sm">
                        {inf.name}
                      </span>
                      {inf.verified && (
                        <span className="w-4 h-4 bg-[#E8292E] rounded-full flex items-center justify-center">
                          <svg width="8" height="8" viewBox="0 0 10 10" fill="none">
                            <path d="M2 5l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-400">{inf.handle}</div>
                  </div>
                </div>
                <span className="text-xs bg-gray-50 text-gray-500 px-2 py-1 rounded-full">
                  {inf.category}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xl font-black text-[#111111]">
                    {inf.followers}
                  </div>
                  <div className="text-xs text-gray-400">팔로워</div>
                </div>
                <div className="flex gap-1.5">
                  {inf.platforms.map((p) => (
                    <div
                      key={p}
                      className="w-7 h-7 rounded-lg bg-gray-50 flex items-center justify-center"
                    >
                      <PlatformIcon platform={p} />
                    </div>
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="sm:hidden text-center mt-6">
          <Link href="/influencers" className="text-sm font-medium text-[#E8292E]">
            전체 인플루언서 보기 →
          </Link>
        </div>
      </div>
    </section>
  );
}
