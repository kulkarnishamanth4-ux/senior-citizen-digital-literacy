import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Search, 
  Award, 
  Radio, 
  ShieldCheck, 
  Users, 
  Mic, 
  AlertOctagon, 
  Sparkles,
  ChevronRight,
  Filter,
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
import { speechService } from './services/speechService';

export default function App() {
  const [language, setLanguage] = useState('en'); // 'en' | 'kn' | 'hi'
  const [fontScale, setFontScale] = useState('large'); // 'normal' | 'large' | 'jumbo'
  const [theme, setTheme] = useState('normal'); // 'normal' | 'high-contrast-yellow'
  const [activeTab, setActiveTab] = useState('guides');
  const [activeGuide, setActiveGuide] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);

  // Persistence State
  const [completedGuides, setCompletedGuides] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('sahayak_completed_guides')) || [];
    } catch {
      return [];
    }
  });

  const [earnedBadges, setEarnedBadges] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('sahayak_earned_badges')) || [];
    } catch {
      return [];
    }
  });

  const [evaluationData, setEvaluationData] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('sahayak_evaluation_data')) || null;
    } catch {
      return null;
    }
  });

  const [alertsCount, setAlertsCount] = useState(() => guardianService.getCaregiverAlerts().length);

  // Sync theme & font scale to document body
  useEffect(() => {
    document.body.className = `theme-${theme} font-scale-${fontScale}`;
  }, [theme, fontScale]);

  const handleCompleteGuide = (guideId) => {
    if (!completedGuides.includes(guideId)) {
      const updated = [...completedGuides, guideId];
      setCompletedGuides(updated);
      localStorage.setItem('sahayak_completed_guides', JSON.stringify(updated));
    }
    setActiveGuide(null);
  };

  const handleEarnBadge = (badgeId) => {
    if (!earnedBadges.includes(badgeId)) {
      const updated = [...earnedBadges, badgeId];
      setEarnedBadges(updated);
      localStorage.setItem('sahayak_earned_badges', JSON.stringify(updated));
    }
  };

  const handleSaveEvaluation = (data) => {
    setEvaluationData(data);
    localStorage.setItem('sahayak_evaluation_data', JSON.stringify(data));
  };

  const categories = ['All', 'Communication', 'Digital Payments', 'Smartphone Settings', 'Healthcare & Civic'];

  const filteredGuides = selectedCategory === 'All'
    ? TASK_GUIDES
    : TASK_GUIDES.filter(g => g.category === selectedCategory);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      {/* Accessible Navbar */}
      <Navbar
        language={language}
        setLanguage={setLanguage}
        fontScale={fontScale}
        setFontScale={setFontScale}
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
              <div className="max-w-6xl mx-auto px-4 py-6 animate-fade-in">
                {/* Hero Banner */}
                <div className="bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 rounded-3xl p-6 sm:p-10 text-slate-950 shadow-xl mb-8 relative overflow-hidden">
                  <div className="max-w-2xl">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-black bg-slate-950 text-amber-300 uppercase tracking-wider mb-3">
                      BMSIT&M Societal Project (1BSOP308)
                    </span>
                    <h2 className="text-3xl sm:text-5xl font-black tracking-tight mb-3">
                      {language === 'kn' ? "ಡಿಜಿಟಲ್ ಸಹಾಯಕ್" : language === 'hi' ? "डिजिटल सहायक" : "Digital Literacy Guides"}
                    </h2>
                    <p className="text-base sm:text-xl font-bold opacity-90 mb-6">
                      {language === 'kn'
                        ? "ಭಯವಿಲ್ಲದೆ, ಸ್ವತಂತ್ರವಾಗಿ ಸ್ಮಾರ್ಟ್‌ಫೋನ್ ಬಳಸಲು 20 ಹಂತ-ಹಂತದ ಸರಳ ಮಾರ್ಗದರ್ಶಿಗಳು."
                        : language === 'hi'
                        ? "आत्मविश्वास के साथ स्मार्टफोन चलाने के लिए 20 आसान सचित्र गाइड।"
                        : "20 step-by-step visual guides designed specifically for senior citizens with voice pacing & spotlight assistance."}
                    </p>

                    <button
                      onClick={() => setIsVoiceOpen(true)}
                      className="px-6 py-3.5 rounded-2xl bg-slate-950 text-amber-300 hover:bg-slate-900 font-black text-base flex items-center space-x-2 shadow-lg transition-transform hover:scale-102"
                    >
                      <Mic className="w-5 h-5 text-amber-400" />
                      <span>{language === 'kn' ? "ಧ್ವನಿ ಮೂಲಕ ಕೇಳಿ" : language === 'hi' ? "बोलकर पूछें" : "Ask by Voice (Infinite-Pause VAD)"}</span>
                    </button>
                  </div>
                </div>

                {/* Category Filters */}
                <div className="flex gap-2 overflow-x-auto pb-4 mb-6 no-scrollbar">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-4 py-2.5 rounded-2xl text-sm font-bold whitespace-nowrap transition-all border ${
                        selectedCategory === cat
                          ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-sm font-black'
                          : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-amber-400'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Guides Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredGuides.map((guide) => {
                    const isCompleted = completedGuides.includes(guide.id);
                    return (
                      <div
                        key={guide.id}
                        onClick={() => setActiveGuide(guide)}
                        className="bg-white dark:bg-slate-900 rounded-3xl p-6 border-2 border-slate-200 dark:border-slate-800 hover:border-amber-400 dark:hover:border-amber-500 shadow-sm hover:shadow-xl transition-all cursor-pointer flex flex-col justify-between group"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-black uppercase tracking-wider text-amber-600 dark:text-amber-400">
                              {guide.category}
                            </span>
                            {isCompleted ? (
                              <span className="inline-flex items-center text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-1 rounded-full">
                                <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Mastered
                              </span>
                            ) : (
                              <span className="text-xs font-bold text-slate-400">
                                {guide.steps.length} Steps
                              </span>
                            )}
                          </div>

                          <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2 group-hover:text-amber-500 transition-colors">
                            {guide.title[language] || guide.title.en}
                          </h3>

                          <p className="text-sm font-medium text-slate-600 dark:text-slate-400 line-clamp-2">
                            {guide.description[language] || guide.description.en}
                          </p>
                        </div>

                        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                          <span className="text-xs font-black text-slate-900 dark:text-amber-300">
                            Start Step-by-Step
                          </span>
                          <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300 group-hover:bg-amber-500 group-hover:text-slate-950 transition-colors">
                            <ChevronRight className="w-4 h-4" />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 2: IS THIS A SCAM? */}
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

            {/* TAB 3: DIGITAL VACCINE SANDBOX */}
            {activeTab === 'vaccine' && (
              <DigitalVaccineSandbox
                language={language}
                onEarnBadge={handleEarnBadge}
              />
            )}

            {/* TAB 4: DUAL STREAM GUARDIAN (LIVE INTERCEPTOR SIMULATION) */}
            {activeTab === 'guardian-sim' && (
              <DualStreamGuardianModal language={language} />
            )}

            {/* TAB 5: PRE/POST TEST EVALUATION */}
            {activeTab === 'evaluation' && (
              <PrePostTest
                language={language}
                onSaveEvaluation={handleSaveEvaluation}
              />
            )}

            {/* TAB 6: CAREGIVER DASHBOARD */}
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

      {/* Floating Patient Voice Assistant Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setIsVoiceOpen(true)}
          className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center shadow-2xl hover:bg-amber-400 hover:scale-105 transition-all ring-4 ring-amber-200 dark:ring-amber-950"
          title="Infinite-Pause Voice Companion"
        >
          <Mic className="w-8 h-8 sm:w-10 sm:h-10" />
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
