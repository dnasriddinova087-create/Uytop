@echo off
title UyTop Web Frontend
echo ===================================================
echo [UyTop] React + Vite Veb Ilova ishga tushirilmoqda...
echo Brauzer manzili: http://localhost:5173
echo ===================================================

cd /d "%~dp0\..\web"
call npm.cmd run dev
pause
