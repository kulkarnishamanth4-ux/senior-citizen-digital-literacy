import React, { useState, useEffect } from 'react';
import { 
  Radio, 
  PhoneCall, 
  Smartphone, 
  AlertOctagon, 
  ShieldAlert, 
  ShieldCheck, 
  Lock, 
  EyeOff, 
  Send, 
  Check, 
  RefreshCw,
  BellRing
} from 'lucide-react';
import { guardianService } from '../services/guardianService';
import { speechService } from '../services/speechService';

export default function DualStreamGuardianModal({ language }) {
  // Call Stream State
  const [callerNumber, setCallerNumber] = useState('+91 98452 11029 (Unknown Number)');
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
    // Initial evaluation
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
      ? "ಎಚ್ಚರಿಕೆ! ಕರೆ ಮಾಡುತ್ತಿರುವವರು ನಿಮ್ಮನ್ನು ಹೆದರಿಸಿ ಒಟಿಪಿ ಪಡೆಯಲು ಯತ್ನಿಸುತ್ತಿದ್ದಾರೆ. ನಿಮ್ಮ ಸುರಕ್ಷತೆಗಾಗಿ ಒಟಿಪಿ ಮರೆಮಾಡಲಾಗಿದೆ. ಆತಂಕ ಬೇಡ."
      : language === 'hi'
      ? "सावधान! फोन करने वाला आपको डराकर ओटीपी मांग रहा है। सुरक्षा के लिए ओटीपी छुपा दिया गया है। घबराएं नहीं।"
      : "Guardian Alert: Active coercion detected. Bank and utility officials never demand OTPs over calls. Your screen has been safeguarded.";
    
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
    <div className="max-w-6xl mx-auto px-4 py-6 animate-fade-in">
      {/* Title & Info Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border-2 border-slate-200 dark:border-slate-800 shadow-md mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-red-100 dark:bg-red-950/80 text-red-600 rounded-2xl">
              <Radio className="w-8 h-8 animate-pulse" />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                Dual-Stream Call & Screen Guardian
              </h2>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 font-medium">
                Active Coercion Interception: Correlates live call intimidation with real-time screen events to stop scams mid-flight.
              </p>
            </div>
          </div>

          <button
            onClick={runStreamCheck}
            className="flex items-center space-x-2 px-5 py-2.5 rounded-2xl bg-amber-500 text-slate-950 font-bold hover:bg-amber-400 transition-all shadow-sm"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Re-evaluate Streams</span>
          </button>
        </div>

        {/* Real-Time Correlation Threat Meter */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Cross-Modal Threat Multiplier
            </span>
            <span className={`text-lg font-black ${
              (evalResult?.threatScore || 0) >= 70 ? 'text-red-600' : 'text-amber-500'
            }`}>
              {evalResult?.threatScore || 0}% RISK SCORE
            </span>
          </div>
          <div className="w-full h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-500 ${
                (evalResult?.threatScore || 0) >= 70 
                  ? 'bg-gradient-to-r from-amber-500 to-red-600' 
                  : 'bg-amber-500'
              }`}
              style={{ width: `${evalResult?.threatScore || 0}%` }}
            />
          </div>
        </div>
      </div>

      {/* Dual Streams Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* STREAM A: Live Phone Call NLP */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border-2 border-slate-200 dark:border-slate-800 shadow-md">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
            <div className="flex items-center space-x-2">
              <PhoneCall className="w-5 h-5 text-red-500 animate-bounce" />
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                Stream 1: Live Call Audio & NLP
              </h3>
            </div>
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 dark:bg-red-950/80 dark:text-red-300">
              Active Call
            </span>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                Incoming Caller ID
              </label>
              <input
                type="text"
                value={callerNumber}
                onChange={(e) => setCallerNumber(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                Real-Time Audio Speech-to-Text Transcript
              </label>
              <textarea
                rows={3}
                value={callTranscript}
                onChange={(e) => setCallTranscript(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium text-sm"
              />
            </div>

            {/* Simulated preset quick phrases */}
            <div className="flex flex-wrap gap-2 pt-1">
              <button 
                onClick={() => setCallTranscript("Electricity officer speaking. Meter disconnecting in 20 minutes, download AnyDesk right now!")}
                className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 font-semibold"
              >
                Electricity Cut Threat
              </button>
              <button 
                onClick={() => setCallTranscript("CBI Officer here. You are under Digital Arrest. Transfer 50,000 immediately to verify innocence.")}
                className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 font-semibold"
              >
                Digital Arrest Threat
              </button>
            </div>
          </div>
        </div>

        {/* STREAM B: Live Screen State & Accessibility Tree */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border-2 border-slate-200 dark:border-slate-800 shadow-md">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
            <div className="flex items-center space-x-2">
              <Smartphone className="w-5 h-5 text-amber-500" />
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                Stream 2: Concurrent Screen State
              </h3>
            </div>
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300">
              Accessibility Tree
            </span>
          </div>

          <div className="space-y-4">
            {/* Screen Toggles */}
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-3">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  Incoming Bank SMS with OTP (e.g., 482910)
                </span>
                <input
                  type="checkbox"
                  checked={isOTPVisible}
                  onChange={(e) => setIsOTPVisible(e.target.checked)}
                  className="w-5 h-5 text-amber-500 rounded accent-amber-500"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  UPI PIN Entry Screen Open (PhonePe/GPay)
                </span>
                <input
                  type="checkbox"
                  checked={isUPIPINActive}
                  onChange={(e) => setIsUPIPINActive(e.target.checked)}
                  className="w-5 h-5 text-amber-500 rounded accent-amber-500"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  Unauthorized APK File Installing
                </span>
                <input
                  type="checkbox"
                  checked={isAPKInstalling}
                  onChange={(e) => setIsAPKInstalling(e.target.checked)}
                  className="w-5 h-5 text-amber-500 rounded accent-amber-500"
                />
              </label>
            </div>

            {/* Screen Preview Card */}
            <div className="p-4 rounded-2xl bg-slate-950 text-white font-mono text-xs border border-slate-800 relative">
              <div className="text-slate-500 text-[10px] pb-1 uppercase tracking-wider">
                Phone Screen Active Notification Layer:
              </div>
              {isOTPVisible ? (
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 mt-1">
                  <div className="text-slate-400 font-bold mb-1">SMS from VK-SBIINB:</div>
                  {isEmergencyActive ? (
                    <div className="p-2 rounded bg-red-950/80 border border-red-700 text-red-200 font-bold flex items-center space-x-2">
                      <EyeOff className="w-4 h-4 text-red-400" />
                      <span>•••••• [MASKED BY GUARDIAN SHIELD]</span>
                    </div>
                  ) : (
                    <div className="text-amber-400 font-bold">
                      Your One Time Password (OTP) for Rs 25,000 is 482910. Do not share.
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-slate-600 italic py-2">No sensitive OTP or PIN detected on screen.</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* EMERGENCY SHIELD OVERLAY (TRIGGERED STATE) */}
      {isEmergencyActive && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-red-950/85 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-10 shadow-2xl border-4 border-red-600 text-center shield-pulse">
            <div className="w-20 h-20 rounded-full bg-red-100 dark:bg-red-950/90 text-red-600 flex items-center justify-center mx-auto mb-4">
              <ShieldAlert className="w-12 h-12 animate-pulse" />
            </div>

            <span className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-black bg-red-600 text-white uppercase tracking-wider mb-2">
              🚨 ACTIVE COERCION DETECTED & INTERCEPTED
            </span>

            <h3 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white mt-2 mb-3">
              {language === 'kn' ? "ಆತಂಕ ಬೇಡ ಅಮ್ಮಾ, ನಾವು ನಿಮ್ಮ ಜೊತೆಗಿದ್ದೇವೆ" : language === 'hi' ? "घबराएं नहीं माताजी, हम आपकी रक्षा कर रहे हैं" : "Take a Deep Breath, Amma"}
            </h3>

            <p className="text-base sm:text-xl text-slate-700 dark:text-slate-300 font-semibold mb-6 max-w-lg mx-auto">
              {language === 'kn' 
                ? "ಕರೆ ಮಾಡುತ್ತಿರುವವರು ನಿಮ್ಮನ್ನು ಹೆದರಿಸಿ ಒಟಿಪಿ ಕೇಳುತ್ತಿದ್ದಾರೆ. ನಿಮ್ಮ ಹಣ ರಕ್ಷಿಸಲು ಒಟಿಪಿಯನ್ನು ಮರೆಮಾಡಲಾಗಿದೆ ಮತ್ತು ಕರೆಯನ್ನು ಬ್ಲಾಕ್ ಮಾಡಲು ಸೂಚಿಸಲಾಗಿದೆ."
                : language === 'hi'
                ? "फोन करने वाला आपको डराकर गुप्त कोड मांग रहा है। आपके पैसे बचाने के लिए स्क्रीन सुरक्षित कर दी गई है।"
                : "The caller is attempting to coerce you while asking for secret codes. Real banks never stay on call demanding OTPs. We have masked your OTP and sent a silent alert to your family."}
            </p>

            {/* Red Flags List */}
            <div className="bg-red-50 dark:bg-red-950/40 p-4 rounded-2xl border border-red-200 dark:border-red-900 text-left mb-6 text-sm font-semibold text-red-900 dark:text-red-200">
              <div className="font-bold uppercase tracking-wider text-xs mb-2 text-red-700 dark:text-red-400">
                Guarding Actions Automatically Executed:
              </div>
              <ul className="space-y-1.5 list-disc list-inside">
                <li>Dynamic Screen Masking applied: OTP digits hidden from sight</li>
                <li>Sensitive touch inputs to payment screens temporarily soft-locked</li>
                <li>Silent notification dispatched to Caregiver Companion Dashboard</li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={handleDismissShield}
                className="w-full sm:w-auto min-h-[56px] px-8 py-3 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black text-lg hover:bg-slate-800 transition-all"
              >
                I Understand - Cut Call Safely
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
