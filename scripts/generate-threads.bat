@echo off
REM 스레드 글 4개 자동 생성 — 매일 오전 10:00 실행
REM 작업 스케줄러 등록: setup-scheduler.bat 참고

cd /d D:\oninple

REM 의존성 확인
if not exist node_modules\playwright (
  echo [INFO] playwright 미설치. 설치 중...
  call npm install --save-dev playwright
  call npx playwright install chromium
)

echo [%date% %time%] 스레드 글 생성 시작 >> D:\oninple\scripts\threads-generate.log
call npx ts-node --project scripts/tsconfig.json scripts/threads-generate.ts >> D:\oninple\scripts\threads-generate.log 2>&1
echo [%date% %time%] 완료 >> D:\oninple\scripts\threads-generate.log
