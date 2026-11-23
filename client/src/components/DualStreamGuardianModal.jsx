import React, { useState, useEffect } from 'react';
import { 
  Radio, 
  PhoneCall, 
  Smartphone, 
  ShieldAlert, 
  EyeOff, 
  RefreshCw
} from 'lucide-react';
import { guardianService } from '../services/guardianService';
import { speechService } from '../services/speechService';

export default function DualStreamGuardianModal({ language }) {
  // Call Stream State
  const [callerNumber, setCallerNumber] = useState('+91 98452 11029 (Unknown)');
  const [callTranscript, setCallTranscript] = useState('Sir, your SBI YONO account will be blocked in 15 minutes. Download AnyDesk and share the 6 digit OTP you just received immediately!');
  const [isCallActive, setIsCallActive] = useState(true);

  // Screen Stream State
  const [isOTPVisible, setIsOTPVisible] = useState(true);
  const [isUPIPINActive, setIsUPIPINActive] = useState(false);
  const [isAPKInstalling, setIsAPKInstalling] = useState(false);

  // Evaluation & Emergency State
  const [evalResult, setEvalResult] = useState(null);
  const [isEmergencyActive, setIsEmergencyActive] = useState(false);

  useEffect(() => {
    runStreamCheck();

    const unsubscribe = guardianService.subscribe((event) => {
      if (event.type === 'EMERGENCY_SHIELD_ACTIVATED') {
        setIsEmergencyActive(true);
        triggerAudioAlert();
      } else if (event.type === 'EMERGENCY_SHIELD_DISMISSED') {
        setIsEmergencyActive(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const triggerAudioAlert = () => {
    const alertMsg = language === 'kn'
      ? "ಎಚ್ಚರಿಕೆ! ಕರೆ ಮಾಡುತ್ತಿರುವವರು ನಿಮ್ಮನ್ನು ಹೆದರಿಸಿ ಒಟಿಪಿ ಪಡೆಯಲು ಯತ್ನಿಸುತ್ತಿದ್ದಾರೆ. ನಿಮ್ಮ ಸುರಕ್ಷತೆಗಾಗಿ ಒಟಿಪಿ ಮರೆಮಾಡಲಾಗಿದೆ."
      : language === 'hi'
      ? "सावधान! फोन करने वाला आपको डराकर ओटीपी मांग रहा है। सुरक्षा के लिए स्क्रीन सुरक्षित कर दी गई है।"
      : "Guardian Alert: Active coercion detected. Bank officials never demand OTPs over calls. Your screen has been safeguarded.";
    
    speechService.speak(alertMsg, language);
  };

  const runStreamCheck = () => {
    const callStream = {
      callerNumber,
      transcript: isCallActive ? callTranscript : '',
      isKnownContact: false
    };

    const screenStream = {
      isOTPVisible,
      isUPIPINActive,
      isAPKInstalling
    };

    const res = guardianService.evaluateStreams(callStream, screenStream);
    setEvalResult(res);
    setIsEmergencyActive(res.isEmergencyTriggered);
  };

  const handleDismissShield = () => {
    guardianService.dismissEmergencyShield();
    setIsEmergencyActive(false);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 animate-fade-in">
      {/* Title & Info Banner */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-10 border border-zinc-200 dark:border-zinc-800 shadow-xs mb-8">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-black text-white dark:bg-white dark:text-black rounded-xl flex items-center justify-center">
              <Radio className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
                {language === 'kn' ? 'ಕರೆ ಸುರಕ್ಷತಾ ಸಹಾಯಕ' : language === 'hi' ? 'कॉल सुरक्षा सहायक' : 'Call Safety Helper'}
              </h2>
              <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 font-normal">
                {language === 'kn'
                  ? "ಫೋನ್ ಕರೆಯಲ್ಲಿ ಯಾರಾದರೂ ಒಟಿಪಿ ಕೇಳಿದರೆ ನಿಮ್ಮನ್ನು ಎಚ್ಚರಿಸಿ ರಕ್ಷಿಸುತ್ತದೆ."
                  : language === 'hi'
                  ? "फोन कॉल पर कोई ओटीपी या पैसे मांगे तो यह तुरंत आपको सचेत करता है।"
                  : "Checks if a caller is trying to steal your OTP or bank details, and automatically hides sensitive information."}
              </p>
            </div>
          </div>

          <button
            onClick={runStreamCheck}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-black text-white dark:bg-white dark:text-black font-semibold text-xs hover:opacity-90 transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>{language === 'kn' ? 'ಮತ್ತೆ ಪರಿಶೀಲಿಸಿ' : language === 'hi' ? 'दोबारा जांचें' : 'Check Again'}</span>
          </button>
        </div>

        {/* Threat Meter */}
        <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
              {language === 'kn' ? 'ಅಪಾಯದ ಮಟ್ಟ' : language === 'hi' ? 'खतरे का स्तर' : 'Risk Level'}
            </span>
            <span className={`text-sm font-bold ${
              (evalResult?.threatScore || 0) >= 70 ? 'text-red-600' : 'text-zinc-700 dark:text-zinc-300'
            }`}>
              {evalResult?.threatScore || 0}% {language === 'kn' ? 'ಅಪಾಯ' : language === 'hi' ? 'जोखिम' : 'Risk'}
            </span>
          </div>
          <div className="w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-300 ${
                (evalResult?.threatScore || 0) >= 70 ? 'bg-red-600' : 'bg-black dark:bg-white'
              }`}
              style={{ width: `${evalResult?.threatScore || 0}%` }}
            />
          </div>
        </div>
      </div>

      {/* Dual Streams Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* STREAM A: Live Phone Call NLP */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800 mb-4">
            <div className="flex items-center space-x-2">
              <PhoneCall className="w-4 h-4 text-zinc-700 dark:text-zinc-300" />
              <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
                {language === 'kn' ? '1. ಕರೆಯಲ್ಲಿ ಹೇಳುತ್ತಿರುವ ಮಾತುಗಳು' : language === 'hi' ? '1. कॉल पर कही जा रही बात' : '1. What the caller is saying'}
              </h3>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700">
              {language === 'kn' ? 'ಕರೆಯ ವಿವರ' : language === 'hi' ? 'कॉल विवरण' : 'Call Details'}
            </span>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-1">
                {language === 'kn' ? 'ಕರೆ ಮಾಡುವವರ ಸಂಖ್ಯೆ' : language === 'hi' ? 'फोन नंबर' : 'Caller Phone Number'}
              </label>
              <input
                type="text"
                value={callerNumber}
                onChange={(e) => setCallerNumber(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white font-medium text-xs"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-1">
                {language === 'kn' ? 'ಕರೆಯಲ್ಲಿ ಕೇಳಿಬಂದ ಮಾತುಗಳು' : language === 'hi' ? 'कॉल पर सुनाई देने वाले शब्द' : 'Words spoken on call'}
              </label>
              <textarea
                rows={3}
                value={callTranscript}
                onChange={(e) => setCallTranscript(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white font-medium text-xs"
              />
            </div>

            {/* Quick Presets */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              <button 
                onClick={() => setCallTranscript("Electricity officer speaking. Meter disconnecting in 20 minutes, download AnyDesk right now!")}
                className="text-xs px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 font-medium"
              >
                Electricity Cut Threat
              </button>
              <button 
                onClick={() => setCallTranscript("CBI Officer here. You are under Digital Arrest. Transfer funds immediately to verify innocence.")}
                className="text-xs px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 font-medium"
              >
                Digital Arrest Threat
              </button>
            </div>
          </div>
        </div>

        {/* STREAM B: Live Screen State */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800 mb-4">
            <div className="flex items-center space-x-2">
              <Smartphone className="w-4 h-4 text-zinc-700 dark:text-zinc-300" />
              <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
                {language === 'kn' ? '2. ನಿಮ್ಮ ಫೋನ್ ಸ್ಕ್ರೀನ್ ಸ್ಥಿತಿ' : language === 'hi' ? '2. फोन स्क्रीन की स्थिति' : '2. What is on your screen'}
              </h3>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700">
              {language === 'kn' ? 'ಸ್ಕ್ರೀನ್ ವಿವರ' : language === 'hi' ? 'स्क्रीन विवरण' : 'Screen State'}
            </span>
          </div>

          <div className="space-y-4">
            <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 space-y-2.5">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                  {language === 'kn' ? 'ಬ್ಯಾಂಕ್‌ನಿಂದ ಬಂದ ಒಟಿಪಿ ಮೆಸೇಜ್ (ಉದಾ: 482910)' : language === 'hi' ? 'बैंक से आया ओटीपी मैसेज' : 'Bank SMS with OTP (e.g., 482910)'}
                </span>
                <input
                  type="checkbox"
                  checked={isOTPVisible}
                  onChange={(e) => setIsOTPVisible(e.target.checked)}
                  className="w-4 h-4 rounded accent-black"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                  {language === 'kn' ? 'ಯುಪಿಐ ಪಿನ್ ಹಾಕುವ ಜಾಗ (PhonePe/GPay)' : language === 'hi' ? 'यूपीआई पिन दर्ज करने वाली स्क्रीन' : 'UPI PIN Entry Screen (PhonePe/GPay)'}
                </span>
                <input
                  type="checkbox"
                  checked={isUPIPINActive}
                  onChange={(e) => setIsUPIPINActive(e.target.checked)}
                  className="w-4 h-4 rounded accent-black"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                  {language === 'kn' ? 'ಅಪರಿಚಿತ ಆ್ಯಪ್ ಡೌನ್‌ಲೋಡ್ ಆಗುತ್ತಿದೆ' : language === 'hi' ? 'अपरिचित ऐप डाउनलोड हो रहा है' : 'Unknown app is downloading'}
                </span>
                <input
                  type="checkbox"
                  checked={isAPKInstalling}
                  onChange={(e) => setIsAPKInstalling(e.target.checked)}
                  className="w-4 h-4 rounded accent-black"
                />
              </label>
            </div>

            {/* Screen Preview Card */}
            <div className="p-3.5 rounded-xl bg-black text-white font-mono text-xs border border-zinc-800 relative">
              <div className="text-zinc-500 text-[10px] pb-1 uppercase tracking-wider">
                {language === 'kn' ? 'ಸ್ಕ್ರೀನ್ ಪ್ರದರ್ಶನ:' : language === 'hi' ? 'स्क्रीन दृश्य:' : 'Screen Display:'}
              </div>
              {isOTPVisible ? (
                <div className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-800 mt-1">
                  <div className="text-zinc-400 font-bold mb-1">
                    {language === 'kn' ? 'ಬ್ಯಾಂಕ್ ಮೆಸೇಜ್:' : language === 'hi' ? 'बैंक मैसेज:' : 'SMS from Bank:'}
                  </div>
                  {isEmergencyActive ? (
                    <div className="p-2 rounded bg-zinc-800 text-white font-bold flex items-center space-x-2 border border-zinc-700">
                      <EyeOff className="w-3.5 h-3.5" />
                      <span>•••••• [{language === 'kn' ? 'ಸುರಕ್ಷತೆಗಾಗಿ ಮರೆಮಾಡಲಾಗಿದೆ' : language === 'hi' ? 'सुरक्षा के लिए छिपाया गया' : 'HIDDEN FOR YOUR SAFETY'}]</span>
                    </div>
                  ) : (
                    <div className="text-zinc-200 font-medium">
                      Your OTP for Rs 25,000 is 482910. Do not share.
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-zinc-600 italic py-1">No sensitive OTP or PIN on screen.</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Emergency Shield Modal */}
      {isEmergencyActive && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-fade-in">
          <div className="relative w-full max-w-lg bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-10 shadow-2xl border-2 border-zinc-900 dark:border-white text-center">
            <div className="w-14 h-14 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white flex items-center justify-center mx-auto mb-4 border border-zinc-300 dark:border-zinc-700">
              <ShieldAlert className="w-8 h-8" />
            </div>

            <span className="inline-flex items-center px-3 py-1 rounded-md text-xs font-bold bg-black text-white dark:bg-white dark:text-black uppercase tracking-wider mb-2">
              Active Coercion Intercepted
            </span>

            <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-white mt-1 mb-2">
              {language === 'kn' ? "ಆತಂಕ ಬೇಡ ಅಮ್ಮಾ" : language === 'hi' ? "घबराएं नहीं माताजी" : "Take a Deep Breath, Amma"}
            </h3>

            <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-300 font-normal mb-6 leading-relaxed">
              {language === 'kn' 
                ? "ಕರೆ ಮಾಡುತ್ತಿರುವವರು ನಿಮ್ಮನ್ನು ಹೆದರಿಸಿ ಒಟಿಪಿ ಕೇಳುತ್ತಿದ್ದಾರೆ. ನಿಮ್ಮ ಹಣ ರಕ್ಷಿಸಲು ಒಟಿಪಿಯನ್ನು ಮರೆಮಾಡಲಾಗಿದೆ."
                : language === 'hi'
                ? "फोन करने वाला आपको डराकर गुप्त कोड मांग रहा है। सुरक्षा के लिए स्क्रीन सुरक्षित कर दी गई है।"
                : "The caller is attempting to coerce you while asking for sensitive credentials. Legitimate officials never stay on call demanding OTPs."}
            </p>

            <button
              onClick={handleDismissShield}
              className="w-full py-3.5 rounded-xl bg-black text-white dark:bg-white dark:text-black font-bold text-sm hover:opacity-90 transition-all"
            >
              I Understand - Dismiss Safely
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
