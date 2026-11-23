/**
 * Patient Speech Engine
 * Designed for older adults — allows long pauses without cutting off,
 * so seniors can speak at their own pace.
 */

class PatientSpeechService {
  constructor() {
    this.recognition = null;
    this.isListening = false;
    this.speechRate = 0.82; // Slower pace for easy listening
    this.lang = 'en-IN';
    
    // Pause timers & state
    this.adaptiveTimeout = null;
    this.maxPauseWindowMs = 6500; // We wait up to 6.5 seconds for seniors to finish talking
    this.currentTranscript = '';
    this.onResultCallback = null;
    this.onStatusCallback = null;
    this.onCadenceFeedback = null;
    this.restartTimeout = null;
  }

  isSupported() {
    return Boolean(
      typeof window !== 'undefined' && 
      (window.SpeechRecognition || window.webkitSpeechRecognition)
    );
  }

  /**
   * Creates a fresh SpeechRecognition instance
   */
  createRecognitionInstance() {
    if (typeof window === 'undefined') return null;
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return null;

    try {
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;
      rec.maxAlternatives = 1;
      rec.lang = this.lang;

      rec.onstart = () => {
        this.isListening = true;
        this.updateStatus('listening', 'Listening... Take your time.');
      };

      rec.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const item = event.results[i];
          if (item.isFinal) {
            finalTranscript += item[0].transcript;
          } else {
            interimTranscript += item[0].transcript;
          }
        }

        const activeText = (finalTranscript || interimTranscript).trim();
        if (activeText) {
          this.currentTranscript = activeText;
          if (this.onResultCallback) {
            this.onResultCallback(activeText, false);
          }
          this.handleCadencePause(activeText);
        }
      };

      rec.onerror = (event) => {
        console.warn('[SpeechService] Recognition error:', event.error);

        // 'no-speech' is a normal transient pause in continuous listening — do NOT kill the session
        if (event.error === 'no-speech') {
          return;
        }

        // 'aborted' is triggered during restarts or manual stops — ignore
        if (event.error === 'aborted') {
          return;
        }

        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          this.isListening = false;
          this.updateStatus('error', 'Microphone permission was denied. Please allow microphone access in your browser address bar.');
          return;
        }

        if (event.error === 'audio-capture') {
          this.isListening = false;
          this.updateStatus('error', 'No microphone detected on your device. Please plug in or enable a microphone.');
          return;
        }

        if (event.error === 'network') {
          this.isListening = false;
          this.updateStatus('error', 'Speech recognition network error. Please check your internet or type your question below.');
          return;
        }

