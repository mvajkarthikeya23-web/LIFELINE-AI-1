@echo off
cd /d "%~dp0"
echo Starting LifeLine AI...
echo Keep this window open while you use the app.
echo Open http://127.0.0.1:8000 in your browser.
py server.py
if errorlevel 1 (
  echo.
  echo Could not start the server. Check that Python 3 is installed and available as "py".
  pause
)
