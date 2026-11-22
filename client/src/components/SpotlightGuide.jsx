import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  ArrowRight, 
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
      finish: "Task Complete! ✓",
      repeat: "Repeat Spoken Instruction",
      spotlightNotice: "Spotlight Active: Tap the highlighted target below."
    },
    kn: {
      stepOf: `ಹಂತ ${currentStepIndex + 1} / ${steps.length}`,
      prev: "ಹಿಂದಿನ ಹಂತ",
      next: "ಮುಂದಿನ ಹಂತ",
      finish: "ಕೆಲಸ ಮುಗಿಯಿತು! ✓",
      repeat: "ಸೂಚನೆಯನ್ನು ಮತ್ತೆ ಕೇಳಿ",
      spotlightNotice: "ಸ್ಪಾಟ್‌ಲೈಟ್ ಆನ್ ಆಗಿದೆ: ಕೆಳಗೆ ಹೈಲೈಟ್ ಆಗಿರುವ ಜಾಗವನ್ನು ಒತ್ತಿರಿ."
    },
    hi: {
      stepOf: `चरण ${currentStepIndex + 1} / ${steps.length}`,
      prev: "पिछला चरण",
      next: "अगला चरण",
      finish: "कार्य पूरा हुआ! ✓",
      repeat: "आवाज दोबारा सुनें",
      spotlightNotice: "स्पॉटलाइट चालू: नीचे रेखांकित स्थान पर टैप करें।"
    }
  };

  const labels = localizedLabels[language] || localizedLabels.en;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-fade-in">
      {/* Back Button */}
      <button
        onClick={() => {
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
      </div>

      {/* Simulated Screen with "Spotlight Scaffolding" */}
      <div className="bg-zinc-950 rounded-3xl p-6 sm:p-10 text-white shadow-xl border border-zinc-800 mb-8">
        <div className="flex items-center justify-between text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-6">
          <div className="flex items-center space-x-2">
            <Smartphone className="w-4 h-4 text-zinc-400" />
            <span>Simulated Device View</span>
          </div>
          <span className="text-zinc-300 flex items-center">
            <Sparkles className="w-3.5 h-3.5 mr-1" />
            {labels.spotlightNotice}
          </span>
        </div>

        {/* Mock Phone Frame */}
        <div className="relative mx-auto max-w-sm h-84 bg-black rounded-3xl border border-zinc-800 p-5 flex flex-col justify-between overflow-hidden shadow-2xl">
          {/* Top Status Bar */}
          <div className="flex justify-between items-center text-[11px] text-zinc-600 pb-2 border-b border-zinc-900">
            <span>9:41 AM</span>
            <span>LTE 100%</span>
          </div>

          {/* Screen Content with Dimming and Spotlight */}
          <div className="flex-1 flex flex-col items-center justify-center relative">
            <div className="absolute inset-0 opacity-15 pointer-events-none flex flex-col justify-around py-4">
              <div className="h-5 w-3/4 bg-zinc-700 rounded"></div>
              <div className="h-16 w-full bg-zinc-800 rounded"></div>
              <div className="h-6 w-1/2 bg-zinc-700 rounded"></div>
            </div>

            {/* High-End White Spotlight Target */}
            <div 
              className="spotlight-active p-5 rounded-2xl bg-white text-black font-bold text-center shadow-2xl flex flex-col items-center space-y-1.5 z-10 cursor-pointer transition-transform hover:scale-102"
              onClick={handleNext}
            >
              <span className="text-base sm:text-lg tracking-tight">
                {currentStep.spotlightTarget}
              </span>
              <span className="text-[10px] uppercase font-bold bg-black text-white px-2 py-0.5 rounded-md">
                Tap to Proceed
              </span>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="text-center text-[11px] text-zinc-600 pt-2 border-t border-zinc-900">
            Step {currentStepIndex + 1} of {steps.length}
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
          className={`w-full sm:w-auto min-h-[58px] px-8 py-3.5 rounded-2xl font-bold text-base sm:text-lg flex items-center justify-center space-x-2 transition-all shadow-sm ${
            isLastStep
              ? 'bg-black text-white dark:bg-white dark:text-black hover:opacity-90'
              : 'bg-black text-white dark:bg-white dark:text-black hover:opacity-90'
          }`}
        >
          <span>{isLastStep ? labels.finish : labels.next}</span>
          {isLastStep ? <CheckCircle2 className="w-5 h-5" /> : <ArrowRight className="w-5 h-5" />}
        </button>
      </div>
    </div>
  );
}
