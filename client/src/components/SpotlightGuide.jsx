import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  ArrowRight, 
  RotateCcw, 
  Volume2, 
  CheckCircle2, 
  Sparkles,
  Info,
  Smartphone
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

  const steps = guide.steps || [];
  const currentStep = steps[currentStepIndex] || steps[0];
  const isLastStep = currentStepIndex === steps.length - 1;

  useEffect(() => {
    // Speak the step aloud automatically on step change
    speakCurrentStep();
  }, [currentStepIndex, language]);

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
        ? "ಅಭಿನಂದನೆಗಳು! ನೀವು ಈ ಕೆಲಸವನ್ನು ಯಶಸ್ವಿಯಾಗಿ ಕಲಿತಿದ್ದೀರಿ!"
        : language === 'hi'
        ? "बधाई हो! आपने यह कार्य सफलतापूर्वक सीख लिया है!"
        : "Congratulations! You have successfully mastered this task!";
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
      finish: "Task Complete! 🎉",
      repeat: "Repeat Spoken Instruction",
      spotlightNotice: "Spotlight Active: Tap only the glowing highlighted area below."
    },
    kn: {
      stepOf: `ಹಂತ ${currentStepIndex + 1} / ${steps.length}`,
      prev: "ಹಿಂದಿನ ಹಂತ",
      next: "ಮುಂದಿನ ಹಂತ",
      finish: "ಕೆಲಸ ಮುಗಿಯಿತು! 🎉",
      repeat: "ಸೂಚನೆಯನ್ನು ಮತ್ತೆ ಕೇಳಿ",
      spotlightNotice: "ಸ್ಪಾಟ್‌ಲೈಟ್ ಆನ್ ಆಗಿದೆ: ಕೆಳಗೆ ಹಳದಿ ಬಣ್ಣದಲ್ಲಿ ಹೊಳೆಯುತ್ತಿರುವ ಜಾಗವನ್ನು ಮಾತ್ರ ಒತ್ತಿರಿ."
    },
    hi: {
      stepOf: `चरण ${currentStepIndex + 1} / ${steps.length}`,
      prev: "पिछला चरण",
      next: "अगला चरण",
      finish: "कार्य पूरा हुआ! 🎉",
      repeat: "आवाज दोबारा सुनें",
      spotlightNotice: "स्पॉटलाइट चालू: नीचे पीले रंग में चमक रहे स्थान पर ही टैप करें।"
    }
  };

  const labels = localizedLabels[language] || localizedLabels.en;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 animate-fade-in">
      {/* Top Navigation */}
      <button
        onClick={() => {
          speechService.stopSpeaking();
          onBack();
        }}
        className="flex items-center space-x-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 font-bold mb-4"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Back to All Guides</span>
      </button>

      {/* Guide Header Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border-2 border-slate-200 dark:border-slate-800 shadow-md mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <span className="px-4 py-1.5 rounded-full bg-amber-100 text-amber-900 dark:bg-amber-950/80 dark:text-amber-300 text-sm font-extrabold uppercase tracking-wide">
            {labels.stepOf}
          </span>

          <button
            onClick={speakCurrentStep}
            className={`flex items-center space-x-2 px-4 py-2 rounded-2xl text-sm font-bold transition-all shadow-sm ${
              isPlayingAudio
                ? 'bg-amber-400 text-slate-950 scale-102 ring-4 ring-amber-200'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200'
            }`}
          >
            <Volume2 className="w-4 h-4 text-amber-600" />
            <span>{labels.repeat}</span>
          </button>
        </div>

        <h2 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white mb-2">
          {guide.title[language] || guide.title.en}
        </h2>
        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 font-medium">
          {guide.description[language] || guide.description.en}
        </p>

        {/* Current Instruction Box */}
        <div className="mt-6 p-6 rounded-2xl bg-amber-50/80 dark:bg-amber-950/40 border-2 border-amber-300 dark:border-amber-700">
          <p className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-amber-100 leading-snug">
            {currentStep.instruction[language] || currentStep.instruction.en}
          </p>

          {currentStep.tip && (
            <div className="mt-4 flex items-start space-x-2 text-sm sm:text-base text-amber-900 dark:text-amber-200 font-medium">
              <Info className="w-5 h-5 flex-shrink-0 mt-0.5 text-amber-600" />
              <span>
                <strong>Tip:</strong> {currentStep.tip[language] || currentStep.tip.en}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Simulated Screen with "Spotlight Scaffolding" */}
      <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-2xl border-4 border-slate-700 mb-6">
        <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
          <div className="flex items-center space-x-2">
            <Smartphone className="w-4 h-4 text-amber-400" />
            <span>Interactive Phone Screen Mockup</span>
          </div>
          <span className="text-amber-400 flex items-center">
            <Sparkles className="w-3.5 h-3.5 mr-1" />
            {labels.spotlightNotice}
          </span>
        </div>

        {/* Mock Phone Frame */}
        <div className="relative mx-auto max-w-sm h-80 bg-slate-950 rounded-2xl border-2 border-slate-800 p-4 flex flex-col justify-between overflow-hidden shadow-inner">
          {/* Top Status Bar */}
          <div className="flex justify-between items-center text-xs text-slate-500 pb-2 border-b border-slate-900">
            <span>9:41 AM</span>
            <span>LTE 100%</span>
          </div>

          {/* Screen Content with Dimming and Spotlight */}
          <div className="flex-1 flex flex-col items-center justify-center relative">
            {/* Background elements are dimmed */}
            <div className="absolute inset-0 opacity-20 pointer-events-none flex flex-col justify-around py-4">
              <div className="h-6 w-3/4 bg-slate-700 rounded"></div>
              <div className="h-20 w-full bg-slate-800 rounded"></div>
              <div className="h-8 w-1/2 bg-slate-700 rounded"></div>
            </div>

            {/* Glowing Spotlight Target */}
            <div className="spotlight-active p-4 rounded-2xl bg-amber-500 text-slate-950 font-black text-center shadow-2xl flex flex-col items-center space-y-1 z-10 cursor-pointer"
                 onClick={handleNext}
            >
              <Sparkles className="w-6 h-6 animate-spin text-slate-950" />
              <span className="text-lg tracking-tight">
                {currentStep.spotlightTarget}
              </span>
              <span className="text-xs uppercase font-extrabold bg-slate-950 text-amber-400 px-2 py-0.5 rounded">
                Tap Here To Continue
              </span>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="text-center text-xs text-slate-600 pt-2 border-t border-slate-900">
            Step {currentStepIndex + 1} of {steps.length}
          </div>
        </div>
      </div>

      {/* Large Navigation Controls (≥60px height for seniors) */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <button
          onClick={handlePrev}
          disabled={currentStepIndex === 0}
          className={`w-full sm:w-auto min-h-[60px] px-6 py-4 rounded-2xl font-black text-lg flex items-center justify-center space-x-2 transition-all ${
            currentStepIndex === 0
              ? 'opacity-30 cursor-not-allowed bg-slate-200 dark:bg-slate-800 text-slate-400'
              : 'bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-100 hover:bg-slate-300'
          }`}
        >
          <ArrowLeft className="w-6 h-6" />
          <span>{labels.prev}</span>
        </button>

        <button
          onClick={handleNext}
          className={`w-full sm:w-auto min-h-[60px] px-8 py-4 rounded-2xl font-black text-xl flex items-center justify-center space-x-3 transition-all shadow-lg ${
            isLastStep
              ? 'bg-emerald-500 text-white hover:bg-emerald-600 scale-102'
              : 'bg-amber-500 text-slate-950 hover:bg-amber-400 hover:scale-102'
          }`}
        >
          <span>{isLastStep ? labels.finish : labels.next}</span>
          {isLastStep ? <CheckCircle2 className="w-6 h-6" /> : <ArrowRight className="w-6 h-6" />}
        </button>
      </div>
    </div>
  );
}
