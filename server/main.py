import os
import re
from typing import List, Optional
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

@app.get("/api/caregiver/alerts")
def get_caregiver_alerts():
    return {
        "count": len(caregiver_alerts_db),
        "alerts": caregiver_alerts_db
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
