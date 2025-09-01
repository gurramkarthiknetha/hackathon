@echo off
echo Starting AI Event Monitor System
echo ================================

echo Starting Backend...
start "Backend" cmd /k "cd backend && python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"

timeout /t 5 /nobreak > nul

echo Starting Frontend...
start "Frontend" cmd /k "cd frontend && npm run dev"

echo System started! Check the opened windows for logs.
echo Backend: http://localhost:8000
echo Frontend: http://localhost:5173
pause
