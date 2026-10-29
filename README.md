# LifeLine AI — Open-Model Prototype

LifeLine AI is a student project prototype for healthcare coordination workflows. This version connects the AI assistant to **Qwen2.5 3B** through **Ollama**, using a local API on your own computer. It does not require a paid AI API key.

## Important safety notice
This is a learning prototype, **not an emergency dispatch service**. In India, call **112** for emergencies. All included hospital and request records are fictional. Never enter real patient names, phone numbers, addresses, IDs, or medical records. The model cannot verify live beds, blood stock, staff, or ambulance availability and must not be used for medical decisions.

## What is included
- Existing responsive LifeLine AI dashboard and fictional directory
- Local AI assistant connected to Qwen2.5 3B via Ollama
- Python standard-library web server and local model bridge (`server.py`)
- Windows helper scripts: `install_model.bat` and `start_lifeline.bat`
- No paid API key and no third-party Python packages required

## Important: the model is downloaded separately
The ZIP contains integration code, **not the model weights**. The model is large and should be downloaded using Ollama. The first download requires an internet connection and several GB of free disk space. With 8 GB RAM, a 3B model is a more reasonable starting point than larger models, but speed varies by computer.

## Windows setup (beginner-friendly)
1. Install Python 3 if you do not already have it: https://www.python.org/downloads/
   - During installation, select **Add Python to PATH** if that option is shown.
2. Install Ollama for Windows: https://ollama.com/download/windows
3. Close and reopen VS Code after installing Ollama.
4. Open the extracted `LifeLine_AI_OpenSource_Model` folder in VS Code.
5. Double-click `install_model.bat` in File Explorer, or open VS Code Terminal and run:
   ```powershell
   ollama pull qwen2.5:3b
   ```
   Wait for the download to finish. This is a one-time download.
6. Start the app by double-clicking `start_lifeline.bat`, or in VS Code Terminal run:
   ```powershell
   py server.py
   ```
7. Keep the terminal window open and visit **http://127.0.0.1:8000** in your browser.
8. Open **AI assistant**, enter fictional non-sensitive details, and click **Ask local AI model**.

Do not open `index.html` directly for the model-powered assistant. Use the local server at `http://127.0.0.1:8000`.

## Troubleshooting
- `ollama is not recognized`: install Ollama, then close/reopen VS Code or restart Windows.
- `Ollama is not reachable`: make sure the Ollama app is running (look for its icon in the Windows system tray).
- `SETUP NEEDED`: run `ollama pull qwen2.5:3b` and wait until it finishes.
- First AI response can take a while because the model needs to load into memory.
- If your computer becomes slow, close other apps or stop the model with `ollama stop qwen2.5:3b`.

## Project structure
- `index.html` — page structure
- `styles.css` — responsive design
- `app.js` — dashboard and browser UI
- `server.py` — local web server and Ollama API bridge
- `install_model.bat` — downloads the model through Ollama
- `start_lifeline.bat` — starts the local app server
- `assets/logo.svg` — app icon
- `docs/ROADMAP.md` — suggested future development

## Architecture
Browser UI → local Python server (`127.0.0.1:8000`) → Ollama (`127.0.0.1:11434`) → Qwen2.5 3B.

The prompt includes only the selected service, area, non-sensitive note, and matching fictional sample directory entries. Do not expose the server to the public internet.

## Limitations
- This is not production-ready and does not have a shared database or real authentication.
- Browser data remains local to the browser.
- No live hospital, ambulance, or blood bank integration.
- AI output can be wrong; human verification is mandatory.
- No diagnosis, treatment recommendation, or autonomous dispatch.


## Live map & nearby help (prototype)
Open **Live map & nearby help** in the sidebar. Allow location access, then choose **Find nearby hospitals**. The map uses Leaflet, OpenStreetMap tiles and public Overpass map listings; an internet connection is required. Directions open Google Maps in a new tab. The emergency option links to India’s 112 number; it does not automatically place a call.

**Limitations:** Public map listings may be incomplete or stale. Live hospital bed counts, blood inventory and ambulance dispatch are not connected; those fields are explicitly marked **Unknown / Not connected**. Verify information with an authorized provider. Do not use this prototype to manage real emergencies or enter real patient data.
