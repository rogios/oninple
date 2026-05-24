@echo off
chcp 65001 > nul
echo === ONINPLE Task Scheduler Setup ===

schtasks /create /tn "ONINPLE_Generate_Threads" /tr "D:\oninple\scripts\generate-threads.bat" /sc daily /st 10:00 /f
echo [OK] Generate task registered (10:00)

schtasks /create /tn "ONINPLE_Post_Threads_1" /tr "D:\oninple\scripts\post-threads.bat" /sc daily /st 10:30 /f
echo [OK] Post task 1 registered (10:30)

schtasks /create /tn "ONINPLE_Post_Threads_2" /tr "D:\oninple\scripts\post-threads.bat" /sc daily /st 12:30 /f
echo [OK] Post task 2 registered (12:30)

schtasks /create /tn "ONINPLE_Post_Threads_3" /tr "D:\oninple\scripts\post-threads.bat" /sc daily /st 14:30 /f
echo [OK] Post task 3 registered (14:30)

schtasks /create /tn "ONINPLE_Post_Threads_4" /tr "D:\oninple\scripts\post-threads.bat" /sc daily /st 16:30 /f
echo [OK] Post task 4 registered (16:30)

echo.
echo === All tasks registered successfully! ===
pause