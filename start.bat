@echo off
title Western Mobile Billing App - Launcher
echo ==================================================
echo   Western Mobile Billing App - Launcher
echo ==================================================
echo.

:: Free up Port 8000 and Port 5173 if they are locked in background
echo [SYSTEM] Cleaning up any background processes using Ports 8000 or 5173...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":8000" 2^>nul') do (
    taskkill /f /pid %%a >nul 2>&1
)
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":5173" 2^>nul') do (
    taskkill /f /pid %%a >nul 2>&1
)
echo.

:: Check if frontend node_modules exists
if not exist "frontend\node_modules\" (
    echo [SYSTEM] Frontend dependencies missing. Installing...
    cd frontend
    call npm install
    cd ..
)

:: Check if backend flag file exists
if not exist "backend\.installed" (
    echo [SYSTEM] First-time setup: Installing Python dependencies...
    pip install -r backend\requirements.txt
    echo installed > backend\.installed
)

echo [SYSTEM] Launching FastAPI Backend on Port 8000...
start /b cmd /c "python -m uvicorn backend.main:app --port 8000"

echo [SYSTEM] Launching React Frontend on Port 5173...
cd frontend
start /b cmd /c "npm run dev"
cd ..

echo [SYSTEM] Launching browser...
timeout /t 3 /nobreak > nul
start http://localhost:5173

echo.
echo ==================================================
echo   Application is running!
echo   - Close this window to stop the application.
echo ==================================================
echo.
pause
