import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, X, Sparkles, Clock, Send, AlertCircle, ArrowRight, Loader2, BookOpen } from 'lucide-react';
import { speechService } from '../services/speechService';
import { TASK_GUIDES } from '../data/guides';
import { APP_CONFIG } from '../config/appConfig';

export default function VoiceAssistantModal({
  language,
  isOpen,
  onClose,
  onSelectGuide,
  onCheckScamQuery
}) {
  const [isListening, setIsListening] = useState(false);
  const [isRecordingAudio, setIsRecordingAudio] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [typedInput, setTypedInput] = useState('');
  const [assistantReply, setAssistantReply] = useState('');
  const [suggestedGuides, setSuggestedGuides] = useState([]);
  const [errorMessage, setErrorMessage] = useState(null);
  const [isLoadingReply, setIsLoadingReply] = useState(false);
  const [isExtendedPauseActive, setIsExtendedPauseActive] = useState(false);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const isWebSpeechNetworkBlocked = useRef(false);

  const apiBaseUrl = APP_CONFIG.apiBaseUrl || 'http://localhost:8000';

  const localizedPrompts = {
    en: {
      title: "Voice Companion",
      sub: "Ask anything about using your smartphone or digital security.",
      speakBtn: "Tap & Speak (English / Kannada / Hindi)",
      stopBtn: "Tap when done speaking",
      listening: "Listening carefully... Take your time, Amma.",
      recordingFallback: "Recording your voice... Tap the red button when finished.",
      waiting: "Holding open... Thinking or taking a breath? I'm waiting.",
      placeholder: "Ask anything, e.g. 'How to open WhatsApp'...",
      send: "Ask",
      tryAsking: "Try asking:",
      suggestions: [
        "How to open WhatsApp?",
        "How do I make a WhatsApp video call?",
        "How do I send photos to my family?",
        "Is this electricity bill message a scam?",
        "How to make screen text larger?",
        "How to turn on flashlight?"
      ],
      relatedGuides: "Related practice lessons:",
      openLesson: "Open Lesson",
      close: "Close"
    },
    kn: {
      title: "ಧ್ವನಿ ಮಿತ್ರ",
      sub: "ಸ್ಮಾರ್ಟ್‌ಫೋನ್ ಬಳಕೆ ಅಥವಾ ಡಿಜಿಟಲ್ ಸುರಕ್ಷತೆಯ ಬಗ್ಗೆ ಯಾವುದೇ ಪ್ರಶ್ನೆ ಕೇಳಿ.",
      speakBtn: "ಮಾತನಾಡಲು ಮೈಕ್ ಒತ್ತಿರಿ (ಕನ್ನಡ)",
      stopBtn: "ಮಾತನಾಡಿ ಮುಗಿದ ಮೇಲೆ ಕೆಂಪು ಬಟನ್ ಒತ್ತಿರಿ",
      listening: "ಕೇಳಿಸಿಕೊಳ್ಳುತ್ತಿದ್ದೇನೆ... ನಿಧಾನವಾಗಿ ಮಾತನಾಡಿ ಅಮ್ಮಾ.",
      recordingFallback: "ಧ್ವನಿ ರೆಕಾರ್ಡ್ ಆಗುತ್ತಿದೆ... ಮುಗಿದ ಮೇಲೆ ಕೆಂಪು ಬಟನ್ ಒತ್ತಿರಿ.",
      waiting: "ಯೋಚಿಸುತ್ತಿದ್ದೀರಾ? ನಾನು ಕಾಯುತ್ತಿದ್ದೇನೆ, ಆತಂಕ ಬೇಡ.",
      placeholder: "ಇಲ್ಲಿ ಕೇಳಿ, ಉದಾಹರಣೆಗೆ: 'ವಾಟ್ಸಾಪ್ ತೆರೆಯುವುದು ಹೇಗೆ?'...",
      send: "ಕೇಳಿ",
      tryAsking: "ಹೀಗೆ ಕೇಳಿ ನೋಡಿ:",
      suggestions: [
        "ವಾಟ್ಸಾಪ್ ತೆರೆಯುವುದು ಹೇಗೆ?",
        "ವಾಟ್ಸಾಪ್ ವಿಡಿಯೋ ಕಾಲ್ ಮಾಡುವುದು ಹೇಗೆ?",
        "ಫೋಟೋ ಕಳುಹಿಸುವುದು ಹೇಗೆ?",
        "ವಿದ್ಯುತ್ ಬಿಲ್ ಮೆಸೇಜ್ ನಿಜವೇ?",
        "ಅಕ್ಷರಗಳನ್ನು ದೊಡ್ಡದಾಗಿಸುವುದು ಹೇಗೆ?",
        "ಟಾರ್ಚ್ ಆನ್ ಮಾಡುವುದು ಹೇಗೆ?"
      ],
      relatedGuides: "ಸಂಬಂಧಿತ ಪಾಠಗಳು:",
      openLesson: "ಪಾಠ ತೆರೆಯಿರಿ",
      close: "ಮುಚ್ಚಿ"
    },
    hi: {
      title: "वॉयस साथी",
      sub: "स्मार्टफोन चलाने या डिजिटल सुरक्षा से जुड़ा कोई भी प्रश्न पूछें।",
      speakBtn: "माइक दबाकर बोलें (हिन्दी)",
      stopBtn: "बोलने के बाद लाल बटन दबाएं",
      listening: "सुन रहा हूँ... आराम से बोलिए माताजी।",
      recordingFallback: "आवाज़ रिकॉर्ड हो रही है... बोलने के बाद लाल बटन दबाएं।",
      waiting: "सांस ले रहे हैं या सोच रहे हैं? मैं धैर्य से सुन रहा हूँ।",
      placeholder: "यहाँ पूछें, जैसे: 'व्हाट्सएप कैसे खोलें?'...",
      send: "पूछें",
      tryAsking: "ऐसे पूछ सकते हैं:",
      suggestions: [
        "व्हाट्सएप कैसे खोलें?",
        "व्हाट्सएप वीडियो कॉल कैसे करें?",
        "फोटो कैसे भेजें?",
        "क्या यह बिजली बिल मैसेज असली है?",
        "स्क्रीन के अक्षरों को बड़ा कैसे करें?",
        "टॉर्च कैसे जलाएं?"
      ],
      relatedGuides: "संबंधित अभ्यास पाठ:",
      openLesson: "पाठ खोलें",
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
        if (message && message.toLowerCase().includes('network')) {
          isWebSpeechNetworkBlocked.current = true;
          // Don't show network error if we have media recorder active
          if (!isRecordingAudio) {
            setErrorMessage("Browser cloud speech is unavailable. Using direct audio recording — tap mic to speak or type below.");
          }
        } else {
          setErrorMessage(message);
        }
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
        handleUserQuery(textResult);
      }
    };

    return () => {
      stopAllAudio();
    };
  }, [language]);

  const stopAllAudio = () => {
    speechService.stopListening();
    speechService.stopSpeaking();
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try { mediaRecorderRef.current.stop(); } catch(e) {}
    }
    setIsListening(false);
    setIsRecordingAudio(false);
  };

  // --------------- Voice Input & MediaRecorder Fallback ---------------

  const toggleListening = async () => {
    setErrorMessage(null);

    // If currently listening/recording, STOP and finalize
    if (isListening || isRecordingAudio) {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
      speechService.stopListening();
      setIsListening(false);
      setIsRecordingAudio(false);
      return;
    }

    // START listening / recording
    setTranscript('');
    setAssistantReply('');
    setSuggestedGuides([]);
    audioChunksRef.current = [];

    // 1. Try starting MediaRecorder as resilient hardware backup
    let mediaStream = null;
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const recorder = new MediaRecorder(mediaStream);
        mediaRecorderRef.current = recorder;

        recorder.ondataavailable = (event) => {
          if (event.data && event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        recorder.onstop = async () => {
          mediaStream.getTracks().forEach(t => t.stop());
          if (audioChunksRef.current.length > 0 && !transcript) {
            await processRecordedAudioChunks();
          }
        };

        recorder.start(500);
        setIsRecordingAudio(true);
      } catch (micErr) {
        console.warn("MediaRecorder permission error:", micErr);
        setErrorMessage("Microphone access was denied. Please allow microphone in your browser settings or type below.");
        return;
      }
    }

    // 2. Also start Web Speech API for immediate live transcription
    speechService.startListening(language);
    setIsListening(true);
  };

  const processRecordedAudioChunks = async () => {
    const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
    if (audioBlob.size < 1000) return;

    setIsLoadingReply(true);

    try {
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      reader.onloadend = async () => {
        const base64Audio = reader.result;
        try {
          const res = await fetch(`${apiBaseUrl}/api/transcribe-voice`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              audio_base64: base64Audio,
              mime_type: 'audio/webm',
              language: language
            })
          });

          if (res.ok) {
            const data = await res.json();
            setTranscript(data.transcript || 'Spoken Question');
            setAssistantReply(data.reply || '');
            if (data.suggested_guide_ids) {
              matchAndSetGuides(data.suggested_guide_ids);
            }
            if (data.reply) {
              speechService.speak(data.reply, language);
            }
          }
        } catch (fetchErr) {
          console.warn("Backend transcribe error:", fetchErr);
        } finally {
          setIsLoadingReply(false);
        }
      };
    } catch (e) {
      setIsLoadingReply(false);
    }
  };

  // --------------- Question Answering Logic ---------------

  const handleManualSubmit = (e) => {
    if (e) e.preventDefault();
    const query = (typedInput || transcript).trim();
    if (!query) return;
    handleUserQuery(query);
    setTypedInput('');
  };

  const handleSuggestionClick = (suggestion) => {
    setTranscript(suggestion);
    handleUserQuery(suggestion);
  };

  const matchAndSetGuides = (guideIds = []) => {
    if (!Array.isArray(guideIds)) return;
    const found = [];
    guideIds.forEach(id => {
      const g = TASK_GUIDES.find(item => item.id === id);
      if (g && !found.some(x => x.id === g.id)) {
        found.push(g);
      }
    });
    setSuggestedGuides(found);
  };

  const handleUserQuery = async (queryText) => {
    const raw = queryText.trim();
    if (!raw) return;

    setTranscript(raw);
    setIsLoadingReply(true);
    setErrorMessage(null);

    const lower = raw.toLowerCase();

    // 1. Direct Scam / Security Check
    const scamWords = [
      'scam', 'fraud', 'fake', 'electricity bill', 'power disconnect', 'lottery', 'prize', 'bank kyc', 'police arrest',
      'ವಂಚನೆ', 'ಕರೆಂಟ್ ಬಿಲ್', 'ನಕಲಿ', 'ಬ್ಯಾಂಕ್', 'धोखा', 'बिजली बिल', 'नकली'
    ];
    if (scamWords.some(w => lower.includes(w))) {
      const scamNotice = language === 'kn'
        ? "ಎಚ್ಚರ! ಇದು ವಂಚನೆಯ ಸಂದೇಶವಾಗಿರಬಹುದು. ಯಾವುದೇ ಕಾರಣಕ್ಕೂ ಅಪರಿಚಿತ ಕರೆಗಳಲ್ಲಿ ಒಟಿಪಿ (OTP) ಅಥವಾ ಬ್ಯಾಂಕ್ ವಿವರಗಳನ್ನು ಹಂಚಿಕೊಳ್ಳಬೇಡಿ."
        : language === 'hi'
        ? "सावधान रहें! यह धोखाधड़ी का संदेश हो सकता है। किसी भी फोन कॉल पर बैंक ओटीपी या पिन साझा न करें।"
        : "Be cautious! This sounds like a potential scam. Never share OTPs or install remote apps like AnyDesk over the phone.";

      setAssistantReply(scamNotice);
      setSuggestedGuides([]);
      setIsLoadingReply(false);
      speechService.speak(scamNotice, language);
      return;
    }

    // 2. Query Backend Intelligent Assistant API
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const res = await fetch(`${apiBaseUrl}/api/chat-assistant`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: raw,
          language: language
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        setAssistantReply(data.reply);
        matchAndSetGuides(data.suggested_guide_ids);
        speechService.speak(data.reply, language);
        setIsLoadingReply(false);
        return;
      }
    } catch (apiErr) {
      console.warn("Backend chat-assistant unavailable, using direct smart knowledge base:", apiErr.message);
    }

    // 3. Robust Local Knowledge Base Fallback
    let reply = "";
    let matchedIds = [];

    if (lower.includes("whatsapp") || lower.includes("ವಾಟ್ಸಾಪ್") || lower.includes("व्हाट्सएप")) {
      if (lower.includes("open") || lower.includes("start") || lower.includes("where") || lower.includes("ತೆರೆ") || lower.includes("खोल")) {
        reply = language === 'kn'
          ? "ವಾಟ್ಸಾಪ್ ತೆರೆಯಲು, ನಿಮ್ಮ ಮೊಬೈಲ್‌ನ ಮುಖಪುಟದಲ್ಲಿ ಅಥವಾ ಆ್ಯಪ್ ಪಟ್ಟಿಯಲ್ಲಿ ಬಿಳಿ ದೂರವಾಣಿ ಚಿತ್ರವಿರುವ ಹಸಿರು ವೃತ್ತಾಕಾರದ ಐಕಾನ್ ಹುಡುಕಿ, ಅದರ ಮೇಲೆ ಒಮ್ಮೆ ಸ್ಪರ್ಶಿಸಿ."
          : language === 'hi'
          ? "व्हाट्सएप खोलने के लिए अपने फोन की स्क्रीन पर हरे रंग का गोल आइकन देखें जिसमें सफेद फोन बना है, और उस पर एक बार टैप करें।"
          : "To open WhatsApp, look on your phone's home screen or apps list for the green circular icon with a white telephone handset inside, and tap on it once.";
        matchedIds = ["whatsapp-video-call", "whatsapp-photo-share", "whatsapp-voice-message"];
      } else if (lower.includes("video") || lower.includes("call") || lower.includes("ವಿಡಿಯೋ") || lower.includes("कॉल")) {
        reply = language === 'kn'
          ? "ವಾಟ್ಸಾಪ್‌ನಲ್ಲಿ ವಿಡಿಯೋ ಕರೆ ಮಾಡಲು, ವಾಟ್ಸಾಪ್ ತೆರೆದು ನಿಮ್ಮ ಸಂಬಂಧಿಕರ ಹೆಸರನ್ನು ಒತ್ತಿ, ಮೇಲಿನ ಬಲ ಮೂಲೆಯಲ್ಲಿರುವ ಚಿಕ್ಕ ವಿಡಿಯೋ ಕ್ಯಾಮೆರಾ ಚಿಹ್ನೆಯನ್ನು ಸ್ಪರ್ಶಿಸಿ."
          : language === 'hi'
          ? "व्हाट्सएप वीडियो कॉल करने के लिए चैट खोलें और ऊपर दाईं ओर दिख रहे छोटे वीडियो कैमरा आइकन पर टैप करें।"
          : "To make a WhatsApp video call, open the chat with your family member and tap the small video camera icon in the top right corner.";
        matchedIds = ["whatsapp-video-call"];
      } else {
        reply = language === 'kn'
          ? "ವಾಟ್ಸಾಪ್ ಮೂಲಕ ನೀವು ಮಕ್ಕಳು ಮತ್ತು ಮೊಮ್ಮಕ್ಕಳೊಂದಿಗೆ ಉಚಿತವಾಗಿ ಮಾತನಾಡಬಹುದು, ಫೋಟೋ ಕಳುಹಿಸಬಹುದು ಮತ್ತು ಮುಖಾಮುಖಿ ವಿಡಿಯೋ ಕರೆ ಮಾಡಬಹುದು."
          : language === 'hi'
          ? "व्हाट्सएप से आप अपने परिवार से मुफ्त में बात कर सकते हैं, फोटो भेज सकते हैं और वीडियो कॉल कर सकते हैं।"
          : "WhatsApp lets you chat, share family photos, and make face-to-face video calls with your loved ones for free.";
        matchedIds = ["whatsapp-video-call", "whatsapp-photo-share"];
      }
    } else if (lower.includes("font") || lower.includes("size") || lower.includes("text") || lower.includes("ದೊಡ್ಡ") || lower.includes("अक्षर")) {
      reply = language === 'kn'
        ? "ಅಕ್ಷರಗಳನ್ನು ದೊಡ್ಡದಾಗಿಸಲು, ಮೊಬೈಲ್‌ನ 'ಸೆಟ್ಟಿಂಗ್ಸ್' (Settings) ತೆರೆದು, 'ಡಿಸ್ಪ್ಲೇ' (Display) ಆಯ್ಕೆಮಾಡಿ, 'ಫಾಂಟ್ ಗಾತ್ರ' (Font Size) ಅನ್ನು ನಿಮ್ಮ ಕಣ್ಣಿಗೆ ಹಿತವಾಗುವಂತೆ ಸರಿಸಿ."
        : language === 'hi'
        ? "स्क्रीन पर अक्षर बड़े करने के लिए फोन की 'सेटिंग्स' में जाएं, 'डिस्प्ले' पर टैप करें और 'फ़ॉन्ट साइज़' को अपनी सुविधानुसार बढ़ा लें।"
        : "To make screen text larger, open your phone Settings, tap 'Display', and then tap 'Font Size' to adjust the slider to a comfortable reading size.";
      matchedIds = ["make-font-larger"];
    } else if (lower.includes("torch") || lower.includes("light") || lower.includes("flashlight") || lower.includes("ಟಾರ್ಚ್") || lower.includes("टॉर्च")) {
      reply = language === 'kn'
        ? "ಟಾರ್ಚ್ ಆನ್ ಮಾಡಲು, ನಿಮ್ಮ ಮೊಬೈಲ್ ಸ್ಕ್ರೀನ್‌ನ ಮೇಲಿನ ತುದಿಯಿಂದ ಕೆಳಗೆ ಬೆರಳಿನಿಂದ ಎಳೆಯಿರಿ (Swipe down), ನಂತರ ಅಲ್ಲಿ ಕಾಣುವ ಟಾರ್ಚ್ ಐಕಾನ್ ಒತ್ತಿರಿ."
        : language === 'hi'
        ? "टॉर्च जलाने के लिए स्क्रीन के सबसे ऊपर से नीचे की ओर स्वाइप करें और टॉर्च वाले आइकन पर टैप करें।"
        : "To turn on the torch, swipe down from the very top of your phone screen to open Quick Settings, and tap the Flashlight icon.";
      matchedIds = ["turn-on-flashlight"];
    } else if (lower.includes("recharge") || lower.includes("bill") || lower.includes("upi") || lower.includes("money") || lower.includes("ಹಣ") || lower.includes("पैसे")) {
      reply = language === 'kn'
        ? "ಮೊಬೈಲ್ ರೀಚಾರ್ಜ್ ಅಥವಾ ಬಿಲ್ ಪಾವತಿಸಲು, ಫೋನ್‌ಪೇ ಅಥವಾ ಗೂಗಲ್ ಪೇ ತೆರೆದು, 'ಮೊಬೈಲ್ ರೀಚಾರ್ಜ್' ಆಯ್ಕೆಮಾಡಿ, ಮೊಬೈಲ್ ಸಂಖ್ಯೆ ನಮೂದಿಸಿ ನಿಮ್ಮ ಯುಪಿಐ ಪಿನ್ ಹಾಕಿ."
        : language === 'hi'
        ? "मोबाइल रिचार्ज करने के लिए फोनपे या गूगल पे खोलें, 'मोबाइल रिचार्ज' चुनें, नंबर डालकर अपना यूपीआई पिन दर्ज करें।"
        : "To recharge your phone, open PhonePe or Google Pay, select 'Mobile Recharge', enter your 10-digit number, and confirm with your UPI PIN.";
      matchedIds = ["mobile-recharge-upi", "send-money-phonepe"];
    } else {
      reply = language === 'kn'
        ? `ನಾನು ನಿಮ್ಮ ಪ್ರಶ್ನೆಯನ್ನು ಕೇಳಿಸಿಕೊಂಡೆ: "${raw}". ಕೆಳಗಿನ ಸಂಬಂಧಿತ ಡಿಜಿಟಲ್ ಪಾಠಗಳಲ್ಲಿ ನೀವು ಕಲಿಯಬಹುದು.`
        : language === 'hi'
        ? `मैंने सुना: "${raw}". आप नीचे दिए गए आसान डिजिटल पाठों में से चुनकर सीख सकते हैं।`
        : `I understood your question: "${raw}". Here are step-by-step smartphone lessons to help you.`;
      matchedIds = ["whatsapp-video-call", "make-font-larger", "turn-on-flashlight"];
    }

    setAssistantReply(reply);
    matchAndSetGuides(matchedIds);
    setIsLoadingReply(false);
    speechService.speak(reply, language);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-lg bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-8 shadow-2xl border border-zinc-200 dark:border-zinc-800 flex flex-col max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center space-x-2.5">
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
              stopAllAudio();
              onClose();
            }}
            className="p-2 rounded-full text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Central Voice Pulse Button */}
        <div className="my-6 flex flex-col items-center justify-center text-center">
          <div className="relative mb-3">
            {(isListening || isRecordingAudio) && (
              <span className="absolute inset-0 rounded-full bg-red-500/20 animate-ping duration-1000" />
            )}
            <button
              onClick={toggleListening}
              className={`relative z-10 w-24 h-24 rounded-full flex items-center justify-center transition-all shadow-xl ${
                isListening || isRecordingAudio
                  ? 'bg-red-600 text-white hover:bg-red-700 ring-8 ring-red-200 dark:ring-red-950 scale-105'
                  : 'bg-black text-white dark:bg-white dark:text-black hover:opacity-90 ring-4 ring-zinc-200 dark:ring-zinc-800'
              }`}
            >
              {isListening || isRecordingAudio ? (
                <Mic className="w-10 h-10 animate-pulse" />
              ) : (
                <Mic className="w-10 h-10" />
              )}
            </button>
          </div>

          <p className="font-bold text-sm text-zinc-900 dark:text-zinc-100 mb-1">
            {isListening || isRecordingAudio ? text.stopBtn : text.speakBtn}
          </p>

          <p className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center space-x-1">
            <Clock className="w-3.5 h-3.5 text-zinc-400" />
            <span>
              {isRecordingAudio
                ? text.recordingFallback
                : isListening
                ? (isExtendedPauseActive ? text.waiting : text.listening)
                : "Continuous cadence listening"}
            </span>
          </p>
        </div>

        {/* Error Notice */}
        {errorMessage && (
          <div className="mb-4 p-3.5 rounded-2xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 flex items-start space-x-2 text-xs text-zinc-800 dark:text-zinc-200">
            <AlertCircle className="w-4 h-4 text-zinc-500 flex-shrink-0 mt-0.5" />
            <div>
              <strong>Notice:</strong> {errorMessage}
            </div>
          </div>
        )}

        {/* Live Transcript Display */}
        {transcript && (
          <div className="mb-4 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-1">
              You Asked:
            </span>
            <p className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
              "{transcript}"
            </p>
          </div>
        )}

        {/* Loading Spinner */}
        {isLoadingReply && (
          <div className="mb-4 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800 flex items-center space-x-2 text-xs text-zinc-500">
            <Loader2 className="w-4 h-4 animate-spin text-zinc-600 dark:text-zinc-300" />
            <span>Thinking and preparing the best explanation for you...</span>
          </div>
        )}

        {/* Assistant Response Box */}
        {assistantReply && (
          <div className="mb-4 p-5 rounded-2xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-xs">
            <div className="flex items-center space-x-1.5 mb-2 text-xs font-bold text-zinc-600 dark:text-zinc-400">
              <Volume2 className="w-4 h-4" />
              <span>Assistant Answer:</span>
            </div>
            <p className="text-sm sm:text-base font-medium leading-relaxed mb-3">
              {assistantReply}
            </p>

            {/* Optional Related Guides without force-closing */}
            {suggestedGuides.length > 0 && (
              <div className="pt-3 border-t border-zinc-200 dark:border-zinc-700 mt-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 block mb-2">
                  {text.relatedGuides}
                </span>
                <div className="flex flex-col gap-2">
                  {suggestedGuides.map(guide => (
                    <button
                      key={guide.id}
                      onClick={() => {
                        stopAllAudio();
                        if (onSelectGuide) onSelectGuide(guide);
                        if (onClose) onClose();
                      }}
                      className="w-full text-left p-3 rounded-xl bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-between group transition-all"
                    >
                      <div className="flex items-center space-x-2.5">
                        <BookOpen className="w-4 h-4 text-zinc-400 group-hover:text-black dark:group-hover:text-white" />
                        <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                          {guide.title[language] || guide.title.en}
                        </span>
                      </div>
                      <span className="text-[10px] font-bold text-zinc-500 group-hover:text-black dark:group-hover:text-white flex items-center">
                        {text.openLesson} <ArrowRight className="w-3 h-3 ml-1" />
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
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
              className="px-5 py-3 rounded-2xl bg-black text-white dark:bg-white dark:text-black font-bold text-sm hover:opacity-90 disabled:opacity-30 transition-all flex items-center space-x-1"
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
