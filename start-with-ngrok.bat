@echo off
echo Starting Social Platform with ngrok tunnel...
echo.

REM Check if NGROK_AUTHTOKEN is set
if "%NGROK_AUTHTOKEN%"=="" (
    echo ERROR: NGROK_AUTHTOKEN is not set!
    echo.
    echo Please follow these steps:
    echo 1. Sign up for free at https://ngrok.com/signup
    echo 2. Get your authtoken from https://dashboard.ngrok.com/auth
    echo 3. Run: set NGROK_AUTHTOKEN=your_token_here
    echo 4. Run this script again
    echo.
    pause
    exit /b 1
)

echo Building and starting Docker containers...
docker-compose -f docker-compose.ngrok.yml up --build

pause