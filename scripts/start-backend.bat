@echo off
title UyTop Backend Server
echo ===================================================
echo [UyTop] FastAPI Backend ishga tushirilmoqda...
echo Port: 8000 (0.0.0.0 orqali barcha tarmoqqa ochiq)
echo Swagger Hujjatlari: http://localhost:8000/docs
echo ===================================================

cd /d "%~dp0\..\backend"
if not exist ".venv" (
    echo [Xato] .venv topilmadi! Avval venv yarating.
    pause
    exit /b
)

call .venv\Scripts\activate.bat
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
pause
