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

def extract_json_dict(text: str) -> Optional[dict]:
    """Robustly extracts and parses a JSON dictionary from Gemini responses,
    handling markdown blocks, commentary, and trailing characters."""
    if not text:
        return None
    cleaned = re.sub(r'```json\s*', '', text, flags=re.IGNORECASE)
    cleaned = re.sub(r'```\s*', '', cleaned).strip()
    try:
        data = json.loads(cleaned)
        if isinstance(data, dict):
            return data
    except Exception:
        pass

    match = re.search(r'\{[\s\S]*\}', text)
    if match:
        try:
            data = json.loads(match.group(0))
            if isinstance(data, dict):
                return data
        except Exception:
            pass
    return None

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

class ChatAssistantRequest(BaseModel):
    message: str
    language: Optional[str] = "en"
    api_key: Optional[str] = None

class ChatAssistantResponse(BaseModel):
    reply: str
    suggested_guide_ids: List[str]

class VoiceTranscribeRequest(BaseModel):
    audio_base64: str
    mime_type: Optional[str] = "audio/webm"
    language: Optional[str] = "en"
    api_key: Optional[str] = None

class VoiceTranscribeResponse(BaseModel):
    transcript: str
    reply: str
    suggested_guide_ids: List[str]

# In-memory alert store for Caregiver Companion
caregiver_alerts_db = []

# ----------------- Routes -----------------
@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": f"{app_title} Engine",
        "version": "1.0.0",
        "gemini_configured": bool(os.getenv("GEMINI_API_KEY"))
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

    prompt = f"""You are an expert AI Accessibility helper for elderly senior citizens.
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

        for model_name in ["gemini-2.0-flash", "gemini-1.5-flash"]:
            try:
                response = client.models.generate_content(
                    model=model_name,
                    contents=[part, prompt]
                )
                raw_text = response.text or ""
                parsed_json = extract_json_dict(raw_text)
                if parsed_json:
                    break
            except Exception as model_err:
                continue
    except Exception as sdk_err:
        parsed_json = None

    # Fallback to direct REST API if SDK call didn't succeed
    if not parsed_json:
        for model_name in ["gemini-2.0-flash", "gemini-1.5-flash"]:
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
                res = requests.post(url, json=payload, timeout=30)
                if res.status_code == 200:
                    data = res.json()
                    candidate_text = data.get("candidates", [{}])[0].get("content", {}).get("parts", [{}])[0].get("text", "")
                    parsed_json = extract_json_dict(candidate_text)
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

@app.post("/api/chat-assistant", response_model=ChatAssistantResponse)
def chat_assistant(req: ChatAssistantRequest):
    """
    Intelligent conversational companion for senior citizens.
    Answers any smartphone or security question directly and politely.
    """
    user_query = req.message.strip()
    lower_query = user_query.lower()
    api_key = req.api_key or os.getenv("GEMINI_API_KEY")

    # If Gemini API key is available, call Gemini for a natural, personalized answer
    if api_key and len(api_key.strip()) > 10:
        try:
            from google import genai
            client = genai.Client(api_key=api_key.strip())
            prompt = f"""You are a warm, gentle, and highly supportive digital literacy companion for elderly Indian grandparents.
The senior is asking: "{user_query}"
Language: "{req.language}" (en = English, kn = Kannada, hi = Hindi)

Instructions:
1. Provide a direct, compassionate, step-by-step answer in 2-3 clear sentences in the requested language.
2. Explain things in very simple, non-technical words (e.g., describe icons as small pictures on screen).
3. If they asked how to open an app (e.g. WhatsApp, PhonePe), explain what the icon looks like and where to find it.
4. If relevant, list matching guide IDs from this list:
   ['whatsapp-video-call', 'whatsapp-photo-share', 'whatsapp-voice-message', 'make-font-larger', 'turn-on-flashlight', 'mobile-recharge-upi', 'send-money-phonepe', 'sos-emergency-call']

