import type { Metadata } from "next";
import { createServiceClient } from "@/lib/supabase/service";
import HomeClient from "@/components/home/HomeClient";
import PageViewTracker from "@/components/PageViewTracker";
import type { DirectoryChannel } from "@/components/home/ChannelDirectory";

const SITE_URL = "https://www.oninple.com";

export const metadata: Metadata = {
  alternates: { canonical: SITE_URL },
  openGraph: { url: SITE_URL },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: "온인플 (ONINPLE)",
      description: "인플루언서·편집자·광고주 무료 디렉토리",
      inLanguage: "ko-KR",
      potentialAction: {
        "@type": "SearchAction",
        target: { "@type": "EntryPoint", urlTemplate: `${SITE_URL}/?q={search_term_string}` },
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: "온인플",
      url: SITE_URL,
      logo: { "@type": "ImageObject", url: `${SITE_URL}/favicon.png` },
      description: "수수료 없이 크리에이터·편집자·광고주를 연결하는 무료 플랫폼",
    },
  ],
};

const BASE_SELECT =
  "id, platform, channel_name, follower_count, categories, can_collaborate, profile_image_url, bio, avg_views, upload_frequency, content_format, content_keywords, audience_age, audience_gender, channel_url, video_url_1, video_url_2, feed_thumbnail_1, feed_thumbnail_2, feed_url_1, feed_url_2, kakao_open_chat, ai_tools, work_fields, portfolio_url";

export default async function HomePage() {
  const supabase = createServiceClient();

  // is_verified 컬럼이 존재하면 함께 가져오고, 없으면 기본 필드만 조회
  let channels: DirectoryChannel[] = [];

  const { data: d1, error } = await supabase
    .from("channels")
    .select(`${BASE_SELECT}, is_verified`)
    .order("follower_count", { ascending: false });

  if (!error && d1) {
    channels = d1 as DirectoryChannel[];
  } else {
    const { data: d2 } = await supabase
      .from("channels")
      .select(BASE_SELECT)
      .order("follower_count", { ascending: false });
    channels = (d2 as DirectoryChannel[]) ?? [];
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PageViewTracker page="/" />
      <HomeClient channels={channels} />
    </>
  );
}
