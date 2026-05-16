"use client";

import { useState } from "react";
import HeroSection from "./HeroSection";
import ChannelDirectory from "./ChannelDirectory";
import type { DirectoryChannel } from "./ChannelDirectory";

const ALL_PLATFORMS = ["youtube", "instagram", "tiktok", "editor"];

export default function HomeClient({ channels }: { channels: DirectoryChannel[] }) {
  const [activePlatforms, setActivePlatforms] = useState<string[]>(ALL_PLATFORMS);

  function togglePlatform(platform: string) {
    setActivePlatforms((prev) => {
      if (prev.includes(platform)) {
        if (prev.length <= 1) return prev; // 최소 1개 유지
        return prev.filter((p) => p !== platform);
      }
      return [...prev, platform];
    });
  }

  return (
    <>
      <HeroSection activePlatforms={activePlatforms} onTogglePlatform={togglePlatform} />
      <ChannelDirectory channels={channels} activePlatforms={activePlatforms} />
    </>
  );
}
