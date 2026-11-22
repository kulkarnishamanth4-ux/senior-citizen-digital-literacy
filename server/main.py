import os
import re
import json
import base64
from typing import List, Optional
import requests
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app_title = os.getenv("APP_NAME", "AI-Powered Senior Digital Literacy & Scam Guardian")

app = FastAPI(
    title=app_title,
    description="Backend API for AI-Powered Smartphone & Digital Literacy Assistant for Senior Citizens (BMSIT&M 1BSOP308)",
    version="1.0.0"
)

# Enable CORS for local client and mobile wrappers
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ----------------- Data Models -----------------
class ScamVerifyRequest(BaseModel):
    text: str
    language: Optional[str] = "en"

class ScamVerifyResponse(BaseModel):
    threat_level: str  # SAFE | CAUTION | DANGER
    risk_score: int    # 0 to 100
    detected_red_flags: List[str]
    spoken_advice: str

class StreamEvaluationRequest(BaseModel):
    caller_number: Optional[str] = None
    call_transcript: Optional[str] = ""
    is_otp_visible: bool = False
    is_upi_pin_active: bool = False
    is_apk_installing: bool = False

class StreamEvaluationResponse(BaseModel):
    threat_score: int
    is_emergency_triggered: bool
    detected_flags: List[str]
    masked_otp_placeholder: Optional[str]
    action_taken: str

class ScreenBox(BaseModel):
    ymin: int
    xmin: int
    ymax: int
    xmax: int

class ScreenAnalyzeRequest(BaseModel):
    image_base64: str
    task_title: str
    step_instruction: str
    target_name: str
    language: Optional[str] = "en"
    api_key: Optional[str] = None

class ScreenAnalyzeResponse(BaseModel):
    found: bool
    screen_state: str  # FOUND | HOME_SCREEN | WRONG_APP | DIALOG_BLOCKING | NOT_FOUND | NO_API_KEY
    detected_label: str
    confidence: float
    box: Optional[ScreenBox] = None
    guidance_message: str
    action_hint: str

# In-memory alert store for Caregiver Companion
caregiver_alerts_db = []

# ----------------- Routes -----------------
@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": f"{app_title} Engine",
        "version": "1.0.0"
    }

@app.post("/api/verify-scam", response_model=ScamVerifyResponse)
def verify_scam(request: ScamVerifyRequest):
    text = request.text.strip().lower()
    if not text:
        raise HTTPException(status_code=400, detail="Text cannot be empty")

    flags = []
    score = 10
    threat_level = "SAFE"

    # Red flag heuristics
    has_apk = ".apk" in text or "http" in text or "bit.ly" in text
    has_urgency = any(w in text for w in ["immediately", "tonight", "suspended", "within 1 hour", "disconnected", "arrest"])
    has_otp_pin = any(w in text for w in ["otp", "pin", "anydesk", "teamviewer", "quicksupport"])
    has_lottery = any(w in text for w in ["won", "prize", "lottery", "cash reward", "congratulations"])
    has_10_digit_phone = bool(re.search(r'\b\d{10}\b', text))

    if has_apk:
        flags.append("Contains unverified APK download link (high malware risk).")
        score += 45
    if has_urgency:
        flags.append("Employs artificial time pressure and threats.")
        score += 25
    if has_otp_pin:
        flags.append("Demands confidential OTP or asks to install remote screen-sharing tools.")
        score += 40
    if has_lottery:
        flags.append("Unsolicited prize promise requires financial action to receive.")
        score += 30
    if has_10_digit_phone:
        flags.append("Originated from personal 10-digit mobile number, not official board ID.")
        score += 15

    score = min(100, score)

    if score >= 70:
        threat_level = "DANGER"
        advice = "CRITICAL FRAUD: Do not reply, call back, or click any link. Banks and utility providers never threaten disconnection through personal SMS."
        if request.language == "kn":
            advice = "ಗಂಭೀರ ವಂಚನೆ: ಯಾವುದೇ ಕಾರಣಕ್ಕೂ ಲಿಂಕ್ ಒತ್ತಬೇಡಿ ಅಥವಾ ಒಟಿಪಿ ಹಂಚಿಕೊಳ್ಳಬೇಡಿ. ಬ್ಯಾಂಕ್‌ಗಳು ಇಂತಹ ಸಂದೇಶ ಕಳುಹಿಸುವುದಿಲ್ಲ."
        elif request.language == "hi":
            advice = "गंभीर धोखाधड़ी: किसी भी लिंक पर क्लिक न करें। बैंक या बिजली विभाग कभी फोन पर ओटीपी नहीं मांगते।"
    elif score >= 40:
        threat_level = "CAUTION"
        advice = "Suspicious message pattern. Verify with your family or official office directly."
    else:
        threat_level = "SAFE"
        advice = "Standard notification. Always remember never to share PINs or passwords."

    return ScamVerifyResponse(
        threat_level=threat_level,
        risk_score=score,
        detected_red_flags=flags,
        spoken_advice=advice
    )

