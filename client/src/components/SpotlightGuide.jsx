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
  Maximize2
} from 'lucide-react';
import confetti from 'canvas-confetti';
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
      }, 4000);
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
      setIsScreenSharing(true);

      const notice = language === 'kn'
        ? "ಸ್ಕ್ರೀನ್ ಹಂಚಿಕೆ ಸಕ್ರಿಯಗೊಂಡಿದೆ. AI ನಿಮ್ಮ ಸ್ಕ್ರೀನ್ ನೋಡುತ್ತಿದೆ."
        : language === 'hi'
        ? "स्क्रीन शेयर शुरू हो गया है। AI आपकी स्क्रीन देख रहा है।"
        : "Screen share active. AI is now inspecting your screen to highlight the buttons.";
      speechService.speak(notice, language);

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
    if (!video || !isScreenSharing) return;
    if (video.videoWidth === 0 || video.videoHeight === 0) {
      return;
    }
    if (isAnalyzing) return;

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
        setShowApiKeyInput(true);
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
        setIsAnalyzing(false);
      }
    }
  }, [isScreenSharing, isAnalyzing, currentStep, guide, language]);

  // --------------- Smart Coordinate Positioning ---------------

  const getHeuristicCoords = (targetName = '') => {
    const t = targetName.toLowerCase();
    if (t.includes('video') || t.includes('dots') || t.includes('menu') || t.includes('camera icon')) {
      return { top: '10%', left: '78%', width: '16%', height: '8%' };
    }
    if (t.includes('send') || t.includes('mic') || t.includes('microphone') || t.includes('submit')) {
      return { top: '82%', left: '76%', width: '18%', height: '10%' };
    }
    if (t.includes('paperclip') || t.includes('attachment') || t.includes('type') || t.includes('keyboard')) {
      return { top: '82%', left: '8%', width: '22%', height: '10%' };
    }
    if (t.includes('contact') || t.includes('recipient') || t.includes('name') || t.includes('header')) {
      return { top: '18%', left: '12%', width: '76%', height: '10%' };
    }
    if (t.includes('torch') || t.includes('flashlight') || t.includes('slider') || t.includes('timeout')) {
      return { top: '32%', left: '18%', width: '64%', height: '14%' };
    }
    return { top: '42%', left: '15%', width: '70%', height: '14%' };
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
    const tipText = currentStep.tip ? ` Tip: ${currentStep.tip[language] || currentStep.tip.en}` : '';
    
    speechService.speak(`${instructionText} ${tipText}`, language, () => {
      setIsPlayingAudio(false);
    });
  };

  // --------------- Navigation ---------------

  const handleNext = () => {
    if (isLastStep) {
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
      const congrats = language === 'kn' 
        ? "ಅಭಿನಂದನೆಗಳು! ನೀವು ಈ ಕೆಲಸವನ್ನು ಯಶಸ್ವಿಯಾಗಿ ಮುಗಿಸಿದ್ದೀರಿ!"
        : language === 'hi'
        ? "बधाई हो! आपने यह कार्य सफलतापूर्वक सीख लिया है!"
        : "Congratulations! You have successfully mastered this lesson!";
      speechService.speak(congrats, language);
      if (onCompleteTask) onCompleteTask(guide.id);
    } else {
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
      prev: "Previous Step",
      next: "Next Step",
      finish: "Lesson Complete! ✓",
      repeat: "Repeat Spoken Instruction",
      startShare: "Start Live Screen Share",
      stopShare: "Stop Screen Share",
      shareActive: "Live Device Screen Feed Active",
      scanning: "AI is inspecting your screen...",
      found: "Target Located — Tap the highlighted button!",
      notFound: "Looking for target button on screen...",
      wrongApp: "Please switch to the target app.",
      homeScreen: "Please open the required app.",
      dialogBlocking: "Please dismiss any popups on your screen.",
      apiKeyLabel: "Configure Gemini API Key for Neural UI Element Detection",
      apiKeySave: "Verify & Save",
      apiKeyValidating: "Verifying Key...",
      reScan: "Scan Screen Now",
      autoScanOn: "Auto-Scan: ON",
      autoScanOff: "Auto-Scan: OFF",
      scans: "scans",
      tapHere: "Tap Here"
    },
    kn: {
      stepOf: `ಹಂತ ${currentStepIndex + 1} / ${steps.length}`,
      prev: "ಹಿಂದಿನ ಹಂತ",
      next: "ಮುಂದಿನ ಹಂತ",
      finish: "ಪಾಠ ಮುಗಿಯಿತು! ✓",
      repeat: "ಸೂಚನೆ ಮತ್ತೆ ಕೇಳಿ",
      startShare: "ಲೈವ್ ಸ್ಕ್ರೀನ್ ಹಂಚಿಕೊಳ್ಳಿ",
      stopShare: "ಸ್ಕ್ರೀನ್ ಹಂಚಿಕೆ ನಿಲ್ಲಿಸಿ",
      shareActive: "ನಿಮ್ಮ ಫೋನ್ ಸ್ಕ್ರೀನ್ ನೇರವಾಗಿ ಪ್ರದರ್ಶನಗೊಳ್ಳುತ್ತಿದೆ",
      scanning: "AI ನಿಮ್ಮ ಸ್ಕ್ರೀನ್ ನೋಡುತ್ತಿದೆ...",
      found: "ಬಟನ್ ಕಂಡುಬಂದಿದೆ — ಗುರುತಿಸಿದ ಜಾಗವನ್ನು ಒತ್ತಿರಿ!",
      notFound: "ಬಟನ್ ಹುಡುಕುತ್ತಿದೆ...",
      wrongApp: "ದಯವಿಟ್ಟು ಸರಿಯಾದ ಆ್ಯಪ್ ತೆರೆಯಿರಿ.",
      homeScreen: "ದಯವಿಟ್ಟು ಆ್ಯಪ್ ತೆರೆಯಿರಿ.",
      dialogBlocking: "ದಯವಿಟ್ಟು ಪಾಪ್-ಅಪ್ ಮುಚ್ಚಿರಿ.",
      apiKeyLabel: "ಲೈವ್ ಸ್ಕ್ರೀನ್ ಗುರುತಿಸುವಿಕೆಗಾಗಿ Gemini API Key ಸೇರಿಸಿ",
      apiKeySave: "ಪರಿಶೀಲಿಸಿ ಮತ್ತು ಉಳಿಸಿ",
      apiKeyValidating: "ಪರಿಶೀಲಿಸಲಾಗುತ್ತಿದೆ...",
      reScan: "ಈಗ ಸ್ಕ್ಯಾನ್ ಮಾಡಿ",
      autoScanOn: "ಆಟೋ-ಸ್ಕ್ಯಾನ್: ಆನ್",
      autoScanOff: "ಆಟೋ-ಸ್ಕ್ಯಾನ್: ಆಫ್",
      scans: "ಸ್ಕ್ಯಾನ್",
      tapHere: "ಇಲ್ಲಿ ಒತ್ತಿರಿ"
    },
    hi: {
      stepOf: `चरण ${currentStepIndex + 1} / ${steps.length}`,
      prev: "पिछला चरण",
      next: "अगला चरण",
      finish: "पाठ पूरा हुआ! ✓",
      repeat: "निर्देश दोबारा सुनें",
      startShare: "लाइव स्क्रीन शेयर करें",
      stopShare: "स्क्रीन शेयर बंद करें",
      shareActive: "आपकी स्क्रीन का लाइव दृश्य सक्रिय है",
      scanning: "AI आपकी स्क्रीन देख रहा है...",
      found: "बटन मिल गया — चिह्नित जगह पर टैप करें!",
      notFound: "बटन ढूंढ रहा है...",
      wrongApp: "कृपया सही ऐप खोलें।",
      homeScreen: "कृपया ऐप खोलें।",
      dialogBlocking: "कृपया स्क्रीन पर दिख रहा पॉप-अप बंद करें।",
      apiKeyLabel: "लाइव स्क्रीन पहचान के लिए Gemini API Key दर्ज करें",
      apiKeySave: "जांचें और सेव करें",
      apiKeyValidating: "जांच हो रही है...",
      reScan: "अभी स्कैन करें",
      autoScanOn: "ऑटो-स्कैन: चालू",
      autoScanOff: "ऑटो-स्कैन: बंद",
      scans: "स्कैन",
      tapHere: "यहाँ टैप करें"
    }
  };

  const labels = localizedLabels[language] || localizedLabels.en;

  // Status indicator
  const getStatusInfo = () => {
    if (!isScreenSharing) return null;
    if (isAnalyzing) return { text: labels.scanning, color: 'text-zinc-300', icon: Loader2, spin: true };
    if (!visionResult) return { text: labels.notFound, color: 'text-zinc-400', icon: Scan, spin: false };

    const state = visionResult.screenState;
    if (state === 'FOUND') return { text: labels.found, color: 'text-emerald-400', icon: CheckCircle2, spin: false };
    if (state === 'HOME_SCREEN') return { text: labels.homeScreen, color: 'text-amber-400', icon: AlertCircle, spin: false };
    if (state === 'WRONG_APP') return { text: labels.wrongApp, color: 'text-amber-400', icon: AlertCircle, spin: false };
    if (state === 'DIALOG_BLOCKING') return { text: labels.dialogBlocking, color: 'text-amber-400', icon: AlertCircle, spin: false };
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

        {/* Current Instruction Box */}
        <div className="mt-8 p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700">
          <p className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-white leading-snug">
            {currentStep.instruction[language] || currentStep.instruction.en}
          </p>

          {currentStep.tip && (
            <div className="mt-4 flex items-start space-x-2 text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 font-medium">
              <Info className="w-4 h-4 flex-shrink-0 mt-0.5 text-zinc-400" />
              <span>
                <strong>Note:</strong> {currentStep.tip[language] || currentStep.tip.en}
              </span>
            </div>
          )}
        </div>

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

      {/* LIVE SCREEN VIEW CONTAINER */}
      <div className="bg-zinc-950 rounded-3xl p-6 sm:p-10 text-white shadow-xl border border-zinc-800 mb-8">
        {/* Header Bar */}
        <div className="flex items-center justify-between text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-6 flex-wrap gap-2">
          <div className="flex items-center space-x-2">
            <Smartphone className="w-4 h-4 text-zinc-400" />
            <span>{isScreenSharing ? labels.shareActive : "Interactive Device Preview"}</span>
            {isScreenSharing && scanCount > 0 && (
              <span className="text-zinc-600 normal-case">({scanCount} {labels.scans})</span>
            )}
          </div>
          <span className="text-zinc-300 flex items-center font-bold">
            <Target className="w-3.5 h-3.5 mr-1" />
            Target: {currentStep.spotlightTarget}
          </span>
        </div>

        {/* Live Status Bar */}
        {statusInfo && (
          <div className={`flex items-center space-x-2 mb-4 text-xs font-semibold ${statusInfo.color}`}>
            <statusInfo.icon className={`w-4 h-4 ${statusInfo.spin ? 'animate-spin' : ''}`} />
            <span>{statusInfo.text}</span>
          </div>
        )}

        {/* AI Guidance Message */}
        {visionResult && visionResult.guidanceMessage && (
          <div className="mb-4 p-3.5 rounded-2xl bg-zinc-900 border border-zinc-800 text-sm font-medium text-zinc-200 leading-relaxed">
            <div className="flex items-start space-x-2">
              <Eye className="w-4 h-4 text-zinc-400 flex-shrink-0 mt-0.5" />
              <div>
                <span className="text-[10px] uppercase tracking-wider text-zinc-500 block mb-1">AI Co-Pilot</span>
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
                      ? "ನಿಮ್ಮ ನೈಜ ಫೋನ್ ಅಥವಾ ಆ್ಯಪ್ ಸ್ಕ್ರೀನ್ ಹಂಚಿಕೊಳ್ಳಿ"
                      : language === 'hi'
                      ? "अपनी असली फोन या ऐप स्क्रीन शेयर करें"
                      : "Share your phone or app window live"}
                  </p>
                  <p className="text-xs text-zinc-500 leading-relaxed max-w-xs">
                    {language === 'kn'
                      ? "ನೀವು ಸ್ಕ್ರೀನ್ ಹಂಚಿಕೊಂಡಾಗ, AI ನಿಮ್ಮ ವಾಟ್ಸಾಪ್ ಅಥವಾ ಫೋನ್‌ಪೇ ನೋಡಿ ಯಾವ ಬಟನ್ ಒತ್ತಬೇಕೆಂದು ನೈಜ ಸಮಯದಲ್ಲಿ ತೋರಿಸುತ್ತದೆ."
                      : language === 'hi'
                      ? "जब आप स्क्रीन शेयर करेंगे, AI आपके व्हाट्सएप या फोनपे में देखकर सही बटन पर लाइव हाइलाइट करेगा।"
                      : "The AI looks at your real screen feed to highlight buttons and text-boxes with zero mockups."}
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
                Powered by Gemini Vision Live Inspector
              </div>
            </div>
          )}

          {/* DYNAMIC SPOTLIGHT OVERLAY: HIGH CONTRAST GLOW WITHOUT DARKENING THE SCREEN */}
          <div 
            className="live-spotlight-box rounded-2xl flex flex-col items-center justify-center p-2 text-center cursor-pointer transition-all duration-300"
            style={{
              top: activeBox.top || '35%',
              left: activeBox.left || '15%',
              width: activeBox.width || '70%',
              height: activeBox.height || '15%',
            }}
            onClick={handleNext}
          >
            <div className="bg-black text-white px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider shadow-xl whitespace-nowrap mb-1 border border-zinc-700">
              🎯 {visionResult?.detectedLabel || currentStep.spotlightTarget}
            </div>
            <span className="text-[10px] font-black text-black bg-white px-2 py-0.5 rounded shadow-md tracking-wider">
              {labels.tapHere}
            </span>
          </div>

          {/* Scanning badge */}
          {isScreenSharing && isAnalyzing && (
            <div className="absolute top-3 right-3 flex items-center space-x-1.5 bg-black/80 border border-zinc-700 px-3 py-1 rounded-full z-40">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
              <span className="text-[10px] text-white font-semibold">AI Inspecting...</span>
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
