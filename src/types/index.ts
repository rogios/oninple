export type Platform = "youtube" | "instagram" | "tiktok" | "editor";

// ─── 1차 카테고리 ─────────────────────────────────────────────────────────────
export type CategoryParent =
  | "beauty" | "food" | "travel" | "sports" | "entertainment"
  | "tech" | "lifestyle" | "education" | "business" | "other";

// ─── 2차 카테고리 ─────────────────────────────────────────────────────────────
export type CategorySub =
  // 뷰티/패션
  | "beauty_makeup" | "beauty_skincare" | "beauty_hair" | "beauty_nail"
  | "beauty_fashion" | "beauty_fragrance"
  // 푸드
  | "food_cooking" | "food_restaurant" | "food_cafe" | "food_diet"
  | "food_alcohol" | "food_mukbang"
  // 여행/아웃도어
  | "travel_domestic" | "travel_overseas" | "travel_camping" | "travel_hiking"
  | "travel_car_camping" | "travel_fishing"
  // 스포츠/건강
  | "sports_gym" | "sports_yoga" | "sports_running" | "sports_sports" | "sports_diet"
  // 엔터테인먼트
  | "ent_vlog" | "ent_music" | "ent_dance" | "ent_comedy" | "ent_review" | "ent_asmr"
  // IT/테크
  | "tech_smartphone" | "tech_app" | "tech_gaming" | "tech_ai" | "tech_coding"
  // 라이프스타일
  | "life_interior" | "life_pets" | "life_parenting" | "life_car" | "life_minimal"
  // 교육
  | "edu_language" | "edu_cert" | "edu_entrance" | "edu_reading" | "edu_history"
  // 비즈니스/재테크
  | "biz_startup" | "biz_invest" | "biz_realestate" | "biz_marketing" | "biz_career"
  // 기타
  | "other_religion" | "other_politics" | "other_webtoon" | "other_fandom" | "other_kidult";

// ─── 레거시 (구버전 DB 데이터 호환) ───────────────────────────────────────────
export type CategoryLegacy = "gaming" | "parenting" | "camping";

export type Category = CategoryParent | CategorySub | CategoryLegacy;

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
