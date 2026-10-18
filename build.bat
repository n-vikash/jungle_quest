@echo off
setlocal
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 echo Note: Node.js is not required to build this game.
if not exist src\head.html (
  echo ERROR: src\head.html not found.
  exit /b 1
)
(
  type src\head.html
  type src\01-graph.js
  type src\02-art-a.js
  type src\02-art-b.js
  type src\02-art-c.js
  type src\03-statues.js
  type src\04-live.js
  type src\05-game.js
  type src\05b-shortcuts.js
  type src\06-ui.js
  type src\tail.html
) > index.html
if errorlevel 1 (
  echo ERROR: Build failed.
  exit /b 1
)
echo Build complete: index.html updated.
exit /b 0
