import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Search, 
  Award, 
  Radio, 
  ShieldCheck, 
  Users, 
  Mic, 
  Sparkles,
  ArrowUpRight,
  CheckCircle2
} from 'lucide-react';
import Navbar from './components/Navbar';
import SpotlightGuide from './components/SpotlightGuide';
import VoiceAssistantModal from './components/VoiceAssistantModal';
import DualStreamGuardianModal from './components/DualStreamGuardianModal';
import ScamDetector from './components/ScamDetector';
import DigitalVaccineSandbox from './components/DigitalVaccineSandbox';
import PrePostTest from './components/PrePostTest';
import CaregiverDashboard from './components/CaregiverDashboard';
import { TASK_GUIDES } from './data/guides';
import { guardianService } from './services/guardianService';
import { APP_CONFIG } from './config/appConfig';

export default function App() {
  const [language, setLanguage] = useState('en'); // 'en' | 'kn' | 'hi'
  const [zoomLevel, setZoomLevel] = useState(115); // 100, 115, 130, 150, 175, 200
  const [theme, setTheme] = useState('light'); // 'light' | 'dark'
  const [activeTab, setActiveTab] = useState('guides');
  const [activeGuide, setActiveGuide] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);

  const prefix = APP_CONFIG.storagePrefix;

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
  }, [theme, zoomLevel]);

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

  const filteredGuides = selectedCategory === 'All'
    ? TASK_GUIDES
    : TASK_GUIDES.filter(g => g.category === selectedCategory);

  const brandHeading = APP_CONFIG.brandName[language] || APP_CONFIG.brandName.en;

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 transition-colors">
      {/* Refined Minimalist Navbar */}
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
                {/* Classy Editorial Hero Card */}
                <div className="rounded-3xl p-8 sm:p-12 bg-zinc-900 text-white dark:bg-zinc-900/90 border border-zinc-800 shadow-md mb-10 relative overflow-hidden">
                  <div className="max-w-2xl relative z-10">
                    <h2 className="text-3xl sm:text-5xl font-bold tracking-tight mb-4">
                      {brandHeading}
                    </h2>

                    <p className="text-base sm:text-lg text-zinc-300 font-normal leading-relaxed mb-8">
                      {language === 'kn'
                        ? "ಭಯವಿಲ್ಲದೆ, ಸ್ವತಂತ್ರವಾಗಿ ಸ್ಮಾರ್ಟ್‌ಫೋನ್ ಬಳಸಲು 20 ಹಂತ-ಹಂತದ ಸರಳ ಮಾರ್ಗದರ್ಶಿಗಳು ಮತ್ತು ಸೈಬರ್ ರಕ್ಷಣೆ."
                        : language === 'hi'
                        ? "आत्मविश्वास के साथ स्मार्टफोन चलाने के लिए 20 आसान सचित्र गाइड एवं डिजिटल सुरक्षा।"
                        : "Purpose-built digital autonomy and cyber fraud defense for senior citizens. Structured step-by-step guidance, calm cadence speech, and active coercion interception."}
                    </p>

                    <button
                      onClick={() => setIsVoiceOpen(true)}
                      className="px-6 py-3.5 rounded-xl bg-white text-black hover:bg-zinc-200 font-bold text-sm sm:text-base flex items-center space-x-2 shadow-xs transition-all"
                    >
                      <Mic className="w-4 h-4 text-black" />
                      <span>{language === 'kn' ? "ಧ್ವನಿ ಮೂಲಕ ಮಾತನಾಡಿ" : language === 'hi' ? "बोलकर पूछें" : "Voice Assistant (Infinite-Pause VAD)"}</span>
                    </button>
                  </div>
                </div>

                {/* Category Filters */}
                <div className="flex gap-2 overflow-x-auto pb-4 mb-6 no-scrollbar">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all border ${
                        selectedCategory === cat
                          ? 'bg-black text-white border-black dark:bg-white dark:text-black dark:border-white shadow-xs'
                          : 'bg-zinc-50 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800 hover:border-zinc-400'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Guides Grid in Minimalist Black/White Elegance */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {filteredGuides.map((guide) => {
                    const isCompleted = completedGuides.includes(guide.id);
                    return (
                      <div
                        key={guide.id}
                        onClick={() => setActiveGuide(guide)}
                        className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800 hover:border-black dark:hover:border-white shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                              {guide.category}
                            </span>
                            {isCompleted ? (
                              <span className="inline-flex items-center text-xs font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
                                <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Mastered
                              </span>
                            ) : (
                              <span className="text-xs text-zinc-400 font-medium">
                                {guide.steps.length} Steps
                              </span>
                            )}
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
                            Open Step-by-Step
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

      {/* Classy Floating Microphone Action Button */}
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
        onCheckScamQuery={(query) => {
          setActiveTab('scam-check');
        }}
      />
    </div>
  );
}
