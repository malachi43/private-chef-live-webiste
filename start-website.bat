@echo off
rem Windows: double-click this file to open the Private Chef website in your browser.
rem Keep the black window open while you browse. Close it to stop.
cd /d "%~dp0"
set PORT=8000
echo.
echo   Private Chef website
echo   Opening http://localhost:%PORT%/index.html
echo   Keep this window open while you browse. Close it to stop.
echo.
where py >nul 2>nul && (start "" "http://localhost:%PORT%/index.html" & py -m http.server %PORT% & goto :eof)
where python >nul 2>nul && (start "" "http://localhost:%PORT%/index.html" & python -m http.server %PORT% & goto :eof)
where npx >nul 2>nul && (start "" "http://localhost:%PORT%/index.html" & npx --yes serve -l %PORT% . & goto :eof)
echo   Python or Node.js is needed to run a local server.
echo   Easiest fix: double-click index.html in this folder to open it directly,
echo   or install Python from https://www.python.org/downloads/
pause