        this.updateStatus('error', `Speech error: ${event.error}`);
      };

      rec.onend = () => {
        // If user is supposed to still be talking and did not click stop, keep listening alive
        if (this.isListening) {
          clearTimeout(this.restartTimeout);
          this.restartTimeout = setTimeout(() => {
            if (this.isListening) {
              try {
                this.recognition = this.createRecognitionInstance();
                if (this.recognition) {
                  this.recognition.start();
                }
              } catch (e) {
                console.warn("[SpeechService] Restart attempt info:", e.message);
              }
            }
          }, 120);
        } else {
          this.updateStatus('idle', 'Tap microphone to speak');
        }
      };

      return rec;
    } catch (e) {
      console.warn('[SpeechService] Could not initialize recognition:', e);
      return null;
    }
  }

  /**
   * Checks if the person is in the middle of speaking
   */
  handleCadencePause(text) {
    if (this.adaptiveTimeout) {
      clearTimeout(this.adaptiveTimeout);
    }

    const isIncomplete = this.isThoughtIncomplete(text);
    const pauseAllowance = isIncomplete ? this.maxPauseWindowMs : 3200;

    if (this.onCadenceFeedback) {
      this.onCadenceFeedback({
        isIncomplete,
        extendedPauseMs: pauseAllowance,
        message: isIncomplete 
          ? "Waiting patiently for you to finish your thought..."
          : "Listening..."
      });
    }

    this.adaptiveTimeout = setTimeout(() => {
      this.commitFinalUtterance();
    }, pauseAllowance);
  }

  isThoughtIncomplete(text) {
    const lower = text.toLowerCase().trim();
    const trailingConnectors = [
      'and', 'or', 'then', 'to', 'how do i', 'where is', 'i want to', 'how to', 'in', 'at', 'with', 'because',
      'ಮತ್ತು', 'ಹೇಗೆ', 'ಮಾಡಬೇಕು', 'ನನಗೆ', 'ಎಲ್ಲಿ', 'ಯಾವಾಗ',
      'aur', 'kaise', 'karna', 'kahan', 'kyun', 'lekin', 'ya'
    ];

    const words = lower.split(/\s+/);
    const lastWord = words[words.length - 1];

    if (trailingConnectors.includes(lastWord)) return true;
    if (words.length <= 2) return true;
    return false;
  }

  commitFinalUtterance() {
    if (this.currentTranscript && this.onResultCallback) {
      const finalUtterance = this.currentTranscript;
      this.currentTranscript = '';
      this.onResultCallback(finalUtterance, true);
      this.stopListening();
    }
  }

  startListening(langCode = 'en') {
    this.currentTranscript = '';
    clearTimeout(this.restartTimeout);

    const langMap = {
      en: 'en-IN',
      kn: 'kn-IN',
      hi: 'hi-IN'
    };
    this.lang = langMap[langCode] || 'en-IN';

    if (!this.isSupported()) {
      this.updateStatus('error', 'Speech recognition is not supported in this browser. Please use Chrome or Edge, or type your question below.');
      return false;
    }

    // Cancel any active TTS speech so it doesn't hold or close microphone
    this.stopSpeaking();

    // Safely stop previous instance if any
    if (this.recognition) {
      try {
        this.recognition.abort();
      } catch (e) {}
    }

    this.isListening = true;
    this.recognition = this.createRecognitionInstance();

    if (this.recognition) {
      try {
        this.recognition.start();
        return true;
      } catch (err) {
        console.warn("[SpeechService] Start error:", err);
        this.isListening = false;
        this.updateStatus('error', 'Could not access microphone. Please tap again or allow microphone permissions.');
        return false;
      }
    }

    this.isListening = false;
    return false;
  }

  stopListening() {
    clearTimeout(this.restartTimeout);
    clearTimeout(this.adaptiveTimeout);

    const hadTranscript = Boolean(this.currentTranscript);
    const lastText = this.currentTranscript;

    this.isListening = false;

    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (e) {}
    }

    // If user clicked stop with an active transcript, deliver it now
    if (hadTranscript && this.onResultCallback) {
      this.currentTranscript = '';
      this.onResultCallback(lastText, true);
    }

    this.updateStatus('idle', 'Tap to speak');
  }

  updateStatus(state, message) {
    if (this.onStatusCallback) {
      this.onStatusCallback({ state, message });
    }
  }

  /**
   * Easy-to-understand Text-to-Speech (TTS)
   */
  speak(text, langCode = 'en', onDone = null) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      if (onDone) onDone();
      return;
    }

    try {
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      const langMap = {
        en: 'en-IN',
        kn: 'kn-IN',
        hi: 'hi-IN'
      };
      utterance.lang = langMap[langCode] || 'en-IN';
      utterance.rate = this.speechRate;
      utterance.pitch = 1.0;

      const voices = window.speechSynthesis.getVoices();
      if (voices && voices.length > 0) {
        const matchedVoice = voices.find(v => 
          v.lang.startsWith(utterance.lang) || 
          v.lang.startsWith(langCode)
        );
        if (matchedVoice) {
          utterance.voice = matchedVoice;
        }
      }

      utterance.onend = () => {
        if (onDone) onDone();
      };

      utterance.onerror = () => {
        if (onDone) onDone();
      };

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn("TTS error:", e);
      if (onDone) onDone();
    }
  }

  stopSpeaking() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }
}

export const speechService = new PatientSpeechService();
