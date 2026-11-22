/**
 * Infinite-Pause & Cadence-Adaptive Speech Engine
 * Specially engineered for older adults experiencing word-retrieval hesitation (anomia)
 * and breathlessness, preventing premature speech cutoff.
 */

class CadenceAdaptiveSpeechService {
  constructor() {
    this.recognition = null;
    this.isListening = false;
    this.speechRate = 0.82; // Calmed, natural slower pace for elder comprehension
    this.lang = 'en-IN';
    
    // Cadence timers & state
    this.adaptiveTimeout = null;
    this.maxPauseWindowMs = 6500; // Standard assistants cut off at 1500ms; we grant up to 6.5s
    this.currentTranscript = '';
    this.onResultCallback = null;
    this.onStatusCallback = null;
    this.onCadenceFeedback = null;
    this.hasPermissionPrompted = false;

    this.initSpeechRecognition();
  }

  isSupported() {
    return Boolean(
      typeof window !== 'undefined' && 
      (window.SpeechRecognition || window.webkitSpeechRecognition)
    );
  }

  initSpeechRecognition() {
    if (typeof window === 'undefined') return;
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    try {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.maxAlternatives = 1;

      this.recognition.onstart = () => {
        this.isListening = true;
        this.updateStatus('listening', 'Listening carefully... Take your time, Amma.');
      };

      this.recognition.onresult = (event) => {
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

      this.recognition.onerror = (event) => {
        console.warn('[SpeechService] Recognition event error:', event.error);
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          this.isListening = false;
          this.updateStatus('error', 'Microphone permission was denied. Please click the lock or camera/mic icon in your browser address bar to allow microphone access.');
        } else if (event.error === 'no-speech') {
          // If no speech heard yet, don't crash
          this.updateStatus('listening', 'Waiting for you to speak... Tap mic when ready.');
        } else if (event.error === 'network') {
          this.isListening = false;
          this.updateStatus('error', 'Speech service network error. Please check your internet connection or type below.');
        } else if (event.error === 'audio-capture') {
          this.isListening = false;
          this.updateStatus('error', 'No microphone detected on your device. Please plug in or enable a microphone.');
        } else {
          this.updateStatus('error', `Speech error: ${event.error}`);
        }
      };

      this.recognition.onend = () => {
        // Only restart if explicitly listening and no fatal error occurred
        if (this.isListening) {
          try {
            this.recognition.start();
          } catch (e) {
            this.isListening = false;
            this.updateStatus('idle', 'Tap microphone to speak');
          }
        } else {
          this.updateStatus('idle', 'Tap microphone to speak');
        }
      };
    } catch (e) {
      console.warn('[SpeechService] Could not initialize recognition:', e);
    }
  }

  /**
   * Evaluates whether the pause is mid-sentence or final
   * If the sentence is incomplete, extends the silence timeout
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

  /**
   * Heuristic check for incomplete grammar / trailing connective words
   */
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
    if (words.length <= 2) return true; // short fragments often have a follow-up
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

  /**
   * Proactively request mic permission via getUserMedia first,
   * ensuring browser dialog appears if not yet granted.
   */
  async requestMicPermission() {
    if (typeof navigator !== 'undefined' && navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        // Release immediate audio stream; Web Speech API handles its own
        stream.getTracks().forEach(t => t.stop());
        return true;
      } catch (err) {
        console.warn("Microphone permission check error:", err);
        return false;
      }
    }
    return true;
  }

  async startListening(langCode = 'en') {
    this.currentTranscript = '';
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

    // Proactively verify permission
    const hasMic = await this.requestMicPermission();
    if (!hasMic) {
      this.updateStatus('error', 'Microphone access was denied. Please allow microphone permissions in your browser address bar.');
      return false;
    }

    if (!this.recognition) {
      this.initSpeechRecognition();
    }

    if (this.recognition) {
      this.recognition.lang = this.lang;
      try {
        this.isListening = true;
        this.recognition.start();
        return true;
      } catch (err) {
        // Recognition might already be running
        console.warn("Recognition start info:", err.message);
        return true;
      }
    }

    return false;
  }

  stopListening() {
    const hadTranscript = Boolean(this.currentTranscript);
    const lastText = this.currentTranscript;

    this.isListening = false;
    if (this.adaptiveTimeout) {
      clearTimeout(this.adaptiveTimeout);
    }
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (e) {}
    }

    // If user clicked stop with an active transcript, commit it now
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
   * Senior-friendly Text-to-Speech (TTS)
   * Plays with gentle pace and natural pauses
   */
  speak(text, langCode = 'en', onDone = null) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      if (onDone) onDone();
      return;
    }

    try {
      window.speechSynthesis.cancel(); // cancel any active speech

      const utterance = new SpeechSynthesisUtterance(text);
      const langMap = {
        en: 'en-IN',
        kn: 'kn-IN',
        hi: 'hi-IN'
      };
      utterance.lang = langMap[langCode] || 'en-IN';
      utterance.rate = this.speechRate; // Calmed, slower speed (0.82x)
      utterance.pitch = 1.0;

      // Try finding a matching native voice
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

export const speechService = new CadenceAdaptiveSpeechService();
