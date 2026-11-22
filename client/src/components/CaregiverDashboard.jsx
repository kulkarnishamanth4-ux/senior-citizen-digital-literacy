import React, { useState } from 'react';
import { 
  Users, 
  ShieldCheck, 
  CheckCircle, 
  Trash2,
  Bell
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
    <div className="max-w-5xl mx-auto px-4 py-8 animate-fade-in">
      {/* Header */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-10 border border-zinc-200 dark:border-zinc-800 shadow-xs mb-8">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-black text-white dark:bg-white dark:text-black rounded-xl flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
                  Family / Caregiver Portal
                </h2>
                <span className="px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700">
                  Remote Oversight
                </span>
              </div>
              <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 font-normal">
                Connected to Senior's Device: Real-time fraud defense alerts, task mastery status, and silent emergency SOS feed.
              </p>
            </div>
          </div>
        </div>

        {/* Status Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mt-6">
          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
              Shield Status
            </span>
            <div className="text-base font-bold text-zinc-900 dark:text-white flex items-center mt-1">
              <ShieldCheck className="w-4 h-4 mr-1 text-emerald-600" /> ACTIVE & SAFE
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
              Guides Mastered
            </span>
            <div className="text-2xl font-black text-zinc-900 dark:text-white mt-1">
              {completedGuidesCount} / 20
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
              Sandbox Badges
            </span>
            <div className="text-2xl font-black text-zinc-900 dark:text-white mt-1">
              {earnedBadgesCount} Completed
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
              Evaluation Score
            </span>
            <div className="text-2xl font-black text-zinc-900 dark:text-white mt-1">
              {evaluationData ? `${evaluationData.postScore}%` : 'Pending'}
            </div>
          </div>
        </div>
      </div>

      {/* Real-Time Alert Log */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-10 border border-zinc-200 dark:border-zinc-800 shadow-xs mb-8">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800 mb-4">
          <div className="flex items-center space-x-2">
            <Bell className="w-4 h-4 text-zinc-700 dark:text-zinc-300" />
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
              Real-Time Scam & Coercion Log
            </h3>
          </div>
          {alerts.length > 0 && (
            <button
              onClick={handleClearAlerts}
              className="text-xs font-semibold text-zinc-500 hover:text-black dark:hover:text-white flex items-center"
            >
              <Trash2 className="w-3.5 h-3.5 mr-1" /> Clear Log
            </button>
          )}
        </div>

        {alerts.length === 0 ? (
          <div className="py-8 text-center text-zinc-400">
            <CheckCircle className="w-8 h-8 mx-auto text-zinc-400 mb-2" />
            <p className="font-semibold text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">No active threats detected on senior's device.</p>
            <p className="text-[11px] text-zinc-400">When the guardian intercepts a suspicious call or masks an OTP, details appear here instantly.</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {alerts.map((alert) => (
              <div 
                key={alert.id}
                className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3"
              >
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-black text-white dark:bg-white dark:text-black uppercase">
                      {alert.riskLevel}
                    </span>
                    <span className="text-[11px] text-zinc-400">{alert.timestamp}</span>
                  </div>
                  <h4 className="font-semibold text-xs sm:text-sm text-zinc-900 dark:text-white mt-1">
                    Caller: {alert.caller}
                  </h4>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 font-normal">
                    {alert.reason}
                  </p>
                </div>

                <a
                  href="tel:1930"
                  className="px-3.5 py-1.5 rounded-lg bg-black text-white dark:bg-white dark:text-black text-xs font-semibold hover:opacity-90"
                >
                  National Cyber Helpline (1930)
                </a>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Emergency Contact Setup */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-xs">
        <h3 className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-white mb-1">
          Designated Family Responder
        </h3>
        <p className="text-xs text-zinc-500 mb-3">
          Silent alerts and high-value payment warnings are delivered directly to this contact.
        </p>

        <div className="flex gap-2 max-w-md">
          <input
            type="text"
            value={caregiverPhone}
            onChange={(e) => setCaregiverPhone(e.target.value)}
            className="flex-1 px-3.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-xs font-semibold text-zinc-900 dark:text-white"
          />
          <button className="px-4 py-2 rounded-xl bg-black text-white dark:bg-white dark:text-black text-xs font-bold hover:opacity-90">
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
