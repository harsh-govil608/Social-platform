@echo off
echo Starting ngrok tunnels for Social Platform...
echo.
echo Make sure your application is running:
echo - Backend on port 5001
echo - Frontend on port 5173
echo.

REM Start backend tunnel
start cmd /k "ngrok http 5001 --log=stdout"

REM Wait a bit
timeout /t 2

REM Start frontend tunnel  
start cmd /k "ngrok http 5173 --log=stdout"

echo.
echo Ngrok tunnels started!
echo.
echo IMPORTANT STEPS:
echo 1. Copy the backend ngrok URL from the first window
echo 2. Update frontend/.env.local with:
echo    VITE_API_URL=https://your-backend-ngrok-url.ngrok-free.app/api
echo 3. Restart your frontend (Ctrl+C and npm run dev)
echo 4. Share the frontend ngrok URL with anyone!
echo.
echo Press any key to exit...
pause >nul