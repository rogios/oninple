/**
 * Gemini API로 블로그 글 자동 생성 후 Supabase에 발행
 *
 * 환경변수 (GitHub Secrets):
 *   GOOGLE_GEMINI_API_KEY
 *   SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *   NAVER_CLIENT_ID
 *   NAVER_CLIENT_SECRET
 *
 * 실행:
 *   npx ts-node --project scripts/tsconfig.json scripts/auto-generate.ts
 */

import * as fs from "fs";
import * as path from "path";

function loadEnv(): void {
  const envPath = path.join(__dirname, "..", ".env.local");
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, "utf-8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx).trim();
    const val = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, "");
    if (!process.env[key]) process.env[key] = val;
  }
  // SUPABASE_URL 폴백: 로컬 .env.local은 NEXT_PUBLIC_SUPABASE_URL을 사용
  if (!process.env.SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL) {
    process.env.SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
  }
}

interface Topic {
  title: string;
  thumbnail: string;
}

interface TopicsFile {
  categories: { name: string; topics: Topic[] }[];
}

interface State {
  categoryIndex: number;
  topicIndices: number[];
}

interface NewsItem {
  title: string;
  description: string;
  pubDate: string;
  link: string;
}

interface GeneratedPost {
  title: string;
  summary: string;
  content: string;
}

const CATEGORY_KEYWORDS: Record<string, string> = {
  "크리에이터": "유튜브 크리에이터",
  "인플루언서 마케팅": "인플루언서 마케팅",
  "AI": "AI 영상 편집",
  "플랫폼 소식": "유튜브 인스타그램 틱톡",
};

// 이미지 프롬프트 랜덤 요소 풀
const IMAGE_COLORS = [
  "warm coral and cream white",
  "deep navy blue and gold",
  "forest green and soft white",
  "vibrant purple and silver",
  "burnt orange and beige",
  "teal and dusty rose",
  "crimson red and charcoal",
  "sky blue and sandy beige",
  "olive green and terracotta",
  "midnight blue and neon yellow",
];

const IMAGE_COMPOSITIONS = [
  "centered symmetrical composition",
  "dynamic diagonal lines",
  "rule of thirds asymmetric layout",
  "overhead flat lay perspective",
  "close-up macro detail shot",
  "wide panoramic landscape view",
  "split-screen diptych layout",
  "layered depth with blurred background",
];

const IMAGE_STYLES = [
  "minimalist clean design",
  "bold editorial magazine style",
  "tech-forward futuristic aesthetic",
  "warm lifestyle photography",
  "abstract geometric art",
  "isometric 3D illustration",
  "cinematic documentary style",
  "vibrant pop art illustration",
  "soft watercolor texture",
  "sharp corporate infographic style",
];

const CATEGORY_IMAGE_THEMES: Record<string, string> = {
  "크리에이터": "content creator working on video production, camera and editing setup, creative workspace",
  "인플루언서 마케팅": "social media marketing strategy, brand collaboration, influencer partnership meeting",
  "AI": "artificial intelligence technology, digital innovation, machine learning data visualization",
  "플랫폼 소식": "social media platforms ecosystem, connected apps and services, digital communication",
};

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function buildImagePrompt(title: string, category: string): string {
  const theme = CATEGORY_IMAGE_THEMES[category] ?? category;
  const color = pick(IMAGE_COLORS);
  const composition = pick(IMAGE_COMPOSITIONS);
  const style = pick(IMAGE_STYLES);

  return (
    `A professional blog thumbnail image for an article titled "${title}". ` +
    `Theme: ${theme}. ` +
    `Color palette: ${color}. ` +
    `Composition: ${composition}. ` +
    `Visual style: ${style}. ` +
    `Korean digital marketing context. ` +
    `No text, no typography, no watermarks. ` +
    `High quality, suitable for a professional blog. 16:9 aspect ratio.`
  );
}

async function generateThumbnail(apiKey: string, prompt: string): Promise<ArrayBuffer> {
  const endpoint =
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`;

  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { responseModalities: ["IMAGE"] },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`이미지 생성 API 오류 (${res.status}): ${err}`);
  }

  const json = await res.json() as {
    candidates: {
      content: { parts: { inlineData?: { data: string; mimeType: string } }[] };
    }[];
  };

  const inlineData = json.candidates?.[0]?.content?.parts
    ?.find(p => p.inlineData)?.inlineData;
  if (!inlineData) throw new Error("이미지 응답에 데이터가 없습니다");

  const buf = Buffer.from(inlineData.data, "base64");
  return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer;
}

async function uploadThumbnail(
  supabaseUrl: string,
  supabaseKey: string,
  imageBuffer: ArrayBuffer,
  slug: string
): Promise<string> {
  const filename = `${slug}.png`;
  const uploadUrl = `${supabaseUrl}/storage/v1/object/thumbnails/${filename}`;

  const res = await fetch(uploadUrl, {
    method: "POST",
    headers: {
      "Content-Type": "image/png",
      "apikey": supabaseKey,
      "Authorization": `Bearer ${supabaseKey}`,
    },
    body: imageBuffer,
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Supabase Storage 업로드 실패 (${res.status}): ${err}`);
  }

  return `${supabaseUrl}/storage/v1/object/public/thumbnails/${filename}`;
}

