/**
 * Real-Time Screen Vision Analysis Service
 * Captures live screen frames from getDisplayMedia video stream
 * and analyzes actual UI elements using Gemini Vision.
 */

import { APP_CONFIG } from '../config/appConfig';

class ScreenVisionService {
  constructor() {
    this.storageKey = `${APP_CONFIG.storagePrefix}gemini_key`;
    this.apiBaseUrl = APP_CONFIG.apiBaseUrl || 'http://localhost:8000';
  }

  /**
   * Get stored Gemini API Key
   */
  getStoredApiKey() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored && stored.trim().length > 10) return stored.trim();
    } catch {
      // ignore
    }
    return '';
  }

  /**
   * Save Gemini API Key
   */
  setStoredApiKey(key) {
    try {
      if (!key) {
        localStorage.removeItem(this.storageKey);
      } else {
        localStorage.setItem(this.storageKey, key.trim());
      }
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Check if Gemini Vision is available (either via server-side key on backend, or local key in browser)
   */
  async isVisionConfigured() {
    if (this.getStoredApiKey()) return true;
    try {
      const res = await fetch(`${this.apiBaseUrl}/api/health`, { method: 'GET' });
      if (res.ok) {
        const data = await res.json();
        return Boolean(data.gemini_configured);
      }
    } catch {
      // Backend not running / unreachable
    }
    return false;
  }

  /**
   * Test if Gemini API Key is valid
   */
  async testApiKey(key) {
    if (!key || key.trim().length < 10) {
      return { success: false, message: 'API key is too short or empty.' };
    }
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key.trim()}`;
      const res = await fetch(url);
      if (res.ok) {
        return { success: true, message: 'Gemini API key verified successfully!' };
      }
      const data = await res.json().catch(() => ({}));
      return { 
        success: false, 
        message: data.error?.message || `Validation failed (HTTP ${res.status}).` 
      };
    } catch (err) {
      return { success: false, message: err.message || 'Network error verifying key.' };
    }
  }

  /**
   * Capture a single high-quality frame from a live HTMLVideoElement
   */
  captureFrame(videoElement, maxWidth = 1280) {
    if (!videoElement || videoElement.videoWidth === 0 || videoElement.videoHeight === 0) {
      throw new Error('Video stream is not yet ready or has zero dimensions.');
    }

    const naturalWidth = videoElement.videoWidth;
    const naturalHeight = videoElement.videoHeight;

    // Scale down proportionally if larger than maxWidth to conserve bandwidth
    let targetWidth = naturalWidth;
    let targetHeight = naturalHeight;
    if (naturalWidth > maxWidth) {
      const ratio = maxWidth / naturalWidth;
      targetWidth = maxWidth;
      targetHeight = Math.round(naturalHeight * ratio);
    }

    const canvas = document.createElement('canvas');
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext('2d');
    
    // Draw current video frame onto canvas
    ctx.drawImage(videoElement, 0, 0, targetWidth, targetHeight);

    // Export as JPEG (quality 0.85)
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    const base64Data = dataUrl.split(',')[1];

    return {
      dataUrl,
      base64Data,
      width: targetWidth,
      height: targetHeight
    };
  }

  /**
   * Analyze live screen frame using Gemini Vision
   * Tries backend first; falls back to direct client REST call.
   */
  async analyzeLiveScreen({
    videoElement,
    taskTitle,
    stepInstruction,
    targetName,
    language = 'en',
    apiKeyOverride = null
  }) {
    const apiKey = apiKeyOverride || this.getStoredApiKey();

    // 1. Capture current frame from live stream
    let frame;
    try {
      frame = this.captureFrame(videoElement);
    } catch (err) {
      return {
        success: false,
        reason: 'FRAME_CAPTURE_FAILED',
        error: err.message,
        guidanceMessage: 'Please ensure your screen share is active.'
      };
    }

    // 2. Try backend API first (/api/analyze-screen)
    // If backend has GEMINI_API_KEY configured in server env, no client key is needed!
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 45000); // 45s to allow Render cold start

      const response = await fetch(`${this.apiBaseUrl}/api/analyze-screen`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          image_base64: frame.base64Data,
          task_title: taskTitle,
          step_instruction: stepInstruction,
          target_name: targetName,
          language: language,
          api_key: apiKey || null
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const result = await response.json();
        // If backend explicitly told us that no key is configured on server or request
        if (result.screen_state === 'NO_API_KEY') {
          return {
            success: false,
            reason: 'NO_API_KEY',
            frameDataUrl: frame.dataUrl,
            guidanceMessage: result.guidance_message || (
              language === 'kn'
                ? "ಲೈವ್ ಸ್ಕ್ರೀನ್ ಗುರುತಿಸುವಿಕೆಗಾಗಿ ದಯವಿಟ್ಟು ಜೆಮಿನಿ ಎಪಿಐ ಕೀ ಸೇರಿಸಿ ಅಥವಾ ಸರ್ವರ್‌ನಲ್ಲಿ ಸಂರಚಿಸಿ."
                : language === 'hi'
                ? "लाइव स्क्रीन पर बटन पहचानने के लिए कृपया जेमिनी एपीआई कुंजी दर्ज करें।"
                : "Please configure GEMINI_API_KEY on the server, or enter a key here for direct browser recognition."
            )
          };
        }
        return this._formatDetectionResult(result, frame.dataUrl);
      }
    } catch (backendErr) {
      console.warn("Backend /api/analyze-screen unavailable; trying direct browser call if local key exists:", backendErr.message);
    }

    // 3. Fallback: If backend was unreachable, check if client has a local key saved in browser
    if (apiKey) {
      try {
        return await this._callGeminiDirect({
          base64Data: frame.base64Data,
          dataUrl: frame.dataUrl,
          taskTitle,
          stepInstruction,
          targetName,
          language,
          apiKey
        });
      } catch (directErr) {
        console.error("Direct Gemini call failed:", directErr);
        return {
          success: false,
          reason: 'API_ERROR',
          error: directErr.message,
          frameDataUrl: frame.dataUrl,
          guidanceMessage: `Screen analysis error: ${directErr.message || 'Unable to connect to Gemini Vision.'}`
        };
      }
    }

    // 4. Neither backend key nor local browser key is available
    return {
      success: false,
      reason: 'NO_API_KEY',
      frameDataUrl: frame.dataUrl,
      guidanceMessage: language === 'kn'
        ? "ಲೈವ್ ಸ್ಕ್ರೀನ್ ಗುರುತಿಸುವಿಕೆಗಾಗಿ ದಯವಿಟ್ಟು ಜೆಮಿನಿ ಎಪಿಐ ಕೀ ಸೇರಿಸಿ."
        : language === 'hi'
        ? "लाइव स्क्रीन पर बटन पहचानने के लिए कृपया जेमिनी एपीआई कुंजी दर्ज करें।"
        : "Please set GEMINI_API_KEY on the server or enter a key to enable live real-time UI recognition."
    };
  }

  /**
   * Direct Gemini REST API Multimodal Caller
   */
  async _callGeminiDirect({
    base64Data,
    dataUrl,
    taskTitle,
    stepInstruction,
    targetName,
    language,
    apiKey
  }) {
    const prompt = `You are an AI Accessibility & Senior Citizen Digital Literacy Co-Pilot.
The elderly senior citizen is currently sharing their REAL live device screen.
Current Task: "${taskTitle}"
Current Step Instruction: "${stepInstruction}"
Target UI Element to locate on their actual screen: "${targetName}"

Analyze the provided screenshot of the user's live device screen carefully:
1. Determine the screen state:
   - "FOUND": The target element or relevant button/textbox is visible on this screen.
   - "HOME_SCREEN": The user is on the phone home screen/launcher and hasn't opened the required app yet.
   - "WRONG_APP": The user is in a different app or wrong screen.
   - "DIALOG_BLOCKING": A popup, permission prompt, or advertisement is covering the screen.
   - "NOT_FOUND": Target element is not currently visible (user may need to scroll or wait).

2. If found, locate its EXACT 2D bounding box on this image.
   Provide coordinates normalized to a 0 to 1000 integer scale:
   - ymin: Top edge of bounding box (integer 0-1000)
   - xmin: Left edge of bounding box (integer 0-1000)
   - ymax: Bottom edge of bounding box (integer 0-1000)
   - xmax: Right edge of bounding box (integer 0-1000)
   Ensure the bounding box snugly fits the target button/textbox/icon.

3. Provide a warm, clear spoken guidance message for an elderly senior in language '${language}' (en = English, kn = Kannada, hi = Hindi):
   - In English: Speak gently and simply. Point to where it is (e.g. "I see your screen. Look at the top right corner and tap the green camera icon.")
   - In Kannada: Use respectful Kannada (e.g. "ನಿಮ್ಮ ಸ್ಕ್ರೀನ್ ಕಾಣಿಸುತ್ತಿದೆ. ಮೇಲಿನ ಬಲ ಮೂಲೆಯಲ್ಲಿ ಗುರುತಿಸಿರುವ ಕ್ಯಾಮೆರಾ ಬಟನ್ ಮೇಲೆ ಒತ್ತಿರಿ.")
   - In Hindi: Use respectful Hindi (e.g. "आपकी स्क्रीन दिखाई दे रही है। ऊपर दाईं ओर दिए गए कैमरा बटन पर टैप करें।")
   - If in wrong app or home screen, tell them kindly which app to open first.

Return ONLY a valid JSON object in this exact schema without extra text:
{
  "found": true,
  "screen_state": "FOUND",
  "detected_label": "Short name of detected element",
  "confidence": 0.95,
  "box": {
    "ymin": 120,
    "xmin": 820,
    "ymax": 180,
    "xmax": 930
  },
  "guidance_message": "Warm spoken instructions for the senior",
  "action_hint": "Tap the camera icon"
}`;

    // Active multimodal models on Google AI Studio
    const models = ['gemini-2.0-flash', 'gemini-1.5-flash'];
    let lastError = null;

    for (const model of models) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    inline_data: {
                      mime_type: 'image/jpeg',
                      data: base64Data
                    }
                  },
                  {
                    text: prompt
                  }
                ]
              }
            ],
            generationConfig: {
              responseMimeType: 'application/json'
            }
          })
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error?.message || `HTTP ${res.status}`);
        }

        const data = await res.json();
        const candidate = data.candidates?.[0];
        const rawText = candidate?.content?.parts?.[0]?.text;
        if (!rawText) throw new Error('No content returned from Gemini.');

        // Clean json if wrapped in backticks or markdown
        let parsed = null;
        try {
          const cleanedText = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
          parsed = JSON.parse(cleanedText);
        } catch {
          const match = rawText.match(/\{[\s\S]*\}/);
          if (match) {
            parsed = JSON.parse(match[0]);
          }
        }

        if (!parsed) throw new Error('Could not parse Gemini JSON response.');

        return this._formatDetectionResult(parsed, dataUrl);
      } catch (err) {
        lastError = err;
        console.warn(`Attempt with ${model} failed:`, err.message);
      }
    }

    throw lastError || new Error('All Gemini model endpoints failed.');
  }

  /**
   * Normalize detection response into UI friendly percentages
   */
  _formatDetectionResult(result, frameDataUrl) {
    const found = Boolean(result.found);
    const box = result.box;

    let cssBox = null;
    if (found && box) {
      const ymin = Math.max(0, Math.min(1000, Number(box.ymin) || 0));
      const xmin = Math.max(0, Math.min(1000, Number(box.xmin) || 0));
      const ymax = Math.max(ymin + 10, Math.min(1000, Number(box.ymax) || 1000));
      const xmax = Math.max(xmin + 10, Math.min(1000, Number(box.xmax) || 1000));

      const topPercent = (ymin / 10).toFixed(2);
      const leftPercent = (xmin / 10).toFixed(2);
      const widthPercent = ((xmax - xmin) / 10).toFixed(2);
      const heightPercent = ((ymax - ymin) / 10).toFixed(2);

      cssBox = {
        top: `${topPercent}%`,
        left: `${leftPercent}%`,
        width: `${widthPercent}%`,
        height: `${heightPercent}%`,
        ymin,
        xmin,
        ymax,
        xmax
      };
    }

    return {
      success: true,
      found: found,
      screenState: result.screen_state || (found ? 'FOUND' : 'NOT_FOUND'),
      detectedLabel: result.detected_label || (found ? 'Target Element' : 'Not detected on current screen'),
      confidence: typeof result.confidence === 'number' ? result.confidence : 0.9,
      box: box,
      cssBox: cssBox,
      guidanceMessage: result.guidance_message || '',
      actionHint: result.action_hint || (found ? 'Tap the highlighted button' : 'Open the relevant screen'),
      frameDataUrl: frameDataUrl,
      timestamp: Date.now()
    };
  }
}

export const screenVisionService = new ScreenVisionService();