Return ONLY valid JSON matching this schema:
{{
  "reply": "Warm answer here in the chosen language",
  "suggested_guide_ids": ["whatsapp-video-call"]
}}"""
            res = client.models.generate_content(
                model="gemini-2.0-flash",
                contents=prompt
            )
            raw = res.text or ''
            data = extract_json_dict(raw)
            if data and "reply" in data:
                return ChatAssistantResponse(
                    reply=str(data.get("reply", "")),
                    suggested_guide_ids=list(data.get("suggested_guide_ids", []))
                )
        except Exception as e:
            print("Gemini chat assistant fallback:", e)

    # Heuristic fallback answers for common senior citizen queries
    reply = ""
    suggested = []

    if "whatsapp" in lower_query:
        if "open" in lower_query or "start" in lower_query or "where" in lower_query or "ತೆರೆಯುವುದು" in lower_query or "खोल" in lower_query:
            if req.language == "kn":
                reply = "ವಾಟ್ಸಾಪ್ ತೆರೆಯಲು, ನಿಮ್ಮ ಮೊಬೈಲ್‌ನ ಮುಖಪುಟದಲ್ಲಿ ಅಥವಾ ಆ್ಯಪ್ ಪಟ್ಟಿಯಲ್ಲಿ ಬಿಳಿ ದೂರವಾಣಿ ಚಿತ್ರವಿರುವ ಹಸಿರು ವೃತ್ತಾಕಾರದ ಐಕಾನ್ ಹುಡುಕಿ, ಅದರ ಮೇಲೆ ಒಮ್ಮೆ ಸ್ಪರ್ಶಿಸಿ."
            elif req.language == "hi":
                reply = "व्हाट्सएप खोलने के लिए अपने फोन की होम स्क्रीन पर हरे रंग का गोलाकार आइकन देखें जिसके अंदर सफेद फोन का चित्र बना है, और उस पर एक बार टैप करें।"
            else:
                reply = "To open WhatsApp, look on your phone's home screen or apps list for the green circular icon with a white telephone handset inside, and tap on it once."
            suggested = ["whatsapp-video-call", "whatsapp-photo-share", "whatsapp-voice-message"]
        elif "call" in lower_query or "video" in lower_query or "ಕಾಲ್" in lower_query or "कॉल" in lower_query:
            if req.language == "kn":
                reply = "ವಾಟ್ಸಾಪ್‌ನಲ್ಲಿ ವಿಡಿಯೋ ಕರೆ ಮಾಡಲು, ವಾಟ್ಸಾಪ್ ತೆರೆದು ನಿಮ್ಮ ಸಂಬಂಧಿಕರ ಹೆಸರನ್ನು ಒತ್ತಿ, ಮೇಲಿನ ಬಲ ಮೂಲೆಯಲ್ಲಿರುವ ಸಣ್ಣ ವಿಡಿಯೋ ಕ್ಯಾಮೆರಾ ಚಿಹ್ನೆಯನ್ನು ಒತ್ತಿರಿ."
            elif req.language == "hi":
                reply = "व्हाट्सएप वीडियो कॉल करने के लिए चैट खोलें और ऊपर दाईं ओर दिख रहे छोटे वीडियो कैमरा आइकन पर टैप करें।"
            else:
                reply = "To make a WhatsApp video call, open the chat with your family member and tap the small video camera icon in the top right corner."
            suggested = ["whatsapp-video-call"]
        else:
            if req.language == "kn":
                reply = "ವಾಟ್ಸಾಪ್ ಮೂಲಕ ನೀವು ಮಕ್ಕಳು ಮತ್ತು ಮೊಮ್ಮಕ್ಕಳೊಂದಿಗೆ ಉಚಿತವಾಗಿ ಮಾತನಾಡಬಹುದು, ಫೋಟೋ ಕಳುಹಿಸಬಹುದು ಮತ್ತು ಮುಖಾಮುಖಿ ವಿಡಿಯೋ ಕರೆ ಮಾಡಬಹುದು."
            elif req.language == "hi":
                reply = "व्हाट्सएप से आप अपने परिवार से मुफ्त में बात कर सकते हैं, फोटो भेज सकते हैं और वीडियो कॉल कर सकते हैं।"
            else:
                reply = "WhatsApp lets you chat, share family photos, and make face-to-face video calls with your loved ones for free."
            suggested = ["whatsapp-video-call", "whatsapp-photo-share"]

    elif any(w in lower_query for w in ["font", "size", "larger", "bigger", "text", "ದೊಡ್ಡ", "ಅಕ್ಷರ", "बड़ा", "अक्षर"]):
        if req.language == "kn":
            reply = "ಅಕ್ಷರಗಳನ್ನು ದೊಡ್ಡದಾಗಿಸಲು, ಮೊಬೈಲ್‌ನ 'ಸೆಟ್ಟಿಂಗ್ಸ್' (Settings) ತೆರೆದು, 'ಡಿಸ್ಪ್ಲೇ' (Display) ಆಯ್ಕೆಮಾಡಿ, 'ಫಾಂಟ್ ಗಾತ್ರ' (Font Size) ಅನ್ನು ನಿಮ್ಮ ಕಣ್ಣಿಗೆ ಹಿತವಾಗುವಂತೆ ಸರಿಸಿ."
        elif req.language == "hi":
            reply = "स्क्रीन पर अक्षर बड़े करने के लिए फोन की 'सेटिंग्स' में जाएं, 'डिस्प्ले' पर टैप करें और 'फ़ॉन्ट साइज़' को अपनी सुविधानुसार बढ़ा लें।"
        else:
            reply = "To make screen text larger, open your phone Settings, tap 'Display', and then tap 'Font Size' to adjust the slider to a comfortable reading size."
        suggested = ["make-font-larger"]

    elif any(w in lower_query for w in ["torch", "light", "flashlight", "ಟಾರ್ಚ್", "ಬೆಳಕು", "टॉर्च"]):
        if req.language == "kn":
            reply = "ಟಾರ್ಚ್ ಆನ್ ಮಾಡಲು, ನಿಮ್ಮ ಮೊಬೈಲ್ ಸ್ಕ್ರೀನ್‌ನ ಮೇಲಿನ ತುದಿಯಿಂದ ಕೆಳಗೆ ಬೆರಳಿನಿಂದ ಎಳೆಯಿರಿ (Swipe down), ನಂತರ ಅಲ್ಲಿ ಕಾಣುವ ಟಾರ್ಚ್ ಐಕಾನ್ ಒತ್ತಿರಿ."
        elif req.language == "hi":
            reply = "टॉर्च जलाने के लिए स्क्रीन के सबसे ऊपर से नीचे की ओर स्वाइप करें और टॉर्च वाले आइकन पर टैप करें।"
        else:
            reply = "To turn on the torch, swipe down from the very top of your phone screen to open Quick Settings, and tap the Flashlight icon."
        suggested = ["turn-on-flashlight"]

    elif any(w in lower_query for w in ["scam", "fraud", "fake", "otp", "pin", "ವಂಚನೆ", "धोखा"]):
        if req.language == "kn":
            reply = "ಎಚ್ಚರ! ಯಾವುದೇ ಅಪರಿಚಿತ ವ್ಯಕ್ತಿಯೊಂದಿಗೆ ಫೋನಿನಲ್ಲಿ ಒಟಿಪಿ (OTP) ಅಥವಾ ಯುಪಿಐ ಪಿನ್ ಹಂಚಿಕೊಳ್ಳಬೇಡಿ. ಬ್ಯಾಂಕ್‌ಗಳು ಅಥವಾ ಸರ್ಕಾರಿ ಕಚೇರಿಗಳು ಎಂದಿಗೂ ಫೋನಿನಲ್ಲಿ ಪಿನ್ ಕೇಳುವುದಿಲ್ಲ."
        elif req.language == "hi":
            reply = "सावधान रहें! किसी भी व्यक्ति के साथ फोन पर ओटीपी या यूपीआई पिन साझा न करें। बैंक या बिजली विभाग कभी फोन पर पिन नहीं मांगते।"
        else:
            reply = "Always remember: Never share your OTP or UPI PIN with anyone over a call. Legitimate banks and government officials will never ask for your passwords."
        suggested = []

    else:
        if req.language == "kn":
            reply = f"ನಾನು ನಿಮ್ಮ ಪ್ರಶ್ನೆಯನ್ನು ಅರ್ಥಮಾಡಿಕೊಂಡೆ: '{user_query}'. ನಿಮಗೆ ಬೇಕಾದ ಯಾವುದೇ ಸ್ಮಾರ್ಟ್‌ಫೋನ್ ಸಹಾಯಕ್ಕಾಗಿ ನಾನು ಸಿದ್ಧನಾಗಿದ್ದೇನೆ."
        elif req.language == "hi":
            reply = f"मैंने आपका प्रश्न समझ लिया: '{user_query}'. स्मार्टफोन चलाने में किसी भी प्रकार की सहायता के लिए मैं तैयार हूँ।"
        else:
            reply = f"I am here to guide you with '{user_query}'. You can ask me how to open apps, adjust settings, or verify suspicious messages."
        suggested = ["whatsapp-video-call", "make-font-larger", "turn-on-flashlight"]

    return ChatAssistantResponse(reply=reply, suggested_guide_ids=suggested)

@app.post("/api/transcribe-voice", response_model=VoiceTranscribeResponse)
def transcribe_voice(req: VoiceTranscribeRequest):
    """
    Transcribes recorded audio directly via Gemini Multimodal Audio,
    bypassing browser speech recognition network limitations.
    """
    api_key = req.api_key or os.getenv("GEMINI_API_KEY")
    clean_base64 = req.audio_base64
    if "," in clean_base64:
        clean_base64 = clean_base64.split(",")[1]

    if not api_key:
        return VoiceTranscribeResponse(
            transcript="Audio received",
            reply="Please set the GEMINI_API_KEY so voice help can work, or type your question in the box below.",
            suggested_guide_ids=[]
        )

    prompt = f"""Listen to this audio recording from an elderly senior citizen in India.