async function fetchNaverNews(
  clientId: string,
  clientSecret: string,
  keyword: string
): Promise<NewsItem[]> {
  const url = `https://openapi.naver.com/v1/search/news.json?query=${encodeURIComponent(keyword)}&display=3&sort=date`;

  const res = await fetch(url, {
    headers: {
      "X-Naver-Client-Id": clientId,
      "X-Naver-Client-Secret": clientSecret,
    },
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`네이버 뉴스 API 오류 (${res.status}): ${err}`);
  }

  const json = await res.json() as { items: { title: string; description: string; pubDate: string; link: string }[] };

  return json.items.map(item => ({
    title: item.title.replace(/<[^>]+>/g, ""),
    description: item.description.replace(/<[^>]+>/g, ""),
    pubDate: item.pubDate,
    link: item.link,
  }));
}

function buildSlug(postNumber: number): string {
  const now = new Date();
  const dateStr = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("");
  return `${dateStr}-post-${postNumber}`;
}

async function generatePost(
  apiKey: string,
  category: string,
  topic: string,
  news: NewsItem[]
): Promise<GeneratedPost> {
  const newsSection = news.length > 0
    ? `\n아래는 "${category}" 카테고리와 관련된 최신 뉴스 3개입니다. 글 작성 시 이 뉴스의 내용과 트렌드를 자연스럽게 반영해주세요.\n\n${news.map((n, i) => `[뉴스 ${i + 1}] ${n.title}\n${n.description}\n(${n.pubDate})`).join("\n\n")}\n`
    : "";

  const prompt = `당신은 크리에이터 이코노미·인플루언서 마케팅 전문 블로그 에디터입니다.
온인플(Oninple) 플랫폼 블로그에 게재할 글을 작성해주세요.
${newsSection}
카테고리: ${category}
주제: ${topic}

작성 조건:
- 전체 분량: 700~900자 (독자가 30초 안에 읽을 수 있는 분량)
- 소제목(##)은 최대 3개
- 단락당 최대 3문장, 문장은 짧고 간결하게
- 각 소제목 아래 내용은 핵심만 압축
- 목록(-)은 꼭 필요한 경우만 사용, 최대 3개 항목
- 마지막 문장: 온인플에 크리에이터·브랜드로 등록을 유도하는 CTA 1문장으로 마무리
- 불필요한 수식어, 반복 표현 금지

말투 조건:
- 전체 톤은 신뢰감 있는 포럼/뉴스 스타일 유지
- "~했다고 합니다", "~입니다" 같은 격식체 사용
- "게임 체인저", "혁신", "패러다임" 같은 과장된 표현 금지
- 불필요한 수식어, 반복 표현 금지

경험담 조건:
- 글 중간에 제3자 크리에이터 경험담 1개 자연스럽게 삽입
- 형식 예시: "실제로 2023년 채널을 시작한 한 크리에이터는..." 같은 방식
- 경험담은 글의 주제와 직접 연결되어야 하며, 온인플 소개로 자연스럽게 이어질 것

반드시 아래 JSON 형식으로만 응답하세요. 다른 텍스트 없이:
{
  "title": "블로그 글 제목 (50자 이내)",
  "summary": "글 요약 (80~120자, 검색 노출용)",
  "content": "마크다운 형식의 블로그 본문 전체"
}`;

  const endpoint =
    `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini API 오류 (${res.status}): ${err}`);
  }

  const json = await res.json() as {
    candidates: { content: { parts: { text: string }[] } }[];
  };

  const raw = json.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  const match = raw.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("Gemini 응답에서 JSON을 파싱할 수 없습니다");

  const parsed = JSON.parse(match[0]) as GeneratedPost;
  if (!parsed.title || !parsed.summary || !parsed.content) {
    throw new Error("Gemini 응답 필드 누락: title / summary / content 확인 필요");
  }

  return parsed;
}