@app.post("/api/threat-stream", response_model=StreamEvaluationResponse)
def evaluate_stream(req: StreamEvaluationRequest):
    call_score = 0
    screen_score = 0
    flags = []

    # Call analysis
    call_lower = req.call_transcript.lower()
    for kw in ["police", "cbi", "arrest", "electricity cut", "blocked", "anydesk", "teamviewer", "otp"]:
        if kw in call_lower:
            call_score += 25
            flags.append(f"Call: Coercive trigger '{kw}' detected")

    if req.caller_number and not req.caller_number.startswith("+91 80"): # unknown mobile
        call_score += 15

    # Screen analysis
    if req.is_otp_visible:
        screen_score += 45
        flags.append("Screen: Sensitive SMS OTP active in window")
    if req.is_upi_pin_active:
        screen_score += 40
        flags.append("Screen: UPI PIN entry screen open")
    if req.is_apk_installing:
        screen_score += 50
        flags.append("Screen: Package installer running external APK")

    total_score = min(100, call_score + screen_score)
    is_emergency = (call_score >= 35 and screen_score >= 40) or total_score >= 75

    action = "NORMAL_MONITORING"
    masked_placeholder = None

    if is_emergency:
        action = "EMERGENCY_SHIELD_ACTIVATED"
        masked_placeholder = "•••••• [MASKED BY GUARDIAN SHIELD]"
        # Dispatch alert to caregiver DB
        caregiver_alerts_db.append({
            "caller": req.caller_number or "Unknown",
            "flags": flags,
            "threat_score": total_score
        })

    return StreamEvaluationResponse(
        threat_score=total_score,
        is_emergency_triggered=is_emergency,
        detected_flags=flags,
        masked_otp_placeholder=masked_placeholder,
        action_taken=action
    )

