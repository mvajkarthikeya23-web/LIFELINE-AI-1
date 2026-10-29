#!/usr/bin/env python3
"""LifeLine AI local web server + Ollama model bridge. Uses only Python's standard library."""
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.request import Request, urlopen
from urllib.error import URLError, HTTPError
import json
import os
import urllib.parse
import urllib.request

ROOT = Path(__file__).resolve().parent
HOST = "127.0.0.1"
PORT = 8000
OLLAMA_URL = "http://127.0.0.1:11434"
MODEL = "qwen2.5:3b"

SYSTEM_PROMPT = """You are LifeLine AI, a cautious assistant for a student healthcare coordination prototype.
You are not a doctor, emergency dispatcher, or source of live hospital data.
Never diagnose, recommend treatment, infer urgency from symptoms, or claim a hospital has current beds,
blood, staff, or ambulance availability. The supplied directory entries are fictional demo records.
You may summarize a non-sensitive coordination note and explain which fictional entries list the requested
service. Say that staff must verify details directly with an authorized provider. If someone describes an
actual emergency in India, tell them to call 112. Do not ask for names, phone numbers, addresses, patient IDs,
or real medical records. Keep the response concise and clearly label uncertainty.
"""

def ollama_json(path, payload=None, timeout=180):
    data = None if payload is None else json.dumps(payload).encode("utf-8")
    headers = {"Content-Type": "application/json"} if data is not None else {}
    req = Request(OLLAMA_URL + path, data=data, headers=headers, method="POST" if data is not None else "GET")
    with urlopen(req, timeout=timeout) as response:
        return json.loads(response.read().decode("utf-8"))

class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def send_json(self, status, body):
        encoded = json.dumps(body).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(encoded)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(encoded)

    def do_GET(self):
        if self.path == "/api/health":
            try:
                tags = ollama_json("/api/tags", timeout=5)
                names = [m.get("name", "") for m in tags.get("models", [])]
                ready = any(n == MODEL or n.startswith(MODEL + ":") for n in names)
                self.send_json(200, {
                    "ok": True,
                    "ollama_reachable": True,
                    "model": MODEL,
                    "model_ready": ready,
                    "message": "Model ready" if ready else f"Run: ollama pull {MODEL}"
                })
            except Exception:
                self.send_json(200, {
                    "ok": False, "ollama_reachable": False, "model": MODEL,
                    "model_ready": False,
                    "message": "Install and start Ollama, then download the model."
                })
            return
        
        if self.path.startswith("/api/hospitals"):
            try:
                from urllib.parse import urlparse, parse_qs

                params = parse_qs(urlparse(self.path).query)
                lat = float(params.get("lat", [""])[0])
                lon = float(params.get("lon", [""])[0])
                radius = int(params.get("radius", ["10000"])[0])

                hospitals = search_nearby_hospitals(lat, lon, radius)

                self.send_json(200, {
                    "ok": True,
                    "count": len(hospitals),
                    "source": "OpenStreetMap",
                    "hospitals": hospitals
                })
            except Exception as exc:
                self.send_json(502, {
                    "ok": False,
                    "error": str(exc)
                })

        return super().do_GET()
    def do_POST(self):
        if self.path != "/api/ai":
            self.send_json(404, {"error": "Unknown API route."})
            return
        try:
            length = int(self.headers.get("Content-Length", "0"))
            if length <= 0 or length > 12000:
                self.send_json(400, {"error": "Request was empty or too large. Use a short demo note."})
                return
            body = json.loads(self.rfile.read(length).decode("utf-8"))
            service = str(body.get("service", "General enquiry"))[:100]
            area = str(body.get("area", ""))[:100]
            note = str(body.get("note", ""))[:400]
            hospitals = body.get("hospitals", [])
            if not isinstance(hospitals, list):
                hospitals = []
            hospitals = hospitals[:10]
            prompt = (
                f"Create a concise coordination summary for a fictional demo.\n"
                f"Requested service: {service}\nArea filter: {area or 'not specified'}\n"
                f"Non-sensitive note: {note or 'not supplied'}\n"
                f"Fictional directory entries matching the service and area: "
                f"{json.dumps(hospitals, ensure_ascii=False)}\n\n"
                "Use headings: Summary, Fictional directory information, Safe next step. "
                "Do not invent facts, do not claim availability, and do not provide medical advice. "
                "If there are no entries, say no matching fictional entry was found."
            )
            output = ollama_json("/api/generate", {
                "model": MODEL,
                "system": SYSTEM_PROMPT,
                "prompt": prompt,
                "stream": False,
                "options": {"temperature": 0.2, "num_predict": 260}
            }, timeout=240)
            self.send_json(200, {"model": MODEL, "response": output.get("response", "").strip()})
        except HTTPError as exc:
            try:
                details = exc.read().decode("utf-8", errors="replace")[:500]
            except Exception:
                details = str(exc)
            self.send_json(502, {"error": "Ollama could not generate a response. Make sure the model is downloaded. Details: " + details})
        except (URLError, TimeoutError, OSError):
            self.send_json(503, {"error": "Ollama is not reachable. Install and start Ollama, then run: ollama pull qwen2.5:3b"})
        except Exception as exc:
            self.send_json(400, {"error": "Could not process the request: " + str(exc)[:300]})

    def log_message(self, fmt, *args):
        print("[LifeLine AI] " + (fmt % args))      


