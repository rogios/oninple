/**
 * Gemini API로 스레드 글 4개 생성 → scripts/threads-queue.json 저장
 *
 * 실행:
 *   npx ts-node --project scripts/tsconfig.json scripts/threads-generate.ts
 *
 * 환경변수: GOOGLE_GEMINI_API_KEY (.env.local 자동 로드)
 */

import * as fs from "fs";
import * as path from "path";
import { randomUUID } from "crypto";

interface GeneratedPost {
  type: string;
  content: string;
}

interface ThreadsPost {
  id: string;
  type: string;
  content: string;
  status: "pending" | "posted";
  createdAt: string;
  postedAt: string | null;
}

interface ThreadsQueue {
  posts: ThreadsPost[];
  lastGenerated: string | null;
  lastPosted: string | null;
}

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
}

async function generatePosts(apiKey: string): Promise<GeneratedPost[]> {
  const prompt = `온인플(Oninple) 인플루언서·크리에이터 매칭 플랫폼을 만드는 팀장이 직접 쓰는 빌드인퍼블릭(build in public) 스레드 글 4개를 작성해주세요.

아래 4가지 상황별로 각 1개씩 작성:
1. 현타/깨달음 - 서비스 만들다가 현실을 직면한 순간
2. 웃픈 상황 - 웃기지만 슬픈 스타트업 현실
3. 실제 고민 또는 숫자 - 구체적인 수치나 고민을 솔직하게
4. 예상 밖 반응 또는 발견 - 예상과 달랐던 점

작성 조건:
- 글 길이: 150~250자
- 형식: 짧은 문장으로 끊기, 문장과 문장 사이 빈 줄 삽입 (스레드 호흡)
- "온인플" 단어 사용 가능하나 서비스 홍보·설명·기능 소개 금지
- 팀장 개인의 감정·현실·경험에만 집중
- 해시태그 없이
- 자연스러운 한국어 구어체, 담담하고 솔직하게
- 공감 가는 디테일 포함

반드시 아래 JSON 배열 형식으로만 응답하세요. 다른 텍스트 없이:
[
  { "type": "현타/깨달음", "content": "글 내용" },
  { "type": "웃픈 상황", "content": "글 내용" },
  { "type": "실제 고민 또는 숫자", "content": "글 내용" },
  { "type": "예상 밖 반응 또는 발견", "content": "글 내용" }
]`;

  const endpoint = `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

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
  const match = raw.match(/\[[\s\S]*\]/);
  if (!match) throw new Error("Gemini 응답에서 JSON 배열을 파싱할 수 없습니다");

  const parsed = JSON.parse(match[0]) as GeneratedPost[];
  if (!Array.isArray(parsed) || parsed.length !== 4) {
    throw new Error("Gemini 응답 형식 오류: 4개 항목 배열이 필요합니다");
  }

  return parsed;
}

async function main() {
  loadEnv();

  const geminiKey = process.env.GOOGLE_GEMINI_API_KEY;
  if (!geminiKey) {
    console.error("❌ GOOGLE_GEMINI_API_KEY 환경변수가 없습니다");
    process.exit(1);
  }

  const queuePath = path.join(__dirname, "threads-queue.json");
  const queue: ThreadsQueue = fs.existsSync(queuePath)
    ? JSON.parse(fs.readFileSync(queuePath, "utf-8"))
    : { posts: [], lastGenerated: null, lastPosted: null };

  const pendingCount = queue.posts.filter(p => p.status === "pending").length;
  if (pendingCount > 0) {
    console.log(`⚠️  아직 발행 안 된 글이 ${pendingCount}개 남아 있습니다. 계속 생성합니다.`);
  }

  console.log("\n🤖 Gemini로 스레드 글 4개 생성 중...");
  const generated = await generatePosts(geminiKey);

  const now = new Date().toISOString();
  const newPosts: ThreadsPost[] = generated.map(p => ({
    id: randomUUID(),
    type: p.type,
    content: p.content,
    status: "pending",
    createdAt: now,
    postedAt: null,
  }));

  queue.posts.push(...newPosts);
  queue.lastGenerated = now;

  fs.writeFileSync(queuePath, JSON.stringify(queue, null, 2) + "\n", "utf-8");

  console.log(`\n✅ ${newPosts.length}개 생성 완료`);
  newPosts.forEach((p, i) => {
    console.log(`\n[${i + 1}] ${p.type}`);
    console.log(p.content.slice(0, 80) + (p.content.length > 80 ? "..." : ""));
  });
}

main().catch(err => {
  console.error("❌ 오류:", err);
  process.exit(1);
});
