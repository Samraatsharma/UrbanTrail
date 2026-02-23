@echo off
setlocal

title UrbanTrail Smart Navigator
color 0B
cls

echo.
echo  ==============================================
echo   UrbanTrail Smart Navigator  ^|  Auto Launch
echo  ==============================================
echo.

:: Go to the folder where this .bat file lives
cd /d "%~dp0"

:: Check for Python
python --version >nul 2>&1
if %errorlevel%==0 (
    echo  [OK] Python found. Starting server on http://localhost:8765
    echo.
    echo  Your browser will open in 2 seconds...
    echo  Press Ctrl+C to stop the server when done.
    echo.
    start "" "http://localhost:8765"
    python -m http.server 8765
    goto :end
)

:: Check for py launcher
py --version >nul 2>&1
if %errorlevel%==0 (
    echo  [OK] Python (py) found. Starting server on http://localhost:8765
    echo.
    echo  Your browser will open in 2 seconds...
    echo  Press Ctrl+C to stop the server when done.
    echo.
    start "" "http://localhost:8765"
    py -m http.server 8765
    goto :end
)

:: Check for Node
node --version >nul 2>&1
if %errorlevel%==0 (
    echo  [OK] Node.js found. Starting server via npx http-server...
    echo.
    start "" "http://localhost:8765"
    npx --yes http-server . -p 8765 --cors -c-1
    goto :end
)

echo  [ERROR] Python or Node.js not found!
echo  Please install Python from https://www.python.org/downloads/
echo  Then run this file again.
echo.

:end
pause
endlocal
