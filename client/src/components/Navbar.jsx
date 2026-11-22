import React from 'react';
import { 
  ShieldCheck, 
  Volume2, 
  Type, 
  Sun, 
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
  fontScale,
  setFontScale,
  theme,
  setTheme,
  activeTab,
  setActiveTab,
  unreadAlertCount
}) {
  const brandTitle = APP_CONFIG.brandName[language] || APP_CONFIG.brandName.en;
  const subTitle = APP_CONFIG.subtitle[language] || APP_CONFIG.subtitle.en;

  const navItems = [
    { id: 'guides', label: { en: '20 Digital Guides', kn: 'ಮಾರ್ಗದರ್ಶಿಗಳು', hi: 'डिजिटल गाइड' }, icon: BookOpen },
    { id: 'scam-check', label: { en: 'Is This a Scam?', kn: 'ಇದು ವಂಚನೆಯೇ?', hi: 'क्या यह फर्जी है?' }, icon: Search },
    { id: 'vaccine', label: { en: 'Digital Vaccine', kn: 'ಡಿಜಿಟಲ್ ಲಸಿಕೆ (ಅಭ್ಯಾಸ)', hi: 'डिजिटल वैक्सीन' }, icon: Award },
    { id: 'guardian-sim', label: { en: 'Live Guardian Interceptor', kn: 'ಲೈವ್ ರಕ್ಷಕ ಗಾರ್ಡಿಯನ್', hi: 'लाइव सुरक्षा गार्डियन' }, icon: Radio },
    { id: 'evaluation', label: { en: 'Pre / Post Test', kn: 'ಪರೀಕ್ಷೆ & ಅಂಕಗಳು', hi: 'जांच व प्रगति' }, icon: ShieldCheck },
    { id: 'caregiver', label: { en: 'Family Dashboard', kn: 'ಕುಟುಂಬ ಪೋರ್ಟಲ್', hi: 'परिवार पोर्टल' }, icon: Users, badge: unreadAlertCount }
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur border-b border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
        {/* Top Control Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-slate-100 dark:border-slate-800">
          {/* Logo & Branding */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('guides')}>
            <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-black text-2xl shadow-md">
              {APP_CONFIG.logoInitial}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                  {brandTitle}
                </h1>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300">
                  <ShieldCheck className="w-3.5 h-3.5 mr-1 text-emerald-600 dark:text-emerald-400" />
                  Active Shield
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                {subTitle}
              </p>
            </div>
          </div>

          {/* Senior Accessibility Quick Toggles */}
          <div className="flex items-center flex-wrap gap-2">
            {/* Language Selector */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-sm font-semibold">
              <button
                onClick={() => setLanguage('en')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  language === 'en' 
                    ? 'bg-amber-500 text-slate-950 shadow-sm font-bold' 
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                }`}
              >
                English
              </button>
              <button
                onClick={() => setLanguage('kn')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  language === 'kn' 
                    ? 'bg-amber-500 text-slate-950 shadow-sm font-bold' 
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                }`}
              >
                ಕನ್ನಡ
              </button>
              <button
                onClick={() => setLanguage('hi')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  language === 'hi' 
                    ? 'bg-amber-500 text-slate-950 shadow-sm font-bold' 
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                }`}
              >
                हिन्दी
              </button>
            </div>

            {/* Font Size Scaler */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-bold">
              <span className="px-2 text-slate-400 flex items-center">
                <Type className="w-3.5 h-3.5 mr-0.5" /> Size:
              </span>
              <button
                onClick={() => setFontScale('normal')}
                className={`px-2 py-1 rounded ${fontScale === 'normal' ? 'bg-amber-400 text-slate-900' : 'text-slate-600 dark:text-slate-300'}`}
                title="Normal Font Size"
              >
                A
              </button>
              <button
                onClick={() => setFontScale('large')}
                className={`px-2 py-1 rounded text-sm ${fontScale === 'large' ? 'bg-amber-400 text-slate-900' : 'text-slate-600 dark:text-slate-300'}`}
                title="Large Font Size"
              >
                A+
              </button>
              <button
                onClick={() => setFontScale('jumbo')}
                className={`px-2 py-1 rounded text-base font-extrabold ${fontScale === 'jumbo' ? 'bg-amber-400 text-slate-900' : 'text-slate-600 dark:text-slate-300'}`}
                title="Jumbo Senior Font Size"
              >
                A++
              </button>
            </div>

            {/* Contrast Mode Toggle */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-bold">
              <button
                onClick={() => setTheme(theme === 'normal' ? 'high-contrast-yellow' : 'normal')}
                className={`px-2.5 py-1.5 rounded-lg transition-all flex items-center ${
                  theme === 'high-contrast-yellow'
                    ? 'bg-yellow-400 text-black font-extrabold shadow-sm'
                    : 'text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
                title="High Contrast Mode for Low Vision"
              >
                <Sun className="w-3.5 h-3.5 mr-1" />
                {theme === 'high-contrast-yellow' ? 'High Contrast ON' : 'High Contrast'}
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Tab Bar */}
        <nav className="flex items-center space-x-1 sm:space-x-2 pt-2.5 overflow-x-auto no-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-xl text-sm sm:text-base font-bold whitespace-nowrap transition-all relative ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 shadow-sm scale-102'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${isActive ? 'text-slate-950' : 'text-amber-500'}`} />
                <span>{item.label[language] || item.label.en}</span>
                {item.badge > 0 && (
                  <span className="ml-1.5 px-2 py-0.5 text-xs rounded-full bg-red-600 text-white font-extrabold animate-pulse">
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
