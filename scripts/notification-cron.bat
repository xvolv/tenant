@echo off
REM Rent Notification Cron Script for Windows

set LOG_FILE=C:\works\tenant\notification.log
set API_URL=http://localhost:3000\api\cron\notifications

REM Create log entry with timestamp
echo %date% %time%: Running rent notification check... >> %LOG_FILE%

REM Check if app is running on port 3000
netstat -an | findstr :3000 >nul
if %errorlevel% neq 0 (
    echo %date% %time%: App not running, starting it... >> %LOG_FILE%
    cd /d C:\works\tenant
    start /B npm run dev
    timeout /t 15 /nobreak >nul
)

REM Run the notification check
curl -s -w "%%{http_code}" %API_URL% > temp_response.txt
set /p HTTP_CODE=<temp_response.txt

if "%HTTP_CODE%"=="200" (
    echo %date% %time%: ✅ Notifications sent successfully >> %LOG_FILE%
) else (
    echo %date% %time%: ❌ Failed to send notifications (HTTP %HTTP_CODE%) >> %LOG_FILE%
)

del temp_response.txt
echo --- >> %LOG_FILE%
