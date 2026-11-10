@echo off
echo ========================================================
echo HEATGUARD AI - Extreme Heatwave Early Warning Platform
echo ========================================================
echo.
echo Starting all 3 services in separate windows...
echo.

echo [1/3] Starting AI Engine (Port 8000)...
start "HEATGUARD AI - AI Engine" cmd /k "cd ai-engine && python app.py"

echo [2/3] Starting Backend API (Port 5000)...
start "HEATGUARD AI - Backend API" cmd /k "cd backend && npm run dev"

echo [3/3] Starting React Frontend (Port 5173)...
start "HEATGUARD AI - Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo All services launched!
echo Access the dashboard in your browser at: http://localhost:5173
echo.
pause
