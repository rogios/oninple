import Link from "next/link";

const categories = [
  { name: "뷰티/패션", emoji: "💄", count: "2,841", slug: "beauty" },
  { name: "푸드/요리", emoji: "🍳", count: "1,920", slug: "food" },
  { name: "여행/라이프", emoji: "✈️", count: "1,654", slug: "travel" },
  { name: "게임/IT", emoji: "🎮", count: "2,103", slug: "gaming" },
  { name: "피트니스", emoji: "💪", count: "987", slug: "fitness" },
  { name: "교육/정보", emoji: "📚", count: "1,230", slug: "education" },
  { name: "엔터/코미디", emoji: "🎭", count: "876", slug: "entertainment" },
  { name: "비즈니스", emoji: "💼", count: "543", slug: "business" },
];

export default function CategorySection() {
  return (
    <section className="bg-gray-50 dark:bg-[#111827] py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-xs font-semibold text-[#E8292E] uppercase tracking-wider mb-2">
              카테고리
            </p>
            <h2 className="text-3xl sm:text-4xl font-black text-[#111111] dark:text-[#F9FAFB]">
              원하는 분야를<br />찾아보세요
            </h2>
          </div>
          <Link
            href="/influencers"
            className="hidden sm:block text-sm font-medium text-gray-500 dark:text-[#9CA3AF] hover:text-[#E8292E] dark:hover:text-[#E8292E] transition-colors"
          >
            전체 보기 →
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/influencers?category=${cat.slug}`}
              className="group bg-white dark:bg-[#1F2937] rounded-2xl p-5 flex items-center gap-4 border border-gray-100 dark:border-[#374151] hover:border-[#E8292E]/30 dark:hover:border-[#E8292E]/50 hover:shadow-md transition-all"
            >
              <span className="text-3xl">{cat.emoji}</span>
              <div>
                <div className="text-sm font-semibold text-[#111111] dark:text-[#F9FAFB] group-hover:text-[#E8292E] dark:group-hover:text-[#E8292E] transition-colors">
                  {cat.name}
                </div>
                <div className="text-xs text-gray-400 dark:text-[#6B7280] mt-0.5">{cat.count}명</div>
              </div>
            </Link>
          ))}
        </div>

        <div className="sm:hidden text-center mt-6">
          <Link
            href="/influencers"
            className="text-sm font-medium text-[#E8292E]"
          >
            전체 카테고리 보기 →
          </Link>
        </div>
      </div>
    </section>
  );
}
