export default function Banner() {
  return (
    <div
      id="slim-banner"
      className="w-full bg-[#111111] text-white text-xs text-center py-2 px-4 flex items-center justify-center gap-3"
    >
      <span className="hidden sm:inline text-gray-400">📣</span>
      <span>
        <strong className="text-[#E8292E]">ONINPLE</strong>
        &nbsp;— 인플루언서·편집자 무료 등록 중. 지금 바로 시작하세요.
      </span>
      <a
        href="/signup"
        className="shrink-0 text-xs font-semibold text-[#E8292E] underline underline-offset-2 hover:text-white transition-colors"
      >
        무료 등록 →
      </a>
    </div>
  );
}
