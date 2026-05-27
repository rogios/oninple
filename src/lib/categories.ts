// ─── 1차/2차 카테고리 공통 상수 ───────────────────────────────────────────────
// ChannelDirectory, ChannelNewForm, ChannelEditForm 에서 공유

export type SubCategory = { key: string; label: string };

export type ParentCategory = {
  key: string;
  label: string;
  /** 이전 데이터 호환용 레거시 key (DB에 이미 저장된 구버전 값) */
  legacyKeys?: string[];
  sub: SubCategory[];
};

export const CATEGORY_TREE: ParentCategory[] = [
  {
    key: "beauty", label: "뷰티/패션",
    sub: [
      { key: "beauty_makeup",    label: "메이크업" },
      { key: "beauty_skincare",  label: "스킨케어" },
      { key: "beauty_hair",      label: "헤어" },
      { key: "beauty_nail",      label: "네일" },
      { key: "beauty_fashion",   label: "패션/스타일" },
      { key: "beauty_fragrance", label: "향수/뷰티리뷰" },
    ],
  },
  {
    key: "food", label: "푸드",
    sub: [
      { key: "food_cooking",    label: "요리/레시피" },
      { key: "food_restaurant", label: "맛집탐방" },
      { key: "food_cafe",       label: "카페/디저트" },
      { key: "food_diet",       label: "다이어트식단" },
      { key: "food_alcohol",    label: "술/와인" },
      { key: "food_mukbang",    label: "먹방" },
    ],
  },
  {
    key: "travel", label: "여행/아웃도어",
    sub: [
      { key: "travel_domestic",    label: "국내여행" },
      { key: "travel_overseas",    label: "해외여행" },
      { key: "travel_camping",     label: "캠핑/백패킹" },
      { key: "travel_hiking",      label: "등산/트레킹" },
      { key: "travel_car_camping", label: "차박" },
      { key: "travel_fishing",     label: "낚시" },
    ],
  },
  {
    key: "sports", label: "스포츠/건강",
    sub: [
      { key: "sports_gym",     label: "헬스/피트니스" },
      { key: "sports_yoga",    label: "요가/필라테스" },
      { key: "sports_running", label: "러닝/마라톤" },
      { key: "sports_sports",  label: "스포츠" },
      { key: "sports_diet",    label: "다이어트" },
    ],
  },
  {
    key: "entertainment", label: "엔터테인먼트",
    sub: [
      { key: "ent_vlog",   label: "브이로그" },
      { key: "ent_music",  label: "음악/커버" },
      { key: "ent_dance",  label: "댄스" },
      { key: "ent_comedy", label: "코미디/유머" },
      { key: "ent_review", label: "영화/드라마리뷰" },
      { key: "ent_asmr",   label: "ASMR" },
    ],
  },
  {
    key: "tech", label: "IT/테크",
    legacyKeys: ["gaming"],
    sub: [
      { key: "tech_smartphone", label: "스마트폰/가전" },
      { key: "tech_app",        label: "앱/소프트웨어" },
      { key: "tech_gaming",     label: "게임" },
      { key: "tech_ai",         label: "AI/테크트렌드" },
      { key: "tech_coding",     label: "코딩/개발" },
    ],
  },
  {
    key: "lifestyle", label: "라이프스타일",
    legacyKeys: ["parenting"],
    sub: [
      { key: "life_interior",  label: "인테리어/DIY" },
      { key: "life_pets",      label: "반려동물" },
      { key: "life_parenting", label: "육아/패밀리" },
      { key: "life_car",       label: "자동차/모빌리티" },
      { key: "life_minimal",   label: "미니멀라이프" },
    ],
  },
  {
    key: "education", label: "교육",
    sub: [
      { key: "edu_language", label: "어학/외국어" },
      { key: "edu_cert",     label: "자격증/취업" },
      { key: "edu_entrance", label: "입시/학습" },
      { key: "edu_reading",  label: "독서/인문" },
      { key: "edu_history",  label: "역사/다큐" },
    ],
  },
  {
    key: "business", label: "비즈니스/재테크",
    sub: [
      { key: "biz_startup",    label: "창업/스타트업" },
      { key: "biz_invest",     label: "재테크/투자" },
      { key: "biz_realestate", label: "부동산" },
      { key: "biz_marketing",  label: "마케팅/브랜딩" },
      { key: "biz_career",     label: "직장생활/커리어" },
    ],
  },
  {
    key: "other", label: "기타",
    sub: [
      { key: "other_religion", label: "종교/철학" },
      { key: "other_politics", label: "정치/사회" },
      { key: "other_webtoon",  label: "웹툰/애니" },
      { key: "other_fandom",   label: "팬덤/아이돌" },
      { key: "other_kidult",   label: "키덜트/취미" },
    ],
  },
];

/** 모든 카테고리 key → 한글 라벨 (1차 + 2차 + 레거시 구버전) */
export const CATEGORY_ALL_LABELS: Record<string, string> = Object.fromEntries([
  // 1차
  ...CATEGORY_TREE.map((p) => [p.key, p.label] as [string, string]),
  // 2차
  ...CATEGORY_TREE.flatMap((p) => p.sub.map((s) => [s.key, s.label] as [string, string])),
  // 레거시
  ["gaming", "게임"], ["parenting", "육아"], ["camping", "캠핑"],
]);

/**
 * 주어진 key가 속한 1차 카테고리 key를 반환.
 * 이미 1차 key면 그대로 반환, 2차 key면 부모 key 반환, 없으면 null.
 */
export function getParentKey(key: string): string | null {
  if (key === "all") return null;
  if (CATEGORY_TREE.some((p) => p.key === key)) return key;
  const parent = CATEGORY_TREE.find(
    (p) => p.sub.some((s) => s.key === key) || (p.legacyKeys ?? []).includes(key)
  );
  return parent?.key ?? null;
}
