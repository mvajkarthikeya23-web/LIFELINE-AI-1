@echo off
echo This downloads the Qwen2.5 3B model using Ollama.
echo The model files are large and are NOT included in the project ZIP.
echo Please install Ollama for Windows first: https://ollama.com/download/windows
echo.
pause
ollama pull qwen2.5:3b
echo.
echo If the download completed successfully, open start_lifeline.bat to run the app.
pause
