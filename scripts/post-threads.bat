@echo off
REM 스레드 글 1개 포스팅 — 매일 10:30 / 12:30 / 14:30 / 16:30 실행
REM 작업 스케줄러 등록: setup-scheduler.bat 참고

cd /d D:\oninple

echo [%date% %time%] 스레드 포스팅 시작 >> D:\oninple\scripts\threads-post.log
call npx ts-node --project scripts/tsconfig.json scripts/threads-post.ts >> D:\oninple\scripts\threads-post.log 2>&1
echo [%date% %time%] 완료 >> D:\oninple\scripts\threads-post.log
