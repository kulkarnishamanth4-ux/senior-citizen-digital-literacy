/**
 * Infinite-Pause & Cadence-Adaptive Speech Engine
 * Specially engineered for older adults experiencing word-retrieval hesitation (anomia)
 * and breathlessness, preventing premature speech cutoff.
 */

class CadenceAdaptiveSpeechService {
  constructor() {
    this.recognition = null;
    this.isListening = false;
    this.speechRate = 0.8; // Calmed, slower speed for elder comprehension
    this.lang = 'en-US';
    
    // Cadence timers & state
    this.adaptiveTimeout = null;
    this.maxPauseWindowMs = 6500; // Standard assistants cut off at 1500ms; we grant up to 6.5s
    this.currentTranscript = '';
    this.onResultCallback = null;
    this.onStatusCallback = null;
    this.onCadenceFeedback = null;

    this.initSpeechRecognition();
  }

  initSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;

      this.recognition.onstart = () => {
        this.isListening = true;
        this.updateStatus('listening', 'Listening carefully... Take your time, Amma.');
      };

      this.recognition.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
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
        if (event.error !== 'no-speech') {
          console.warn('[SpeechService] Recognition notice:', event.error);
        }
      };

      this.recognition.onend = () => {
        // If user is supposed to be talking, keep listening alive unless explicitly stopped
        if (this.isListening) {
          try {
            this.recognition.start();
          } catch (e) {
            this.isListening = false;
            this.updateStatus('idle', 'Tap microphone to speak');
          }
        }
      };
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
    const pauseAllowance = isIncomplete ? this.maxPauseWindowMs : 3000;

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
      'and', 'or', 'then', 'to', 'how do i', 'where is', 'i want to', 'how to',
      'ಮತ್ತು', 'ಹೇಗೆ', 'ಮಾಡಬೇಕು', 'ನನಗೆ', 'aur', 'kaise', 'karna', 'kahan'
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

  startListening(langCode = 'en') {
    this.currentTranscript = '';
    const langMap = {
      en: 'en-IN',
      kn: 'kn-IN',
      hi: 'hi-IN'
    };
    this.lang = langMap[langCode] || 'en-IN';

    if (this.recognition) {
      this.recognition.lang = this.lang;
      try {
        this.recognition.start();
        this.isListening = true;
      } catch (err) {
        // Recognition already started
      }
    } else {
      this.updateStatus('error', 'Speech recognition not supported on this device');
    }
  }

  stopListening() {
    this.isListening = false;
    if (this.adaptiveTimeout) {
      clearTimeout(this.adaptiveTimeout);
    }
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (e) {}
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
    if (!('speechSynthesis' in window)) {
      if (onDone) onDone();
      return;
    }

    window.speechSynthesis.cancel(); // cancel any active speech

    const utterance = new SpeechSynthesisUtterance(text);
    const langMap = {
      en: 'en-IN',
      kn: 'kn-IN',
      hi: 'hi-IN'
    };
    utterance.lang = langMap[langCode] || 'en-IN';
    utterance.rate = this.speechRate; // Calmed, slower speed (0.8x)
    utterance.pitch = 1.0;

    // Try finding a matching native voice
    const voices = window.speechSynthesis.getVoices();
    const matchedVoice = voices.find(v => v.lang.startsWith(utterance.lang) || v.lang.startsWith(langCode));
    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }

    utterance.onend = () => {
      if (onDone) onDone();
    };

    utterance.onerror = () => {
      if (onDone) onDone();
    };

    window.speechSynthesis.speak(utterance);
  }

  stopSpeaking() {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }
}

export const speechService = new CadenceAdaptiveSpeechService();
