@echo off
title TataDana Fintech - 24/7 Always Online Host & Public Tunnel
cls
echo ======================================================
echo   TataDana Fintech Platform - 24/7 Always Online
echo ======================================================
echo.
echo Memulai server TataDana dan Cloudflare Public Tunnel...
echo Server akan otomatis restart jika terjadi kendala.
echo Jangan tutup jendela terminal ini agar tetap selalu online.
echo.

cd /d "%~dp0"

:loop
echo [%date% %time%] Memulai supervisor watchdog...
node supervisor.js
echo.
echo [%date% %time%] Watchdog terhenti. Memulai ulang dalam 2 detik...
timeout /t 2 /nobreak >nul
goto loop
