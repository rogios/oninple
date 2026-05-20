/**
 * 블로그 글 자동 발행 스크립트
 *
 * 실행:
 *   npx ts-node --project scripts/tsconfig.json scripts/publish-blog.ts \
 *     --title "제목" \
 *     --slug "my-slug" \
 *     --content "본문 내용" \
 *     --summary "요약" \
 *     --category "AI" \
 *     --thumbnail "https://..." (선택)
 *
 * 카테고리 선택지: 크리에이터 / 인플루언서 마케팅 / AI / 플랫폼 소식
 */

import * as fs from "fs";
import * as path from "path";
import { createClient } from "@supabase/supabase-js";

// ── .env.local 파싱 ────────────────────────────────────────────────────────────

function loadEnvLocal(): Record<string, string> {
  const envPath = path.join(__dirname, "..", ".env.local");
  if (!fs.existsSync(envPath)) {
    console.error("❌ .env.local 파일을 찾을 수 없습니다:", envPath);
    process.exit(1);
  }
  const content = fs.readFileSync(envPath, "utf-8");
  const env: Record<string, string> = {};
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx).trim();
    const val = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, "");
    env[key] = val;
  }
  return env;
}

// ── CLI 인수 파싱: --key=value 또는 --key value ────────────────────────────────

function parseArgs(argv: string[]): Record<string, string> {
  const args: Record<string, string> = {};
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (!arg.startsWith("--")) continue;
    const eqIdx = arg.indexOf("=");
    if (eqIdx !== -1) {
      args[arg.slice(2, eqIdx)] = arg.slice(eqIdx + 1);
    } else {
      const key = arg.slice(2);
      const next = argv[i + 1];
      if (next !== undefined && !next.startsWith("--")) {
        args[key] = next;
        i++;
      } else {
        args[key] = "true";
      }
    }
  }
  return args;
}

// ── 메인 ──────────────────────────────────────────────────────────────────────

async function main() {
  const env = loadEnvLocal();
  const args = parseArgs(process.argv.slice(2));

  const required = ["title", "content", "summary", "category", "slug"] as const;
  const missing = required.filter((k) => !args[k]);
  if (missing.length > 0) {
    console.error("❌ 필수 인수 누락:", missing.map((k) => `--${k}`).join(", "));
    console.error(
      "\n사용법:\n  npx ts-node --project scripts/tsconfig.json scripts/publish-blog.ts \\\n" +
      "    --title \"제목\" --slug \"my-slug\" --content \"본문\" \\\n" +
      "    --summary \"요약\" --category \"AI\" [--thumbnail \"https://...\"]"
    );
    process.exit(1);
  }

  const validCategories = ["크리에이터", "인플루언서 마케팅", "AI", "플랫폼 소식"];
  if (!validCategories.includes(args.category)) {
    console.error(`❌ 잘못된 카테고리: "${args.category}"`);
    console.error("   선택지:", validCategories.join(" / "));
    process.exit(1);
  }

  const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    console.error("❌ .env.local에 NEXT_PUBLIC_SUPABASE_URL 또는 SUPABASE_SERVICE_ROLE_KEY가 없습니다");
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, serviceKey);

  const post = {
    title: args.title,
    content: args.content,
    summary: args.summary,
    category: args.category,
    slug: args.slug,
    thumbnail: args.thumbnail ?? null,
    published: true,
  };

  console.log(`\n📝 발행 중: "${post.title}"`);
  console.log(`   슬러그: /blog/${post.slug}`);
  console.log(`   카테고리: ${post.category}`);

  const { data, error } = await supabase.from("posts").insert(post).select().single();

  if (error) {
    console.error("❌ 저장 실패:", error.message);
    process.exit(1);
  }

  console.log("\n✅ 발행 완료!");
  console.log(`   ID: ${data.id}`);
  console.log(`   URL: https://oninple.com/blog/${data.slug}`);
}

main().catch((err) => {
  console.error("❌ 예기치 않은 오류:", err);
  process.exit(1);
});
