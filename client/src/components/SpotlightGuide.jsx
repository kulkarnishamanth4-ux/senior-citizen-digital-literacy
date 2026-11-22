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
  RefreshCw
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
  const [apiKeyStatus, setApiKeyStatus] = useState(null); // null | 'validating' | 'valid' | 'invalid'
  const [autoScanEnabled, setAutoScanEnabled] = useState(true);
  const [scanCount, setScanCount] = useState(0);

  const videoRef = useRef(null);
  const analysisTimerRef = useRef(null);
  const isMountedRef = useRef(true);

  const steps = guide.steps || [];
  const currentStep = steps[currentStepIndex] || steps[0];
  const isLastStep = currentStepIndex === steps.length - 1;

  const [isVisionReady, setIsVisionReady] = useState(() => Boolean(screenVisionService.getStoredApiKey()));

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

    if (isScreenSharing && autoScanEnabled && isVisionReady) {
      // Run an immediate first scan
      runSingleAnalysis();

      // Then repeat every 3.5 seconds
      analysisTimerRef.current = setInterval(() => {
        if (isMountedRef.current && !isAnalyzing) {
          runSingleAnalysis();
        }
      }, 3500);
    }

    return () => clearInterval(analysisTimerRef.current);
  }, [isScreenSharing, autoScanEnabled, currentStepIndex, isVisionReady]);

  // --------------- Screen Share ---------------

  const startScreenShare = async () => {
    setShareError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
        throw new Error("Screen sharing is not supported by this browser. Use Chrome/Edge on desktop or Android.");
      }

      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { cursor: "always", displaySurface: "window" },
        audio: false
      });

      setScreenStream(stream);
      setIsScreenSharing(true);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }

      stream.getVideoTracks()[0].onended = () => {
        stopScreenShare();
      };

      const notice = language === 'kn'
        ? "ಸ್ಕ್ರೀನ್ ಹಂಚಿಕೆ ಸಕ್ರಿಯಗೊಂಡಿದೆ. AI ನಿಮ್ಮ ಸ್ಕ್ರೀನ್ ನೋಡುತ್ತಿದೆ."
        : language === 'hi'
        ? "स्क्रीन शेयर शुरू हो गया है। AI आपकी स्क्रीन देख रहा है।"
        : "Screen share active. AI is now watching your live screen to find the right button for you.";
      speechService.speak(notice, language);

      // If vision is not confirmed ready, check or prompt for key
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
      screenStream.getTracks().forEach(track => track.stop());
    }
    setScreenStream(null);
    setIsScreenSharing(false);
    setVisionResult(null);
    setIsAnalyzing(false);
  };

  // --------------- Gemini Vision Analysis ---------------

  const runSingleAnalysis = useCallback(async () => {
    if (!videoRef.current || !isScreenSharing) return;
    if (isAnalyzing) return;

    setIsAnalyzing(true);
    setAnalysisError(null);

    try {
      const result = await screenVisionService.analyzeLiveScreen({
        videoElement: videoRef.current,
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

        // Speak the guidance on first successful detection, or when state changes
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

      // Start scanning immediately
      setTimeout(() => runSingleAnalysis(), 500);
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
      repeat: "Repeat Instruction",
      startShare: "Share Your Screen",
      stopShare: "Stop Screen Share",
      shareActive: "Live Screen Analysis Active",
      scanning: "AI is scanning your screen...",
      found: "Target Found — Tap the highlighted area!",
      notFound: "Looking for the target element...",
      wrongApp: "Please open the correct app first.",
      homeScreen: "Please open the app to get started.",
      dialogBlocking: "Please close any popups on your screen.",
      apiKeyLabel: "Enter your Gemini API Key for live screen analysis",
      apiKeySave: "Verify & Save",
      apiKeyValidating: "Verifying...",
      reScan: "Re-scan Screen",
      autoScanOn: "Auto-Scan: ON",
      autoScanOff: "Auto-Scan: OFF",
      scans: "scans"
    },
    kn: {
      stepOf: `ಹಂತ ${currentStepIndex + 1} / ${steps.length}`,
      prev: "ಹಿಂದಿನ ಹಂತ",
      next: "ಮುಂದಿನ ಹಂತ",
      finish: "ಪಾಠ ಮುಗಿಯಿತು! ✓",
      repeat: "ಸೂಚನೆ ಮತ್ತೆ ಕೇಳಿ",
      startShare: "ನಿಮ್ಮ ಸ್ಕ್ರೀನ್ ಹಂಚಿಕೊಳ್ಳಿ",
      stopShare: "ಸ್ಕ್ರೀನ್ ಹಂಚಿಕೆ ನಿಲ್ಲಿಸಿ",
      shareActive: "ಲೈವ್ ಸ್ಕ್ರೀನ್ AI ವಿಶ್ಲೇಷಣೆ ಸಕ್ರಿಯ",
      scanning: "AI ನಿಮ್ಮ ಸ್ಕ್ರೀನ್ ನೋಡುತ್ತಿದೆ...",
      found: "ಬಟನ್ ಕಂಡುಬಂದಿದೆ — ಗುರುತಿಸಿದ ಜಾಗವನ್ನು ಒತ್ತಿರಿ!",
      notFound: "ಬಟನ್ ಹುಡುಕುತ್ತಿದೆ...",
      wrongApp: "ದಯವಿಟ್ಟು ಮೊದಲು ಸರಿಯಾದ ಅಪ್ಲಿಕೇಶನ್ ತೆರೆಯಿರಿ.",
      homeScreen: "ದಯವಿಟ್ಟು ಅಪ್ಲಿಕೇಶನ್ ತೆರೆಯಿರಿ.",
      dialogBlocking: "ದಯವಿಟ್ಟು ಸ್ಕ್ರೀನ್ ಮೇಲಿನ ಪಾಪ್-ಅಪ್ ಮುಚ್ಚಿರಿ.",
      apiKeyLabel: "ಲೈವ್ ಸ್ಕ್ರೀನ್ ಗುರುತಿಸುವಿಕೆಗಾಗಿ Gemini API Key ನಮೂದಿಸಿ",
      apiKeySave: "ಪರಿಶೀಲಿಸಿ ಮತ್ತು ಉಳಿಸಿ",
      apiKeyValidating: "ಪರಿಶೀಲಿಸಲಾಗುತ್ತಿದೆ...",
      reScan: "ಮತ್ತೆ ಸ್ಕ್ಯಾನ್ ಮಾಡಿ",
      autoScanOn: "ಆಟೋ-ಸ್ಕ್ಯಾನ್: ಆನ್",
      autoScanOff: "ಆಟೋ-ಸ್ಕ್ಯಾನ್: ಆಫ್",
      scans: "ಸ್ಕ್ಯಾನ್"
    },
    hi: {
      stepOf: `चरण ${currentStepIndex + 1} / ${steps.length}`,
      prev: "पिछला चरण",
      next: "अगला चरण",
      finish: "पाठ पूरा हुआ! ✓",
      repeat: "निर्देश दोबारा सुनें",
      startShare: "अपनी स्क्रीन शेयर करें",
      stopShare: "स्क्रीन शेयर बंद करें",
      shareActive: "लाइव स्क्रीन AI विश्लेषण सक्रिय",
      scanning: "AI आपकी स्क्रीन देख रहा है...",
      found: "बटन मिल गया — चिह्नित जगह पर टैप करें!",
      notFound: "बटन ढूंढ रहा है...",
      wrongApp: "कृपया पहले सही ऐप खोलें।",
      homeScreen: "कृपया ऐप खोलें।",
      dialogBlocking: "कृपया स्क्रीन पर दिख रहा पॉप-अप बंद करें।",
      apiKeyLabel: "लाइव स्क्रीन पहचान के लिए Gemini API Key दर्ज करें",
      apiKeySave: "जांचें और सेव करें",
      apiKeyValidating: "जांच हो रही है...",
      reScan: "फिर से स्कैन करें",
      autoScanOn: "ऑटो-स्कैन: चालू",
      autoScanOff: "ऑटो-स्कैन: बंद",
      scans: "स्कैन"
    }
  };

  const labels = localizedLabels[language] || localizedLabels.en;

  // --------------- Status indicator text ---------------

  const getStatusInfo = () => {
    if (!isScreenSharing) return null;
    if (isAnalyzing) return { text: labels.scanning, color: 'text-zinc-400', icon: Loader2, spin: true };
    if (!isVisionReady) return { text: labels.apiKeyLabel, color: 'text-yellow-400', icon: Key, spin: false };
    if (!visionResult) return { text: labels.notFound, color: 'text-zinc-500', icon: Scan, spin: false };

    const state = visionResult.screenState;
    if (state === 'FOUND') return { text: labels.found, color: 'text-emerald-400', icon: CheckCircle2, spin: false };
    if (state === 'HOME_SCREEN') return { text: labels.homeScreen, color: 'text-amber-400', icon: AlertCircle, spin: false };
    if (state === 'WRONG_APP') return { text: labels.wrongApp, color: 'text-amber-400', icon: AlertCircle, spin: false };
    if (state === 'DIALOG_BLOCKING') return { text: labels.dialogBlocking, color: 'text-amber-400', icon: AlertCircle, spin: false };
    return { text: labels.notFound, color: 'text-zinc-500', icon: Scan, spin: false };
  };

  const statusInfo = getStatusInfo();

  // --------------- Render ---------------

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-fade-in">
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
                className="flex items-center space-x-2 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-black text-white dark:bg-white dark:text-black hover:opacity-90 transition-all shadow-xs"
                title="Share your device screen so AI can find the right buttons for you"
              >
                <ScreenShare className="w-3.5 h-3.5" />
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
                  disabled={isAnalyzing || !isVisionReady}
                  className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-zinc-800 text-white hover:bg-zinc-700 transition-all border border-zinc-600 disabled:opacity-40"
                  title="Manually trigger a new scan"
                >
                  <RefreshCw className={`w-3 h-3 ${isAnalyzing ? 'animate-spin' : ''}`} />
                  <span>{labels.reScan}</span>
                </button>

                {/* Auto-Scan Toggle */}
                <button
                  onClick={() => setAutoScanEnabled(prev => !prev)}
                  className={`px-2.5 py-1.5 rounded-xl text-[10px] font-bold border transition-all ${
                    autoScanEnabled
                      ? 'bg-emerald-900/40 text-emerald-300 border-emerald-700'
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

        {/* Current Instruction */}
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
          <div className="mt-4 p-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 text-xs text-zinc-700 dark:text-zinc-300">
            {shareError}
          </div>
        )}
      </div>

      {/* API KEY INPUT MODAL (shown when needed) */}
      {showApiKeyInput && (
        <div className="bg-zinc-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-zinc-800 mb-8">
          <div className="flex items-center space-x-2 mb-4">
            <Key className="w-5 h-5 text-zinc-400" />
            <h3 className="text-base font-bold">{labels.apiKeyLabel}</h3>
          </div>

          <p className="text-xs text-zinc-400 mb-4 leading-relaxed">
            {language === 'kn'
              ? "ನಿಮ್ಮ ನೈಜ ಸ್ಕ್ರೀನ್ ಅನ್ನು ನೋಡಿ ಬಟನ್‌ಗಳನ್ನು ಗುರುತಿಸಲು AI ಗೆ Gemini API Key ಬೇಕು. ಇದನ್ನು ಒಮ್ಮೆ ನಮೂದಿಸಿ, ಇನ್ನು ಮುಂದೆ ನೆನಪಿನಲ್ಲಿಡಲಾಗುತ್ತದೆ."
              : language === 'hi'
              ? "AI को आपकी स्क्रीन देखकर बटन पहचानने के लिए Gemini API Key चाहिए। एक बार दर्ज करें, यह याद रखा जाएगा।"
              : "The AI needs a Gemini API key to look at your screen and identify buttons. Enter it once and it will be remembered."}
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
            <p className="mt-3 text-xs text-emerald-400 font-semibold">✓ Key verified! Starting live analysis...</p>
          )}
          {apiKeyStatus === 'invalid' && (
            <p className="mt-3 text-xs text-red-400 font-semibold">✗ Invalid key. Please check and try again.</p>
          )}

          <p className="mt-4 text-[10px] text-zinc-600 leading-relaxed">
            Get a free API key at{' '}
            <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer" className="underline text-zinc-400 hover:text-white">
              aistudio.google.com/apikey
            </a>
            . Your key is stored only in this browser and never shared.
          </p>
        </div>
      )}

      {/* LIVE SCREEN VIEW WITH REAL AI BOUNDING BOX */}
      <div className="bg-zinc-950 rounded-3xl p-6 sm:p-10 text-white shadow-xl border border-zinc-800 mb-8">
        {/* Header Bar */}
        <div className="flex items-center justify-between text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-6 flex-wrap gap-2">
          <div className="flex items-center space-x-2">
            <Smartphone className="w-4 h-4 text-zinc-400" />
            <span>{isScreenSharing ? labels.shareActive : "Interactive Device View"}</span>
            {isScreenSharing && scanCount > 0 && (
              <span className="text-zinc-600 normal-case">({scanCount} {labels.scans})</span>
            )}
          </div>
          <span className="text-zinc-300 flex items-center font-bold">
            <Target className="w-3.5 h-3.5 mr-1" />
            Target: {currentStep.spotlightTarget}
          </span>
        </div>

        {/* Status Bar */}
        {statusInfo && (
          <div className={`flex items-center space-x-2 mb-4 text-xs font-semibold ${statusInfo.color}`}>
            <statusInfo.icon className={`w-4 h-4 ${statusInfo.spin ? 'animate-spin' : ''}`} />
            <span>{statusInfo.text}</span>
          </div>
        )}

        {/* AI Guidance Message */}
        {visionResult && visionResult.guidanceMessage && (
          <div className="mb-4 p-3 rounded-2xl bg-zinc-900 border border-zinc-800 text-sm font-medium text-zinc-200 leading-relaxed">
            <div className="flex items-start space-x-2">
              <Eye className="w-4 h-4 text-zinc-400 flex-shrink-0 mt-0.5" />
              <div>
                <span className="text-[10px] uppercase tracking-wider text-zinc-500 block mb-1">AI Co-Pilot</span>
                {visionResult.guidanceMessage}
              </div>
            </div>
          </div>
        )}

        {/* Analysis Error */}
        {analysisError && (
          <div className="mb-4 p-3 rounded-xl bg-zinc-900 border border-red-900/40 text-xs text-red-300">
            {analysisError}
          </div>
        )}

        {/* Video Frame with Live Bounding Box Overlay */}
        <div className="relative mx-auto max-w-md h-96 bg-black rounded-3xl border border-zinc-800 overflow-hidden shadow-2xl flex flex-col justify-between">
          {isScreenSharing ? (
            <div className="absolute inset-0 w-full h-full">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-contain bg-black"
              />
            </div>
          ) : (
            /* Mockup placeholder when screen share is off */
            <div className="absolute inset-0 flex flex-col justify-between p-5">
              <div className="flex justify-between items-center text-[11px] text-zinc-600 pb-2 border-b border-zinc-900">
                <span>9:41 AM</span>
                <span>LTE 100%</span>
              </div>
              <div className="flex-1 flex flex-col items-center justify-center text-center px-6 space-y-4">
                <ScreenShare className="w-12 h-12 text-zinc-700" />
                <p className="text-sm text-zinc-600 font-medium leading-relaxed">
                  {language === 'kn'
                    ? "ನಿಮ್ಮ ಸ್ಕ್ರೀನ್ ಹಂಚಿಕೊಂಡಾಗ, AI ನಿಮಗೆ ಯಾವ ಬಟನ್ ಒತ್ತಬೇಕೆಂದು ತೋರಿಸುತ್ತದೆ."
                    : language === 'hi'
                    ? "जब आप स्क्रीन शेयर करेंगे, AI आपको बताएगा कि कौन सा बटन दबाना है।"
                    : "When you share your screen, the AI will look at it and show you exactly which button to tap."}
                </p>
              </div>
              <div className="text-[10px] text-zinc-700 text-center pb-2">
                Powered by Gemini Vision
              </div>
            </div>
          )}

          {/* REAL AI-DETECTED BOUNDING BOX OVERLAY */}
          {isScreenSharing && visionResult && visionResult.found && visionResult.cssBox && (
            <div 
              className="spotlight-active absolute rounded-2xl bg-white/10 border-3 border-white backdrop-blur-xs flex flex-col items-center justify-center p-2 text-center cursor-pointer transition-all duration-500"
              style={{
                top: visionResult.cssBox.top,
                left: visionResult.cssBox.left,
                width: visionResult.cssBox.width,
                height: visionResult.cssBox.height,
              }}
              onClick={handleNext}
            >
              <div className="bg-black text-white px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider shadow-md whitespace-nowrap mb-1">
                🎯 {visionResult.detectedLabel || currentStep.spotlightTarget}
              </div>
              <span className="text-[10px] font-extrabold text-white bg-zinc-900/90 px-2 py-0.5 rounded shadow-sm">
                {language === 'kn' ? 'ಇಲ್ಲಿ ಒತ್ತಿರಿ' : language === 'hi' ? 'यहाँ टैप करें' : 'Tap Here'}
              </span>
            </div>
          )}

          {/* Scanning Indicator Overlay */}
          {isScreenSharing && isAnalyzing && (
            <div className="absolute top-3 right-3 flex items-center space-x-1.5 bg-black/70 px-2.5 py-1 rounded-full z-20">
              <Loader2 className="w-3 h-3 animate-spin text-white" />
              <span className="text-[10px] text-white font-semibold">Scanning...</span>
            </div>
          )}

          {/* Confidence Badge */}
          {isScreenSharing && visionResult && visionResult.found && (
            <div className="absolute bottom-3 right-3 bg-emerald-900/70 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full z-20">
              {Math.round(visionResult.confidence * 100)}% confident
            </div>
          )}

          {/* Bottom Status Banner */}
          <div className="relative z-10 text-center text-[11px] text-zinc-400 bg-black/80 py-2 border-t border-zinc-900 mt-auto">
            {isScreenSharing && visionResult?.found
              ? (language === 'kn' ? 'AI ಗುರಿ ಗುರುತಿಸಿದೆ: ನಿಮ್ಮ ಆ್ಯಪ್‌ನಲ್ಲಿ ಈ ಬಟನ್ ಒತ್ತಿರಿ.' 
                 : language === 'hi' ? 'AI ने बटन पहचाना: अपने ऐप में इस पर टैप करें।'
                 : 'AI detected the target on your real screen. Tap the highlighted area in your app.')
              : isScreenSharing
              ? (language === 'kn' ? 'AI ನಿಮ್ಮ ಸ್ಕ್ರೀನ್ ನೋಡುತ್ತಿದೆ...'
                 : language === 'hi' ? 'AI आपकी स्क्रीन देख रहा है...'
                 : 'AI is analyzing your live screen...')
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
