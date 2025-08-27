@echo off
title SRE Monorepo - Starting All Apps
echo Starting SRE Monorepo Applications...
echo.

echo Killing existing Node processes...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 2 /nobreak >nul

echo Cleaning up ports...
npx kill-port 3000 3001 3002 3003 >nul 2>&1
timeout /t 2 /nobreak >nul

echo Starting applications...
echo.

echo [1/4] Starting Main App (Port 3000)...
start "Main App" cmd /k "cd /d %~dp0\apps\main && set PORT=3000 && npm run dev"
timeout /t 3 /nobreak >nul

echo [2/4] Starting Brain App (Port 3001)...
start "Brain App" cmd /k "cd /d %~dp0\apps\brain && set PORT=3001 && npm run dev"
timeout /t 3 /nobreak >nul

echo [3/4] Starting Profile App (Port 3002)...
start "Profile App" cmd /k "cd /d %~dp0\apps\profile && set PORT=3002 && npm run dev"
timeout /t 3 /nobreak >nul

echo [4/4] Starting Writer App (Port 3003)...
start "Writer App" cmd /k "cd /d %~dp0\apps\writer && set PORT=3003 && npm run dev"

echo.
echo All applications are starting...
echo.
echo URLs:
echo - Main:    http://localhost:3000
echo - Brain:   http://localhost:3001
echo - Profile: http://localhost:3002
echo - Writer:  http://localhost:3003
echo.
echo Or use .lvh.me domains:
echo - Main:    http://main.lvh.me:3000
echo - Brain:   http://brain.lvh.me:3001
echo - Profile: http://profile.lvh.me:3002
echo - Writer:  http://writer.lvh.me:3003
echo.
echo Press any key to exit...
pause >nul