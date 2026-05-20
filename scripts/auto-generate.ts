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
import { createClient } from "@supabase/supabase-js";

interface TopicsFile {
  categories: { name: string; topics: string[] }[];
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

function buildSlug(title: string): string {
  const now = new Date();
  const dateStr = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("");

  // 한글·영문·숫자·하이픈만 남기고 슬러그 생성
  const cleaned = title
    .toLowerCase()
    .replace(/[^\w\s가-힣]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 40);

  return `${dateStr}-${cleaned}`;
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
- 분량: 한국어 기준 1,500~2,500자
- 형식: Markdown (##, ###, **굵게**, - 목록 등 적극 활용)
- 어조: 전문적이지만 친근하고 읽기 쉬운 문체
- 대상 독자: 크리에이터, 인플루언서, 브랜드 마케터
- 구성: 서론 → 본론(소제목 3~4개) → 결론
- 실용적인 팁 또는 인사이트 반드시 포함
- 온인플 플랫폼을 자연스럽게 1~2회 언급

반드시 아래 JSON 형식으로만 응답하세요. 다른 텍스트 없이:
{
  "title": "블로그 글 제목 (50자 이내)",
  "summary": "글 요약 (100~150자, 검색 노출용)",
  "content": "마크다운 형식의 블로그 본문 전체"
}`;

  const endpoint =
    `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

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
  const topic = category.topics[topicIndex];

  console.log(`\n📅 실행 시각: ${new Date().toISOString()}`);
  console.log(`🎯 카테고리: ${category.name} (index ${categoryIndex})`);
  console.log(`📌 주제: ${topic} (index ${topicIndex})`);
  console.log(`\n🤖 Gemini로 글 생성 중...`);

  const { title, summary, content } = await generatePost(
    geminiKey,
    category.name,
    topic
  );

  const slug = buildSlug(title);

  console.log(`\n📝 제목: ${title}`);
  console.log(`📄 요약: ${summary}`);
  console.log(`🔗 슬러그: ${slug}`);
  console.log(`\n💾 Supabase에 저장 중...`);

  const supabase = createClient(supabaseUrl, supabaseKey);

  const { data, error } = await supabase
    .from("posts")
    .insert({
      title,
      content,
      summary,
      category: category.name,
      slug,
      thumbnail: null,
      published: true,
    })
    .select()
    .single();

  if (error) {
    console.error("❌ Supabase 저장 실패:", error.message);
    process.exit(1);
  }

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