async function main() {
  loadEnv();

  const geminiKey = process.env.GOOGLE_GEMINI_API_KEY;
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const naverClientId = process.env.NAVER_CLIENT_ID;
  const naverClientSecret = process.env.NAVER_CLIENT_SECRET;

  if (!geminiKey || !supabaseUrl || !supabaseKey) {
    console.error(
      "❌ 환경변수 누락 — GOOGLE_GEMINI_API_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY 필요"
    );
    process.exit(1);
  }

  const topicsPath = path.join(__dirname, "topics.json");
  const statePath = path.join(__dirname, "state.json");

  const topics: TopicsFile = JSON.parse(fs.readFileSync(topicsPath, "utf-8"));
  const state: State = JSON.parse(fs.readFileSync(statePath, "utf-8"));

  const { categoryIndex, topicIndices } = state;
  const category = topics.categories[categoryIndex];
  const topicIndex = topicIndices[categoryIndex];
  const topicItem = category.topics[topicIndex];
  const topic = topicItem.title;

  console.log(`\n📅 실행 시각: ${new Date().toISOString()}`);
  console.log(`🎯 카테고리: ${category.name} (index ${categoryIndex})`);
  console.log(`📌 주제: ${topic} (index ${topicIndex})`);

  let news: NewsItem[] = [];
  if (naverClientId && naverClientSecret) {
    const keyword = CATEGORY_KEYWORDS[category.name] ?? category.name;
    console.log(`\n📰 네이버 뉴스 검색 중: "${keyword}"`);
    try {
      news = await fetchNaverNews(naverClientId, naverClientSecret, keyword);
      console.log(`   ${news.length}개 뉴스 수집 완료`);
      news.forEach((n, i) => console.log(`   [${i + 1}] ${n.title}\n        ${n.link}`));
    } catch (err) {
      console.warn(`⚠️  네이버 뉴스 API 실패 (뉴스 없이 진행): ${err}`);
    }
  } else {
    console.warn("⚠️  NAVER_CLIENT_ID / NAVER_CLIENT_SECRET 없음 — 뉴스 없이 진행");
  }

  console.log(`\n🤖 Gemini로 글 생성 중...`);

  const { title, summary, content } = await generatePost(
    geminiKey,
    category.name,
    topic,
    news
  );

  const postNumber = Date.now();
  const slug = buildSlug(postNumber);

  console.log(`\n📝 제목: ${title}`);
  console.log(`📄 요약: ${summary}`);
  console.log(`🔗 슬러그: ${slug}`);

  // 이미지 생성 및 업로드
  let thumbnail: string | null = topicItem.thumbnail || null;
  const imagePrompt = buildImagePrompt(title, category.name);
  console.log(`\n🎨 이미지 생성 중...`);
  console.log(`   프롬프트: ${imagePrompt.slice(0, 120)}...`);
  try {
    const imageBuffer = await generateThumbnail(geminiKey, imagePrompt);
    thumbnail = await uploadThumbnail(supabaseUrl, supabaseKey, imageBuffer, slug);
    console.log(`   ✅ 이미지 업로드 완료: ${thumbnail}`);
  } catch (err) {
    console.warn(`⚠️  이미지 생성 실패 (기본 썸네일 사용): ${err}`);
  }

  console.log(`\n💾 Supabase에 저장 중...`);

  const res = await fetch(`${supabaseUrl}/rest/v1/posts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": supabaseKey,
      "Authorization": `Bearer ${supabaseKey}`,
      "Prefer": "return=representation",
    },
    body: JSON.stringify({
      title,
      content,
      summary,
      category: category.name,
      slug,
      thumbnail,
      published: true,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error(`❌ Supabase 저장 실패 (${res.status}): ${err}`);
    process.exit(1);
  }

  const [data] = await res.json() as { id: string }[];

  console.log(`\n✅ 발행 완료!`);
  console.log(`   ID  : ${data.id}`);
  console.log(`   URL : https://oninple.com/blog/${slug}`);

  // reference_news 저장 (컬럼이 없으면 경고만 출력)
  if (news.length > 0) {
    const referenceNews = news.map(n => ({ title: n.title, url: n.link }));
    console.log(`\n📰 참고 뉴스 저장 중...`);
    referenceNews.forEach((n, i) => console.log(`   [${i + 1}] ${n.title}\n        ${n.url}`));

    const patchRes = await fetch(
      `${supabaseUrl}/rest/v1/posts?id=eq.${data.id}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "apikey": supabaseKey,
          "Authorization": `Bearer ${supabaseKey}`,
        },
        body: JSON.stringify({ reference_news: referenceNews }),
      }
    );

    if (!patchRes.ok) {
      const err = await patchRes.text();
      console.warn(`⚠️  reference_news 저장 실패 (${patchRes.status}): ${err}`);
      console.warn(`   → Supabase posts 테이블에 reference_news jsonb 컬럼을 추가해주세요.`);
    } else {
      console.log(`   ✅ reference_news 저장 완료`);
    }
  }

  // 다음 실행을 위한 state 업데이트
  const newTopicIndices = [...topicIndices];
  newTopicIndices[categoryIndex] = (topicIndex + 1) % category.topics.length;

  const newState: State = {
    categoryIndex: (categoryIndex + 1) % topics.categories.length,
    topicIndices: newTopicIndices,
  };

  fs.writeFileSync(statePath, JSON.stringify(newState, null, 2) + "\n", "utf-8");
  console.log(
    `\n🔄 state.json 업데이트 — 다음 카테고리: ${topics.categories[newState.categoryIndex].name}`
  );
}

main().catch((err) => {
  console.error("❌ 예기치 않은 오류:", err);
  process.exit(1);
});