1. Transcribe the spoken words accurately in the language they spoke ({req.language}).
2. Provide a polite, reassuring answer to their question in language '{req.language}'.
3. Return JSON:
{{
  "transcript": "Exact words spoken",
  "reply": "Friendly 2-sentence response",
  "suggested_guide_ids": ["whatsapp-video-call"]
}}"""

    data = None

    # 1. Try google.genai SDK
    try:
        from google import genai
        from google.genai import types

        client = genai.Client(api_key=api_key.strip())
        audio_bytes = base64.b64decode(clean_base64)
        audio_part = types.Part.from_bytes(data=audio_bytes, mime_type=req.mime_type or "audio/webm")

        for model_name in ["gemini-2.0-flash", "gemini-1.5-flash"]:
            try:
                res = client.models.generate_content(
                    model=model_name,
                    contents=[audio_part, prompt]
                )
                data = extract_json_dict(res.text or '')
                if data:
                    break
            except Exception:
                continue
    except Exception:
        data = None

    # 2. Fallback to direct REST API
    if not data:
        for model_name in ["gemini-2.0-flash", "gemini-1.5-flash"]:
            try:
                url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={api_key.strip()}"
                payload = {
                    "contents": [{
                        "parts": [
                            {"inline_data": {"mime_type": req.mime_type or "audio/webm", "data": clean_base64}},
                            {"text": prompt}
                        ]
                    }],
                    "generationConfig": {"responseMimeType": "application/json"}
                }
                res = requests.post(url, json=payload, timeout=35)
                if res.status_code == 200:
                    res_json = res.json()
                    candidate_text = res_json.get("candidates", [{}])[0].get("content", {}).get("parts", [{}])[0].get("text", "")
                    data = extract_json_dict(candidate_text)
                    if data:
                        break
            except Exception:
                continue

    if data:
        return VoiceTranscribeResponse(
            transcript=str(data.get("transcript", "Audio query")),
            reply=str(data.get("reply", "I am here to guide you.")),
            suggested_guide_ids=list(data.get("suggested_guide_ids", []))
        )

    return VoiceTranscribeResponse(
        transcript="Audio query",
        reply="Could not process voice audio at this moment. Please type your question in the box below.",
        suggested_guide_ids=[]
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
