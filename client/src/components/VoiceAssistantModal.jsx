import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Volume2, X, Sparkles, Clock, AlertTriangle } from 'lucide-react';
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
  const [assistantReply, setAssistantReply] = useState('');
  const [cadenceStatus, setCadenceStatus] = useState('Tap microphone to start speaking.');
  const [isExtendedPauseActive, setIsExtendedPauseActive] = useState(false);

  const localizedPrompts = {
    en: {
      title: "Patient Voice Companion",
      sub: "Infinite-Pause Engine: I wait patiently for you to finish speaking without cutting you off.",
      speakBtn: "Tap & Speak in English, Kannada or Hindi",
      listening: "Listening... Take your time, Amma.",
      waiting: "Holding open... Thinking or taking a breath? I'm waiting.",
      placeholder: "Ask anything, e.g., 'How do I make a video call?' or 'Is this message real?'",
      close: "Close"
    },
    kn: {
      title: "ಸಹಾಯಕ್ ಧ್ವನಿ ಮಿತ್ರ",
      sub: "ಶಾಂತ ಧ್ವನಿ ವ್ಯವಸ್ಥೆ: ನೀವು ಮಾತನಾಡುವಾಗ ನಿಧಾನವಾದರೂ ಇದು ಮಧ್ಯದಲ್ಲೇ ಕಟ್ ಆಗುವುದಿಲ್ಲ.",
      speakBtn: "ಮಾತನಾಡಲು ಮೈಕ್ ಒತ್ತಿರಿ",
      listening: "ಕೇಳಿಸಿಕೊಳ್ಳುತ್ತಿದ್ದೇನೆ... ನಿಧಾನವಾಗಿ ಮಾತನಾಡಿ ಅಮ್ಮಾ.",
      waiting: "ಯೋಚಿಸುತ್ತಿದ್ದೀರಾ? ನಾನು ಕಾಯುತ್ತಿದ್ದೇನೆ, ಆತಂಕ ಬೇಡ.",
      placeholder: "ಉದಾಹರಣೆಗೆ: 'ವಿಡಿಯೋ ಕಾಲ್ ಮಾಡುವುದು ಹೇಗೆ?' ಅಥವಾ 'ವಿದ್ಯುತ್ ಬಿಲ್ ಮೆಸೇಜ್ ನಿಜವೇ?'",
      close: "ಮುಚ್ಚಿ"
    },
    hi: {
      title: "धैर्यवान वॉयस साथी",
      sub: "अनंत-ठहराव तकनीक: आपकी बात पूरी होने तक यह बीच में नहीं कटेगा।",
      speakBtn: "माइक दबाकर बोलें",
      listening: "सुन रहा हूँ... आराम से बोलिए माताजी।",
      waiting: "सांस ले रहे हैं या सोच रहे हैं? मैं धैर्य से सुन रहा हूँ।",
      placeholder: "जैसे: 'वीडियो कॉल कैसे करें?' या 'क्या यह बिजली का मैसेज असली है?'",
      close: "बंद करें"
    }
  };

  const text = localizedPrompts[language] || localizedPrompts.en;

  useEffect(() => {
    speechService.onStatusCallback = ({ state, message }) => {
      if (state === 'listening') {
        setIsListening(true);
        setCadenceStatus(text.listening);
      } else {
        setIsListening(false);
      }
    };

    speechService.onCadenceFeedback = ({ isIncomplete, extendedPauseMs, message }) => {
      setIsExtendedPauseActive(isIncomplete);
      setCadenceStatus(isIncomplete ? text.waiting : text.listening);
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

  const toggleListening = () => {
    if (isListening) {
      speechService.stopListening();
      setIsListening(false);
    } else {
      setTranscript('');
      setAssistantReply('');
      speechService.startListening(language);
    }
  };

  const processVoiceCommand = (command) => {
    const lower = command.toLowerCase();

    // 1. Check if user is asking about a scam
    if (lower.includes('scam') || lower.includes('fraud') || lower.includes('fake') || 
        lower.includes('electricity') || lower.includes('bill') || lower.includes('ವಂಚನೆ') || 
        lower.includes('ಕರೆಂಟ್') || lower.includes('धोखा') || lower.includes('बिजली')) {
      const reply = language === 'kn'
        ? "ಇದು ನಕಲಿ ಸಂದೇಶವಾಗಿರಬಹುದು! ದಯವಿಟ್ಟು ಒಟಿಪಿ ಅಥವಾ ಯಾವುದೇ ಅಪರಿಚಿತ ಲಿಂಕ್ ಮುಟ್ಟಬೇಡಿ. ನಮ್ಮ ವಂಚನೆ ಪರೀಕ್ಷಕದಲ್ಲಿ ನೋಡೋಣ."
        : language === 'hi'
        ? "यह धोखाधड़ी का संदेश हो सकता है! कृपया कोई ओटीपी साझा न करें। आइए इसे जांचें।"
        : "Be careful! This sounds like a scam alert. Never share OTPs or install APK files. Let's verify it together.";

      setAssistantReply(reply);
      speechService.speak(reply, language, () => {
        if (onCheckScamQuery) onCheckScamQuery(command);
      });
      return;
    }

    // 2. Check matching task guides
    let matchedGuide = null;
    if (lower.includes('video') || lower.includes('ವಿಡಿಯೋ') || lower.includes('वीडियो')) {
      matchedGuide = TASK_GUIDES.find(g => g.id === 'whatsapp-video-call');
    } else if (lower.includes('photo') || lower.includes('ಫೋಟೋ') || lower.includes('फोटो')) {
      matchedGuide = TASK_GUIDES.find(g => g.id === 'whatsapp-photo-share');
    } else if (lower.includes('recharge') || lower.includes('ರೀಚಾರ್ಜ್') || lower.includes('रिचार्ज')) {
      matchedGuide = TASK_GUIDES.find(g => g.id === 'mobile-recharge-upi');
    } else if (lower.includes('torch') || lower.includes('light') || lower.includes('ಟಾರ್ಚ್') || lower.includes('टॉर्च')) {
      matchedGuide = TASK_GUIDES.find(g => g.id === 'turn-on-flashlight');
    } else if (lower.includes('font') || lower.includes('size') || lower.includes('ದೊಡ್ಡ') || lower.includes('अक्षर')) {
      matchedGuide = TASK_GUIDES.find(g => g.id === 'make-font-larger');
    } else if (lower.includes('sos') || lower.includes('help') || lower.includes('ತುರ್ತು') || lower.includes('मदद')) {
      matchedGuide = TASK_GUIDES.find(g => g.id === 'sos-emergency-call');
    }

    if (matchedGuide) {
      const guideTitle = matchedGuide.title[language] || matchedGuide.title.en;
      const reply = language === 'kn'
        ? `ನಾನು ${guideTitle} ಮಾರ್ಗದರ್ಶಿಯನ್ನು ತೆರೆಯುತ್ತಿದ್ದೇನೆ. ಹಂತ ಹಂತವಾಗಿ ಜೊತೆಯಾಗಿ ಕಲಿಯೋಣ.`
        : language === 'hi'
        ? `मैं ${guideTitle} गाइड खोल रहा हूँ। आइए साथ में सीखते हैं।`
        : `Opening the guide for ${guideTitle}. Let's do it step by step together.`;

      setAssistantReply(reply);
      speechService.speak(reply, language, () => {
        if (onSelectGuide) onSelectGuide(matchedGuide);
        if (onClose) onClose();
      });
    } else {
      const generalReply = language === 'kn'
        ? `ನಾನು ಕೇಳಿಸಿಕೊಂಡೆ: "${command}". ನಾನು ನಿಮಗೆ 20 ಡಿಜಿಟಲ್ ಮಾರ್ಗದರ್ಶಿಗಳಲ್ಲಿ ಸಹಾಯ ಮಾಡಬಲ್ಲೆ.`
        : language === 'hi'
        ? `मैंने सुना: "${command}". मैं आपको किसी भी डिजिटल कार्य में मदद कर सकता हूँ।`
        : `I heard: "${command}". I am ready to guide you step-by-step through any smartphone task or verify any suspicious message.`;

      setAssistantReply(generalReply);
      speechService.speak(generalReply, language);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl border-4 border-amber-400">
        {/* Close Button */}
        <button
          onClick={() => {
            speechService.stopListening();
            speechService.stopSpeaking();
            onClose();
          }}
          className="absolute top-5 right-5 p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
          aria-label={text.close}
        >
          <X className="w-6 h-6" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-300 text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Cadence-Adaptive Infinite-Pause VAD</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            {text.title}
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-md mx-auto">
            {text.sub}
          </p>
        </div>

        {/* Giant Microphone Button */}
        <div className="flex flex-col items-center justify-center my-6">
          <button
            onClick={toggleListening}
            className={`w-28 h-28 sm:w-32 sm:h-32 rounded-full flex items-center justify-center transition-all shadow-xl relative ${
              isListening
                ? 'bg-red-500 text-white scale-105 ring-8 ring-red-200 dark:ring-red-950/80 animate-pulse'
                : 'bg-amber-500 text-slate-950 hover:bg-amber-400 hover:scale-102'
            }`}
          >
            {isListening ? (
              <Mic className="w-14 h-14" />
            ) : (
              <MicOff className="w-14 h-14" />
            )}
          </button>

          <span className="mt-4 text-sm font-bold text-slate-700 dark:text-slate-300">
            {isListening ? "Listening... (Tap to finish)" : text.speakBtn}
          </span>
        </div>

        {/* Live Cadence Status Pill */}
        <div className={`p-4 rounded-2xl mb-4 text-center transition-all border ${
          isExtendedPauseActive
            ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-300 text-amber-900 dark:text-amber-200'
            : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200'
        }`}>
          <div className="flex items-center justify-center space-x-2 text-sm font-bold">
            <Clock className={`w-4 h-4 ${isExtendedPauseActive ? 'text-amber-600 animate-spin' : 'text-slate-400'}`} />
            <span>{cadenceStatus}</span>
          </div>

          {transcript && (
            <div className="mt-3 p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 font-semibold text-lg text-slate-900 dark:text-white">
              "{transcript}"
            </div>
          )}

          {assistantReply && (
            <div className="mt-3 p-3 bg-emerald-50 dark:bg-emerald-950/60 rounded-xl border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 text-left">
              <div className="flex items-center space-x-1.5 text-xs font-bold uppercase tracking-wider mb-1 text-emerald-700 dark:text-emerald-400">
                <Volume2 className="w-3.5 h-3.5" />
                <span>Sahayak Spoken Response</span>
              </div>
              <p className="text-base font-medium">{assistantReply}</p>
            </div>
          )}
        </div>

        {/* Quick Sample Prompts */}
        <div className="text-center">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            Try saying:
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            {language === 'kn' ? (
              <>
                <button onClick={() => processVoiceCommand('ವಿಡಿಯೋ ಕಾಲ್ ಮಾಡುವುದು ಹೇಗೆ?')} className="text-xs px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 font-medium hover:bg-amber-100">
                  "ವಿಡಿಯೋ ಕಾಲ್ ಮಾಡುವುದು ಹೇಗೆ?"
                </button>
                <button onClick={() => processVoiceCommand('ವಿದ್ಯುತ್ ಬಿಲ್ ಮೆಸೇಜ್ ವಂಚನೆಯೇ?')} className="text-xs px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 font-medium hover:bg-amber-100">
                  "ಕರೆಂಟ್ ಬಿಲ್ ಮೆಸೇಜ್ ವಂಚನೆಯೇ?"
                </button>
              </>
            ) : language === 'hi' ? (
              <>
                <button onClick={() => processVoiceCommand('वीडियो कॉल कैसे करें?')} className="text-xs px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 font-medium hover:bg-amber-100">
                  "वीडियो कॉल कैसे करें?"
                </button>
                <button onClick={() => processVoiceCommand('क्या यह बिजली मैसेज फर्जी है?')} className="text-xs px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 font-medium hover:bg-amber-100">
                  "क्या यह बिजली मैसेज फर्जी है?"
                </button>
              </>
            ) : (
              <>
                <button onClick={() => processVoiceCommand('How do I make a video call?')} className="text-xs px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 font-medium hover:bg-amber-100">
                  "How do I make a video call?"
                </button>
                <button onClick={() => processVoiceCommand('Is this electricity bill SMS a scam?')} className="text-xs px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 font-medium hover:bg-amber-100">
                  "Is this electricity bill SMS a scam?"
                </button>
                <button onClick={() => processVoiceCommand('Turn on torch')} className="text-xs px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 font-medium hover:bg-amber-100">
                  "Turn on torch"
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
