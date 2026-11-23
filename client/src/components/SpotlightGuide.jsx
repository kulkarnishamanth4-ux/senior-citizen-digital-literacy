import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  ArrowLeft, 
  ArrowRight, 
  Volume2, 
  CheckCircle2, 
  Info, 
  Smartphone, 
  ScreenShare, 
  StopCircle, 
  Eye, 
  Target, 
  Loader2,
  Key,
  Scan,
  AlertCircle,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { speechService } from '../services/speechService';
import { screenVisionService } from '../services/screenVisionService';

export default function SpotlightGuide({
  guide,
  language,
  onBack,
  onCompleteTask
}) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [screenStream, setScreenStream] = useState(null);
  const [shareError, setShareError] = useState(null);

  // Gemini Vision state
  const [visionResult, setVisionResult] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState(null);
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const [apiKeyDraft, setApiKeyDraft] = useState('');
  const [apiKeyStatus, setApiKeyStatus] = useState(null);
  const [autoScanEnabled, setAutoScanEnabled] = useState(true);
  const [scanCount, setScanCount] = useState(0);
  const [isVisionReady, setIsVisionReady] = useState(() => Boolean(screenVisionService.getStoredApiKey()));

  const videoRef = useRef(null);
  const analysisTimerRef = useRef(null);
  const isMountedRef = useRef(true);
  const isScreenSharingRef = useRef(false);
  const isAnalyzingRef = useRef(false);

  const steps = guide.steps || [];
  const currentStep = steps[currentStepIndex] || steps[0];
  const isLastStep = currentStepIndex === steps.length - 1;

  // --------------- Lifecycle ---------------

  useEffect(() => {
    isMountedRef.current = true;
    screenVisionService.isVisionConfigured().then(ready => {
      if (isMountedRef.current) {
        setIsVisionReady(ready);
      }
    });

    return () => {
      isMountedRef.current = false;
      clearInterval(analysisTimerRef.current);
      stopScreenShare();
    };
  }, []);

  // Ensure video element plays the stream reliably
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;

    if (screenStream) {
      video.srcObject = screenStream;
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch(err => {
          console.warn("Video play error in effect:", err);
        });
      }
    } else {
      video.srcObject = null;
    }
  }, [screenStream]);

  // Speak current step on change
  useEffect(() => {
    speakCurrentStep();
    if (isScreenSharing) {
      setTimeout(() => {
        runSingleAnalysis();
      }, 500);
    }
  }, [currentStepIndex, language]);

  // Reset vision result when step changes
  useEffect(() => {
    setVisionResult(null);
    setAnalysisError(null);
    setScanCount(0);
  }, [currentStepIndex]);

  // Auto-scan loop when screen sharing is active
  useEffect(() => {
    clearInterval(analysisTimerRef.current);

    if (isScreenSharing && autoScanEnabled) {
      analysisTimerRef.current = setInterval(() => {
        if (isMountedRef.current && !isAnalyzing) {
          runSingleAnalysis();
        }
      }, 3500);
    }

    return () => clearInterval(analysisTimerRef.current);
  }, [isScreenSharing, autoScanEnabled, currentStepIndex]);

  // --------------- Screen Share ---------------

  const startScreenShare = async () => {
    setShareError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
        throw new Error(
          language === 'kn'
            ? "ನಿಮ್ಮ ಬ್ರೌಸರ್‌ನಲ್ಲಿ ಸ್ಕ್ರೀನ್ ಹಂಚಿಕೆ ಬೆಂಬಲಿತವಾಗಿಲ್ಲ. ದಯವಿಟ್ಟು ಡೆಸ್ಕ್‌ಟಾಪ್ ಅಥವಾ ಬೆಂಬಲಿತ ಆಂಡ್ರಾಯ್ಡ್ Chrome ಬ್ರೌಸರ್ ಬಳಸಿ."
            : language === 'hi'
            ? "आपके ब्राउज़र में स्क्रीन शेयर समर्थित नहीं है। कृपया Chrome या Edge का उपयोग करें।"
            : "Screen sharing is not supported by this browser. Please use Google Chrome or Microsoft Edge on a laptop or desktop computer."
        );
      }

      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          cursor: "always"
        },
        audio: false
      });

      // Bind directly to video element immediately
      const video = videoRef.current;
      if (video) {
        video.muted = true;
        video.defaultMuted = true;
        video.playsInline = true;
        video.srcObject = stream;
        video.play().catch(e => console.warn("Immediate video play warning:", e));
      }

      // Handle user stopping screen share via native browser floating banner
      stream.getVideoTracks()[0].onended = () => {
        stopScreenShare();
      };

      setScreenStream(stream);
      isScreenSharingRef.current = true;
      setIsScreenSharing(true);

      // Active voice command on screen connection
      const stepText = currentStep.instruction[language] || currentStep.instruction.en;
      const target = currentStep.spotlightTarget;
      const notice = language === 'kn'
        ? `ಸ್ಕ್ರೀನ್ ಹಂಚಿಕೆ ಸಕ್ರಿಯಗೊಂಡಿದೆ! ಹಂತ ${currentStepIndex + 1}: ${stepText}. ಹೈಲೈಟ್ ಮಾಡಿರುವ ${target} ಮೇಲೆ ಒತ್ತಿರಿ.`
        : language === 'hi'
        ? `स्क्रीन शेयर शुरू हो गया है! चरण ${currentStepIndex + 1}: ${stepText}. हाइलाइट किए गए ${target} पर टैप करें।`
        : `Screen connected! Step ${currentStepIndex + 1}: ${stepText}. Tap the highlighted ${target} on your screen.`;
      
      speechService.speak(notice, language);

      // Trigger immediate first scan as soon as video plays
      setTimeout(() => {
        runSingleAnalysis();
      }, 500);

      // Check vision readiness
      if (!isVisionReady) {
        const configured = await screenVisionService.isVisionConfigured();
        setIsVisionReady(configured);
        if (!configured) {
          setShowApiKeyInput(true);
        }
      }
    } catch (err) {
      console.warn("Screen share error:", err);
      if (err.name !== 'NotAllowedError') {
        setShareError(err.message || "Could not start screen capture.");
      }
    }
  };

  const stopScreenShare = () => {
    clearInterval(analysisTimerRef.current);
    isScreenSharingRef.current = false;
    isAnalyzingRef.current = false;
    if (screenStream) {
      screenStream.getTracks().forEach(track => {
        try { track.stop(); } catch(e) {}
      });
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setScreenStream(null);
    setIsScreenSharing(false);
    setVisionResult(null);
    setIsAnalyzing(false);
  };

  const handleVideoMetadata = () => {
    setTimeout(() => {
      runSingleAnalysis();
    }, 400);
  };

  // --------------- Gemini Vision Analysis ---------------

  const runSingleAnalysis = useCallback(async () => {
    const video = videoRef.current;
    if (!video || !video.srcObject) return;
    if (video.videoWidth === 0 || video.videoHeight === 0) {
      // If video dimensions not yet populated, schedule retry
      setTimeout(() => {
        if (isScreenSharingRef.current && !isAnalyzingRef.current) {
          runSingleAnalysis();
        }
      }, 400);
      return;
    }
    if (isAnalyzingRef.current) return;

    isAnalyzingRef.current = true;
    setIsAnalyzing(true);
    setAnalysisError(null);

    try {
      const result = await screenVisionService.analyzeLiveScreen({
        videoElement: video,
        taskTitle: guide.title[language] || guide.title.en,
        stepInstruction: currentStep.instruction[language] || currentStep.instruction.en,
        targetName: currentStep.spotlightTarget || 'Target button',
        language,
      });

      if (!isMountedRef.current) return;

      if (result.success === false && result.reason === 'NO_API_KEY') {
        setIsVisionReady(false);
        setAnalysisError(null);
      } else if (result.success === false) {
        setAnalysisError(result.guidanceMessage || result.error || 'Analysis failed.');
      } else {
        setIsVisionReady(true);
        setVisionResult(result);
        setScanCount(prev => prev + 1);

        if (result.guidanceMessage && result.found) {
          speechService.speak(result.guidanceMessage, language);
        }
      }
    } catch (err) {
      if (isMountedRef.current) {
        setAnalysisError(err.message || 'Unexpected analysis error.');
      }
    } finally {
      if (isMountedRef.current) {
        isAnalyzingRef.current = false;
        setIsAnalyzing(false);
      }
    }
  }, [currentStep, guide, language]);

  // --------------- Comprehensive Smart Coordinate Positioning ---------------

  const getHeuristicCoords = (targetName = '') => {
    const t = targetName.toLowerCase();
    
    // WhatsApp App Icon / Launcher
    if (t.includes('whatsapp app icon') || t.includes('upi app') || t.includes('health app') || t.includes('digilocker app')) {
      return { top: '25%', left: '20%', width: '22%', height: '12%' };
    }
    // Settings icon
    if (t.includes('settings gear icon') || t.includes('gear')) {
      return { top: '25%', left: '60%', width: '22%', height: '12%' };
    }
    // Video camera icon / phone call icon
    if (t.includes('video camera icon') || t.includes('camera icon') || t.includes('video call')) {
      return { top: '6%', left: '78%', width: '16%', height: '8%' };
    }
    // Contact name / recipient row in list
    if (t.includes('contact name') || t.includes('recipient') || t.includes('verified beneficiary')) {
      return { top: '20%', left: '8%', width: '84%', height: '10%' };
    }
    // Paperclip / attachment icon
    if (t.includes('paperclip') || t.includes('attachment')) {
      return { top: '84%', left: '8%', width: '16%', height: '8%' };
    }
    // Gallery / Camera picker popup
    if (t.includes('gallery') || t.includes('camera button') || t.includes('plan selector')) {
      return { top: '55%', left: '20%', width: '60%', height: '18%' };
    }
    // Mic icon / green send button
    if (t.includes('mic icon') || t.includes('green mic') || t.includes('send green button') || t.includes('send trigger')) {
      return { top: '84%', left: '78%', width: '16%', height: '8%' };
    }
    // Torch icon in notification shade
    if (t.includes('torch') || t.includes('flashlight')) {
      return { top: '22%', left: '26%', width: '22%', height: '12%' };
    }
    // Notification shade swipe
    if (t.includes('notification shade') || t.includes('swipe')) {
      return { top: '5%', left: '20%', width: '60%', height: '14%' };
    }
    // Font slider in display settings
    if (t.includes('font slider') || t.includes('slider') || t.includes('display')) {
      return { top: '48%', left: '12%', width: '76%', height: '10%' };
    }
    // Mobile recharge / electricity icon
    if (t.includes('recharge') || t.includes('electricity') || t.includes('board selector')) {
      return { top: '34%', left: '15%', width: '30%', height: '12%' };
    }
    // PIN pad
    if (t.includes('pin screen') || t.includes('pin pad') || t.includes('pin rule')) {
      return { top: '62%', left: '10%', width: '80%', height: '28%' };
    }
    // Clear all button in notifications
    if (t.includes('clear all') || t.includes('clear')) {
      return { top: '80%', left: '35%', width: '30%', height: '8%' };
    }
    // Info icon / block button
    if (t.includes('info icon') || t.includes('three dots') || t.includes('menu')) {
      return { top: '8%', left: '82%', width: '12%', height: '8%' };
    }
    if (t.includes('block button')) {
      return { top: '70%', left: '15%', width: '70%', height: '10%' };
    }
    // SOS / Power button
    if (t.includes('power button') || t.includes('hardware')) {
      return { top: '28%', left: '92%', width: '7%', height: '16%' };
    }
    if (t.includes('sos') || t.includes('broadcast')) {
      return { top: '48%', left: '15%', width: '70%', height: '18%' };
    }

    // Default center spotlight
    return { top: '38%', left: '15%', width: '70%', height: '14%' };
  };

  const activeBox = (visionResult && visionResult.found && visionResult.cssBox)
    ? visionResult.cssBox
    : getHeuristicCoords(currentStep.spotlightTarget);

  // --------------- API Key Management ---------------

  const handleSaveApiKey = async () => {
    const key = apiKeyDraft.trim();
    if (!key) return;

    setApiKeyStatus('validating');
    const testResult = await screenVisionService.testApiKey(key);

    if (testResult.success) {
      screenVisionService.setStoredApiKey(key);
      setApiKeyStatus('valid');
      setIsVisionReady(true);
      setShowApiKeyInput(false);
      setApiKeyDraft('');

      setTimeout(() => runSingleAnalysis(), 400);
    } else {
      setApiKeyStatus('invalid');
    }
  };

  // --------------- Speech ---------------

  const speakCurrentStep = () => {
    if (!currentStep) return;
    setIsPlayingAudio(true);
    const instructionText = currentStep.instruction[language] || currentStep.instruction.en;
    const target = currentStep.spotlightTarget ? ` Target: ${currentStep.spotlightTarget}.` : '';
    const tipText = currentStep.tip ? ` Tip: ${currentStep.tip[language] || currentStep.tip.en}` : '';
    
    speechService.speak(`${instructionText} ${target} ${tipText}`, language, () => {
      setIsPlayingAudio(false);
    });
  };

  // --------------- Navigation ---------------

  const handleNext = () => {
    if (isLastStep) {
      const congrats = language === 'kn' 
        ? "ಎಲ್ಲಾ ಹಂತಗಳು ಮುಗಿದಿವೆ! ನೀವು ಯಾವಾಗ ಬೇಕಾದರೂ ಮತ್ತೆ ಬಂದು ನೋಡಬಹುದು."
        : language === 'hi'
        ? "सभी चरण पूरे हो गए हैं! आप जब चाहें इसे दोबारा देख सकते हैं।"
        : "You have finished all the steps! You can come back and practice anytime.";
      speechService.speak(congrats, language);
      if (onCompleteTask) onCompleteTask(guide.id);
    } else {
      const confirmNotice = language === 'kn'
        ? "ಉತ್ತಮ! ಈಗ ಮುಂದಿನ ಹಂತಕ್ಕೆ ಹೋಗೋಣ."
        : language === 'hi'
        ? "बहुत बढ़िया! अब अगले चरण पर चलते हैं।"
        : "Great! Moving to the next step.";
      speechService.speak(confirmNotice, language);
      setCurrentStepIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  // --------------- Localized Labels ---------------

  const localizedLabels = {
    en: {
      stepOf: `Step ${currentStepIndex + 1} of ${steps.length}`,
      prev: "Previous",
      next: "Next",
      finish: "Finish ✓",
      repeat: "Hear Again",
      startShare: "Share Screen",
      stopShare: "Stop Sharing",
      shareActive: "Your Screen is Live",
      scanning: "Looking at screen...",
      found: "Tap the highlighted button!",
      notFound: "Looking for next button...",
      wrongApp: "Please switch to the right app.",
      homeScreen: "Please open the app.",
      dialogBlocking: "Please close any popup on your screen.",
      apiKeyLabel: "Gemini Key for Screen Help",
      apiKeySave: "Save",
      apiKeyValidating: "Checking...",
      reScan: "Check Screen",
      autoScanOn: "Auto-Check: On",
      autoScanOff: "Auto-Check: Off",
      scans: "checks",
      tapHere: "Tap Here"
    },
    kn: {
      stepOf: `ಹಂತ ${currentStepIndex + 1} / ${steps.length}`,
      prev: "ಹಿಂದಿನದು",
      next: "ಮುಂದಿನದು",
      finish: "ಮುಗಿಸಿ ✓",
      repeat: "ಮತ್ತೆ ಕೇಳಿ",
      startShare: "ಸ್ಕ್ರೀನ್ ತೋರಿಸಿ",
      stopShare: "ನಿಲ್ಲಿಸಿ",
      shareActive: "ನಿಮ್ಮ ಸ್ಕ್ರೀನ್ ಕಾಣಿಸುತ್ತಿದೆ",
      scanning: "ಸ್ಕ್ರೀನ್ ನೋಡಲಾಗುತ್ತಿದೆ...",
      found: "ಗುರುತಿಸಿದ ಜಾಗವನ್ನು ಒತ್ತಿರಿ!",
      notFound: "ಮುಂದಿನ ಬಟನ್ ಹುಡುಕಲಾಗುತ್ತಿದೆ...",
      wrongApp: "ದಯವಿಟ್ಟು ಸರಿಯಾದ ಆ್ಯಪ್ ತೆರೆಯಿರಿ.",
      homeScreen: "ದಯವಿಟ್ಟು ಆ್ಯಪ್ ತೆರೆಯಿರಿ.",
      dialogBlocking: "ದಯವಿಟ್ಟು ಪಾಪ್-ಅಪ್ ಮುಚ್ಚಿರಿ.",
      apiKeyLabel: "ಸ್ಕ್ರೀನ್ ಸಹಾಯಕ್ಕಾಗಿ Gemini Key",
      apiKeySave: "ಉಳಿಸಿ",
      apiKeyValidating: "ಪರಿಶೀಲಿಸಲಾಗುತ್ತಿದೆ...",
      reScan: "ಮತ್ತೆ ನೋಡಿ",
      autoScanOn: "ಸ್ವಯಂ-ಪರೀಕ್ಷೆ: ಆನ್",
      autoScanOff: "ಸ್ವಯಂ-ಪರೀಕ್ಷೆ: ಆಫ್",
      scans: "ಪರೀಕ್ಷೆಗಳು",
      tapHere: "ಇಲ್ಲಿ ಒತ್ತಿರಿ"
    },
    hi: {
      stepOf: `चरण ${currentStepIndex + 1} / ${steps.length}`,
      prev: "पिछला",
      next: "अगला",
      finish: "समाप्त ✓",
      repeat: "दोबारा सुनें",
      startShare: "स्क्रीन दिखाएं",
      stopShare: "बंद करें",
      shareActive: "आपकी स्क्रीन दिख रही है",
      scanning: "स्क्रीन देखी जा रही है...",
      found: "चिह्नित जगह पर टैप करें!",
      notFound: "अगला बटन खोज रहे हैं...",
      wrongApp: "कृपया सही ऐप खोलें।",
      homeScreen: "कृपया ऐप खोलें।",
      dialogBlocking: "कृपया स्क्रीन का पॉप-अप बंद करें।",
      apiKeyLabel: "स्क्रीन सहायता के लिए Gemini Key",
      apiKeySave: "सेव करें",
      apiKeyValidating: "जांच हो रही है...",
      reScan: "दोबारा देखें",
      autoScanOn: "ऑटो-जांच: चालू",
      autoScanOff: "ऑटो-जांच: बंद",
      scans: "जांच",
      tapHere: "यहाँ टैप करें"
    }
  };

  const labels = localizedLabels[language] || localizedLabels.en;

  // Status indicator
  const getStatusInfo = () => {
    if (!isScreenSharing) return null;
    if (isAnalyzing) return { text: labels.scanning, color: 'text-zinc-300', icon: Loader2, spin: true };
    if (visionResult && visionResult.found) return { text: labels.found, color: 'text-emerald-400', icon: CheckCircle2, spin: false };
    return { text: labels.notFound, color: 'text-zinc-400', icon: Scan, spin: false };
  };

  const statusInfo = getStatusInfo();

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 animate-fade-in">
      {/* Back Button */}
      <button
        onClick={() => {
          stopScreenShare();
          speechService.stopSpeaking();
          onBack();
        }}
        className="flex items-center space-x-2 text-zinc-500 hover:text-black dark:text-zinc-400 dark:hover:text-white font-semibold text-sm mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Guides</span>
      </button>

      {/* Guide Header Card */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-10 border border-zinc-200 dark:border-zinc-800 shadow-xs mb-8">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <span className="px-3 py-1 rounded-full bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200 text-xs font-bold uppercase tracking-wider border border-zinc-200 dark:border-zinc-700">
            {labels.stepOf}
          </span>

          <div className="flex items-center space-x-2 flex-wrap gap-y-2">
            {/* Screen Share Toggle */}
            {!isScreenSharing ? (
              <button
                onClick={startScreenShare}
                className="flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold bg-black text-white dark:bg-white dark:text-black hover:opacity-90 transition-all shadow-xs"
                title="Share your phone or app window so AI looks at your real screen"
              >
                <ScreenShare className="w-4 h-4" />
                <span>{labels.startShare}</span>
              </button>
            ) : (
              <>
                <button
                  onClick={stopScreenShare}
                  className="flex items-center space-x-2 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-zinc-800 text-white hover:bg-zinc-700 transition-all border border-zinc-600"
                >
                  <StopCircle className="w-3.5 h-3.5 text-red-400" />
                  <span>{labels.stopShare}</span>
                </button>

                {/* Manual Re-scan Button */}
                <button
                  onClick={runSingleAnalysis}
                  disabled={isAnalyzing}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-zinc-800 text-white hover:bg-zinc-700 transition-all border border-zinc-600 disabled:opacity-40"
                  title="Capture frame and run Gemini Vision immediately"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isAnalyzing ? 'animate-spin' : ''}`} />
                  <span>{labels.reScan}</span>
                </button>

                {/* Auto-Scan Toggle */}
                <button
                  onClick={() => setAutoScanEnabled(prev => !prev)}
                  className={`px-2.5 py-1.5 rounded-xl text-[10px] font-bold border transition-all ${
                    autoScanEnabled
                      ? 'bg-emerald-950 text-emerald-300 border-emerald-700'
                      : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                  }`}
                >
                  {autoScanEnabled ? labels.autoScanOn : labels.autoScanOff}
                </button>
              </>
            )}

            <button
              onClick={speakCurrentStep}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                isPlayingAudio
                  ? 'bg-black text-white dark:bg-white dark:text-black border-transparent'
                  : 'bg-zinc-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100'
              }`}
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>{labels.repeat}</span>
            </button>
          </div>
        </div>

        <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 mb-3">
          {guide.title[language] || guide.title.en}
        </h2>
        <p className="text-sm sm:text-base text-zinc-500 dark:text-zinc-400 font-normal leading-relaxed">
          {guide.description[language] || guide.description.en}
        </p>

        {shareError && (
          <div className="mt-4 p-4 rounded-2xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-xs text-zinc-800 dark:text-zinc-200 flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 text-zinc-600 dark:text-zinc-400 flex-shrink-0 mt-0.5" />
            <div>
              <strong>Screen Share Notice:</strong> {shareError}
            </div>
          </div>
        )}
      </div>

      {/* API KEY MODAL */}
      {showApiKeyInput && (
        <div className="bg-zinc-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-zinc-800 mb-8">
          <div className="flex items-center space-x-2 mb-3">
            <Key className="w-5 h-5 text-zinc-400" />
            <h3 className="text-base font-bold">{labels.apiKeyLabel}</h3>
          </div>

          <p className="text-xs text-zinc-400 mb-4 leading-relaxed">
            {language === 'kn'
              ? "ಲೈವ್ ಸ್ಕ್ರೀನ್ ಮೇಲೆ ಬಟನ್‌ಗಳನ್ನು ನೈಜ ಸಮಯದಲ್ಲಿ ಗುರುತಿಸಲು Gemini API Key ಅಗತ್ಯವಿದೆ."
              : language === 'hi'
              ? "लाइव स्क्रीन पर बटन पहचानने के लिए Gemini API Key आवश्यक है।"
              : "To identify buttons on your live screen, configure GEMINI_API_KEY in Render server settings, or paste a key here for direct browser use."}
          </p>

          <div className="flex items-center gap-3">
            <input
              type="password"
              value={apiKeyDraft}
              onChange={(e) => { setApiKeyDraft(e.target.value); setApiKeyStatus(null); }}
              placeholder="AIza... (Gemini API Key)"
              className="flex-1 px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white text-sm font-mono placeholder-zinc-600 focus:outline-none focus:border-zinc-500"
            />
            <button
              onClick={handleSaveApiKey}
              disabled={apiKeyStatus === 'validating' || !apiKeyDraft.trim()}
              className="px-5 py-2.5 rounded-xl bg-white text-black font-bold text-sm hover:bg-zinc-200 transition-all disabled:opacity-40 flex items-center space-x-2"
            >
              {apiKeyStatus === 'validating' ? (
                <><Loader2 className="w-4 h-4 animate-spin" /><span>{labels.apiKeyValidating}</span></>
              ) : (
                <span>{labels.apiKeySave}</span>
              )}
            </button>
          </div>

          {apiKeyStatus === 'valid' && (
            <p className="mt-3 text-xs text-emerald-400 font-semibold">✓ Verified! Starting live neural screen recognition...</p>
          )}
          {apiKeyStatus === 'invalid' && (
            <p className="mt-3 text-xs text-red-400 font-semibold">✗ Invalid key. Please check and try again.</p>
          )}
        </div>
      )}

      {/* PROMINENT LIVE COMMAND BANNER DIRECTLY ABOVE SCREEN VIEW */}
      <div className="mb-4 p-4 sm:p-5 rounded-2xl bg-zinc-900 text-white border-2 border-zinc-700 flex items-center justify-between gap-4 shadow-xl">
        <div className="flex items-start space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-white text-black flex items-center justify-center font-black text-sm flex-shrink-0 mt-0.5 shadow">
            AI
          </div>
          <div>
            <span className="text-[11px] font-black uppercase tracking-wider text-zinc-400 block mb-0.5">
              {isScreenSharing 
                ? (language === 'kn' ? "ನಿಮ್ಮ ಸ್ಕ್ರೀನ್‌ನಲ್ಲಿ ಇಲ್ಲಿ ಒತ್ತಿರಿ:" : language === 'hi' ? "अपनी स्क्रीन पर यहाँ टैप करें:" : "Tap this on your screen:") 
                : (language === 'kn' ? "ಮುಂದಿನ ಸೂಚನೆ:" : language === 'hi' ? "अगला निर्देश:" : "What to do next:")}
            </span>
            <p className="text-base sm:text-xl font-extrabold leading-snug text-white">
              {currentStep.instruction[language] || currentStep.instruction.en}
            </p>
            {currentStep.spotlightTarget && (
              <div className="mt-2 inline-flex items-center space-x-1.5 px-3 py-1 rounded-md bg-white text-black text-xs font-black shadow-xs">
                <span>{language === 'kn' ? '🎯 ಇಲ್ಲಿ ಒತ್ತಿರಿ:' : language === 'hi' ? '🎯 यहाँ दबाएं:' : '🎯 Tap here:'}</span>
                <span className="underline">{currentStep.spotlightTarget}</span>
              </div>
            )}
          </div>
        </div>
        <button
          onClick={speakCurrentStep}
          className="p-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white flex-shrink-0 border border-zinc-600 transition-all shadow-md"
          title="Repeat spoken command"
        >
          <Volume2 className="w-5 h-5" />
        </button>
      </div>

      {/* LIVE SCREEN VIEW CONTAINER */}
      <div className="bg-zinc-950 rounded-3xl p-6 sm:p-10 text-white shadow-xl border border-zinc-800 mb-8">
        {/* Header Bar */}
        <div className="flex items-center justify-between text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-6 flex-wrap gap-2">
          <div className="flex items-center space-x-2">
            <Smartphone className="w-4 h-4 text-zinc-400" />
            <span>{isScreenSharing ? labels.shareActive : (language === 'kn' ? 'ಫೋನ್ ಸ್ಕ್ರೀನ್' : language === 'hi' ? 'फोन स्क्रीन' : 'Phone Screen')}</span>
            {isScreenSharing && scanCount > 0 && (
              <span className="text-zinc-600 normal-case">({scanCount} {labels.scans})</span>
            )}
          </div>
          <span className="text-zinc-300 flex items-center font-bold">
            <Target className="w-3.5 h-3.5 mr-1 text-emerald-400" />
            {language === 'kn' ? 'ಹುಡುಕಿ:' : language === 'hi' ? 'खोजें:' : 'Find:'} {currentStep.spotlightTarget}
          </span>
        </div>

        {/* Live Status Bar */}
        {statusInfo && (
          <div className={`flex items-center space-x-2 mb-4 text-xs font-semibold ${statusInfo.color}`}>
            <statusInfo.icon className={`w-4 h-4 ${statusInfo.spin ? 'animate-spin' : ''}`} />
            <span>{statusInfo.text}</span>
          </div>
        )}

        {/* Guidance Message */}
        {visionResult && visionResult.guidanceMessage && (
          <div className="mb-4 p-3.5 rounded-2xl bg-zinc-900 border border-zinc-800 text-sm font-medium text-zinc-200 leading-relaxed">
            <div className="flex items-start space-x-2">
              <Eye className="w-4 h-4 text-zinc-400 flex-shrink-0 mt-0.5" />
              <div>
                <span className="text-[10px] uppercase tracking-wider text-zinc-500 block mb-1">
                  {language === 'kn' ? 'ಸಹಾಯ ಸೂಚನೆ' : language === 'hi' ? 'सहायता संदेश' : 'Help Note'}
                </span>
                {visionResult.guidanceMessage}
              </div>
            </div>
          </div>
        )}

        {/* Analysis Error Notice */}
        {analysisError && (
          <div className="mb-4 p-3 rounded-xl bg-zinc-900 border border-red-900/40 text-xs text-red-300">
            {analysisError}
          </div>
        )}

        {/* RESPONSIVE SCREEN DISPLAY: EXPANDS INTO GENEROUS SIZED VIEWPORT */}
        <div className={`relative mx-auto w-full transition-all duration-300 ${
          isScreenSharing ? 'max-w-3xl min-h-[460px] sm:min-h-[560px]' : 'max-w-md h-96'
        } bg-black rounded-3xl border border-zinc-800 overflow-hidden shadow-2xl flex flex-col justify-between`}>
          
          {/* VIDEO ELEMENT: ALWAYS IN DOM, NEVER BLACKED OUT */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            onLoadedMetadata={handleVideoMetadata}
            className={`absolute inset-0 w-full h-full object-contain bg-black transition-opacity duration-300 ${
              isScreenSharing ? 'opacity-100 z-10' : 'opacity-0 pointer-events-none'
            }`}
          />

          {/* Placeholder mockup when screen sharing is inactive */}
          {!isScreenSharing && (
            <div className="absolute inset-0 flex flex-col justify-between p-5 z-0">
              <div className="flex justify-between items-center text-[11px] text-zinc-600 pb-2 border-b border-zinc-900">
                <span>9:41 AM</span>
                <span>LTE 100%</span>
              </div>
              <div className="flex-1 flex flex-col items-center justify-center text-center px-6 space-y-4">
                <div className="w-16 h-16 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400">
                  <ScreenShare className="w-8 h-8" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-zinc-300 mb-1">
                    {language === 'kn'
                      ? "ನಿಮ್ಮ ಫೋನ್ ಸ್ಕ್ರೀನ್ ತೋರಿಸಿ"
                      : language === 'hi'
                      ? "अपने फोन की स्क्रीन दिखाएं"
                      : "Show your phone screen"}
                  </p>
                  <p className="text-xs text-zinc-500 leading-relaxed max-w-xs">
                    {language === 'kn'
                      ? "ಸ್ಕ್ರೀನ್ ಹಂಚಿಕೊಂಡರೆ, ಯಾವ ಬಟನ್ ಒತ್ತಬೇಕೆಂದು ಸುಲಭವಾಗಿ ತೋರಿಸಲಾಗುತ್ತದೆ."
                      : language === 'hi'
                      ? "स्क्रीन शेयर करने पर हम आपको दिखाएंगे कि किस बटन पर टैप करना है।"
                      : "Share your screen so the app can highlight where to tap on your phone."}
                  </p>
                </div>
                <button
                  onClick={startScreenShare}
                  className="px-5 py-2.5 rounded-xl bg-white text-black font-bold text-xs hover:bg-zinc-200 transition-all shadow-md flex items-center space-x-2"
                >
                  <ScreenShare className="w-4 h-4" />
                  <span>{labels.startShare}</span>
                </button>
              </div>
              <div className="text-[10px] text-zinc-700 text-center pb-2">
                Simple Step-by-Step Guidance
              </div>
            </div>
          )}

          {/* DYNAMIC SPOTLIGHT OVERLAY: HIGH CONTRAST GLOW WITHOUT DARKENING THE SCREEN */}
          <div 
            className="live-spotlight-box rounded-2xl flex flex-col items-center justify-center p-2 text-center cursor-pointer transition-all duration-300 z-30"
            style={{
              top: activeBox.top || '35%',
              left: activeBox.left || '15%',
              width: activeBox.width || '70%',
              height: activeBox.height || '15%',
            }}
            onClick={handleNext}
          >
            {/* Pulsing indicator tag */}
            <div className="bg-black text-white px-3 py-1 rounded-md text-xs font-black uppercase tracking-wider shadow-2xl whitespace-nowrap mb-1 border border-zinc-700 flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>🎯 {visionResult?.detectedLabel || currentStep.spotlightTarget}</span>
            </div>
            <div className="text-[11px] font-black text-black bg-white px-3 py-0.5 rounded-full shadow-lg tracking-wider flex items-center space-x-1">
              <span>👇</span>
              <span>{labels.tapHere}</span>
            </div>
          </div>

          {/* Scanning badge */}
          {isScreenSharing && isAnalyzing && (
            <div className="absolute top-3 right-3 flex items-center space-x-1.5 bg-black/80 border border-zinc-700 px-3 py-1 rounded-full z-40">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
              <span className="text-[10px] text-white font-semibold">AI Inspecting Screen...</span>
            </div>
          )}

          {/* Confidence Badge */}
          {isScreenSharing && visionResult && visionResult.found && (
            <div className="absolute bottom-3 right-3 bg-emerald-950 border border-emerald-700 text-emerald-300 text-[10px] font-bold px-2.5 py-1 rounded-full z-40">
              {Math.round(visionResult.confidence * 100)}% match
            </div>
          )}

          {/* Bottom Status Ribbon */}
          <div className="relative z-20 text-center text-[11px] text-zinc-400 bg-black/85 py-2.5 border-t border-zinc-900 mt-auto">
            {isScreenSharing
              ? (visionResult?.found
                 ? (language === 'kn' ? 'AI ಗುರಿ ಗುರುತಿಸಿದೆ: ನಿಮ್ಮ ಆ್ಯಪ್‌ನಲ್ಲಿ ಈ ಬಟನ್ ಒತ್ತಿರಿ.'
                    : language === 'hi' ? 'AI ने बटन पहचाना: अपने ऐप में इस पर टैप करें।'
                    : 'Target detected on your live screen. Tap the highlighted button in your app.')
                 : (language === 'kn' ? 'AI ನಿಮ್ಮ ಸ್ಕ್ರೀನ್ ನೋಡುತ್ತಿದೆ...'
                    : language === 'hi' ? 'AI आपकी स्क्रीन देख रहा है...'
                    : 'AI is looking at your live screen...'))
              : (language === 'kn' ? 'ಸ್ಕ್ರೀನ್ ಹಂಚಿಕೊಂಡು ಪ್ರಾರಂಭಿಸಿ'
                 : language === 'hi' ? 'स्क्रीन शेयर करके शुरू करें'
                 : 'Share your screen to begin live AI guidance')}
          </div>
        </div>
      </div>

      {/* Large Navigation Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <button
          onClick={handlePrev}
          disabled={currentStepIndex === 0}
          className={`w-full sm:w-auto min-h-[58px] px-6 py-3.5 rounded-2xl font-bold text-sm sm:text-base flex items-center justify-center space-x-2 border transition-all ${
            currentStepIndex === 0
              ? 'opacity-30 cursor-not-allowed bg-zinc-100 dark:bg-zinc-900 text-zinc-400 border-zinc-200 dark:border-zinc-800'
              : 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100'
          }`}
        >
          <ArrowLeft className="w-5 h-5" />
          <span>{labels.prev}</span>
        </button>

        <button
          onClick={handleNext}
          className="w-full sm:w-auto min-h-[58px] px-8 py-3.5 rounded-2xl font-bold text-base sm:text-lg flex items-center justify-center space-x-2 transition-all shadow-sm bg-black text-white dark:bg-white dark:text-black hover:opacity-90"
        >
          <span>{isLastStep ? labels.finish : labels.next}</span>
          {isLastStep ? <CheckCircle2 className="w-5 h-5" /> : <ArrowRight className="w-5 h-5" />}
        </button>
      </div>
    </div>
  );
}