@app.post("/api/analyze-screen", response_model=ScreenAnalyzeResponse)
def analyze_screen(req: ScreenAnalyzeRequest):
    """
    Analyzes live screen capture using Gemini Vision.
    Detects real UI buttons/textboxes and returns normalized coordinates for live overlay.
    """
    api_key = req.api_key or os.getenv("GEMINI_API_KEY")
    if not api_key or len(api_key.strip()) < 10:
        return ScreenAnalyzeResponse(
            found=False,
            screen_state="NO_API_KEY",
            detected_label="Gemini API Key Required",
            confidence=0.0,
            box=None,
            guidance_message=(
                "ಲೈವ್ ಸ್ಕ್ರೀನ್ ಗುರುತಿಸುವಿಕೆಗಾಗಿ ದಯವಿಟ್ಟು ಜೆಮಿನಿ ಎಪಿಐ ಕೀ ಸೇರಿಸಿ."
                if req.language == "kn"
                else "लाइव स्क्रीन पर बटन पहचानने के लिए कृपया जेमिनी एपीआई कुंजी दर्ज करें।"
                if req.language == "hi"
                else "Please enter your Gemini API key in settings to enable real-time UI element recognition on your screen."
            ),
            action_hint="Configure Gemini API Key"
        )

    # Clean base64
    clean_base64 = req.image_base64
    if "," in clean_base64:
        clean_base64 = clean_base64.split(",")[1]

    prompt = f"""You are an expert AI Accessibility & Digital Literacy Co-Pilot assisting an elderly senior citizen.
The senior is sharing their REAL smartphone or computer screen.
Current Task: "{req.task_title}"
Current Step Instruction: "{req.step_instruction}"
Target UI Element to locate: "{req.target_name}"

Carefully analyze this screenshot of the senior's screen:
1. Determine the screen state:
   - "FOUND": The target element or relevant button/textbox is visible on this screen.
   - "HOME_SCREEN": The user is on the phone home screen/launcher and hasn't opened the app yet.
   - "WRONG_APP": The user is on an unrelated app or wrong screen.
   - "DIALOG_BLOCKING": A popup, permission prompt, or advertisement is covering the screen.
   - "NOT_FOUND": The target element is not currently visible (user may need to scroll or wait).

2. If found, locate its EXACT 2D bounding box on this image.
   Provide coordinates normalized to a 0 to 1000 integer scale:
   - ymin: Top edge of bounding box (integer 0-1000)
   - xmin: Left edge of bounding box (integer 0-1000)
   - ymax: Bottom edge of bounding box (integer 0-1000)
   - xmax: Right edge of bounding box (integer 0-1000)
   Ensure the bounding box fits snugly around the target element.

3. Provide a warm, clear spoken guidance message for an elderly senior in language '{req.language}' (en = English, kn = Kannada, hi = Hindi):
   - In English: Speak gently and simply. Point to where it is (e.g. "I can see your WhatsApp screen. Look at the top right, tap the camera icon.")
   - In Kannada: Use respectful Kannada (e.g. "ನಿಮ್ಮ ಸ್ಕ್ರೀನ್ ಕಾಣಿಸುತ್ತಿದೆ. ಮೇಲಿನ ಬಲ ಮೂಲೆಯಲ್ಲಿ ಗುರುತಿಸಿರುವ ಕ್ಯಾಮೆರಾ ಬಟನ್ ಮೇಲೆ ಒತ್ತಿರಿ.")
   - In Hindi: Use respectful Hindi (e.g. "आपकी स्क्रीन दिखाई दे रही है। ऊपर दाईं ओर दिए गए कैमरा बटन पर टैप करें।")
   - If in wrong app or home screen, tell them kindly which app to open first.

Return ONLY a valid JSON object in this exact schema without markdown backticks or commentary:
{{
  "found": true,
  "screen_state": "FOUND",
  "detected_label": "Short name of detected element",
  "confidence": 0.95,
  "box": {{
    "ymin": 120,
    "xmin": 820,
    "ymax": 180,
    "xmax": 930
  }},
  "guidance_message": "Warm spoken instructions for the senior",
  "action_hint": "Tap the camera icon"
}}"""

    # First attempt: google.genai SDK
    parsed_json = None
    try:
        from google import genai
        from google.genai import types

        client = genai.Client(api_key=api_key.strip())
        img_bytes = base64.b64decode(clean_base64)
        part = types.Part.from_bytes(data=img_bytes, mime_type="image/jpeg")

        for model_name in ["gemini-2.5-flash", "gemini-1.5-flash", "gemini-3.8-flash"]:
            try:
                response = client.models.generate_content(
                    model=model_name,
                    contents=[part, prompt]
                )
                raw_text = response.text or ""
                cleaned = re.sub(r'```json|```', '', raw_text).strip()
                parsed_json = json.loads(cleaned)
                if parsed_json:
                    break
            except Exception as model_err:
                continue
    except Exception as sdk_err:
        parsed_json = None

    # Fallback to direct REST API if SDK call didn't succeed
    if not parsed_json:
        for model_name in ["gemini-2.5-flash", "gemini-1.5-flash", "gemini-3.8-flash"]:
            try:
                url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={api_key.strip()}"
                payload = {
                    "contents": [{
                        "parts": [
                            {"inline_data": {"mime_type": "image/jpeg", "data": clean_base64}},
                            {"text": prompt}
                        ]
                    }],
                    "generationConfig": {"responseMimeType": "application/json"}
                }
                res = requests.post(url, json=payload, timeout=12)
                if res.status_code == 200:
                    data = res.json()
                    candidate_text = data.get("candidates", [{}])[0].get("content", {}).get("parts", [{}])[0].get("text", "")
                    cleaned = re.sub(r'```json|```', '', candidate_text).strip()
                    parsed_json = json.loads(cleaned)
                    if parsed_json:
                        break
            except Exception:
                continue

    if not parsed_json:
        return ScreenAnalyzeResponse(
            found=False,
            screen_state="NOT_FOUND",
            detected_label="Element not identified",
            confidence=0.0,
            box=None,
            guidance_message=(
                "ಸ್ಕ್ರೀನ್ ಮೇಲೆ ಬಟನ್ ಕಂಡುಬಂದಿಲ್ಲ. ದಯವಿಟ್ಟು ಸರಿಯಾದ ಅಪ್ಲಿಕೇಶನ್ ತೆರೆಯಿರಿ."
                if req.language == "kn"
                else "स्क्रीन पर बटन नहीं मिला। कृपया सही ऐप खोलें।"
                if req.language == "hi"
                else "Target button was not identified on this screen. Please ensure the target app is open."
            ),
            action_hint="Open target app"
        )

    box_data = parsed_json.get("box")
    screen_box = None
    if parsed_json.get("found") and isinstance(box_data, dict):
        screen_box = ScreenBox(
            ymin=int(box_data.get("ymin", 0)),
            xmin=int(box_data.get("xmin", 0)),
            ymax=int(box_data.get("ymax", 1000)),
            xmax=int(box_data.get("xmax", 1000))
        )

    return ScreenAnalyzeResponse(
        found=bool(parsed_json.get("found", False)),
        screen_state=str(parsed_json.get("screen_state", "FOUND" if parsed_json.get("found") else "NOT_FOUND")),
        detected_label=str(parsed_json.get("detected_label", req.target_name)),
        confidence=float(parsed_json.get("confidence", 0.9)),
        box=screen_box,
        guidance_message=str(parsed_json.get("guidance_message", "")),
        action_hint=str(parsed_json.get("action_hint", "Tap the highlighted area"))
    )

@app.get("/api/caregiver/alerts")
def get_caregiver_alerts():
    return {
        "count": len(caregiver_alerts_db),
        "alerts": caregiver_alerts_db
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
