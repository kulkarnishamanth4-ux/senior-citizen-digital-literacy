import React, { useState } from 'react';
import { 
  Users, 
  ShieldAlert, 
  ShieldCheck, 
  Clock, 
  PhoneCall, 
  AlertTriangle, 
  CheckCircle, 
  Trash2,
  Bell,
  HeartHandshake,
  Smartphone
} from 'lucide-react';
import { guardianService } from '../services/guardianService';

export default function CaregiverDashboard({
  completedGuidesCount,
  earnedBadgesCount,
  evaluationData,
  onClearAlerts
}) {
  const [alerts, setAlerts] = useState(guardianService.getCaregiverAlerts());
  const [caregiverPhone, setCaregiverPhone] = useState('+91 99001 23456 (Ananya - Daughter)');

  const handleClearAlerts = () => {
    guardianService.clearAlerts();
    setAlerts([]);
    if (onClearAlerts) onClearAlerts();
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 animate-fade-in">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border-2 border-slate-200 dark:border-slate-800 shadow-md mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 rounded-2xl">
              <Users className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                  Family / Caregiver Companion Portal
                </h2>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300">
                  Remote Oversight
                </span>
              </div>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 font-medium">
                Connected to Parent's Device: Real-time fraud defense alerts, task mastery status, and silent emergency SOS feed.
              </p>
            </div>
          </div>
        </div>

        {/* Status Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mt-4">
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300">
            <span className="text-xs font-bold uppercase text-emerald-800 dark:text-emerald-300">
              Parent Shield Status
            </span>
            <div className="text-xl font-black text-emerald-600 flex items-center mt-1">
              <ShieldCheck className="w-5 h-5 mr-1" /> ACTIVE & SAFE
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <span className="text-xs font-bold uppercase text-slate-500">
              Guides Mastered
            </span>
            <div className="text-2xl font-black text-slate-800 dark:text-white mt-1">
              {completedGuidesCount} / 20 Tasks
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <span className="text-xs font-bold uppercase text-slate-500">
              Vaccine Badges
            </span>
            <div className="text-2xl font-black text-purple-600 mt-1">
              {earnedBadgesCount} Completed
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <span className="text-xs font-bold uppercase text-slate-500">
              Post-Test Score
            </span>
            <div className="text-2xl font-black text-blue-600 mt-1">
              {evaluationData ? `${evaluationData.postScore}%` : 'Pending'}
            </div>
          </div>
        </div>
      </div>

      {/* Real-Time Alert Log */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border-2 border-slate-200 dark:border-slate-800 shadow-md mb-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
          <div className="flex items-center space-x-2">
            <Bell className="w-5 h-5 text-amber-500" />
            <h3 className="text-lg font-black text-slate-900 dark:text-white">
              Real-Time Scam & Coercion Alert Log
            </h3>
          </div>
          {alerts.length > 0 && (
            <button
              onClick={handleClearAlerts}
              className="text-xs font-bold text-slate-500 hover:text-red-600 flex items-center"
            >
              <Trash2 className="w-3.5 h-3.5 mr-1" /> Clear Alert History
            </button>
          )}
        </div>

        {alerts.length === 0 ? (
          <div className="p-8 text-center text-slate-500 dark:text-slate-400">
            <CheckCircle className="w-12 h-12 mx-auto text-emerald-500 mb-2" />
            <p className="font-bold text-base">No active security threats or coercion events detected.</p>
            <p className="text-xs text-slate-400">When the guardian intercepts a suspicious call or masks an OTP, details appear here instantly.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {alerts.map((alert) => (
              <div 
                key={alert.id}
                className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border-2 border-red-300 dark:border-red-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3"
              >
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 rounded text-xs font-black bg-red-600 text-white uppercase">
                      {alert.riskLevel}
                    </span>
                    <span className="text-xs font-bold text-slate-500">{alert.timestamp}</span>
                  </div>
                  <h4 className="font-bold text-slate-900 dark:text-white mt-1">
                    Caller: {alert.caller}
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium">
                    {alert.reason}
                  </p>
                </div>

                <div className="flex items-center space-x-2 w-full sm:w-auto">
                  <a
                    href="tel:112"
                    className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800"
                  >
                    Contact Cyber Police (1930)
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Emergency Contact Setup */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border-2 border-slate-200 dark:border-slate-800 shadow-md">
        <h3 className="text-base font-black text-slate-900 dark:text-white mb-2">
          Designated Family Responder
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          All silent alerts, double-check verification screenshots, and high-value UPI warnings are routed here.
        </p>

        <div className="flex gap-2 max-w-md">
          <input
            type="text"
            value={caregiverPhone}
            onChange={(e) => setCaregiverPhone(e.target.value)}
            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-semibold text-slate-900 dark:text-white"
          />
          <button className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 text-sm font-bold hover:bg-amber-400">
            Saved
          </button>
        </div>
      </div>
    </div>
  );
}
