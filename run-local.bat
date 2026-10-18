@echo off
setlocal
cd /d "%~dp0"
if not exist index.html (
  echo index.html is missing. Running build.bat first...
  call build.bat
  if errorlevel 1 exit /b 1
)
where py >nul 2>nul
if not errorlevel 1 (
  start "Jungle Quest" http://localhost:8000
  py -m http.server 8000
  exit /b %errorlevel%
)
where python >nul 2>nul
if not errorlevel 1 (
  start "Jungle Quest" http://localhost:8000
  python -m http.server 8000
  exit /b %errorlevel%
)
echo Python was not found. Install Python or use VS Code Live Server on index.html.
pause
