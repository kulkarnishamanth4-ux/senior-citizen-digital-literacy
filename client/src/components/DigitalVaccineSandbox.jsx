import React, { useState } from 'react';
import { 
  Award, 
  AlertTriangle, 
  ShieldCheck, 
  Volume2, 
  CheckCircle2, 
  XCircle, 
  Sparkles,
  RotateCcw,
  Smartphone
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { SCAM_SIMULATIONS } from '../data/simulations';
import { speechService } from '../services/speechService';

export default function DigitalVaccineSandbox({ language, onEarnBadge }) {
  const [activeSimIndex, setActiveSimIndex] = useState(0);
  const [selectedChoiceId, setSelectedChoiceId] = useState(null);
  const [feedbackState, setFeedbackState] = useState(null);
  const [completedSims, setCompletedSims] = useState({});

  const simulation = SCAM_SIMULATIONS[activeSimIndex];
  const choiceResult = simulation.choices.find(c => c.id === selectedChoiceId);

  const handleSelectChoice = (choice) => {
    setSelectedChoiceId(choice.id);
    setFeedbackState(choice);

    if (choice.isCorrect) {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.7 }
      });
      setCompletedSims(prev => ({ ...prev, [simulation.id]: true }));
      if (onEarnBadge) onEarnBadge(simulation.id);
    }

    const feedbackText = choice.feedback[language] || choice.feedback.en;
    speechService.speak(feedbackText, language);
  };

  const handleNextSimulation = () => {
    setSelectedChoiceId(null);
    setFeedbackState(null);
    setActiveSimIndex((prev) => (prev + 1) % SCAM_SIMULATIONS.length);
  };

  const speakAudioExplanation = () => {
    const text = simulation.audioExplanation[language] || simulation.audioExplanation.en;
    speechService.speak(text, language);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 animate-fade-in">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border-2 border-slate-200 dark:border-slate-800 shadow-md mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-purple-100 dark:bg-purple-950/80 text-purple-600 rounded-2xl">
              <Award className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                  Digital Vaccine Sandbox
                </h2>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800 dark:bg-purple-950/80 dark:text-purple-300">
                  Risk-Free Training
                </span>
              </div>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 font-medium">
                Practice handling hyper-realistic fake messages in a 100% safe sandbox to build natural reflex.
              </p>
            </div>
          </div>

          {/* Badges Earned Counter */}
          <div className="flex items-center space-x-2 bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-2xl">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
              {Object.keys(completedSims).length} / {SCAM_SIMULATIONS.length} Vaccines Earned
            </span>
          </div>
        </div>

        {/* Simulation Selector Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
          {SCAM_SIMULATIONS.map((sim, index) => {
            const isCompleted = completedSims[sim.id];
            const isCurrent = activeSimIndex === index;
            return (
              <button
                key={sim.id}
                onClick={() => {
                  setActiveSimIndex(index);
                  setSelectedChoiceId(null);
                  setFeedbackState(null);
                }}
                className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all border ${
                  isCurrent
                    ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                    : isCompleted
                    ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border-emerald-300'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}
              >
                {isCompleted ? '✓ ' : ''}Simulation {index + 1}
              </button>
            );
          })}
        </div>
      </div>

      {/* Simulated Phone SMS / Message Screen */}
      <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl border-4 border-slate-700 mb-6">
        <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
          <div className="flex items-center space-x-2">
            <Smartphone className="w-4 h-4 text-purple-400" />
            <span>Simulated Incoming Threat Screen</span>
          </div>
          <span className="text-red-400 font-extrabold uppercase">
            Threat Type: {simulation.threatType}
          </span>
        </div>

        {/* Message Bubble Card */}
        <div className="max-w-xl mx-auto bg-slate-950 rounded-2xl p-5 border border-slate-800 shadow-inner">
          <div className="flex justify-between items-center text-xs text-slate-500 pb-2 border-b border-slate-800 mb-3">
            <span className="font-bold text-amber-400">{simulation.sender}</span>
            <span>Just Now</span>
          </div>

          <p className="text-base sm:text-xl font-medium text-slate-100 leading-relaxed">
            {simulation.messageBody[language] || simulation.messageBody.en}
          </p>
        </div>

        {/* Red Flags Accordion / List */}
        <div className="mt-6 max-w-xl mx-auto bg-slate-800/80 rounded-2xl p-4 border border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-black uppercase tracking-wider text-amber-400">
              Hidden Red Flags to Spot:
            </span>
            <button
              onClick={speakAudioExplanation}
              className="text-xs font-bold text-slate-300 hover:text-white flex items-center space-x-1"
            >
              <Volume2 className="w-3.5 h-3.5 text-amber-400" />
              <span>Hear Explanation</span>
            </button>
          </div>
          <ul className="space-y-1.5 text-xs sm:text-sm text-slate-300">
            {simulation.redFlags.map((flagObj, i) => (
              <li key={i} className="flex items-start space-x-2">
                <span className="text-amber-400 font-bold">•</span>
                <span>{flagObj[language] || flagObj.flag}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Interactive Choices */}
      <div className="space-y-3 mb-6">
        <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white text-center">
          What would you do in this situation?
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {simulation.choices.map((choice) => {
            const isSelected = selectedChoiceId === choice.id;
            return (
              <button
                key={choice.id}
                onClick={() => handleSelectChoice(choice)}
                className={`min-h-[70px] p-5 rounded-2xl font-black text-base sm:text-lg text-left transition-all border-2 shadow-sm flex items-center justify-between ${
                  isSelected
                    ? choice.isCorrect
                      ? 'bg-emerald-500 text-white border-emerald-600 scale-102'
                      : 'bg-red-500 text-white border-red-600 scale-102'
                    : 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white border-slate-200 dark:border-slate-800 hover:border-amber-400'
                }`}
              >
                <span>{choice.text[language] || choice.text.en}</span>
                {isSelected && (
                  choice.isCorrect ? <CheckCircle2 className="w-6 h-6 flex-shrink-0 ml-2" /> : <XCircle className="w-6 h-6 flex-shrink-0 ml-2" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Feedback Banner */}
      {feedbackState && (
        <div className={`p-6 rounded-3xl border-4 shadow-lg mb-6 animate-fade-in ${
          feedbackState.isCorrect
            ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-950 dark:text-emerald-100'
            : 'bg-red-50 dark:bg-red-950/40 border-red-500 text-red-950 dark:text-red-100'
        }`}>
          <div className="flex items-center space-x-3 mb-2">
            {feedbackState.isCorrect ? (
              <ShieldCheck className="w-8 h-8 text-emerald-600" />
            ) : (
              <AlertTriangle className="w-8 h-8 text-red-600" />
            )}
            <h4 className="text-xl sm:text-2xl font-black">
              {feedbackState.isCorrect ? "Vaccine Succeeded! You Defended Yourself" : "Learning Moment: Why This Was Risky"}
            </h4>
          </div>

          <p className="text-base sm:text-lg font-semibold mb-4">
            {feedbackState.feedback[language] || feedbackState.feedback.en}
          </p>

          <button
            onClick={handleNextSimulation}
            className="px-6 py-3 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold hover:bg-slate-800 transition-all text-sm"
          >
            Try Next Digital Vaccine Practice →
          </button>
        </div>
      )}
    </div>
  );
}
