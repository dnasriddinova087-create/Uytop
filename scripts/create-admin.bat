@echo off
title UyTop Admin Akkaunti Yaratish
echo ===================================================
echo [UyTop] Yangi Admin akkaunti yaratish
echo ===================================================

set /p FIRST_NAME="Ism: "
set /p LAST_NAME="Familiya: "
set /p PHONE="Telefon raqami (+998XXXXXXXXX): "
set /p PASSWORD="Parol: "
set /p EMAIL="Email (ixtiyoriy): "

cd /d "%~dp0\..\backend"
call .venv\Scripts\activate.bat
python -m app.cli create-admin --first-name "%FIRST_NAME%" --last-name "%LAST_NAME%" --phone "%PHONE%" --password "%PASSWORD%" --email "%EMAIL%"
pause
