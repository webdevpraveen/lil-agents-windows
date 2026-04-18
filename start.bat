@echo off
title Lil Agents Win — Sunny, Anku & Somu
color 0B
echo.
echo  =====================================================
echo   Lil Agents Win  v1.0
echo   Sunny (Sundram) - Anku (Ankita) - Somu (Saumya)
echo  =====================================================
echo.

:: Check Node.js
where node >nul 2>&1
if %errorlevel% neq 0 (
  echo  [!] Node.js is not installed.
  echo.
  echo      Download it from: https://nodejs.org
  echo      Choose the LTS version, install, then restart this.
  echo.
  pause
  exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do set NODEVERSION=%%i
echo  [OK] Node.js %NODEVERSION%

:: Install dependencies if needed
if not exist node_modules (
  echo.
  echo  Installing dependencies (first run only, ~30 seconds)...
  echo.
  npm install
  if %errorlevel% neq 0 (
    echo.
    echo  [!] npm install failed. Check your internet connection.
    pause
    exit /b 1
  )
)

echo.
echo  Starting your crew...
echo  Sunny, Anku and Somu will appear above your taskbar.
echo.
echo  To chat: click any character.
echo  To set API key: right-click the system tray icon ^> Settings
echo  To quit: right-click tray ^> Quit
echo.
npm start
