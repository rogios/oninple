export default function NoticeDetailLoading() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* 뒤로가기 */}
      <div className="flex items-center gap-1.5 mb-8">
        <div className="w-3.5 h-3.5 bg-gray-200 rounded animate-pulse" />
        <div className="w-20 h-3 bg-gray-200 rounded animate-pulse" />
      </div>

      <article className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
        {/* 헤더 */}
        <div className="mb-6 pb-6 border-b border-gray-100 space-y-3">
          <div className="w-2/3 h-5 bg-gray-200 rounded-lg animate-pulse" />
          <div className="w-24 h-3 bg-gray-100 rounded animate-pulse" />
        </div>

        {/* 본문 */}
        <div className="space-y-2.5">
          {[1, 0.95, 0.88, 1, 0.75, 0.92, 0.6].map((w, i) => (
            <div
              key={i}
              className="h-4 bg-gray-100 rounded animate-pulse"
              style={{ width: `${w * 100}%` }}
            />
          ))}
          <div className="pt-2" />
          {[0.9, 1, 0.7].map((w, i) => (
            <div
              key={i + 10}
              className="h-4 bg-gray-100 rounded animate-pulse"
              style={{ width: `${w * 100}%` }}
            />
          ))}
        </div>
      </article>
    </div>
  );
}
