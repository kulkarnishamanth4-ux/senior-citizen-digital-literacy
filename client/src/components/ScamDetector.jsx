import React, { useState } from 'react';
import { 
  Search, 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  Volume2, 
  Copy, 
  Trash2, 
  Sparkles,
  PhoneCall,
  CheckCircle2
} from 'lucide-react';
import { speechService } from '../services/speechService';

export default function ScamDetector({ language, onAlertCaregiver }) {
  const [inputText, setInputText] = useState('');
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const presets = [
    {
      title: "Electricity Disconnection SMS",
      text: "Dear Customer, your electricity power will be disconnected at 9:30 PM tonight from electricity office due to pending bill. Immediately call officer Rahul at 9845211029."
    },
    {
      title: "SBI YONO PAN Card Link",
      text: "Dear Customer, your SBI YONO account has been suspended today. Click http://sbi-pan-update.apk to avoid permanent closure."
    },
    {
      title: "Lottery Cash Prize Collect Trap",
      text: "Congratulations! You won Rs 25,000 cash prize in festive draw. Enter your 6-digit UPI PIN in PhonePe to accept funds."
    },
    {
      title: "Genuine Bank Transaction SMS",
      text: "Dear SBI Customer, your A/C ending in 4092 has been credited with Rs 1,500 on 22-Nov-2026 by UPI. Avl Bal: Rs 14,250. -SBI"
    }
  ];

  const analyzeMessage = (textToTest) => {
    const text = (textToTest || inputText).trim();
    if (!text) return;

    setIsAnalyzing(true);

    setTimeout(() => {
      const lower = text.toLowerCase();
      let threatLevel = 'SAFE';
      let score = 10;
      let reasons = [];
      let advice = '';

      // Check red flags
      const isUrgent = lower.includes('immediately') || lower.includes('tonight') || lower.includes('suspended') || lower.includes('within 2 hours') || lower.includes('disconnected');
      const hasPhone = /\b\d{10}\b/.test(text);
      const hasAPK = lower.includes('.apk') || lower.includes('http');
      const asksPINorOTP = lower.includes('pin') || lower.includes('otp') || lower.includes('anydesk') || lower.includes('teamviewer');
      const claimsPrize = lower.includes('won') || lower.includes('prize') || lower.includes('lottery') || lower.includes('congratulations');

      if (hasAPK || (isUrgent && (hasPhone || asksPINorOTP)) || (claimsPrize && asksPINorOTP)) {
        threatLevel = 'DANGER';
        score = 95;
        if (hasAPK) reasons.push("Contains a link downloading an APK file (often malware/virus).");
        if (isUrgent) reasons.push("Uses high-pressure fear tactics ('power cut tonight' / 'account suspended').");
        if (asksPINorOTP) reasons.push("Asks for secret UPI PIN or OTP (Banks never ask this).");
        if (hasPhone) reasons.push("Asks you to call an unofficial personal 10-digit mobile number.");

        advice = language === 'kn'
          ? "ಇದು ನೂರಕ್ಕೆ ನೂರು ವಂಚನೆಯ ಸಂದೇಶ! ಯಾರೊಂದಿಗೂ ಒಟಿಪಿ ಹಂಚಿಕೊಳ್ಳಬೇಡಿ ಮತ್ತು ಯಾವುದೇ ಲಿಂಕ್ ಮುಟ್ಟಬೇಡಿ."
          : language === 'hi'
          ? "यह 100% धोखाधड़ी का संदेश है! किसी भी लिंक पर क्लिक न करें और न ही फोन करें।"
          : "CRITICAL SCAM ALERT! Legitimate banks and electricity boards never send threats from personal mobile numbers. Do not call or click.";
      } else if (isUrgent || claimsPrize || hasPhone) {
        threatLevel = 'CAUTION';
        score = 65;
        reasons.push("Message contains urgent wording or requests immediate contact.");
        advice = language === 'kn'
          ? "ಎಚ್ಚರಿಕೆಯಿಂದಿರಿ! ಅಪರಿಚಿತ ಸಂಖ್ಯೆಗಳಿಗೆ ಮರುಕರೆ ಮಾಡಬೇಡಿ."
          : language === 'hi'
          ? "सावधान रहें! किसी भी संदिग्ध नंबर पर कॉल न करें।"
          : "Exercise caution. Verify the claim independently before responding.";
      } else {
        threatLevel = 'SAFE';
        score = 15;
        reasons.push("Standard notification pattern; no suspicious APK links, OTP requests, or panic threats found.");
        advice = language === 'kn'
          ? "ಇದು ಸಾಮಾನ್ಯ ಅಧಿಕೃತ ಸಂದೇಶದಂತಿದೆ. ಆದರೂ ನಿಮ್ಮ ರಹಸ್ಯ ಪಿನ್ ಯಾರೊಂದಿಗೂ ಹಂಚಿಕೊಳ್ಳಬೇಡಿ."
          : language === 'hi'
          ? "यह एक सामान्य संदेश लगता है। फिर भी अपना गुप्त पिन किसी को न बताएं।"
          : "This appears to be a normal informational message. Always remember never to share PINs.";
      }

      const result = {
        threatLevel,
        score,
        reasons,
        advice,
        text
      };

      setAnalysisResult(result);
      setIsAnalyzing(false);

      // Auto speak advice
      speechService.speak(advice, language);

      if (threatLevel === 'DANGER' && onAlertCaregiver) {
        onAlertCaregiver(result);
      }
    }, 600);
  };

  const speakAdvice = () => {
    if (analysisResult?.advice) {
      speechService.speak(analysisResult.advice, language);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 animate-fade-in">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border-2 border-slate-200 dark:border-slate-800 shadow-md mb-6">
        <div className="flex items-center space-x-3 mb-2">
          <div className="p-3 bg-amber-100 dark:bg-amber-950/80 text-amber-600 rounded-2xl">
            <Search className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              "Is This a Scam?" Message Shield
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 font-medium">
              Paste or type any suspicious SMS, WhatsApp message, or phone call threat for an instant safety verification.
            </p>
          </div>
        </div>

        {/* Input Textarea */}
        <div className="mt-6">
          <textarea
            rows={4}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Paste or type suspicious message here (e.g. 'Electricity cut tonight, call 98xxx' or 'SBI YONO KYC expired')..."
            className="w-full p-4 rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium text-base sm:text-lg focus:outline-none focus:border-amber-500"
          />

          <div className="flex flex-wrap items-center justify-between gap-3 mt-3">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setInputText('')}
                className="px-3 py-2 text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center"
              >
                <Trash2 className="w-4 h-4 mr-1" /> Clear
              </button>
            </div>

            <button
              onClick={() => analyzeMessage()}
              disabled={!inputText.trim() || isAnalyzing}
              className={`min-h-[52px] px-8 py-3 rounded-2xl font-black text-lg flex items-center space-x-2 transition-all shadow-md ${
                !inputText.trim() || isAnalyzing
                  ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                  : 'bg-amber-500 text-slate-950 hover:bg-amber-400 scale-102'
              }`}
            >
              <Sparkles className="w-5 h-5" />
              <span>{isAnalyzing ? "Analyzing..." : "Verify Safety Now"}</span>
            </button>
          </div>
        </div>

        {/* Preset Sample Scams */}
        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
            Or test with common Indian scam samples:
          </p>
          <div className="flex flex-wrap gap-2">
            {presets.map((preset, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setInputText(preset.text);
                  analyzeMessage(preset.text);
                }}
                className="text-xs sm:text-sm px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-amber-100 dark:hover:bg-amber-950/60 font-semibold transition-all border border-slate-200 dark:border-slate-700"
              >
                {preset.title}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Analysis Result Card */}
      {analysisResult && (
        <div className={`p-6 sm:p-8 rounded-3xl border-4 shadow-xl mb-6 transition-all animate-fade-in ${
          analysisResult.threatLevel === 'DANGER'
            ? 'bg-red-50 dark:bg-red-950/40 border-red-500 text-red-950 dark:text-red-100'
            : analysisResult.threatLevel === 'CAUTION'
            ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-500 text-amber-950 dark:text-amber-100'
            : 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-950 dark:text-emerald-100'
        }`}>
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <div className="flex items-center space-x-3">
              {analysisResult.threatLevel === 'DANGER' ? (
                <ShieldAlert className="w-10 h-10 text-red-600" />
              ) : analysisResult.threatLevel === 'CAUTION' ? (
                <AlertTriangle className="w-10 h-10 text-amber-600" />
              ) : (
                <ShieldCheck className="w-10 h-10 text-emerald-600" />
              )}
              <div>
                <span className="text-xs font-black uppercase tracking-wider">
                  VERDICT
                </span>
                <h3 className="text-2xl sm:text-3xl font-black">
                  {analysisResult.threatLevel === 'DANGER'
                    ? '🔴 100% FRAUDULENT SCAM DETECTED'
                    : analysisResult.threatLevel === 'CAUTION'
                    ? '🟡 CAUTION: SUSPICIOUS PATTERNS'
                    : '🟢 LIKELY SAFE / OFFICIAL'}
                </h3>
              </div>
            </div>

            <button
              onClick={speakAdvice}
              className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-current text-sm font-bold shadow-sm"
            >
              <Volume2 className="w-4 h-4" />
              <span>Listen to Spoken Advice</span>
            </button>
          </div>

          {/* Advice Quote */}
          <div className="p-4 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-current text-base sm:text-xl font-bold mb-4">
            "{analysisResult.advice}"
          </div>

          {/* Red Flag Details */}
          {analysisResult.reasons.length > 0 && (
            <div className="text-sm sm:text-base space-y-2 mt-4 font-medium">
              <strong className="block uppercase text-xs tracking-wider">Why we flagged this:</strong>
              <ul className="list-disc list-inside space-y-1">
                {analysisResult.reasons.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
