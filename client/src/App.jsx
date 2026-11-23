import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Search, 
  Award, 
  Radio, 
  ShieldCheck, 
  Users, 
  Mic, 
  ArrowUpRight, 
  CheckCircle2,
  Sliders,
  Download,
  Smartphone
} from 'lucide-react';
import Navbar from './components/Navbar';
import SpotlightGuide from './components/SpotlightGuide';
import VoiceAssistantModal from './components/VoiceAssistantModal';
import DualStreamGuardianModal from './components/DualStreamGuardianModal';
import ScamDetector from './components/ScamDetector';
import DigitalVaccineSandbox from './components/DigitalVaccineSandbox';
import PrePostTest from './components/PrePostTest';
import CaregiverDashboard from './components/CaregiverDashboard';
import OnboardingModal from './components/OnboardingModal';
import { TASK_GUIDES } from './data/guides';
import { guardianService } from './services/guardianService';
import { APP_CONFIG } from './config/appConfig';

export default function App() {
  const prefix = APP_CONFIG.storagePrefix;

  // Setup / Onboarding state: prompts every time someone enters the website
  const [hasCompletedSetup, setHasCompletedSetup] = useState(false);

  const [language, setLanguage] = useState(() => {
    try {
      return localStorage.getItem(`${prefix}preferred_lang`) || 'en';
    } catch {
      return 'en';
    }
  });

  const [zoomLevel, setZoomLevel] = useState(() => {
    try {
      const saved = localStorage.getItem(`${prefix}preferred_zoom`);
      return saved ? parseInt(saved, 10) : 115;
    } catch {
      return 115;
    }
  });

  const [theme, setTheme] = useState('light'); // 'light' | 'dark'
  const [activeTab, setActiveTab] = useState('guides');
  const [activeGuide, setActiveGuide] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);

  // Persistence State
  const [completedGuides, setCompletedGuides] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(`${prefix}completed_guides`)) || [];
    } catch {
      return [];
    }
  });

  const [earnedBadges, setEarnedBadges] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(`${prefix}earned_badges`)) || [];
    } catch {
      return [];
    }
  });

  const [evaluationData, setEvaluationData] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(`${prefix}evaluation_data`)) || null;
    } catch {
      return null;
    }
  });

  const [alertsCount, setAlertsCount] = useState(() => guardianService.getCaregiverAlerts().length);

  // Sync zoom factor and theme
  useEffect(() => {
    document.documentElement.style.setProperty('--zoom-factor', zoomLevel / 100);
    document.body.className = `theme-${theme}`;
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem(`${prefix}preferred_zoom`, zoomLevel.toString());
    localStorage.setItem(`${prefix}preferred_lang`, language);
  }, [theme, zoomLevel, language]);

  const handleFinishSetup = (chosenTab = 'guides') => {
    setHasCompletedSetup(true);
    if (chosenTab && typeof chosenTab === 'string') {
      setActiveGuide(null);
      setActiveTab(chosenTab);
    }
  };

  const handleCompleteGuide = (guideId) => {
    if (!completedGuides.includes(guideId)) {
      const updated = [...completedGuides, guideId];
      setCompletedGuides(updated);
      localStorage.setItem(`${prefix}completed_guides`, JSON.stringify(updated));
    }
    setActiveGuide(null);
  };

  const handleEarnBadge = (badgeId) => {
    if (!earnedBadges.includes(badgeId)) {
      const updated = [...earnedBadges, badgeId];
      setEarnedBadges(updated);
      localStorage.setItem(`${prefix}earned_badges`, JSON.stringify(updated));
    }
  };

  const handleSaveEvaluation = (data) => {
    setEvaluationData(data);
    localStorage.setItem(`${prefix}evaluation_data`, JSON.stringify(data));
  };

  const categories = ['All', 'Communication', 'Digital Payments', 'Smartphone Settings', 'Healthcare & Civic'];

  const categoryLabels = {
    'All': { en: 'All Guides', kn: 'ಎಲ್ಲಾ ಮಾರ್ಗದರ್ಶಿಗಳು', hi: 'सभी गाइड' },
    'Communication': { en: 'Calls & WhatsApp', kn: 'ಕರೆ & ವಾಟ್ಸಾಪ್', hi: 'कॉल और व्हाट्सएप' },
    'Digital Payments': { en: 'Paying Money & UPI', kn: 'ಹಣ ಪಾವತಿ & ಯುಪಿಐ', hi: 'पैसे भेजना और यूपीआई' },
    'Smartphone Settings': { en: 'Phone Settings', kn: 'ಫೋನ್ ಸೆಟ್ಟಿಂಗ್ಸ್', hi: 'फोन सेटिंग्स' },
    'Healthcare & Civic': { en: 'Health & Government', kn: 'ಆರೋಗ್ಯ & ಸರ್ಕಾರಿ ಸೇವೆ', hi: 'स्वास्थ्य और सरकारी सेवा' }
  };

  const filteredGuides = selectedCategory === 'All'
    ? TASK_GUIDES
    : TASK_GUIDES.filter(g => g.category === selectedCategory);

  const brandHeading = APP_CONFIG.brandName[language] || APP_CONFIG.brandName.en;

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 transition-colors">
      {/* 1. INITIAL ONBOARDING: Ask Language & Zoom Preference First */}
      {!hasCompletedSetup && (
        <OnboardingModal
          currentLanguage={language}
          setLanguage={setLanguage}
          currentZoom={zoomLevel}
          setZoomLevel={setZoomLevel}
          onFinish={handleFinishSetup}
        />
      )}

      {/* 2. MAIN APPLICATION (Revealed after preferences are chosen) */}
      <Navbar
        language={language}
        setLanguage={setLanguage}
        zoomLevel={zoomLevel}
        setZoomLevel={setZoomLevel}
        theme={theme}
        setTheme={setTheme}
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveGuide(null);
          setActiveTab(tab);
        }}
        unreadAlertCount={alertsCount}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-24">
        {activeGuide ? (
          <SpotlightGuide
            guide={activeGuide}
            language={language}
            onBack={() => setActiveGuide(null)}
            onCompleteTask={handleCompleteGuide}
          />
        ) : (
          <>
            {/* TAB 1: 20 DIGITAL GUIDES */}
            {activeTab === 'guides' && (
              <div className="max-w-6xl mx-auto px-4 py-8 animate-fade-in">
                {/* Clean Friendly Hero Card */}
                <div className="rounded-3xl p-8 sm:p-12 bg-zinc-900 text-white dark:bg-zinc-900/90 border border-zinc-800 shadow-md mb-10 relative overflow-hidden">
                  <div className="max-w-2xl relative z-10">
                    <h2 className="text-3xl sm:text-5xl font-bold tracking-tight mb-4">
                      {brandHeading}
                    </h2>

                    <p className="text-base sm:text-lg text-zinc-300 font-normal leading-relaxed mb-8">
                      {language === 'kn'
                        ? "ಸ್ಮಾರ್ಟ್‌ಫೋನ್ ಅನ್ನು ಸುಲಭವಾಗಿ ಬಳಸಲು ಮತ್ತು ಆನ್‌ಲೈನ್ ವಂಚನೆಗಳಿಂದ ಸುರಕ್ಷಿತವಾಗಿರಲು ಸರಳ ಮಾರ್ಗದರ್ಶಿಗಳು."
                        : language === 'hi'
                        ? "स्मार्टफोन आसानी से चलाने और धोखाधड़ी से सुरक्षित रहने के लिए आसान गाइड।"
                        : "Simple step-by-step guides to help you use your smartphone with confidence and stay safe from scams."}
                    </p>

                    <div className="flex flex-wrap items-center gap-3">
                      <button
                        onClick={() => setIsVoiceOpen(true)}
                        className="px-6 py-3.5 rounded-xl bg-white text-black hover:bg-zinc-200 font-bold text-sm sm:text-base flex items-center space-x-2 shadow-xs transition-all"
                      >
                        <Mic className="w-4 h-4 text-black" />
                        <span>{language === 'kn' ? "ಧ್ವನಿ ಮೂಲಕ ಕೇಳಿ" : language === 'hi' ? "बोलकर पूछें" : "Ask by Speaking"}</span>
                      </button>

                      <a
                        href={APP_CONFIG.apkDownload.directUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-6 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-sm sm:text-base flex items-center space-x-2 shadow-xs transition-all"
                        title="Download ElderAssist APK for Android"
                      >
                        <Download className="w-4 h-4 text-black" />
                        <span>{language === 'kn' ? "ಆ್ಯಪ್ ಡೌನ್‌ಲೋಡ್ (APK)" : language === 'hi' ? "ऐप डाउनलोड (APK)" : "Download App (APK)"}</span>
                      </a>

                      <button
                        onClick={() => setHasCompletedSetup(false)}
                        className="px-4 py-3.5 rounded-xl border border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-800 text-xs sm:text-sm font-semibold flex items-center space-x-1.5 transition-all"
                        title="Change Text Size & Language"
                      >
                        <Sliders className="w-4 h-4" />
                        <span>{language === 'kn' ? "ಅಕ್ಷರ ಗಾತ್ರ & ಭಾಷೆ" : language === 'hi' ? "अक्षर और भाषा" : "Change Text Size & Language"}</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Dedicated Android App Download Banner */}
                <div className="rounded-3xl p-6 sm:p-8 bg-zinc-50 dark:bg-zinc-900 border-2 border-emerald-500/40 dark:border-emerald-500/30 shadow-sm mb-10">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-black flex items-center justify-center flex-shrink-0 shadow-md">
                        <Smartphone className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2 mb-1 flex-wrap gap-1">
                          <h3 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-zinc-100">
                            {language === 'kn'
                              ? "ನಿಮ್ಮ ಮೊಬೈಲ್‌ನಲ್ಲಿ ಆ್ಯಪ್ ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ (Android APK)"
                              : language === 'hi'
                              ? "अपने फोन में ऐप डाउनलोड करें (Android APK)"
                              : "Download Mobile App for Android (APK)"}
                          </h3>
                          <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                            {APP_CONFIG.apkDownload.version}
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed mb-3 max-w-2xl">
                          {language === 'kn'
                            ? "ಪ್ರತಿದಿನ ಬ್ರೌಸರ್ ತೆರೆಯುವ ಅಗತ್ಯವಿಲ್ಲ. ಈ ಆ್ಯಪ್ ಅನ್ನು ನಿಮ್ಮ ಆಂಡ್ರಾಯ್ಡ್ ಮೊಬೈಲ್‌ನಲ್ಲಿ ನೇರವಾಗಿ ಇನ್‌ಸ್ಟಾಲ್ ಮಾಡಿ ಸುಲಭವಾಗಿ ಬಳಸಿ."
                            : language === 'hi'
                            ? "बार-बार ब्राउज़र खोलने की आवश्यकता नहीं। अपने एंड्रॉयड फोन में ऐप इंस्टॉल करें और होम स्क्रीन से एक टैप में चलाएं।"
                            : "No need to open a web browser every time. Install ElderAssist directly onto your Android phone for quick one-tap access from your home screen."}
                        </p>

                        {/* 3 Simple Install Steps */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-zinc-200 dark:border-zinc-800 text-xs text-zinc-700 dark:text-zinc-300">
                          <div className="flex items-center space-x-1.5">
                            <span className="w-5 h-5 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center font-bold text-[10px]">1</span>
                            <span>{language === 'kn' ? 'ಡೌನ್‌ಲೋಡ್ ಬಟನ್ ಒತ್ತಿ' : language === 'hi' ? 'डाउनलोड बटन दबाएं' : 'Tap Download Button'}</span>
                          </div>
                          <div className="flex items-center space-x-1.5">
                            <span className="w-5 h-5 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center font-bold text-[10px]">2</span>
                            <span>{language === 'kn' ? 'ಫೈಲ್ ತೆರೆದು Install ಒತ್ತಿ' : language === 'hi' ? 'फाइल खोलकर Install दबाएं' : 'Open file & tap Install'}</span>
                          </div>
                          <div className="flex items-center space-x-1.5">
                            <span className="w-5 h-5 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center font-bold text-[10px]">3</span>
                            <span>{language === 'kn' ? 'ಫೋನ್‌ನಲ್ಲಿ ಆ್ಯಪ್ ಸಿದ್ಧ!' : language === 'hi' ? 'ऐप फोन में तैयार!' : 'App ready on phone!'}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 flex-shrink-0">
                      <a
                        href={APP_CONFIG.apkDownload.directUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm sm:text-base flex items-center justify-center space-x-2 shadow-md transition-all"
                      >
                        <Download className="w-5 h-5" />
                        <span>{language === 'kn' ? "APK ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ" : language === 'hi' ? "APK डाउनलोड करें" : "Download APK File"}</span>
                      </a>

                      <a
                        href={APP_CONFIG.apkDownload.releasesUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs font-semibold flex items-center justify-center space-x-1 transition-all border border-zinc-200 dark:border-zinc-700"
                      >
                        <span>{language === 'kn' ? "GitHub ಆವೃತ್ತಿಗಳು" : language === 'hi' ? "GitHub वर्शन देखें" : "View on GitHub Releases"}</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                </div>

                {/* Category Filters */}
                <div className="flex gap-2 overflow-x-auto pb-4 mb-6 no-scrollbar">
                  {categories.map((cat) => {
                    const labelObj = categoryLabels[cat];
                    const catLabel = labelObj ? (labelObj[language] || labelObj.en) : cat;
                    return (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all border ${
                          selectedCategory === cat
                            ? 'bg-black text-white border-black dark:bg-white dark:text-black dark:border-white shadow-xs'
                            : 'bg-zinc-50 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800 hover:border-zinc-400'
                        }`}
                      >
                        {catLabel}
                      </button>
                    );
                  })}
                </div>

                {/* Guides Grid in Minimalist Black/White Elegance - Pure Revision Tiles, No Gamified Mastered Badges */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {filteredGuides.map((guide) => {
                    const catObj = categoryLabels[guide.category];
                    const catDisplayName = catObj ? (catObj[language] || catObj.en) : guide.category;
                    return (
                      <div
                        key={guide.id}
                        onClick={() => setActiveGuide(guide)}
                        className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800 hover:border-black dark:hover:border-white shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                              {catDisplayName}
                            </span>
                            <span className="text-xs text-zinc-400 font-medium">
                              {guide.steps.length} {language === 'kn' ? 'ಹಂತಗಳು' : language === 'hi' ? 'चरण' : 'Steps'}
                            </span>
                          </div>

                          <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-2 group-hover:underline">
                            {guide.title[language] || guide.title.en}
                          </h3>

                          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 font-normal leading-relaxed line-clamp-2">
                            {guide.description[language] || guide.description.en}
                          </p>
                        </div>

                        <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                          <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-200">
                            {language === 'kn' ? 'ತೆರೆಯಿರಿ & ನೋಡಿ' : language === 'hi' ? 'खोलें और देखें' : 'Open & Practice'}
                          </span>
                          <div className="w-7 h-7 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-800 dark:text-zinc-200 group-hover:bg-black group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black transition-colors">
                            <ArrowUpRight className="w-4 h-4" />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 2: SCAM VERIFIER */}
            {activeTab === 'scam-check' && (
              <ScamDetector
                language={language}
                onAlertCaregiver={(scamResult) => {
                  guardianService.triggerEmergencyInterception({
                    callStream: { callerNumber: 'Flagged by User', transcript: scamResult.text },
                    screenStream: { isOTPVisible: false, isUPIPINActive: false },
                    threatScore: scamResult.score,
                    detectedFlags: scamResult.reasons
                  });
                  setAlertsCount(guardianService.getCaregiverAlerts().length);
                }}
              />
            )}

            {/* TAB 3: SAFETY SANDBOX */}
            {activeTab === 'vaccine' && (
              <DigitalVaccineSandbox
                language={language}
                onEarnBadge={handleEarnBadge}
              />
            )}

            {/* TAB 4: GUARDIAN SHIELD */}
            {activeTab === 'guardian-sim' && (
              <DualStreamGuardianModal language={language} />
            )}

            {/* TAB 5: PRE / POST TEST EVALUATION */}
            {activeTab === 'evaluation' && (
              <PrePostTest
                language={language}
                onSaveEvaluation={handleSaveEvaluation}
              />
            )}

            {/* TAB 6: CAREGIVER PORTAL */}
            {activeTab === 'caregiver' && (
              <CaregiverDashboard
                completedGuidesCount={completedGuides.length}
                earnedBadgesCount={earnedBadges.length}
                evaluationData={evaluationData}
                onClearAlerts={() => setAlertsCount(0)}
              />
            )}
          </>
        )}
      </main>

      {/* Floating Microphone Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setIsVoiceOpen(true)}
          className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-black text-white dark:bg-white dark:text-black flex items-center justify-center shadow-xl hover:scale-105 transition-all border border-zinc-700"
          title="Voice Assistant (Infinite-Pause VAD)"
        >
          <Mic className="w-6 h-6 sm:w-7 sm:h-7" />
        </button>
      </div>

      {/* Voice Assistant Modal */}
      <VoiceAssistantModal
        language={language}
        isOpen={isVoiceOpen}
        onClose={() => setIsVoiceOpen(false)}
        onSelectGuide={(guide) => {
          setActiveTab('guides');
          setActiveGuide(guide);
        }}
        onCheckScamQuery={() => {
          setActiveTab('scam-check');
        }}
      />
    </div>
  );
}
