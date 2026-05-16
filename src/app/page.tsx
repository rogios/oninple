import { createServiceClient } from "@/lib/supabase/service";
import HomeClient from "@/components/home/HomeClient";
import PageViewTracker from "@/components/PageViewTracker";
import type { DirectoryChannel } from "@/components/home/ChannelDirectory";

const BASE_SELECT =
  "id, platform, channel_name, follower_count, categories, can_collaborate, profile_image_url, bio, avg_views, upload_frequency, content_format, content_keywords, audience_age, audience_gender, channel_url, video_url_1, video_url_2, feed_thumbnail_1, kakao_open_chat, ai_tools, work_fields, portfolio_url";

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
      <PageViewTracker page="/" />
      <HomeClient channels={channels} />
    </>
  );
}
