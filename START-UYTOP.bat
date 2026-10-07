@echo off
title UyTop - Tizimni Ishga Tushirish
chcp 65001 >nul
echo ======================================================
echo           UYTOP PLATFORMASI ISHGA TUSHIRILMOQDA
echo ======================================================
echo 1. FastAPI Backend:  http://localhost:8000
echo 2. Swagger Docs:     http://localhost:8000/docs
echo 3. Web Ilova:        http://localhost:5173
echo ======================================================
echo.

echo [1/3] Backend server ishga tushirilmoqda...
start "UyTop Backend (Port 8000)" cmd /k "cd /d %~dp0backend && call .venv\Scripts\activate.bat && python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"

timeout /t 3 /nobreak >nul

echo [2/3] Web Frontend ishga tushirilmoqda...
start "UyTop Web (Port 5173)" cmd /k "cd /d %~dp0web && call npm.cmd run dev -- --host 0.0.0.0 --port 5173"

timeout /t 2 /nobreak >nul

echo [3/3] Brauzer ochilmoqda: http://localhost:5173
start http://localhost:5173

echo.
echo ======================================================
echo Tayyor! Loyiha brauzeringizda ochildi: http://localhost:5173
echo Mobil ilovani ishga tushirish uchun scripts\start-mobile.bat ni bosing.
echo ======================================================
pause
