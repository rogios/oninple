/**
 * Gemini API로 블로그 글 자동 생성 후 Supabase에 발행
 *
 * 환경변수 (GitHub Secrets):
 *   GOOGLE_GEMINI_API_KEY
 *   SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *
 * 실행:
 *   npx ts-node --project scripts/tsconfig.json scripts/auto-generate.ts
 */

import * as fs from "fs";
import * as path from "path";

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

interface GeneratedPost {
  title: string;
  summary: string;
  content: string;
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
  topic: string
): Promise<GeneratedPost> {
  const prompt = `당신은 크리에이터 이코노미·인플루언서 마케팅 전문 블로그 에디터입니다.
온인플(Oninple) 플랫폼 블로그에 게재할 글을 작성해주세요.

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
  const geminiKey = process.env.GOOGLE_GEMINI_API_KEY;
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

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
  console.log(`\n🤖 Gemini로 글 생성 중...`);

  const { title, summary, content } = await generatePost(
    geminiKey,
    category.name,
    topic
  );

  // 카테고리별 순환 구조 기준 전역 순번: 1, 2, 3, ...
  const postNumber = topicIndices[categoryIndex] * topics.categories.length + categoryIndex + 1;
  const slug = buildSlug(postNumber);

  console.log(`\n📝 제목: ${title}`);
  console.log(`📄 요약: ${summary}`);
  console.log(`🔗 슬러그: ${slug}`);
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
      thumbnail: topicItem.thumbnail || null,
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
