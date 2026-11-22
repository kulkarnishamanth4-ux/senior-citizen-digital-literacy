import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Volume2, X, Sparkles, Clock } from 'lucide-react';
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
      title: "Voice Companion",
      sub: "Cadence-Adaptive: I wait patiently without cutting you off mid-thought.",
      speakBtn: "Tap & Speak in English, Kannada or Hindi",
      listening: "Listening... Take your time, Amma.",
      waiting: "Holding open... Thinking or taking a breath? I'm waiting.",
      placeholder: "Ask anything, e.g., 'How do I make a video call?' or 'Is this message real?'",
      close: "Close"
    },
    kn: {
      title: "ಧ್ವನಿ ಮಿತ್ರ",
      sub: "ಶಾಂತ ಧ್ವನಿ ವ್ಯವಸ್ಥೆ: ನೀವು ಮಾತನಾಡುವಾಗ ನಿಧಾನವಾದರೂ ಇದು ಮಧ್ಯದಲ್ಲೇ ಕಟ್ ಆಗುವುದಿಲ್ಲ.",
      speakBtn: "ಮಾತನಾಡಲು ಮೈಕ್ ಒತ್ತಿರಿ",
      listening: "ಕೇಳಿಸಿಕೊಳ್ಳುತ್ತಿದ್ದೇನೆ... ನಿಧಾನವಾಗಿ ಮಾತನಾಡಿ ಅಮ್ಮಾ.",
      waiting: "ಯೋಚಿಸುತ್ತಿದ್ದೀರಾ? ನಾನು ಕಾಯುತ್ತಿದ್ದೇನೆ, ಆತಂಕ ಬೇಡ.",
      placeholder: "ಉದಾಹರಣೆಗೆ: 'ವಿಡಿಯೋ ಕಾಲ್ ಮಾಡುವುದು ಹೇಗೆ?' ಅಥವಾ 'ವಿದ್ಯುತ್ ಬಿಲ್ ಮೆಸೇಜ್ ನಿಜವೇ?'",
      close: "ಮುಚ್ಚಿ"
    },
    hi: {
      title: "वॉयस साथी",
      sub: "धैर्यवान तकनीक: आपकी बात पूरी होने तक यह बीच में नहीं कटेगा।",
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

    speechService.onCadenceFeedback = ({ isIncomplete }) => {
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

    // Scam checking
    if (lower.includes('scam') || lower.includes('fraud') || lower.includes('fake') || 
        lower.includes('electricity') || lower.includes('bill') || lower.includes('ವಂಚನೆ') || 
        lower.includes('ಕರೆಂಟ್') || lower.includes('धोखा') || lower.includes('बिजली')) {
      const reply = language === 'kn'
        ? "ಇದು ನಕಲಿ ಸಂದೇಶವಾಗಿರಬಹುದು! ದಯವಿಟ್ಟು ಒಟಿಪಿ ಅಥವಾ ಯಾವುದೇ ಅಪರಿಚಿತ ಲಿಂಕ್ ಮುಟ್ಟಬೇಡಿ."
        : language === 'hi'
        ? "यह धोखाधड़ी का संदेश हो सकता है! कृपया कोई ओटीपी साझा न करें।"
        : "Be careful! This sounds like a scam alert. Never share OTPs or install APK files.";

      setAssistantReply(reply);
      speechService.speak(reply, language, () => {
        if (onCheckScamQuery) onCheckScamQuery(command);
      });
      return;
    }

    // Matching task guides
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
        ? `ನಾನು ${guideTitle} ಮಾರ್ಗದರ್ಶಿಯನ್ನು ತೆರೆಯುತ್ತಿದ್ದೇನೆ.`
        : language === 'hi'
        ? `मैं ${guideTitle} गाइड खोल रहा हूँ।`
        : `Opening ${guideTitle}. Let's do it together.`;

      setAssistantReply(reply);
      speechService.speak(reply, language, () => {
        if (onSelectGuide) onSelectGuide(matchedGuide);
        if (onClose) onClose();
      });
    } else {
      const generalReply = language === 'kn'
        ? `ನಾನು ಕೇಳಿಸಿಕೊಂಡೆ: "${command}".`
        : language === 'hi'
        ? `मैंने सुना: "${command}".`
        : `I heard: "${command}". I am ready to guide you step-by-step.`;

      setAssistantReply(generalReply);
      speechService.speak(generalReply, language);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-lg bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-8 shadow-2xl border border-zinc-200 dark:border-zinc-800">
        {/* Close Button */}
        <button
          onClick={() => {
            speechService.stopListening();
            speechService.stopSpeaking();
            onClose();
          }}
          className="absolute top-5 right-5 p-2 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200"
          aria-label={text.close}
        >
          <X className="w-5 h-5" />
        </button>

        {/* Minimalist Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs font-semibold mb-3 border border-zinc-200 dark:border-zinc-700">
            <Sparkles className="w-3 h-3" />
            <span>Cadence-Adaptive VAD</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
            {text.title}
          </h2>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1 max-w-sm mx-auto">
            {text.sub}
          </p>
        </div>

        {/* Microphone Button */}
        <div className="flex flex-col items-center justify-center my-6">
          <button
            onClick={toggleListening}
            className={`w-24 h-24 sm:w-28 sm:h-28 rounded-full flex items-center justify-center transition-all shadow-md relative ${
              isListening
                ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 scale-105 ring-4 ring-zinc-300 dark:ring-zinc-700 animate-pulse'
                : 'bg-black text-white dark:bg-white dark:text-black hover:opacity-90'
            }`}
          >
            {isListening ? (
              <Mic className="w-10 h-10" />
            ) : (
              <MicOff className="w-10 h-10" />
            )}
          </button>

          <span className="mt-4 text-xs font-semibold text-zinc-600 dark:text-zinc-300">
            {isListening ? "Listening... (Tap to finish)" : text.speakBtn}
          </span>
        </div>

        {/* Cadence Status Box */}
        <div className={`p-4 rounded-2xl mb-4 text-center transition-all border ${
          isExtendedPauseActive
            ? 'bg-zinc-100 dark:bg-zinc-800/80 border-zinc-400 text-zinc-900 dark:text-zinc-100'
            : 'bg-zinc-50 dark:bg-zinc-800/40 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300'
        }`}>
          <div className="flex items-center justify-center space-x-2 text-xs font-semibold">
            <Clock className={`w-3.5 h-3.5 ${isExtendedPauseActive ? 'animate-spin' : 'text-zinc-400'}`} />
            <span>{cadenceStatus}</span>
          </div>

          {transcript && (
            <div className="mt-3 p-3 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-700 font-medium text-base text-zinc-900 dark:text-white">
              "{transcript}"
            </div>
          )}

          {assistantReply && (
            <div className="mt-3 p-3 bg-zinc-100 dark:bg-zinc-800 rounded-xl border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 text-left">
              <div className="flex items-center space-x-1.5 text-[11px] font-bold uppercase tracking-wider mb-1 text-zinc-500">
                <Volume2 className="w-3 h-3" />
                <span>Response</span>
              </div>
              <p className="text-sm font-medium">{assistantReply}</p>
            </div>
          )}
        </div>

        {/* Preset Queries */}
        <div className="text-center">
          <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-2">
            Suggested Prompts:
          </p>
          <div className="flex flex-wrap gap-1.5 justify-center">
            {language === 'kn' ? (
              <>
                <button onClick={() => processVoiceCommand('ವಿಡಿಯೋ ಕಾಲ್ ಮಾಡುವುದು ಹೇಗೆ?')} className="text-xs px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 font-medium hover:bg-zinc-200">
                  "ವಿಡಿಯೋ ಕಾಲ್ ಮಾಡುವುದು ಹೇಗೆ?"
                </button>
                <button onClick={() => processVoiceCommand('ವಿದ್ಯುತ್ ಬಿಲ್ ಮೆಸೇಜ್ ವಂಚನೆಯೇ?')} className="text-xs px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 font-medium hover:bg-zinc-200">
                  "ಕರೆಂಟ್ ಬಿಲ್ ಮೆಸೇಜ್ ವಂಚನೆಯೇ?"
                </button>
              </>
            ) : language === 'hi' ? (
              <>
                <button onClick={() => processVoiceCommand('वीडियो कॉल कैसे करें?')} className="text-xs px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 font-medium hover:bg-zinc-200">
                  "वीडियो कॉल कैसे करें?"
                </button>
                <button onClick={() => processVoiceCommand('क्या यह बिजली मैसेज फर्जी है?')} className="text-xs px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 font-medium hover:bg-zinc-200">
                  "क्या यह बिजली मैसेज फर्जी है?"
                </button>
              </>
            ) : (
              <>
                <button onClick={() => processVoiceCommand('How do I make a video call?')} className="text-xs px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 font-medium hover:bg-zinc-200">
                  "How do I make a video call?"
                </button>
                <button onClick={() => processVoiceCommand('Is this electricity bill SMS a scam?')} className="text-xs px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 font-medium hover:bg-zinc-200">
                  "Is this electricity bill SMS a scam?"
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
