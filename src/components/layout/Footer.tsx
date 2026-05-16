import Link from "next/link";

const footerLinks = {
  서비스: [
    { label: "인플루언서 찾기", href: "/influencers" },
    { label: "AI 편집자", href: "/editors" },
    { label: "광고주 등록", href: "/advertisers" },
  ],
  회사: [
    { label: "소개", href: "/about" },
    { label: "블로그", href: "/blog" },
    { label: "문의", href: "/contact" },
  ],
  법적고지: [
    { label: "이용약관", href: "/terms" },
    { label: "개인정보처리방침", href: "/privacy" },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-[#111111] text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <span className="text-2xl font-black text-[#E8292E] tracking-tight">
              ONINPLE
            </span>
            <p className="mt-3 text-sm text-gray-400 leading-relaxed">
              유튜브·인스타·틱톡 인플루언서와<br />
              AI 편집자, 광고주를 연결하는<br />
              무료 디렉토리 플랫폼
            </p>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([group, links]) => (
            <div key={group}>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
                {group}
              </h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-gray-300 hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-gray-500">
            © 2026 ONINPLE. All rights reserved.
          </p>
          <div className="flex gap-4">
            <a href="#" className="text-gray-500 hover:text-white transition-colors text-xs">
              YouTube
            </a>
            <a href="#" className="text-gray-500 hover:text-white transition-colors text-xs">
              Instagram
            </a>
            <a href="#" className="text-gray-500 hover:text-white transition-colors text-xs">
              TikTok
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
