import React, { useState } from 'react';
import { 
  Globe, 
  ZoomIn, 
  ZoomOut, 
  ArrowRight, 
  Volume2, 
  CheckCircle2, 
  Eye
} from 'lucide-react';
import { speechService } from '../services/speechService';
import { APP_CONFIG } from '../config/appConfig';

export default function OnboardingModal({
  currentLanguage,
  setLanguage,
  currentZoom,
  setZoomLevel,
  onFinish
}) {
  const [step, setStep] = useState(1); // 1 = Language, 2 = Zoom Adjustment

  const zoomLevels = [100, 115, 130, 150, 175, 200];

  const handleSelectLanguage = (langCode) => {
    setLanguage(langCode);
    const greetings = {
      en: "Welcome! Now let's adjust the text size so you can read comfortably.",
      kn: "ಸ್ವಾಗತ! ಈಗ ಅಕ್ಷರಗಳ ಗಾತ್ರವನ್ನು ನಿಮ್ಮ ಕಣ್ಣಿಗೆ ಆರಾಮವಾಗುವಂತೆ ಸರಿಹೊಂದಿಸೋಣ.",
      hi: "स्वागत है! अब आइए लिखावट के आकार को आपकी आंखों की सुविधा अनुसार तय करते हैं।"
    };
    speechService.speak(greetings[langCode] || greetings.en, langCode);
    setStep(2);
  };

  const handleZoomStep = (delta) => {
    const currentIndex = zoomLevels.indexOf(currentZoom);
    let newIndex = currentIndex !== -1 ? currentIndex + delta : 1;
    newIndex = Math.max(0, Math.min(zoomLevels.length - 1, newIndex));
    setZoomLevel(zoomLevels[newIndex]);
  };

  const sampleTexts = {
    en: "Can you read this text comfortably? Adjust the size until it looks clear and easy on your eyes.",
    kn: "ಈ ಅಕ್ಷರಗಳು ಸ್ಪಷ್ಟವಾಗಿ ಕಾಣಿಸುತ್ತಿವೆಯೇ? ನಿಮ್ಮ ಕಣ್ಣಿಗೆ ಆರಾಮವಾಗುವಂತೆ ಗಾತ್ರವನ್ನು ಸರಿಹೊಂದಿಸಿ.",
    hi: "क्या आप यह लिखावट आराम से पढ़ सकते हैं? अपने अनुसार लिखावट का सही आकार चुनें।"
  };

  const readSampleText = () => {
    speechService.speak(sampleTexts[currentLanguage] || sampleTexts.en, currentLanguage);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-xl bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-10 shadow-2xl border border-zinc-200 dark:border-zinc-800">
        {/* Step Indicator */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800 mb-6">
          <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
            Welcome Setup • Step {step} of 2
          </span>
          <div className="flex space-x-1.5">
            <div className={`w-6 h-1.5 rounded-full ${step >= 1 ? 'bg-black dark:bg-white' : 'bg-zinc-200 dark:bg-zinc-700'}`} />
            <div className={`w-6 h-1.5 rounded-full ${step >= 2 ? 'bg-black dark:bg-white' : 'bg-zinc-200 dark:bg-zinc-700'}`} />
          </div>
        </div>

        {/* STEP 1: LANGUAGE SELECTION */}
        {step === 1 && (
          <div className="text-center animate-fade-in">
            <div className="w-12 h-12 rounded-2xl bg-black text-white dark:bg-white dark:text-black flex items-center justify-center font-bold text-2xl mx-auto mb-4 shadow-sm">
              <Globe className="w-6 h-6" />
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-white mb-2">
              Choose Your Language
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 font-normal mb-8 max-w-sm mx-auto">
              Please choose the language you are most comfortable speaking and reading.
            </p>

            <div className="space-y-3 mb-6">
              {/* English */}
              <button
                onClick={() => handleSelectLanguage('en')}
                className={`w-full min-h-[64px] p-4 rounded-2xl border text-left font-bold text-base sm:text-lg flex items-center justify-between transition-all ${
                  currentLanguage === 'en'
                    ? 'bg-black text-white border-black dark:bg-white dark:text-black dark:border-white shadow-xs'
                    : 'bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border-zinc-200 dark:border-zinc-700 hover:border-black dark:hover:border-white'
                }`}
              >
                <div>
                  <div className="text-base sm:text-lg">English</div>
                  <div className="text-xs opacity-70 font-normal">Continue in English</div>
                </div>
                <ArrowRight className="w-5 h-5" />
              </button>

              {/* Kannada */}
              <button
                onClick={() => handleSelectLanguage('kn')}
                className={`w-full min-h-[64px] p-4 rounded-2xl border text-left font-bold text-base sm:text-lg flex items-center justify-between transition-all ${
                  currentLanguage === 'kn'
                    ? 'bg-black text-white border-black dark:bg-white dark:text-black dark:border-white shadow-xs'
                    : 'bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border-zinc-200 dark:border-zinc-700 hover:border-black dark:hover:border-white'
                }`}
              >
                <div>
                  <div className="text-base sm:text-lg">ಕನ್ನಡ (Kannada)</div>
                  <div className="text-xs opacity-70 font-normal">ಕನ್ನಡದಲ್ಲಿ ಮುಂದುವರಿಯಿರಿ</div>
                </div>
                <ArrowRight className="w-5 h-5" />
              </button>

              {/* Hindi */}
              <button
                onClick={() => handleSelectLanguage('hi')}
                className={`w-full min-h-[64px] p-4 rounded-2xl border text-left font-bold text-base sm:text-lg flex items-center justify-between transition-all ${
                  currentLanguage === 'hi'
                    ? 'bg-black text-white border-black dark:bg-white dark:text-black dark:border-white shadow-xs'
                    : 'bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border-zinc-200 dark:border-zinc-700 hover:border-black dark:hover:border-white'
                }`}
              >
                <div>
                  <div className="text-base sm:text-lg">हिन्दी (Hindi)</div>
                  <div className="text-xs opacity-70 font-normal">हिन्दी में आगे बढ़ें</div>
                </div>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: ZOOM & FONT ADJUSTMENT */}
        {step === 2 && (
          <div className="animate-fade-in">
            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-2xl bg-black text-white dark:bg-white dark:text-black flex items-center justify-center font-bold text-2xl mx-auto mb-4 shadow-sm">
                <Eye className="w-6 h-6" />
              </div>

              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-white mb-2">
                Adjust Your Text Size
              </h2>
              <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 font-normal">
                Select a comfortable zoom percentage so everything is easy to read.
              </p>
            </div>

            {/* Live Sample Text Box */}
            <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                  Live Text Preview ({currentZoom}%)
                </span>
                <button
                  onClick={readSampleText}
                  className="flex items-center space-x-1 text-xs font-semibold text-zinc-600 dark:text-zinc-300 hover:text-black dark:hover:text-white"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>Read aloud</span>
                </button>
              </div>

              <p className="font-semibold text-zinc-900 dark:text-white leading-relaxed">
                {sampleTexts[currentLanguage] || sampleTexts.en}
              </p>
            </div>

            {/* Stepper & Percentage Buttons */}
            <div className="space-y-4 mb-8">
              <div className="flex items-center justify-center space-x-3">
                <button
                  onClick={() => handleZoomStep(-1)}
                  disabled={currentZoom <= 100}
                  className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-zinc-700 dark:text-zinc-200 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-zinc-200"
                  title="Make Text Smaller"
                >
                  <ZoomOut className="w-5 h-5" />
                </button>

                <div className="px-6 py-2.5 rounded-2xl bg-black text-white dark:bg-white dark:text-black font-black text-xl shadow-xs">
                  {currentZoom}%
                </div>

                <button
                  onClick={() => handleZoomStep(1)}
                  disabled={currentZoom >= 200}
                  className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-zinc-700 dark:text-zinc-200 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-zinc-200"
                  title="Make Text Bigger"
                >
                  <ZoomIn className="w-5 h-5" />
                </button>
              </div>

              {/* Quick Preset Pills */}
              <div className="flex flex-wrap items-center justify-center gap-1.5">
                {zoomLevels.map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => setZoomLevel(lvl)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                      currentZoom === lvl
                        ? 'bg-black text-white border-black dark:bg-white dark:text-black dark:border-white shadow-xs'
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700 hover:border-zinc-400'
                    }`}
                  >
                    {lvl}%
                  </button>
                ))}
              </div>
            </div>

            {/* Continue to App */}
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setStep(1)}
                className="w-1/3 py-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-700 text-xs sm:text-sm font-semibold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                ← Back
              </button>

              <button
                onClick={onFinish}
                className="w-2/3 py-3.5 rounded-2xl bg-black text-white dark:bg-white dark:text-black font-bold text-sm sm:text-base hover:opacity-90 shadow-sm flex items-center justify-center space-x-2"
              >
                <span>Enter Assistant</span>
                <CheckCircle2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
