import React from 'react';
import { 
  ShieldCheck, 
  ZoomIn, 
  ZoomOut, 
  Sun, 
  Moon, 
  Users, 
  BookOpen, 
  Search, 
  Award,
  Radio
} from 'lucide-react';
import { APP_CONFIG } from '../config/appConfig';

export default function Navbar({
  language,
  setLanguage,
  zoomLevel,
  setZoomLevel,
  theme,
  setTheme,
  activeTab,
  setActiveTab,
  unreadAlertCount
}) {
  const brandTitle = APP_CONFIG.brandName[language] || APP_CONFIG.brandName.en;
  const subTitle = APP_CONFIG.subtitle[language] || APP_CONFIG.subtitle.en;

  const zoomLevels = [100, 115, 130, 150, 175, 200];

  const handleZoomChange = (delta) => {
    const currentIndex = zoomLevels.indexOf(zoomLevel);
    let newIndex = currentIndex !== -1 ? currentIndex + delta : 1;
    newIndex = Math.max(0, Math.min(zoomLevels.length - 1, newIndex));
    setZoomLevel(zoomLevels[newIndex]);
  };

  const navItems = [
    { id: 'guides', label: { en: '20 Guides', kn: 'ಮಾರ್ಗದರ್ಶಿಗಳು', hi: '20 गाइड' }, icon: BookOpen },
    { id: 'scam-check', label: { en: 'Scam Verifier', kn: 'ವಂಚನೆ ಪರೀಕ್ಷಕ', hi: 'स्कैम जांच' }, icon: Search },
    { id: 'vaccine', label: { en: 'Safety Sandbox', kn: 'ಅಭ್ಯಾಸ ಪೋರ್ಟಲ್', hi: 'सुरक्षा अभ्यास' }, icon: Award },
    { id: 'guardian-sim', label: { en: 'Guardian Shield', kn: 'ಲೈವ್ ಗಾರ್ಡಿಯನ್', hi: 'गार्डियन शील्ड' }, icon: Radio },
    { id: 'evaluation', label: { en: 'Pre / Post Test', kn: 'ಮೌಲ್ಯಮಾಪನ', hi: 'प्रगति जांच' }, icon: ShieldCheck },
    { id: 'caregiver', label: { en: 'Family Portal', kn: 'ಕುಟುಂಬ ಪೋರ್ಟಲ್', hi: 'परिवार पोर्टल' }, icon: Users, badge: unreadAlertCount }
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-zinc-950/95 backdrop-blur border-b border-zinc-200 dark:border-zinc-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
        {/* Top Minimalist Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-zinc-100 dark:border-zinc-900">
          {/* Logo & Academic Title */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('guides')}>
            <div className="w-10 h-10 rounded-xl bg-black text-white dark:bg-white dark:text-black flex items-center justify-center font-bold text-xl tracking-tight shadow-sm">
              {APP_CONFIG.logoInitial}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                  {brandTitle}
                </h1>
                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
                  <ShieldCheck className="w-3 h-3 mr-1 text-emerald-600 dark:text-emerald-400" />
                  Protected
                </span>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 font-normal">
                {subTitle}
              </p>
            </div>
          </div>

          {/* Controls: Zoom, Language & Contrast */}
          <div className="flex items-center flex-wrap gap-2.5">
            {/* Numerical Zoom Controls */}
            <div className="flex items-center bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-1 text-xs">
              <button
                onClick={() => handleZoomChange(-1)}
                disabled={zoomLevel <= 100}
                className="p-1.5 rounded-lg text-zinc-600 dark:text-zinc-300 hover:bg-white dark:hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>

              <div className="flex items-center px-1 space-x-1">
                {zoomLevels.map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => setZoomLevel(lvl)}
                    className={`px-2 py-1 rounded-md text-xs font-semibold transition-all ${
                      zoomLevel === lvl
                        ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs font-bold'
                        : 'text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white'
                    }`}
                  >
                    {lvl}%
                  </button>
                ))}
              </div>

              <button
                onClick={() => handleZoomChange(1)}
                disabled={zoomLevel >= 200}
                className="p-1.5 rounded-lg text-zinc-600 dark:text-zinc-300 hover:bg-white dark:hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Language Switcher */}
            <div className="flex items-center bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-1 text-xs font-semibold">
              <button
                onClick={() => setLanguage('en')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  language === 'en'
                    ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white'
                }`}
              >
                EN
              </button>
              <button
                onClick={() => setLanguage('kn')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  language === 'kn'
                    ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white'
                }`}
              >
                ಕನ್ನಡ
              </button>
              <button
                onClick={() => setLanguage('hi')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  language === 'hi'
                    ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white'
                }`}
              >
                हिन्दी
              </button>
            </div>

            {/* Dark / Light Mode */}
            <button
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-all"
              title="Toggle Light / Dark"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Navigation Tabs in Refined Monochrome */}
        <nav className="flex items-center space-x-1.5 pt-2.5 overflow-x-auto no-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all border ${
                  isActive
                    ? 'bg-black text-white border-black dark:bg-white dark:text-black dark:border-white shadow-xs'
                    : 'bg-transparent text-zinc-600 dark:text-zinc-400 border-transparent hover:bg-zinc-100 dark:hover:bg-zinc-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label[language] || item.label.en}</span>
                {item.badge > 0 && (
                  <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-red-600 text-white font-bold">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
