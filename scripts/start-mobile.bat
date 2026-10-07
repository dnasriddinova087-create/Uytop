@echo off
title UyTop Expo Mobile App
echo ===================================================
echo [UyTop] Expo React Native Mobil Ilova ishga tushirilmoqda...
echo Android / iOS telefoningizda Expo Go bilan QR-kodni skaner qiling.
echo ===================================================

cd /d "%~dp0\..\mobile"
call npx.cmd expo start
pause