def search_nearby_hospitals(latitude, longitude, radius=10000):
    """Search public OpenStreetMap data for nearby healthcare facilities."""
    latitude = float(latitude)
    longitude = float(longitude)
    radius = max(1000, min(int(radius), 25000))

    if not (-90 <= latitude <= 90 and -180 <= longitude <= 180):
        raise ValueError("Invalid coordinates")

    query = f"""
    [out:json][timeout:20];
    (
      node["amenity"~"^(hospital|clinic|doctors|ambulance_station)$"]
        (around:{radius},{latitude},{longitude});
      way["amenity"~"^(hospital|clinic|doctors|ambulance_station)$"]
        (around:{radius},{latitude},{longitude});
      relation["amenity"~"^(hospital|clinic|doctors|ambulance_station)$"]
        (around:{radius},{latitude},{longitude});
    );
    out center tags;
    """

    request = Request(
        "https://overpass-api.de/api/interpreter",
        data=urllib.parse.urlencode({"data": query}).encode("utf-8"),
        headers={"User-Agent": "LifeLineAIStudentPrototype/1.0"},
    )

    with urlopen(request, timeout=30) as response:
        data = json.loads(response.read().decode("utf-8"))

    places = []
    for item in data.get("elements", []):
        tags = item.get("tags", {})
        center = item.get("center", {})
        lat = item.get("lat", center.get("lat"))
        lon = item.get("lon", center.get("lon"))

        if lat is None or lon is None:
            continue

        places.append({
            "name": tags.get("name", "Unnamed facility"),
            "type": tags.get("amenity", "healthcare facility"),
            "latitude": lat,
            "longitude": lon,
            "address": ", ".join(
                tags[key] for key in ("addr:street", "addr:city", "addr:postcode")
                if tags.get(key)
            ) or "Address not listed",
            "phone": tags.get("phone", "Not listed"),
            "website": tags.get("website", ""),
            "source": "OpenStreetMap",
            "live_availability": "Not available from this source",
        })

    return places

if __name__ == "__main__":
    print("=" * 58)
    print("LifeLine AI local app server")
    print(f"Open http://{HOST}:{PORT} in your browser.")
    print(f"Local model expected: {MODEL}")
    print("Keep this terminal open while using the app. Press Ctrl+C to stop.")
    print("Prototype only. Do not enter real patient information.")
    print("=" * 58)
    ThreadingHTTPServer((HOST, PORT), Handler).serve_forever()
