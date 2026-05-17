import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "이용약관",
  description: "온인플 서비스 이용약관을 확인하세요. 서비스 이용 조건 및 절차, 운영자와 이용자 간의 권리·의무를 규정합니다.",
  openGraph: {
    title: "이용약관 | ONINPLE",
    description: "온인플 서비스 이용약관",
    url: "https://www.oninple.com/terms",
  },
  alternates: { canonical: "https://www.oninple.com/terms" },
};

const UPDATED = "2026년 5월 16일";

function Section({ num, title, children }: { num: string; title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="text-base font-black text-[#111111] mb-4">
        제{num}조 ({title})
      </h2>
      <div className="space-y-2 text-sm text-gray-600 leading-relaxed">{children}</div>
    </section>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return <p>{children}</p>;
}

function List({ items }: { items: string[] }) {
  return (
    <ul className="space-y-1.5 pl-4">
      {items.map((item, i) => (
        <li key={i} className="flex gap-2">
          <span className="text-[#E8292E] shrink-0 font-bold">{i + 1}.</span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* 헤더 */}
      <div className="mb-12 pb-8 border-b border-gray-100">
        <p className="text-xs font-semibold text-[#E8292E] uppercase tracking-widest mb-3">Legal</p>
        <h1 className="text-2xl font-black text-[#111111] mb-2">이용약관</h1>
        <p className="text-xs text-gray-400">시행일: {UPDATED}</p>
      </div>

      <div className="prose-none">
        <Section num="1" title="목적">
          <P>
            이 약관은 온인플(이하 "서비스")을 운영하는 운영자(이하 "운영자")가 제공하는 인플루언서·편집 프로듀서·광고주 연결 디렉토리 플랫폼 서비스의 이용 조건 및 절차,
            운영자와 이용자 간의 권리·의무 및 책임사항, 기타 필요한 사항을 규정함을 목적으로 합니다.
          </P>
        </Section>

        <Section num="2" title="정의">
          <List items={[
            '"서비스"란 운영자가 제공하는 온인플(ONINPLE) 플랫폼 및 관련 제반 서비스를 의미합니다.',
            '"이용자"란 이 약관에 동의하고 서비스를 이용하는 모든 회원을 의미합니다.',
            '"회원"이란 서비스에 Google 계정으로 로그인하여 가입한 자를 의미합니다.',
            '"채널"이란 회원이 서비스에 등록한 인플루언서 또는 편집 프로듀서 프로필 정보를 의미합니다.',
          ]} />
        </Section>

        <Section num="3" title="약관의 효력 및 변경">
          <List items={[
            '이 약관은 서비스 내 공지 또는 별도의 방법으로 이용자에게 게시함으로써 효력이 발생합니다.',
            '운영자는 필요한 경우 약관을 변경할 수 있으며, 변경된 약관은 공지 후 7일이 경과한 날부터 효력이 발생합니다.',
            '이용자가 변경된 약관에 동의하지 않는 경우 서비스 이용을 중단하고 회원 탈퇴를 요청할 수 있습니다.',
          ]} />
        </Section>

        <Section num="4" title="서비스의 제공">
          <P>운영자는 다음과 같은 서비스를 제공합니다.</P>
          <List items={[
            '인플루언서·편집 프로듀서 채널 프로필 등록 및 디렉토리 서비스',
            '카카오 오픈채팅을 통한 직접 연결 지원',
            '채널 검색·탐색 서비스',
            '공지사항, 블로그 등 정보 제공 서비스',
            '기타 운영자가 정하는 서비스',
          ]} />
        </Section>

        <Section num="5" title="회원 가입">
          <List items={[
            '이용자는 Google 계정을 통한 OAuth 인증으로 서비스에 가입할 수 있습니다.',
            '만 14세 미만의 아동은 서비스에 가입할 수 없습니다.',
            '회원 가입 시 이용자는 정확하고 최신의 정보를 제공하여야 합니다.',
            '타인의 정보를 도용하거나 허위 정보를 제공한 경우, 운영자는 해당 계정을 제한하거나 삭제할 수 있습니다.',
          ]} />
        </Section>

        <Section num="6" title="회원의 의무">
          <P>이용자는 다음 각 호의 행위를 하여서는 아니 됩니다.</P>
          <List items={[
            '타인의 계정을 도용하거나 부정한 방법으로 서비스를 이용하는 행위',
            '채널 정보, 팔로워 수, 조회수 등을 허위로 등록하는 행위',
            '다른 이용자 또는 제3자를 비방·명예훼손하거나 사생활을 침해하는 행위',
            '음란물, 폭력적 콘텐츠 등 불법적이거나 부적절한 내용을 게시하는 행위',
            '서비스의 정상적인 운영을 방해하는 행위',
            '관련 법령을 위반하는 행위',
          ]} />
        </Section>

        <Section num="7" title="운영자의 권한">
          <List items={[
            '운영자는 이용자가 제6조를 위반한 경우 경고 조치를 취할 수 있습니다.',
            '운영자는 동일한 위반 행위가 반복되거나 중대한 위반이 있는 경우 서비스 이용을 제한하거나 강제 탈퇴 처리할 수 있습니다.',
            '운영자는 서비스의 원활한 운영을 위해 채널 정보, 게시물 등을 검토하고 필요 시 삭제 또는 수정할 수 있습니다.',
            '운영자는 위 조치를 취하기 전 사전 고지를 원칙으로 하나, 긴급한 경우 사후 고지할 수 있습니다.',
          ]} />
        </Section>

        <Section num="8" title="서비스 이용 제한 및 중단">
          <List items={[
            '운영자는 시스템 점검, 긴급 장애 대응 등 기술적 사유로 서비스를 일시 중단할 수 있습니다.',
            '운영자는 서비스 제공에 필요한 설비 교체, 유지보수 등의 사유로 서비스를 변경하거나 종료할 수 있습니다.',
            '서비스 종료 시 운영자는 30일 이전에 공지합니다.',
          ]} />
        </Section>

        <Section num="9" title="회원 탈퇴">
          <List items={[
            '이용자는 언제든지 서비스 내 마이페이지를 통해 탈퇴를 요청할 수 있습니다.',
            '탈퇴 요청 시 해당 회원의 채널 정보 및 개인정보는 관련 법령이 정한 기간에 따라 처리됩니다.',
            '운영자가 정책 위반으로 강제 탈퇴한 경우, 해당 이용자는 재가입이 제한될 수 있습니다.',
          ]} />
        </Section>

        <Section num="10" title="면책조항">
          <List items={[
            '운영자는 천재지변, 디도스 공격, IDC 장애 등 불가항력적 사유로 인한 서비스 중단에 대해 책임을 지지 않습니다.',
            '운영자는 이용자가 서비스 내에 게시한 정보·자료의 정확성 및 신뢰성에 대해 보증하지 않습니다.',
            '운영자는 이용자 간 또는 이용자와 제3자 간에 서비스를 매개로 발생한 분쟁에 개입하지 않으며, 이로 인한 손해를 배상할 책임이 없습니다.',
            '서비스는 채널과 광고주를 연결하는 디렉토리 플랫폼으로, 실제 계약 및 거래는 이용자 간에 이루어지며 운영자는 이에 관여하지 않습니다.',
          ]} />
        </Section>

        <Section num="11" title="지적재산권">
          <List items={[
            '서비스에 관련된 저작권 및 지적재산권은 운영자에게 귀속됩니다.',
            '이용자는 서비스에 자신이 등록한 콘텐츠(채널명, 소개글 등)에 대한 권리를 보유하며, 운영자에게 서비스 운영에 필요한 범위 내의 사용 권한을 부여합니다.',
            '이용자는 운영자의 사전 동의 없이 서비스의 콘텐츠를 복제, 배포, 변경하거나 상업적으로 이용할 수 없습니다.',
          ]} />
        </Section>

        <Section num="12" title="준거법 및 관할법원">
          <List items={[
            '이 약관의 해석 및 적용에 관해서는 대한민국 법령을 준거법으로 합니다.',
            '서비스 이용과 관련하여 운영자와 이용자 간 분쟁이 발생한 경우, 민사소송법상 관할 법원에 소를 제기할 수 있습니다.',
          ]} />
        </Section>
      </div>

      <div className="mt-12 pt-8 border-t border-gray-100 text-xs text-gray-400">
        <p>본 약관은 {UPDATED}부터 적용됩니다.</p>
      </div>
    </div>
  );
}
