import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, 
  ArrowRight, 
  Volume2, 
  CheckCircle2, 
  Sparkles, 
  Info, 
  Smartphone, 
  ScreenShare, 
  StopCircle, 
  Eye, 
  Target, 
  Layers
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { speechService } from '../services/speechService';

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

  const videoRef = useRef(null);

  const steps = guide.steps || [];
  const currentStep = steps[currentStepIndex] || steps[0];
  const isLastStep = currentStepIndex === steps.length - 1;

  // Compute realistic target location percentage for live screen overlay
  const getTargetCoordinates = (targetName = '') => {
    const t = targetName.toLowerCase();
    if (t.includes('video') || t.includes('dots') || t.includes('menu') || t.includes('camera icon')) {
      return { top: '12%', right: '8%', width: '18%', height: '8%', labelPos: 'bottom' };
    }
    if (t.includes('send') || t.includes('mic') || t.includes('microphone') || t.includes('submit')) {
      return { bottom: '10%', right: '8%', width: '20%', height: '10%', labelPos: 'top' };
    }
    if (t.includes('paperclip') || t.includes('attachment') || t.includes('type') || t.includes('keyboard')) {
      return { bottom: '10%', left: '8%', width: '22%', height: '10%', labelPos: 'top' };
    }
    if (t.includes('contact') || t.includes('recipient') || t.includes('name') || t.includes('header')) {
      return { top: '22%', left: '15%', width: '70%', height: '10%', labelPos: 'bottom' };
    }
    if (t.includes('torch') || t.includes('flashlight') || t.includes('slider') || t.includes('timeout')) {
      return { top: '35%', left: '20%', width: '60%', height: '14%', labelPos: 'bottom' };
    }
    // Default center-middle
    return { top: '45%', left: '15%', width: '70%', height: '15%', labelPos: 'bottom' };
  };

  const targetCoords = getTargetCoordinates(currentStep.spotlightTarget);

  useEffect(() => {
    speakCurrentStep();
  }, [currentStepIndex, language]);

  // Clean up screen stream on unmount
  useEffect(() => {
    return () => {
      stopScreenShare();
    };
  }, []);

  const startScreenShare = async () => {
    setShareError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
        throw new Error("Screen sharing is not supported by this browser. Use Chrome/Edge on desktop or Android.");
      }

      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          cursor: "always",
          displaySurface: "window"
        },
        audio: false
      });

      setScreenStream(stream);
      setIsScreenSharing(true);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }

      // Handle user stopping screen share via native browser bar
      stream.getVideoTracks()[0].onended = () => {
        stopScreenShare();
      };

      const notice = language === 'kn'
        ? "ಸ್ಕ್ರೀನ್ ಹಂಚಿಕೆ ಸಕ್ರಿಯಗೊಂಡಿದೆ. ಈಗ ನಿಮ್ಮ ಸ್ಕ್ರೀನ್ ಮೇಲೆ ಗುಂಡಿಗಳನ್ನು ಹೈಲೈಟ್ ಮಾಡಲಾಗುತ್ತದೆ."
        : language === 'hi'
        ? "स्क्रीन शेयर शुरू हो गया है। अब आपकी असली स्क्रीन पर बटन रेखांकित किए जाएंगे।"
        : "Live Screen Share active. Looking at your screen to highlight the exact buttons.";
      speechService.speak(notice, language);

    } catch (err) {
      console.warn("Screen share error:", err);
      if (err.name !== 'NotAllowedError') {
        setShareError(err.message || "Could not start screen capture.");
      }
    }
  };

  const stopScreenShare = () => {
    if (screenStream) {
      screenStream.getTracks().forEach(track => track.stop());
    }
    setScreenStream(null);
    setIsScreenSharing(false);
  };

  const speakCurrentStep = () => {
    if (!currentStep) return;
    setIsPlayingAudio(true);
    const instructionText = currentStep.instruction[language] || currentStep.instruction.en;
    const tipText = currentStep.tip ? ` Tip: ${currentStep.tip[language] || currentStep.tip.en}` : '';
    
    speechService.speak(`${instructionText} ${tipText}`, language, () => {
      setIsPlayingAudio(false);
    });
  };

  const handleNext = () => {
    if (isLastStep) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
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

  const localizedLabels = {
    en: {
      stepOf: `Step ${currentStepIndex + 1} of ${steps.length}`,
      prev: "Previous Step",
      next: "Next Step",
      finish: "Lesson Complete! ✓",
      repeat: "Repeat Spoken Instruction",
      startShare: "Ask Device to Screen-Share (Live App Highlight)",
      stopShare: "Stop Screen Share",
      shareActive: "Live Device Screen Mirroring Active",
      spotlightNotice: "Target Locked: Tap this highlighted area in your app."
    },
    kn: {
      stepOf: `ಹಂತ ${currentStepIndex + 1} / ${steps.length}`,
      prev: "ಹಿಂದಿನ ಹಂತ",
      next: "ಮುಂದಿನ ಹಂತ",
      finish: "ಪಾಠ ಮುಗಿಯಿತು! ✓",
      repeat: "ಸೂಚನೆ ಮತ್ತೆ ಕೇಳಿ",
      startShare: "ನನ್ನ ಸ್ಕ್ರೀನ್ ಹಂಚಿಕೊಳ್ಳಿ (ನೈಜ ಆ್ಯಪ್‌ನಲ್ಲಿ ಗುರುತಿಸಿ)",
      stopShare: "ಸ್ಕ್ರೀನ್ ಹಂಚಿಕೆ ನಿಲ್ಲಿಸಿ",
      shareActive: "ನಿಮ್ಮ ಫೋನ್ ಸ್ಕ್ರೀನ್ ನೇರವಾಗಿ ಪ್ರದರ್ಶನಗೊಳ್ಳುತ್ತಿದೆ",
      spotlightNotice: "ಗುರಿ ಗುರುತಿಸಲಾಗಿದೆ: ನಿಮ್ಮ ಆ್ಯಪ್‌ನಲ್ಲಿ ಈ ಬಟನ್ ಒತ್ತಿರಿ."
    },
    hi: {
      stepOf: `चरण ${currentStepIndex + 1} / ${steps.length}`,
      prev: "पिछला चरण",
      next: "अगला चरण",
      finish: "पाठ पूरा हुआ! ✓",
      repeat: "निर्देश दोबारा सुनें",
      startShare: "स्क्रीन शेयर करें (असली ऐप में बटन दिखाएं)",
      stopShare: "स्क्रीन शेयर बंद करें",
      shareActive: "आपकी स्क्रीन का लाइव दृश्य सक्रिय है",
      spotlightNotice: "लक्ष्य चिह्नित: अपने ऐप में इस बटन पर टैप करें।"
    }
  };

  const labels = localizedLabels[language] || localizedLabels.en;

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

      {/* Guide Header Card in Refined Monochrome */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-10 border border-zinc-200 dark:border-zinc-800 shadow-xs mb-8">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <span className="px-3 py-1 rounded-full bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200 text-xs font-bold uppercase tracking-wider border border-zinc-200 dark:border-zinc-700">
            {labels.stepOf}
          </span>

          <div className="flex items-center space-x-2">
            {/* Screen Share Trigger Button */}
            {!isScreenSharing ? (
              <button
                onClick={startScreenShare}
                className="flex items-center space-x-2 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-black text-white dark:bg-white dark:text-black hover:opacity-90 transition-all shadow-xs"
                title="Requests device screen share to highlight buttons on the live app"
              >
                <ScreenShare className="w-3.5 h-3.5" />
                <span>{labels.startShare}</span>
              </button>
            ) : (
              <button
                onClick={stopScreenShare}
                className="flex items-center space-x-2 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-zinc-800 text-white hover:bg-zinc-700 transition-all border border-zinc-600"
              >
                <StopCircle className="w-3.5 h-3.5 text-red-400" />
                <span>{labels.stopShare}</span>
              </button>
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
          <div className="mt-4 p-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 text-xs text-zinc-700 dark:text-zinc-300">
            {shareError}
          </div>
        )}
      </div>

      {/* SCREEN CAPTURE & SPOTLIGHT OVERLAY VIEW */}
      <div className="bg-zinc-950 rounded-3xl p-6 sm:p-10 text-white shadow-xl border border-zinc-800 mb-8">
        <div className="flex items-center justify-between text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-6">
          <div className="flex items-center space-x-2">
            <Smartphone className="w-4 h-4 text-zinc-400" />
            <span>{isScreenSharing ? labels.shareActive : "Interactive Device View"}</span>
          </div>
          <span className="text-zinc-300 flex items-center font-bold">
            <Target className="w-3.5 h-3.5 mr-1" />
            Target: {currentStep.spotlightTarget}
          </span>
        </div>

        {/* View Frame: Live Screen Share Feed OR Interactive View */}
        <div className="relative mx-auto max-w-md h-96 bg-black rounded-3xl border border-zinc-800 overflow-hidden shadow-2xl flex flex-col justify-between">
          {/* Live Video Element for User's Actual Screen Share */}
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
            /* Mockup Device Content when screen share is off */
            <div className="absolute inset-0 flex flex-col justify-between p-5">
              <div className="flex justify-between items-center text-[11px] text-zinc-600 pb-2 border-b border-zinc-900">
                <span>9:41 AM</span>
                <span>LTE 100%</span>
              </div>
              <div className="flex-1 flex flex-col justify-around py-4 opacity-20">
                <div className="h-5 w-3/4 bg-zinc-700 rounded"></div>
                <div className="h-20 w-full bg-zinc-800 rounded"></div>
                <div className="h-6 w-1/2 bg-zinc-700 rounded"></div>
              </div>
            </div>
          )}

          {/* DYNAMIC SPOTLIGHT BOUNDING BOX OVERLAY (Appears over live screen OR mockup) */}
          <div 
            className="spotlight-active absolute rounded-2xl bg-white/20 border-3 border-white backdrop-blur-xs flex flex-col items-center justify-center p-3 text-center cursor-pointer transition-all duration-300"
            style={{
              top: targetCoords.top || 'auto',
              bottom: targetCoords.bottom || 'auto',
              left: targetCoords.left || 'auto',
              right: targetCoords.right || 'auto',
              width: targetCoords.width || '60%',
              height: targetCoords.height || '15%'
            }}
            onClick={handleNext}
          >
            <div className="bg-black text-white px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider shadow-md whitespace-nowrap mb-1">
              🎯 {currentStep.spotlightTarget}
            </div>
            <span className="text-[10px] font-extrabold text-white bg-zinc-900/90 px-2 py-0.5 rounded shadow-sm">
              Tap Here
            </span>
          </div>

          {/* Bottom Step Indicator Banner */}
          <div className="relative z-10 text-center text-[11px] text-zinc-400 bg-black/80 py-2 border-t border-zinc-900">
            {labels.spotlightNotice}
          </div>
        </div>
      </div>

      {/* Large Navigation Controls (≥60px height for seniors) */}
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
