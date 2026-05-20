@echo off
REM Windows 작업 스케줄러에 스레드 자동화 태스크 등록
REM 반드시 관리자 권한으로 실행하세요

echo ================================================
echo  OnInple Threads 자동화 스케줄러 등록
echo ================================================
echo.

REM 글 생성: 매일 오전 10:00
schtasks /create ^
  /tn "OnInple\Threads_Generate" ^
  /tr "\"D:\oninple\scripts\generate-threads.bat\"" ^
  /sc DAILY /st 10:00 ^
  /ru "%USERDOMAIN%\%USERNAME%" ^
  /f
echo [OK] 글 생성 태스크 등록 (매일 10:00)

REM 포스팅: 10:30
schtasks /create ^
  /tn "OnInple\Threads_Post_1" ^
  /tr "\"D:\oninple\scripts\post-threads.bat\"" ^
  /sc DAILY /st 10:30 ^
  /ru "%USERDOMAIN%\%USERNAME%" ^
  /f
echo [OK] 포스팅 1 등록 (매일 10:30)

REM 포스팅: 12:30
schtasks /create ^
  /tn "OnInple\Threads_Post_2" ^
  /tr "\"D:\oninple\scripts\post-threads.bat\"" ^
  /sc DAILY /st 12:30 ^
  /ru "%USERDOMAIN%\%USERNAME%" ^
  /f
echo [OK] 포스팅 2 등록 (매일 12:30)

REM 포스팅: 14:30
schtasks /create ^
  /tn "OnInple\Threads_Post_3" ^
  /tr "\"D:\oninple\scripts\post-threads.bat\"" ^
  /sc DAILY /st 14:30 ^
  /ru "%USERDOMAIN%\%USERNAME%" ^
  /f
echo [OK] 포스팅 3 등록 (매일 14:30)

REM 포스팅: 16:30
schtasks /create ^
  /tn "OnInple\Threads_Post_4" ^
  /tr "\"D:\oninple\scripts\post-threads.bat\"" ^
  /sc DAILY /st 16:30 ^
  /ru "%USERDOMAIN%\%USERNAME%" ^
  /f
echo [OK] 포스팅 4 등록 (매일 16:30)

echo.
echo ================================================
echo  등록 완료! 작업 스케줄러에서 확인하세요.
echo  시작 메뉴 > 작업 스케줄러 > OnInple 폴더
echo ================================================
pause
