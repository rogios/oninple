import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "개인정보처리방침",
  description: "온인플의 개인정보처리방침을 확인하세요. Google OAuth 인증을 통한 개인정보 수집 및 이용, 보유 기간, 제3자 제공 방침을 안내합니다.",
  openGraph: {
    title: "개인정보처리방침 | ONINPLE",
    description: "온인플 개인정보처리방침",
    url: "https://oninple.com/privacy",
  },
  alternates: { canonical: "https://oninple.com/privacy" },
};

const UPDATED = "2026년 5월 16일";

function Section({ num, title, children }: { num: string; title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="text-base font-black text-[#111111] dark:text-[#F9FAFB] mb-4">
        제{num}조 ({title})
      </h2>
      <div className="space-y-3 text-sm text-gray-600 dark:text-[#9CA3AF] leading-relaxed">{children}</div>
    </section>
  );
}

function Table({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-[#374151]">
      <table className="w-full text-xs">
        <thead className="bg-gray-50 dark:bg-[#374151] border-b border-gray-200 dark:border-[#4B5563]">
          <tr>
            {headers.map((h) => (
              <th key={h} className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-[#9CA3AF] whitespace-nowrap">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-[#374151]">
          {rows.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => (
                <td key={j} className="px-4 py-3 text-gray-600 dark:text-[#9CA3AF] align-top">{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
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

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* 헤더 */}
      <div className="mb-12 pb-8 border-b border-gray-100 dark:border-[#374151]">
        <p className="text-xs font-semibold text-[#E8292E] uppercase tracking-widest mb-3">Legal</p>
        <h1 className="text-2xl font-black text-[#111111] dark:text-[#F9FAFB] mb-2">개인정보처리방침</h1>
        <p className="text-xs text-gray-400 dark:text-[#6B7280]">시행일: {UPDATED}</p>
      </div>

      <div className="prose-none">
        {/* 개요 */}
        <div className="bg-gray-50 dark:bg-[#374151] rounded-2xl p-5 mb-10 text-sm text-gray-600 dark:text-[#9CA3AF] leading-relaxed">
          온인플(ONINPLE)은 개인정보보호법 등 관련 법령에 따라 이용자의 개인정보를 보호하고, 이와 관련한 고충을 신속하게 처리하기 위하여 다음과 같이 개인정보처리방침을 수립·공개합니다.
        </div>

        <Section num="1" title="수집하는 개인정보의 항목">
          <p>온인플은 서비스 제공을 위해 다음과 같은 개인정보를 수집합니다.</p>
          <Table
            headers={["구분", "수집 항목", "수집 방법"]}
            rows={[
              ["회원 가입 시 (필수)", "이름, 이메일 주소, 프로필 이미지", "Google OAuth 인증"],
              ["채널 등록 시 (선택)", "채널명, 채널 URL, 팔로워 수, 카테고리, 소개글, 카카오 오픈채팅 링크, 대표 영상 URL, 썸네일 이미지 URL", "이용자 직접 입력"],
              ["서비스 이용 시 (자동)", "접속 IP, 접속 일시, 서비스 이용 기록", "자동 수집"],
            ]}
          />
        </Section>

        <Section num="2" title="개인정보의 수집 및 이용 목적">
          <Table
            headers={["이용 목적", "수집 항목"]}
            rows={[
              ["회원 식별 및 서비스 제공", "이름, 이메일, 프로필 이미지"],
              ["채널 디렉토리 표시 및 검색", "채널명, 채널 URL, 팔로워 수, 카테고리, 소개글 등"],
              ["광고주·인플루언서 직접 연결 지원", "카카오 오픈채팅 링크"],
              ["서비스 운영 및 개선, 부정 이용 방지", "접속 기록, 이용 기록"],
              ["공지사항, 서비스 관련 안내", "이메일"],
            ]}
          />
        </Section>

        <Section num="3" title="개인정보의 보유 및 이용 기간">
          <p>온인플은 회원 탈퇴 시 또는 수집·이용 목적이 달성된 경우 해당 개인정보를 지체 없이 파기합니다. 단, 관련 법령에 따라 일정 기간 보유해야 하는 경우는 다음과 같습니다.</p>
          <Table
            headers={["보존 항목", "보존 근거", "보존 기간"]}
            rows={[
              ["계약 또는 청약철회 등에 관한 기록", "전자상거래 등에서의 소비자보호에 관한 법률", "5년"],
              ["소비자 불만 또는 분쟁처리에 관한 기록", "전자상거래 등에서의 소비자보호에 관한 법률", "3년"],
              ["접속에 관한 기록", "통신비밀보호법", "3개월"],
            ]}
          />
        </Section>

        <Section num="4" title="개인정보의 제3자 제공">
          <p>온인플은 원칙적으로 이용자의 개인정보를 외부에 제공하지 않습니다. 다만, 다음의 경우에는 예외로 합니다.</p>
          <List items={[
            '이용자가 사전에 동의한 경우',
            '법령의 규정에 의거하거나, 수사 목적으로 법령에 정해진 절차와 방법에 따라 수사기관의 요구가 있는 경우',
          ]} />
          <p className="text-sm text-gray-600 leading-relaxed mt-2">온인플은 광고주와 인플루언서·편집 프로듀서 간 연결을 위해 채널 프로필 정보(채널명, 카테고리, 소개글, 카카오 오픈채팅 링크 등)를 서비스 내에 공개적으로 표시합니다. 이용자는 채널 등록 시 이에 동의하는 것으로 간주됩니다.</p>
        </Section>

        <Section num="5" title="개인정보 처리의 위탁">
          <p>온인플은 서비스 제공을 위해 다음과 같이 개인정보 처리 업무를 위탁하고 있습니다.</p>
          <Table
            headers={["수탁업체", "위탁 업무", "보유 기간"]}
            rows={[
              ["Google LLC", "Google OAuth 소셜 로그인 인증", "회원 탈퇴 시까지"],
              ["Supabase Inc.", "데이터베이스 및 인증 서비스 운영", "회원 탈퇴 시까지"],
            ]}
          />
        </Section>

        <Section num="6" title="Google OAuth 관련 안내">
          <List items={[
            '온인플은 Google OAuth 2.0을 통해서만 회원 가입이 가능합니다.',
            'Google 계정 연동 시 Google로부터 이름, 이메일 주소, 프로필 이미지를 수신합니다.',
            '온인플은 Google 계정의 비밀번호에는 접근하지 않습니다.',
            'Google 계정과의 연동 해제는 Google 계정 설정 > 보안 > 타사 앱 액세스에서 직접 해제하거나, 온인플 회원 탈퇴를 통해 처리할 수 있습니다.',
            'Google의 개인정보처리방침: https://policies.google.com/privacy',
          ]} />
        </Section>

        <Section num="7" title="이용자의 권리 및 행사 방법">
          <p>이용자는 온인플에 대해 언제든지 다음 각 호의 개인정보 보호 관련 권리를 행사할 수 있습니다.</p>
          <List items={[
            '개인정보 열람 요구',
            '오류 등이 있을 경우 정정 요구',
            '삭제 요구',
            '처리 정지 요구',
          ]} />
          <p>위 권리의 행사는 서비스 내 마이페이지 또는 문의하기 페이지를 통해 요청하실 수 있습니다. 온인플은 요청을 받은 날로부터 10일 이내에 처리 결과를 알려드립니다.</p>
        </Section>

        <Section num="8" title="개인정보의 파기">
          <p>온인플은 개인정보 보유 기간의 경과, 처리 목적 달성 등 개인정보가 불필요하게 되었을 때에는 지체 없이 해당 개인정보를 파기합니다.</p>
          <List items={[
            '전자적 파일 형태로 저장된 개인정보: 기록을 재생할 수 없는 기술적 방법을 사용하여 삭제',
            '종이에 출력된 개인정보: 분쇄기로 분쇄하거나 소각',
          ]} />
        </Section>

        <Section num="9" title="개인정보의 안전성 확보 조치">
          <p>온인플은 개인정보의 안전성 확보를 위해 다음과 같은 조치를 취하고 있습니다.</p>
          <List items={[
            '개인정보의 암호화: 이용자의 개인정보는 암호화되어 저장 및 관리됩니다.',
            '해킹 등에 대비한 기술적 대책: 보안 프로그램 설치, 시스템 모니터링을 통해 개인정보 유출을 방지합니다.',
            '개인정보 접근 제한: 개인정보를 처리하는 데이터베이스에 대한 접근 권한을 최소화합니다.',
          ]} />
        </Section>

        <Section num="10" title="쿠키의 운용">
          <List items={[
            '온인플은 이용자에게 최적화된 서비스를 제공하기 위해 쿠키(cookie)를 사용합니다.',
            '쿠키는 웹사이트를 운영하는 데 이용되는 서버가 이용자의 브라우저에 보내는 작은 텍스트 파일로, 이용자 컴퓨터의 하드디스크에 저장됩니다.',
            '이용자는 브라우저 설정을 통해 쿠키 저장을 거부하거나 삭제할 수 있으나, 이 경우 서비스 이용에 제한이 있을 수 있습니다.',
          ]} />
        </Section>

        <Section num="11" title="개인정보 보호책임자">
          <p>온인플은 개인정보 처리에 관한 업무를 총괄해서 책임지고, 개인정보 처리와 관련한 이용자의 불만처리 및 피해구제 등을 위하여 아래와 같이 개인정보 보호책임자를 지정하고 있습니다.</p>
          <div className="bg-gray-50 dark:bg-[#374151] rounded-xl p-4 text-sm space-y-1">
            <p><span className="font-semibold text-[#111111] dark:text-[#F9FAFB]">서비스명:</span> 온인플 (ONINPLE)</p>
            <p><span className="font-semibold text-[#111111] dark:text-[#F9FAFB]">문의:</span> 서비스 내 문의하기 페이지 이용</p>
          </div>
          <p>기타 개인정보 침해에 대한 신고 또는 상담은 아래 기관에 문의하실 수 있습니다.</p>
          <List items={[
            '개인정보 침해신고센터: privacy.kisa.or.kr / (국번없이) 118',
            '대검찰청 사이버수사과: www.spo.go.kr / (국번없이) 1301',
            '경찰청 사이버안전국: cyberbureau.police.go.kr / (국번없이) 182',
          ]} />
        </Section>

        <Section num="12" title="개인정보처리방침의 변경">
          <p>
            이 개인정보처리방침은 {UPDATED}부터 적용됩니다. 내용의 추가·삭제 및 수정이 있을 경우, 변경 사항 시행 7일 전부터 서비스 내 공지사항을 통해 고지합니다.
          </p>
        </Section>
      </div>

      <div className="mt-12 pt-8 border-t border-gray-100 dark:border-[#374151] text-xs text-gray-400 dark:text-[#6B7280]">
        <p>본 방침은 {UPDATED}부터 적용됩니다.</p>
      </div>
    </div>
  );
}
