import React, { useState } from 'react';
import { 
  Globe, 
  ZoomIn, 
  ZoomOut, 
  ArrowRight, 
  ArrowLeft,
  Volume2, 
  CheckCircle2, 
  Eye,
  BookOpen,
  Search,
  Award,
  Radio,
  ShieldCheck,
  Users
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
  const [step, setStep] = useState(1); // 1 = Language, 2 = Zoom, 3 = Feature Cards

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

  const handleProceedToFeatures = () => {
    const promptText = {
      en: "Great! Now tap any card below to choose what you would like to do.",
      kn: "ಉತ್ತಮ! ಈಗ ನೀವು ಏನು ಮಾಡಲು ಬಯಸುತ್ತೀರಿ ಎಂದು ಕೆಳಗಿನ ಕಾರ್ಡ್‌ಗಳಿಂದ ಆರಿಸಿ.",
      hi: "बहुत बढ़िया! अब नीचे दिए गए कार्ड्स में से चुनें कि आप क्या करना चाहते हैं।"
    };
    speechService.speak(promptText[currentLanguage] || promptText.en, currentLanguage);
    setStep(3);
  };

  // The 6 main features corresponding directly to the horizontal bar
  const featureCards = [
    {
      id: 'guides',
      icon: BookOpen,
      title: {
        en: '20 Phone Guides',
        kn: '20 ಫೋನ್ ಮಾರ್ಗದರ್ಶಿಗಳು',
        hi: '20 फोन गाइड'
      },
      desc: {
        en: 'Step-by-step help for WhatsApp calls, photos, phone settings, and UPI payments.',
        kn: 'ವಾಟ್ಸಾಪ್, ವಿಡಿಯೋ ಕಾಲ್, ಫೋಟೋ, ಸೆಟ್ಟಿಂಗ್ಸ್ ಮತ್ತು ಹಣ ಪಾವತಿಗಳ ಸುಲಭ ಹಂತಗಳು.',
        hi: 'व्हाट्सएप, कॉल, फोटो और पेमेंट के 20 आसान सचित्र गाइड।'
      }
    },
    {
      id: 'scam-check',
      icon: Search,
      title: {
        en: 'Check a Message',
        kn: 'ಸಂದೇಶ ಪರಿಶೀಲನೆ',
        hi: 'मैसेज जांचें'
      },
      desc: {
        en: 'Check if an SMS, WhatsApp message, or electricity bill notice is safe or a scam.',
        kn: 'ಬಂದಿರುವ ಮೆಸೇಜ್ ಅಥವಾ ಕರೆಂಟ್ ಬಿಲ್ ನೋಟಿಸ್ ನಿಜವೇ ಅಥವಾ ನಕಲಿಯೇ ಎಂದು ಪರೀಕ್ಷಿಸಿ.',
        hi: 'संदिग्ध मैसेज या बिजली बिल नोटिस सुरक्षित है या फर्जी, यहाँ जांचें।'
      }
    },
    {
      id: 'vaccine',
      icon: Award,
      title: {
        en: 'Practice Safety',
        kn: 'ಸುರಕ್ಷತಾ ಅಭ್ಯಾಸ',
        hi: 'सुरक्षा सीखें'
      },
      desc: {
        en: 'Safe practice to learn how to spot fake lottery prizes and fraudulent links.',
        kn: 'ನಕಲಿ ಬಹುಮಾನ ಮತ್ತು ವಂಚನೆಯ ಲಿಂಕ್‌ಗಳನ್ನು ಗುರುತಿಸಲು ಸುರಕ್ಷಿತವಾಗಿ ಅಭ್ಯಾಸ ಮಾಡಿ.',
        hi: 'फर्जी लॉटरी और अनजान लिंक पहचानने का आसान और सुरक्षित अभ्यास।'
      }
    },
    {
      id: 'guardian-sim',
      icon: Radio,
      title: {
        en: 'Call Safety Helper',
        kn: 'ಕರೆ ರಕ್ಷಣೆ',
        hi: 'कॉल सुरक्षा'
      },
      desc: {
        en: 'See how to protect your OTP and bank details when someone calls you.',
        kn: 'ಕರೆಯಲ್ಲಿ ಯಾರಾದರೂ ಒಟಿಪಿ ಕೇಳಿದರೆ ನಿಮ್ಮ ಫೋನ್ ಮತ್ತು ಹಣವನ್ನು ರಕ್ಷಿಸುವುದು ಹೇಗೆ.',
        hi: 'कॉल पर कोई ओटीपी या पैसे मांगे तो सुरक्षित रहने का तरीका समझें।'
      }
    },
    {
      id: 'evaluation',
      icon: ShieldCheck,
      title: {
        en: 'Practice Questions',
        kn: 'ಪ್ರಶ್ನೋತ್ತರ',
        hi: 'अभ्यास प्रश्न'
      },
      desc: {
        en: 'Answer simple questions to test and improve your phone safety knowledge.',
        kn: 'ಸ್ಮಾರ್ಟ್‌ಫೋನ್ ಸುರಕ್ಷತೆಯ ಬಗ್ಗೆ ನಿಮ್ಮ ತಿಳುವಳಿಕೆಯನ್ನು ಸುಲಭವಾಗಿ ಪರಿಶೀಲಿಸಿ.',
        hi: 'फोन सुरक्षा के बारे में अपनी जानकारी जांचने के लिए आसान सवाल।'
      }
    },
    {
      id: 'caregiver',
      icon: Users,
      title: {
        en: 'Family Alerts',
        kn: 'ಕುಟುಂಬದವರಿಗೆ ಮಾಹಿತಿ',
        hi: 'परिवार अलर्ट'
      },
      desc: {
        en: 'View safety alerts and your learning progress for your family members.',
        kn: 'ಮಕ್ಕಳು ಅಥವಾ ಕುಟುಂಬದವರಿಗೆ ರಕ್ಷಣಾ ಎಚ್ಚರಿಕೆಗಳು ಮತ್ತು ಪ್ರಗತಿಯ ವಿವರ.',
        hi: 'परिवार के सदस्यों के लिए सुरक्षा अलर्ट और आपकी प्रगति रिपोर्ट।'
      }
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xs animate-fade-in overflow-y-auto">
      <div className={`relative w-full ${step === 3 ? 'max-w-3xl sm:max-w-4xl' : 'max-w-xl'} bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-10 shadow-2xl border border-zinc-200 dark:border-zinc-800 transition-all my-8 max-h-[92vh] overflow-y-auto`}>
        {/* Step Indicator */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800 mb-6">
          <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
            {currentLanguage === 'kn' ? `ಹಂತ ${step} / 3` : currentLanguage === 'hi' ? `चरण ${step} / 3` : `Step ${step} of 3`}
          </span>
          <div className="flex space-x-1.5">
            <div className={`w-6 h-1.5 rounded-full ${step >= 1 ? 'bg-black dark:bg-white' : 'bg-zinc-200 dark:bg-zinc-700'}`} />
            <div className={`w-6 h-1.5 rounded-full ${step >= 2 ? 'bg-black dark:bg-white' : 'bg-zinc-200 dark:bg-zinc-700'}`} />
            <div className={`w-6 h-1.5 rounded-full ${step >= 3 ? 'bg-black dark:bg-white' : 'bg-zinc-200 dark:bg-zinc-700'}`} />
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
                {currentLanguage === 'kn' ? 'ಅಕ್ಷರಗಳ ಗಾತ್ರ ಸರಿಹೊಂದಿಸಿ' : currentLanguage === 'hi' ? 'अक्षरों का आकार चुनें' : 'Adjust Your Text Size'}
              </h2>
              <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 font-normal">
                {currentLanguage === 'kn' 
                  ? 'ನಿಮ್ಮ ಕಣ್ಣಿಗೆ ಆರಾಮವಾಗುವಂತೆ ಅಕ್ಷರಗಳ ಗಾತ್ರವನ್ನು ಆಯ್ಕೆಮಾಡಿ.' 
                  : currentLanguage === 'hi' 
                  ? 'अपनी आंखों की सुविधा के अनुसार लिखावट का सही आकार चुनें।' 
                  : 'Select a comfortable text size so everything is easy to read.'}
              </p>
            </div>

            {/* Live Sample Text Box */}
            <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                  {currentLanguage === 'kn' ? `ಪ್ರದರ್ಶನ (${currentZoom}%)` : currentLanguage === 'hi' ? `प्रदर्शन (${currentZoom}%)` : `Live Preview (${currentZoom}%)`}
                </span>
                <button
                  onClick={readSampleText}
                  className="flex items-center space-x-1 text-xs font-semibold text-zinc-600 dark:text-zinc-300 hover:text-black dark:hover:text-white"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>{currentLanguage === 'kn' ? 'ಓದಿ ಕೇಳಿ' : currentLanguage === 'hi' ? 'सुनें' : 'Read aloud'}</span>
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

            {/* Navigation Buttons */}
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setStep(1)}
                className="w-1/3 py-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-700 text-xs sm:text-sm font-semibold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center justify-center space-x-1"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>{currentLanguage === 'kn' ? 'ಹಿಂದಕ್ಕೆ' : currentLanguage === 'hi' ? 'पीछे' : 'Back'}</span>
              </button>

              <button
                onClick={handleProceedToFeatures}
                className="w-2/3 py-3.5 rounded-2xl bg-black text-white dark:bg-white dark:text-black font-bold text-sm sm:text-base hover:opacity-90 shadow-sm flex items-center justify-center space-x-2"
              >
                <span>{currentLanguage === 'kn' ? 'ಮುಂದೆ: ವಿಷಯ ಆಯ್ಕೆಮಾಡಿ' : currentLanguage === 'hi' ? 'आगे: विषय चुनें' : 'Next: Choose Feature'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: CHOOSE FROM THE HORIZONTAL BAR FEATURES AS CARDS */}
        {step === 3 && (
          <div className="animate-fade-in">
            <div className="text-center mb-6">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-white mb-2">
                {currentLanguage === 'kn' 
                  ? 'ಇಂದು ನೀವು ಏನು ಕಲಿಯಲು ಬಯಸುತ್ತೀರಿ?' 
                  : currentLanguage === 'hi' 
                  ? 'आज आप क्या देखना या सीखना चाहते हैं?' 
                  : 'What would you like to do today?'}
              </h2>
              <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 font-normal">
                {currentLanguage === 'kn'
                  ? 'ಪ್ರಾರಂಭಿಸಲು ಕೆಳಗಿನ ಯಾವುದೇ ಕಾರ್ಡ್ ಮೇಲೆ ಒಮ್ಮೆ ಒತ್ತಿರಿ.'
                  : currentLanguage === 'hi'
                  ? 'शुरू करने के लिए नीचे दिए गए किसी भी कार्ड पर टैप करें।'
                  : 'Tap any card below to open it immediately.'}
              </p>
            </div>

            {/* 6 Feature Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 mb-6">
              {featureCards.map((feat) => {
                const Icon = feat.icon;
                const titleText = feat.title[currentLanguage] || feat.title.en;
                const descText = feat.desc[currentLanguage] || feat.desc.en;

                return (
                  <div
                    key={feat.id}
                    onClick={() => onFinish(feat.id)}
                    className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 hover:border-black dark:hover:border-white hover:bg-white dark:hover:bg-zinc-800 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group text-left"
                  >
                    <div>
                      <div className="w-10 h-10 rounded-xl bg-black text-white dark:bg-white dark:text-black flex items-center justify-center font-bold mb-3 shadow-xs group-hover:scale-105 transition-transform">
                        <Icon className="w-5 h-5" />
                      </div>

                      <h3 className="font-bold text-base sm:text-lg text-zinc-900 dark:text-white mb-1.5 group-hover:underline">
                        {titleText}
                      </h3>

                      <p className="text-xs text-zinc-600 dark:text-zinc-400 font-normal leading-relaxed line-clamp-3">
                        {descText}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-zinc-200 dark:border-zinc-700/60 flex items-center justify-between text-xs font-semibold text-zinc-900 dark:text-zinc-200">
                      <span>{currentLanguage === 'kn' ? 'ತೆರೆಯಿರಿ' : currentLanguage === 'hi' ? 'खोलें' : 'Open'}</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer Navigation */}
            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => setStep(2)}
                className="py-3 px-5 rounded-2xl border border-zinc-200 dark:border-zinc-700 text-xs sm:text-sm font-semibold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center space-x-1"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>{currentLanguage === 'kn' ? 'ಅಕ್ಷರ ಗಾತ್ರ ಬದಲಾಯಿಸಿ' : currentLanguage === 'hi' ? 'अक्षर आकार बदलें' : 'Back to Text Size'}</span>
              </button>

              <button
                onClick={() => onFinish('guides')}
                className="py-3 px-6 rounded-2xl bg-black text-white dark:bg-white dark:text-black font-bold text-xs sm:text-sm hover:opacity-90 shadow-sm flex items-center space-x-1.5"
              >
                <span>{currentLanguage === 'kn' ? 'ಎಲ್ಲಾ ಮಾರ್ಗದರ್ಶಿಗಳನ್ನು ನೋಡಿ' : currentLanguage === 'hi' ? 'सभी गाइड देखें' : 'Explore All Guides'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
