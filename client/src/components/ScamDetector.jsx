import React, { useState } from 'react';
import { 
  Search, 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  Volume2, 
  Trash2, 
  Sparkles
} from 'lucide-react';
import { speechService } from '../services/speechService';

export default function ScamDetector({ language, onAlertCaregiver }) {
  const [inputText, setInputText] = useState('');
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const presets = [
    {
      title: "Electricity Cut Threat SMS",
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
      title: "Official Bank Transaction SMS",
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

      const isUrgent = lower.includes('immediately') || lower.includes('tonight') || lower.includes('suspended') || lower.includes('within 2 hours') || lower.includes('disconnected');
      const hasPhone = /\b\d{10}\b/.test(text);
      const hasAPK = lower.includes('.apk') || lower.includes('http');
      const asksPINorOTP = lower.includes('pin') || lower.includes('otp') || lower.includes('anydesk') || lower.includes('teamviewer');
      const claimsPrize = lower.includes('won') || lower.includes('prize') || lower.includes('lottery') || lower.includes('congratulations');

      if (hasAPK || (isUrgent && (hasPhone || asksPINorOTP)) || (claimsPrize && asksPINorOTP)) {
        threatLevel = 'DANGER';
        score = 95;
        if (hasAPK) reasons.push("Contains an unverified APK software download link.");
        if (isUrgent) reasons.push("Employs artificial time pressure and threats ('power cut tonight').");
        if (asksPINorOTP) reasons.push("Requests confidential UPI PIN or OTP (Banks never ask this).");
        if (hasPhone) reasons.push("Directs to a personal 10-digit mobile number instead of official desk.");

        advice = language === 'kn'
          ? "ಇದು ನೂರಕ್ಕೆ ನೂರು ವಂಚನೆಯ ಸಂದೇಶ! ಯಾರೊಂದಿಗೂ ಒಟಿಪಿ ಹಂಚಿಕೊಳ್ಳಬೇಡಿ ಮತ್ತು ಯಾವುದೇ ಲಿಂಕ್ ಮುಟ್ಟಬೇಡಿ."
          : language === 'hi'
          ? "यह 100% धोखाधड़ी का संदेश है! किसी भी लिंक पर क्लिक न करें और न ही फोन करें।"
          : "CRITICAL SCAM: Legitimate institutions never threaten disconnection through personal SMS. Do not call or click.";
      } else if (isUrgent || claimsPrize || hasPhone) {
        threatLevel = 'CAUTION';
        score = 65;
        reasons.push("Message contains urgency markers or requests immediate contact.");
        advice = language === 'kn'
          ? "ಎಚ್ಚರಿಕೆಯಿಂದಿರಿ! ಅಪರಿಚಿತ ಸಂಖ್ಯೆಗಳಿಗೆ ಮರುಕರೆ ಮಾಡಬೇಡಿ."
          : language === 'hi'
          ? "सावधान रहें! किसी भी संदिग्ध नंबर पर कॉल न करें।"
          : "Exercise caution. Verify the claim independently through official channels.";
      } else {
        threatLevel = 'SAFE';
        score = 15;
        reasons.push("Standard notification pattern; no suspicious links, OTP demands, or panic threats found.");
        advice = language === 'kn'
          ? "ಇದು ಸಾಮಾನ್ಯ ಅಧಿಕೃತ ಸಂದೇಶದಂತಿದೆ. ಆದರೂ ರಹಸ್ಯ ಪಿನ್ ಯಾರೊಂದಿಗೂ ಹಂಚಿಕೊಳ್ಳಬೇಡಿ."
          : language === 'hi'
          ? "यह एक सामान्य संदेश लगता है। फिर भी अपना गुप्त पिन किसी को न बताएं।"
          : "This appears to be a legitimate informational message.";
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

      speechService.speak(advice, language);

      if (threatLevel === 'DANGER' && onAlertCaregiver) {
        onAlertCaregiver(result);
      }
    }, 500);
  };

  const speakAdvice = () => {
    if (analysisResult?.advice) {
      speechService.speak(analysisResult.advice, language);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-fade-in">
      {/* Header */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-10 border border-zinc-200 dark:border-zinc-800 shadow-xs mb-8">
        <div className="flex items-center space-x-3 mb-2">
          <div className="w-10 h-10 bg-black text-white dark:bg-white dark:text-black rounded-xl flex items-center justify-center">
            <Search className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
              Message & Scam Verifier
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 font-normal">
              Paste or type any suspicious SMS, WhatsApp message, or caller claim for an objective safety evaluation.
            </p>
          </div>
        </div>

        {/* Input Textarea */}
        <div className="mt-8">
          <textarea
            rows={4}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Paste message here (e.g., 'Electricity power will be disconnected tonight, call 98xxx')..."
            className="w-full p-4 rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white font-medium text-sm sm:text-base focus:outline-none focus:border-black dark:focus:border-white transition-colors"
          />

          <div className="flex flex-wrap items-center justify-between gap-3 mt-3">
            <button
              onClick={() => setInputText('')}
              className="px-3 py-1.5 text-xs font-semibold text-zinc-500 hover:text-black dark:hover:text-white flex items-center"
            >
              <Trash2 className="w-3.5 h-3.5 mr-1" /> Clear Text
            </button>

            <button
              onClick={() => analyzeMessage()}
              disabled={!inputText.trim() || isAnalyzing}
              className={`min-h-[48px] px-6 py-2.5 rounded-xl font-bold text-sm flex items-center space-x-2 transition-all shadow-xs ${
                !inputText.trim() || isAnalyzing
                  ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 cursor-not-allowed border border-zinc-200 dark:border-zinc-700'
                  : 'bg-black text-white dark:bg-white dark:text-black hover:opacity-90'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>{isAnalyzing ? "Analyzing..." : "Verify Message"}</span>
            </button>
          </div>
        </div>

        {/* Preset Sample Scams */}
        <div className="mt-8 pt-6 border-t border-zinc-100 dark:border-zinc-800">
          <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-2.5">
            Test with common Indian scenarios:
          </p>
          <div className="flex flex-wrap gap-2">
            {presets.map((preset, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setInputText(preset.text);
                  analyzeMessage(preset.text);
                }}
                className="text-xs px-3 py-1.5 rounded-lg bg-zinc-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 font-medium transition-all border border-zinc-200 dark:border-zinc-700"
              >
                {preset.title}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Analysis Result Card in Monochrome */}
      {analysisResult && (
        <div className={`p-6 sm:p-8 rounded-3xl border shadow-sm mb-8 transition-all animate-fade-in ${
          analysisResult.threatLevel === 'DANGER'
            ? 'bg-zinc-950 text-white border-zinc-800'
            : 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white border-zinc-200 dark:border-zinc-800'
        }`}>
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <div className="flex items-center space-x-3">
              {analysisResult.threatLevel === 'DANGER' ? (
                <ShieldAlert className="w-8 h-8 text-red-500" />
              ) : analysisResult.threatLevel === 'CAUTION' ? (
                <AlertTriangle className="w-8 h-8 text-zinc-400" />
              ) : (
                <ShieldCheck className="w-8 h-8 text-emerald-500" />
              )}
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                  VERDICT
                </span>
                <h3 className="text-xl sm:text-2xl font-bold tracking-tight">
                  {analysisResult.threatLevel === 'DANGER'
                    ? 'FRAUDULENT SCAM DETECTED'
                    : analysisResult.threatLevel === 'CAUTION'
                    ? 'CAUTION: SUSPICIOUS PATTERNS'
                    : 'LEGITIMATE NOTIFICATION'}
                </h3>
              </div>
            </div>

            <button
              onClick={speakAdvice}
              className="flex items-center space-x-2 px-3.5 py-1.5 rounded-xl border border-zinc-700 text-xs font-semibold hover:bg-zinc-800 transition-all"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>Spoken Advice</span>
            </button>
          </div>

          <div className="p-4 rounded-xl bg-zinc-900 dark:bg-zinc-800/80 border border-zinc-800 text-sm sm:text-base font-medium mb-4 text-zinc-100">
            "{analysisResult.advice}"
          </div>

          {analysisResult.reasons.length > 0 && (
            <div className="text-xs sm:text-sm space-y-1.5 font-normal text-zinc-400">
              <strong className="block uppercase text-[10px] tracking-wider text-zinc-500">Identified Markers:</strong>
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
