import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, X, Sparkles, Clock, Send, AlertCircle, ArrowRight } from 'lucide-react';
import { speechService } from '../services/speechService';
import { TASK_GUIDES } from '../data/guides';

export default function VoiceAssistantModal({
  language,
  isOpen,
  onClose,
  onSelectGuide,
  onCheckScamQuery
}) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [typedInput, setTypedInput] = useState('');
  const [assistantReply, setAssistantReply] = useState('');
  const [errorMessage, setErrorMessage] = useState(null);
  const [isExtendedPauseActive, setIsExtendedPauseActive] = useState(false);
  const [isSpeakingReply, setIsSpeakingReply] = useState(false);

  const localizedPrompts = {
    en: {
      title: "Voice Companion",
      sub: "Cadence-Adaptive: I wait patiently without cutting you off mid-thought.",
      speakBtn: "Tap & Speak (English / Kannada / Hindi)",
      stopBtn: "Tap when done speaking",
      listening: "Listening carefully... Take your time, Amma.",
      waiting: "Holding open... Thinking or taking a breath? I'm waiting.",
      placeholder: "Ask anything, or type here...",
      send: "Ask",
      tryAsking: "Try asking:",
      suggestions: [
        "How do I make a WhatsApp video call?",
        "How do I send photos to my family?",
        "Is this electricity bill message a scam?",
        "How to make screen text larger?",
        "How to send money with UPI?"
      ],
      close: "Close"
    },
    kn: {
      title: "ಧ್ವನಿ ಮಿತ್ರ",
      sub: "ಶಾಂತ ಧ್ವನಿ ವ್ಯವಸ್ಥೆ: ನೀವು ಮಾತನಾಡುವಾಗ ನಿಧಾನವಾದರೂ ಇದು ಮಧ್ಯದಲ್ಲೇ ಕಟ್ ಆಗುವುದಿಲ್ಲ.",
      speakBtn: "ಮಾತನಾಡಲು ಮೈಕ್ ಒತ್ತಿರಿ (ಕನ್ನಡ)",
      stopBtn: "ಮಾತನಾಡಿ ಮುಗಿದ ಮೇಲೆ ಒತ್ತಿರಿ",
      listening: "ಕೇಳಿಸಿಕೊಳ್ಳುತ್ತಿದ್ದೇನೆ... ನಿಧಾನವಾಗಿ ಮಾತನಾಡಿ ಅಮ್ಮಾ.",
      waiting: "ಯೋಚಿಸುತ್ತಿದ್ದೀರಾ? ನಾನು ಕಾಯುತ್ತಿದ್ದೇನೆ, ಆತಂಕ ಬೇಡ.",
      placeholder: "ಇಲ್ಲಿ ಪ್ರಶ್ನೆ ಕೇಳಿ ಅಥವಾ ಟೈಪ್ ಮಾಡಿ...",
      send: "ಕೇಳಿ",
      tryAsking: "ಹೀಗೆ ಕೇಳಿ ನೋಡಿ:",
      suggestions: [
        "ವಾಟ್ಸಾಪ್ ವಿಡಿಯೋ ಕಾಲ್ ಮಾಡುವುದು ಹೇಗೆ?",
        "ಫೋಟೋ ಕಳುಹಿಸುವುದು ಹೇಗೆ?",
        "ವಿದ್ಯುತ್ ಬಿಲ್ ಮೆಸೇಜ್ ನಿಜವೇ?",
        "ಅಕ್ಷರಗಳನ್ನು ದೊಡ್ಡದಾಗಿಸುವುದು ಹೇಗೆ?",
        "ಯುಪಿಐ ಹಣ ಕಳುಹಿಸುವುದು ಹೇಗೆ?"
      ],
      close: "ಮುಚ್ಚಿ"
    },
    hi: {
      title: "वॉयस साथी",
      sub: "धैर्यवान तकनीक: आपकी बात पूरी होने तक यह बीच में नहीं कटेगा।",
      speakBtn: "माइक दबाकर बोलें (हिन्दी)",
      stopBtn: "बोलने के बाद यहाँ टैप करें",
      listening: "सुन रहा हूँ... आराम से बोलिए माताजी।",
      waiting: "सांस ले रहे हैं या सोच रहे हैं? मैं धैर्य से सुन रहा हूँ।",
      placeholder: "यहाँ बोलें या प्रश्न लिखें...",
      send: "पूछें",
      tryAsking: "ऐसे पूछ सकते हैं:",
      suggestions: [
        "व्हाट्सएप वीडियो कॉल कैसे करें?",
        "फोटो कैसे भेजें?",
        "क्या यह बिजली बिल मैसेज असली है?",
        "स्क्रीन के अक्षरों को बड़ा कैसे करें?",
        "यूपीआई से पैसे कैसे भेजें?"
      ],
      close: "बंद करें"
    }
  };

  const text = localizedPrompts[language] || localizedPrompts.en;

  useEffect(() => {
    speechService.onStatusCallback = ({ state, message }) => {
      if (state === 'listening') {
        setIsListening(true);
        setErrorMessage(null);
      } else if (state === 'error') {
        setIsListening(false);
        setErrorMessage(message);
      } else {
        setIsListening(false);
      }
    };

    speechService.onCadenceFeedback = ({ isIncomplete }) => {
      setIsExtendedPauseActive(isIncomplete);
    };

    speechService.onResultCallback = (textResult, isFinal) => {
      setTranscript(textResult);
      if (isFinal) {
        processVoiceCommand(textResult);
      }
    };

    return () => {
      speechService.stopListening();
      speechService.stopSpeaking();
    };
  }, [language]);

  const toggleListening = async () => {
    setErrorMessage(null);
    if (isListening) {
      speechService.stopListening();
      setIsListening(false);
    } else {
      setTranscript('');
      setAssistantReply('');
      const started = await speechService.startListening(language);
      if (!started && !speechService.isSupported()) {
        setErrorMessage(
          language === 'kn'
            ? "ನಿಮ್ಮ ಬ್ರೌಸರ್‌ನಲ್ಲಿ ಮೈಕ್ರೊಫೋನ್ ಬೆಂಬಲಿತವಾಗಿಲ್ಲ. ದಯವಿಟ್ಟು ಕೆಳಗೆ ಟೈಪ್ ಮಾಡಿ ಪ್ರಶ್ನಿಸಿ."
            : language === 'hi'
            ? "आपके ब्राउज़र में माइक समर्थित नहीं है। कृपया नीचे लिखकर पूछें।"
            : "Microphone speech recognition is not supported in this browser. Please use Chrome/Edge or type below."
        );
      }
    }
  };

  const handleManualSubmit = (e) => {
    if (e) e.preventDefault();
    const query = (typedInput || transcript).trim();
    if (!query) return;
    processVoiceCommand(query);
    setTypedInput('');
  };

  const handleSuggestionClick = (suggestion) => {
    setTranscript(suggestion);
    processVoiceCommand(suggestion);
  };

  const processVoiceCommand = (command) => {
    const raw = command.trim();
    if (!raw) return;

    const lower = raw.toLowerCase();

    // 1. Check for scam / fraud questions
    const scamKeywords = [
      'scam', 'fraud', 'fake', 'electricity', 'bill', 'disconnect', 'power', 'suspended', 'lottery', 'prize', 'bank',
      'ವಂಚನೆ', 'ಕರೆಂಟ್', 'ಬಿಲ್', 'ನಕಲಿ', 'ಬ್ಯಾಂಕ್', 'ಒಟಿಪಿ',
      'धोखा', 'बिजली', 'बिल', 'नकली', 'बैंक', 'ओटीपी'
    ];
    const isScamQuery = scamKeywords.some(kw => lower.includes(kw));

    if (isScamQuery) {
      const reply = language === 'kn'
        ? "ಇದು ನಕಲಿ ಅಥವಾ ವಂಚನೆಯ ಸಂದೇಶವಾಗಿರಬಹುದು! ದಯವಿಟ್ಟು ಯಾವುದೇ ಕಾರಣಕ್ಕೂ ಒಟಿಪಿ ಅಥವಾ ಅಪರಿಚಿತ ಲಿಂಕ್ ಮುಟ್ಟಬೇಡಿ. ನಮ್ಮ ವಂಚನೆ ಪರೀಕ್ಷಕವನ್ನು ತೆರೆಯುತ್ತಿದ್ದೇವೆ."
        : language === 'hi'
        ? "यह धोखाधड़ी या स्कैम हो सकता है! कृपया कोई भी ओटीपी या अज्ञात लिंक साझा न करें। हम स्कैम जांच उपकरण खोल रहे हैं।"
        : "Be careful! This sounds like a potential scam. Never share OTPs or click unverified links. Let me open the Scam Verifier for you.";

      setAssistantReply(reply);
      setIsSpeakingReply(true);
      speechService.speak(reply, language, () => {
        setIsSpeakingReply(false);
        if (onCheckScamQuery) onCheckScamQuery(raw);
        if (onClose) onClose();
      });
      return;
    }

    // 2. Intelligent Guide Search across ALL 20 guides
    let matchedGuide = null;
    let highestScore = 0;

    TASK_GUIDES.forEach(guide => {
      let score = 0;
      const titleEn = (guide.title.en || '').toLowerCase();
      const titleKn = (guide.title.kn || '').toLowerCase();
      const titleHi = (guide.title.hi || '').toLowerCase();
      const descEn = (guide.description.en || '').toLowerCase();
      const cat = (guide.category || '').toLowerCase();

      // Token match
      const words = lower.split(/\s+/).filter(w => w.length > 2);
      words.forEach(w => {
        if (titleEn.includes(w)) score += 3;
        if (titleKn.includes(w)) score += 4;
        if (titleHi.includes(w)) score += 4;
        if (descEn.includes(w)) score += 1;
        if (cat.includes(w)) score += 2;
      });

      // Special key synonyms
      if (guide.id === 'whatsapp-video-call' && (lower.includes('video') || lower.includes('call') || lower.includes('ವಿಡಿಯೋ') || lower.includes('कॉल'))) score += 5;
      if (guide.id === 'whatsapp-photo-share' && (lower.includes('photo') || lower.includes('image') || lower.includes('ಫೋಟೋ') || lower.includes('फोटो'))) score += 5;
      if (guide.id === 'mobile-recharge-upi' && (lower.includes('recharge') || lower.includes('money') || lower.includes('upi') || lower.includes('ರೀಚಾರ್ಜ್') || lower.includes('पैसे'))) score += 5;
      if (guide.id === 'turn-on-flashlight' && (lower.includes('torch') || lower.includes('light') || lower.includes('ಟಾರ್ಚ್') || lower.includes('टॉर्च'))) score += 5;
      if (guide.id === 'make-font-larger' && (lower.includes('font') || lower.includes('size') || lower.includes('text') || lower.includes('ದೊಡ್ಡ') || lower.includes('अक्षर') || lower.includes('बड़ा'))) score += 5;
      if (guide.id === 'sos-emergency-call' && (lower.includes('sos') || lower.includes('help') || lower.includes('emergency') || lower.includes('ತುರ್ತು') || lower.includes('मदद'))) score += 5;

      if (score > highestScore) {
        highestScore = score;
        matchedGuide = guide;
      }
    });

    if (matchedGuide && highestScore >= 2) {
      const guideTitle = matchedGuide.title[language] || matchedGuide.title.en;
      const reply = language === 'kn'
        ? `ನಾನು "${guideTitle}" ಮಾರ್ಗದರ್ಶಿಯನ್ನು ತೆರೆಯುತ್ತಿದ್ದೇನೆ. ಬನ್ನಿ ಒಟ್ಟಿಗೆ ಕಲಿಯೋಣ.`
        : language === 'hi'
        ? `मैं "${guideTitle}" गाइड खोल रहा हूँ। आइए साथ में सीखते हैं।`
        : `Opening "${guideTitle}". Let's do it together.`;

      setAssistantReply(reply);
      setIsSpeakingReply(true);
      speechService.speak(reply, language, () => {
        setIsSpeakingReply(false);
        if (onSelectGuide) onSelectGuide(matchedGuide);
        if (onClose) onClose();
      });
    } else {
      const generalReply = language === 'kn'
        ? `ನಾನು ಕೇಳಿಸಿಕೊಂಡೆ: "${raw}". ನಾನು ನಿಮಗೆ 20 ಡಿಜಿಟಲ್ ಪಾಠಗಳಲ್ಲಿ ಮಾರ್ಗದರ್ಶನ ನೀಡಲು ಸಿದ್ಧನಾಗಿದ್ದೇನೆ.`
        : language === 'hi'
        ? `मैंने सुना: "${raw}". मैं आपको 20 डिजिटल पाठों में सहायता करने के लिए तैयार हूँ।`
        : `I heard: "${raw}". I am here to guide you step-by-step through any of our 20 smartphone lessons.`;

      setAssistantReply(generalReply);
      setIsSpeakingReply(true);
      speechService.speak(generalReply, language, () => {
        setIsSpeakingReply(false);
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-lg bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-8 shadow-2xl border border-zinc-200 dark:border-zinc-800 flex flex-col max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-black text-white dark:bg-white dark:text-black flex items-center justify-center font-bold">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-100">
                {text.title}
              </h3>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                {text.sub}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              speechService.stopListening();
              speechService.stopSpeaking();
              onClose();
            }}
            className="p-2 rounded-full text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Central Voice Pulse Button */}
        <div className="my-6 flex flex-col items-center justify-center text-center">
          <div className="relative mb-4">
            {isListening && (
              <span className="absolute inset-0 rounded-full bg-black/10 dark:bg-white/20 animate-ping duration-1000" />
            )}
            <button
              onClick={toggleListening}
              className={`relative z-10 w-24 h-24 rounded-full flex items-center justify-center transition-all shadow-xl ${
                isListening
                  ? 'bg-red-600 text-white hover:bg-red-700 ring-8 ring-red-200 dark:ring-red-950 scale-105'
                  : 'bg-black text-white dark:bg-white dark:text-black hover:opacity-90 ring-4 ring-zinc-200 dark:ring-zinc-800'
              }`}
            >
              {isListening ? (
                <Mic className="w-10 h-10 animate-pulse" />
              ) : (
                <Mic className="w-10 h-10" />
              )}
            </button>
          </div>

          <p className="font-bold text-sm text-zinc-900 dark:text-zinc-100 mb-1">
            {isListening ? text.stopBtn : text.speakBtn}
          </p>

          <p className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center space-x-1">
            <Clock className="w-3.5 h-3.5 text-zinc-400" />
            <span>
              {isListening
                ? (isExtendedPauseActive ? text.waiting : text.listening)
                : "Cadence-adaptive listening window (up to 6.5s)"}
            </span>
          </p>
        </div>

        {/* Error Notice */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded-2xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 flex items-start space-x-2 text-xs text-zinc-800 dark:text-zinc-200">
            <AlertCircle className="w-4 h-4 text-zinc-600 dark:text-zinc-400 flex-shrink-0 mt-0.5" />
            <div>
              <strong>Notice:</strong> {errorMessage}
            </div>
          </div>
        )}

        {/* Live Transcript Display */}
        {transcript && (
          <div className="mb-4 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-1">
              {isListening ? "Heard so far..." : "Your Question:"}
            </span>
            <p className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
              "{transcript}"
            </p>
          </div>
        )}

        {/* Assistant Response Box */}
        {assistantReply && (
          <div className="mb-4 p-4 rounded-2xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100">
            <div className="flex items-center space-x-1.5 mb-1.5 text-xs font-bold text-zinc-600 dark:text-zinc-400">
              <Volume2 className="w-3.5 h-3.5" />
              <span>Assistant Reply:</span>
            </div>
            <p className="text-sm font-medium leading-relaxed">
              {assistantReply}
            </p>
          </div>
        )}

        {/* Fallback Text Input Form */}
        <form onSubmit={handleManualSubmit} className="mt-2 mb-4">
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={typedInput}
              onChange={(e) => setTypedInput(e.target.value)}
              placeholder={text.placeholder}
              className="flex-1 px-4 py-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
            />
            <button
              type="submit"
              disabled={!typedInput.trim()}
              className="px-4 py-3 rounded-2xl bg-black text-white dark:bg-white dark:text-black font-bold text-sm hover:opacity-90 disabled:opacity-30 transition-all flex items-center space-x-1"
            >
              <span>{text.send}</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>

        {/* Quick Suggestion Chips */}
        <div className="mt-auto pt-2 border-t border-zinc-100 dark:border-zinc-800">
          <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-2">
            {text.tryAsking}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {text.suggestions.map((s, idx) => (
              <button
                key={idx}
                onClick={() => handleSuggestionClick(s)}
                className="text-left text-xs px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 transition-colors border border-zinc-200/60 dark:border-zinc-700/60 flex items-center space-x-1"
              >
                <span>{s}</span>
                <ArrowRight className="w-3 h-3 text-zinc-400" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
