import { createServiceClient } from "@/lib/supabase/service";
import HomeClient from "@/components/home/HomeClient";
import PageViewTracker from "@/components/PageViewTracker";
import type { DirectoryChannel } from "@/components/home/ChannelDirectory";

export default async function HomePage() {
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("channels")
    .select(
      "id, platform, channel_name, follower_count, categories, can_collaborate, profile_image_url, bio, avg_views, upload_frequency, content_format, content_keywords, audience_age, audience_gender, channel_url, video_url_1, video_url_2, feed_thumbnail_1, kakao_open_chat, ai_tools, work_fields, portfolio_url, is_verified"
    )
    .order("follower_count", { ascending: false });

  return (
    <>
      <PageViewTracker page="/" />
      <HomeClient channels={(data as DirectoryChannel[]) ?? []} />
    </>
  );
}
