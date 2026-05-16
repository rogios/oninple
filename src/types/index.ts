export type Platform = "youtube" | "instagram" | "tiktok" | "editor";

export type Category =
  | "beauty"
  | "food"
  | "travel"
  | "lifestyle"
  | "gaming"
  | "tech"
  | "parenting"
  | "sports"
  | "camping"
  | "other";

export type GradeKey =
  | "500"
  | "1k"
  | "5k"
  | "10k"
  | "50k"
  | "100k"
  | "500k"
  | "1m"
  | "5m";

export interface Creator {
  id: string;
  platform: Platform;
  name: string;
  handle: string;
  avatar: string;        // initials or URL
  avatarColor: string;
  intro: string;
  category: Category;
  subscribers: number;   // or followers
  avgViews: number;
  uploadCycle?: string;  // youtube only
  contentFormat: string[];
  available: boolean;
  grade: GradeKey;
  // optional
  videoLinks?: [string?, string?];
  audienceAge?: string;
  audienceGender?: string;
  keywords?: string[];
  kakaoLink?: string;
  channelUrl?: string;
}
