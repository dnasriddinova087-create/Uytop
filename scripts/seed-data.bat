@echo off
title UyTop Namunaviy Ma'lumotlarni Yuklash
echo ===================================================
echo [UyTop] Namunaviy ma'lumotlar bazaga yozilmoqda...
echo ===================================================

cd /d "%~dp0\..\backend"
call .venv\Scripts\activate.bat
python -m app.cli seed
pause
