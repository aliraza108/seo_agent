# api/chat.py
import os
import logging
import httpx
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("api.chat")

API_KEY = 'AIzaSyBFHEfqKOdI9HMWLlQCQRs7OUnrCsIpn_E'          # set in Vercel
MODEL = os.getenv("MODEL", "gemini-2.0-flash")
GEMINI_BASE_URL = os.getenv("GEMINI_BASE_URL", "https://generativelanguage.googleapis.com")

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    message: str

@app.get("/")
async def info():
    """
    GET /api/chat  -> quick info so GET won't 404
    """
    return {"status": "ok", "note": "POST JSON {message: string} to this endpoint to chat."}

async def call_google_gemini(message: str) -> str:
    if not API_KEY:
        raise RuntimeError("API_KEY not set in environment")

    model_path = MODEL
    if not model_path.startswith("models/") and ":" not in model_path:
        model_path = f"models/{MODEL}"

    url = f"{GEMINI_BASE_URL}/v1/{model_path}:generate"
    headers = {"Authorization": f"Bearer {API_KEY}", "Content-Type": "application/json"}
    payload = {"prompt": {"text": f"You are a helpful SEO assistant. User: {message}"},
               "temperature": 0.2, "maxOutputTokens": 512}

    async with httpx.AsyncClient(timeout=60.0) as client:
        r = await client.post(url, headers=headers, json=payload)

    if r.status_code >= 400:
        logger.error("Gemini API error %s: %s", r.status_code, r.text)
        raise RuntimeError(f"Gemini API error {r.status_code}: {r.text}")

    data = r.json()
    # Try common shapes
    try:
        if "candidates" in data and isinstance(data["candidates"], list):
            return (data["candidates"][0].get("output") or "").strip()
        if "outputs" in data and isinstance(data["outputs"], list):
            out0 = data["outputs"][0]
            if isinstance(out0, dict) and "content" in out0:
                content = out0["content"]
                if isinstance(content, list) and content:
                    first = content[0]
                    if isinstance(first, dict) and "text" in first:
                        return (first["text"] or "").strip()
        for k in ("output", "generated_text", "text"):
            if k in data:
                return str(data[k]).strip()
    except Exception:
        logger.exception("Failed to parse Gemini response")

    return str(data)

@app.post("/")
async def chat(payload: ChatRequest):
    logger.info("POST /api/chat received (len=%d)", len(payload.message or ""))
    try:
        reply = await call_google_gemini(payload.message)
        return {"reply": reply}
    except RuntimeError as e:
        logger.exception("Runtime error when calling Gemini")
        raise HTTPException(status_code=502, detail=str(e))
    except Exception as e:
        logger.exception("Unexpected error")
        raise HTTPException(status_code=500, detail="Internal server error")
