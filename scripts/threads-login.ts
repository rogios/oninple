/**
 * Playwright로 Threads 수동 로그인 후 세션 저장
 *
 * 설치 (최초 1회):
 *   npm install --save-dev playwright
 *   npx playwright install chromium
 *
 * 실행:
 *   npx ts-node --project scripts/tsconfig.json scripts/threads-login.ts
 *
 * 세션 저장 위치: scripts/threads-session/session.json
 */

import { chromium } from "playwright";
import * as fs from "fs";
import * as path from "path";
import * as readline from "readline";

const SESSION_DIR = path.join(__dirname, "threads-session");
const SESSION_FILE = path.join(SESSION_DIR, "session.json");

function waitForEnter(): Promise<void> {
  return new Promise(resolve => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    rl.question("\n로그인 완료 후 Enter를 눌러주세요...", () => {
      rl.close();
      resolve();
    });
  });
}

async function main() {
  if (!fs.existsSync(SESSION_DIR)) {
    fs.mkdirSync(SESSION_DIR, { recursive: true });
  }

  console.log("\n🌐 브라우저를 열고 Threads 로그인 페이지로 이동합니다.");
  console.log("   Instagram 계정으로 로그인해주세요.\n");

  const browser = await chromium.launch({ headless: false, slowMo: 50 });
  const context = await browser.newContext({
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  });
  const page = await context.newPage();

  // Threads가 자동화 브라우저에 4xx를 반환할 수 있으므로 에러를 무시하고 브라우저만 열어둠
  await page.goto("https://www.threads.com/", { waitUntil: "commit", timeout: 30000 }).catch(() => {});

  console.log("   👉 브라우저에 페이지가 안 열리면 주소창에 직접 입력: https://www.threads.com/");

  await waitForEnter();

  // 로그인 상태 확인
  const url = page.url();
  if (url.includes("login")) {
    console.log("⚠️  아직 로그인 페이지에 있습니다. 로그인을 완료해주세요.");
  }

  await context.storageState({ path: SESSION_FILE });

  console.log(`\n✅ 세션 저장 완료`);
  console.log(`   위치: ${SESSION_FILE}`);

  await browser.close();
}

main().catch(err => {
  console.error("❌ 오류:", err);
  process.exit(1);
});
