/**
 * threads-queue.json에서 다음 대기 중인 글을 Threads에 포스팅
 *
 * 실행:
 *   npx ts-node --project scripts/tsconfig.json scripts/threads-post.ts
 *
 * 사전 조건: threads-login.ts로 세션 저장 필요
 */

import { chromium } from "playwright";
import * as fs from "fs";
import * as path from "path";

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

const SESSION_FILE = path.join(__dirname, "threads-session", "session.json");
const QUEUE_FILE = path.join(__dirname, "threads-queue.json");

async function postToThreads(content: string): Promise<void> {
  if (!fs.existsSync(SESSION_FILE)) {
    throw new Error(
      "세션 파일이 없습니다. threads-login.ts를 먼저 실행해 로그인해주세요."
    );
  }

  const browser = await chromium.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-dev-shm-usage"],
  });

  const context = await browser.newContext({
    storageState: SESSION_FILE,
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    viewport: { width: 1280, height: 800 },
  });

  const page = await context.newPage();

  try {
    await page.goto("https://www.threads.net/", {
      waitUntil: "domcontentloaded",
      timeout: 30000,
    });

    await page.waitForTimeout(2000);

    // 로그인 여부 확인
    if (page.url().includes("login")) {
      throw new Error(
        "세션이 만료됐습니다. threads-login.ts를 다시 실행해 세션을 갱신해주세요."
      );
    }

    // 작성 영역 클릭 (Threads 웹 UI 셀렉터 우선순위 순)
    const composeSelectors = [
      '[aria-label="New thread"]',
      'a[href="/compose/post/"]',
      'span:has-text("Start a thread")',
      'span:has-text("스레드를 시작하세요")',
      '[placeholder*="thread"]',
    ];

    let opened = false;
    for (const sel of composeSelectors) {
      try {
        await page.locator(sel).first().click({ timeout: 5000 });
        opened = true;
        break;
      } catch {
        // 다음 셀렉터 시도
      }
    }

    if (!opened) {
      // 단축키 시도 (일부 버전에서 Ctrl+N 또는 C키)
      await page.keyboard.press("c");
      await page.waitForTimeout(1000);
      const editable = page.locator('[contenteditable="true"], [data-lexical-editor="true"]').first();
      opened = await editable.isVisible({ timeout: 3000 }).catch(() => false);
    }

    if (!opened) {
      throw new Error(
        "작성 영역을 찾을 수 없습니다. Threads UI가 변경됐을 수 있습니다."
      );
    }

    await page.waitForTimeout(1000);

    // 텍스트 입력
    const editorSelectors = [
      '[contenteditable="true"]',
      '[data-lexical-editor="true"]',
      'textarea',
    ];

    let typed = false;
    for (const sel of editorSelectors) {
      try {
        const el = page.locator(sel).first();
        if (await el.isVisible({ timeout: 3000 })) {
          await el.click();
          await page.keyboard.type(content, { delay: 20 });
          typed = true;
          break;
        }
      } catch {
        // 다음 시도
      }
    }

    if (!typed) throw new Error("텍스트 입력 영역을 찾을 수 없습니다");

    await page.waitForTimeout(1500);

    // 게시 버튼 클릭
    const postSelectors = [
      'button:has-text("Post")',
      'button:has-text("게시")',
      '[data-testid="thread-post-button"]',
      'div[role="button"]:has-text("Post")',
    ];

    let posted = false;
    for (const sel of postSelectors) {
      try {
        const btn = page.locator(sel).first();
        if (await btn.isEnabled({ timeout: 3000 })) {
          await btn.click();
          posted = true;
          break;
        }
      } catch {
        // 다음 시도
      }
    }

    if (!posted) throw new Error("게시 버튼을 찾을 수 없습니다");

    // 게시 완료 대기
    await page.waitForTimeout(3000);
    console.log("✅ 스레드 포스팅 완료");

  } finally {
    await browser.close();
  }
}

async function main() {
  if (!fs.existsSync(QUEUE_FILE)) {
    console.error(
      "❌ threads-queue.json이 없습니다. threads-generate.ts를 먼저 실행해주세요."
    );
    process.exit(1);
  }

  const queue: ThreadsQueue = JSON.parse(fs.readFileSync(QUEUE_FILE, "utf-8"));
  const pending = queue.posts.filter(p => p.status === "pending");

  if (pending.length === 0) {
    console.log("📭 발행 대기 중인 글이 없습니다.");
    process.exit(0);
  }

  const post = pending[0];
  console.log(`\n📤 포스팅 중: [${post.type}]`);
  console.log(post.content.slice(0, 80) + (post.content.length > 80 ? "..." : ""));

  await postToThreads(post.content);

  // 발행 완료 표시
  const idx = queue.posts.findIndex(p => p.id === post.id);
  queue.posts[idx].status = "posted";
  queue.posts[idx].postedAt = new Date().toISOString();
  queue.lastPosted = new Date().toISOString();

  fs.writeFileSync(QUEUE_FILE, JSON.stringify(queue, null, 2) + "\n", "utf-8");

  const remaining = pending.length - 1;
  console.log(`\n💾 큐 업데이트 완료. 남은 글: ${remaining}개`);
}

main().catch(err => {
  console.error("❌ 오류:", err);
  process.exit(1);
});
