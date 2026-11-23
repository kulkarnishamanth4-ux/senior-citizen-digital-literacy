import React, { useState } from 'react';
import { 
  Award, 
  ShieldCheck, 
  Volume2, 
  CheckCircle2, 
  XCircle, 
  Sparkles,
  Smartphone
} from 'lucide-react';
import { SCAM_SIMULATIONS } from '../data/simulations';
import { speechService } from '../services/speechService';

export default function DigitalVaccineSandbox({ language, onEarnBadge }) {
  const [activeSimIndex, setActiveSimIndex] = useState(0);
  const [selectedChoiceId, setSelectedChoiceId] = useState(null);
  const [feedbackState, setFeedbackState] = useState(null);
  const [completedSims, setCompletedSims] = useState({});

  const simulation = SCAM_SIMULATIONS[activeSimIndex];

  const handleSelectChoice = (choice) => {
    setSelectedChoiceId(choice.id);
    setFeedbackState(choice);

    if (choice.isCorrect) {
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
    <div className="max-w-4xl mx-auto px-4 py-8 animate-fade-in">
      {/* Header */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-10 border border-zinc-200 dark:border-zinc-800 shadow-xs mb-8">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-black text-white dark:bg-white dark:text-black rounded-xl flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
                  {language === 'kn' ? 'ಸುರಕ್ಷತಾ ಅಭ್ಯಾಸ: ನಕಲಿ ಸಂದೇಶ ಗುರುತಿಸಿ' : language === 'hi' ? 'सुरक्षा सीखें: फर्जी मैसेज पहचानें' : 'Practice Safety: Spot Fake Messages'}
                </h2>
                <span className="px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700">
                  {language === 'kn' ? 'ಸುರಕ್ಷಿತ ಅಭ್ಯಾಸ' : language === 'hi' ? 'सुरक्षित अभ्यास' : 'Safe to Try'}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 font-normal">
                {language === 'kn'
                  ? "ವಂಚನೆಯ ಸಂದೇಶಗಳು ಹೇಗೆ ಬರುತ್ತವೆ ಎಂದು ತಿಳಿದುಕೊಳ್ಳಲು ಈ ಉದಾಹರಣೆಗಳನ್ನು ನೋಡಿ ಅಭ್ಯಾಸ ಮಾಡಿ."
                  : language === 'hi'
                  ? "धोखाधड़ी वाले मैसेज कैसे आते हैं, यह समझने के लिए इन सुरक्षित उदाहरणों से अभ्यास करें।"
                  : "Try these safe examples to practice spotting fake messages and phone scams."}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-1.5 bg-zinc-100 dark:bg-zinc-800 px-3.5 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs font-semibold text-zinc-800 dark:text-zinc-200">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{Object.keys(completedSims).length} / {SCAM_SIMULATIONS.length} {language === 'kn' ? 'ಅಭ್ಯಾಸ ಮಾಡಲಾಗಿದೆ' : language === 'hi' ? 'अभ्यास पूरा' : 'Practiced'}</span>
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
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                  isCurrent
                    ? 'bg-black text-white border-black dark:bg-white dark:text-black dark:border-white shadow-xs'
                    : isCompleted
                    ? 'bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border-zinc-300 dark:border-zinc-700'
                    : 'bg-zinc-50 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:border-zinc-400'
                }`}
              >
                {isCompleted ? '✓ ' : ''}Scenario {index + 1}
              </button>
            );
          })}
        </div>
      </div>

      {/* Simulated Screen */}
      <div className="bg-zinc-950 rounded-3xl p-6 sm:p-10 text-white shadow-xl border border-zinc-800 mb-8">
        <div className="flex items-center justify-between text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-6">
          <div className="flex items-center space-x-2">
            <Smartphone className="w-4 h-4 text-zinc-400" />
            <span>Simulated Incoming Threat</span>
          </div>
          <span className="text-zinc-300 font-bold">
            Vector: {simulation.threatType}
          </span>
        </div>

        {/* Message Bubble Card */}
        <div className="max-w-xl mx-auto bg-black rounded-2xl p-6 border border-zinc-800 shadow-inner">
          <div className="flex justify-between items-center text-[11px] text-zinc-500 pb-2 border-b border-zinc-900 mb-4">
            <span className="font-semibold text-zinc-300">{simulation.sender}</span>
            <span>Just Now</span>
          </div>

          <p className="text-base sm:text-lg font-normal text-zinc-200 leading-relaxed">
            {simulation.messageBody[language] || simulation.messageBody.en}
          </p>
        </div>

        {/* Red Flags List */}
        <div className="mt-8 max-w-xl mx-auto bg-zinc-900 rounded-2xl p-5 border border-zinc-800">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
              Red Flags to Spot:
            </span>
            <button
              onClick={speakAudioExplanation}
              className="text-xs font-semibold text-zinc-300 hover:text-white flex items-center space-x-1"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>Listen</span>
            </button>
          </div>
          <ul className="space-y-2 text-xs sm:text-sm text-zinc-300 font-normal">
            {simulation.redFlags.map((flagObj, i) => (
              <li key={i} className="flex items-start space-x-2">
                <span className="text-zinc-500 font-bold">•</span>
                <span>{flagObj[language] || flagObj.flag}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Interactive Choices in Classy Monochrome */}
      <div className="space-y-3 mb-8">
        <h3 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-white text-center">
          What is the safe response?
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {simulation.choices.map((choice) => {
            const isSelected = selectedChoiceId === choice.id;
            return (
              <button
                key={choice.id}
                onClick={() => handleSelectChoice(choice)}
                className={`min-h-[64px] p-4 rounded-2xl font-semibold text-sm sm:text-base text-left transition-all border flex items-center justify-between ${
                  isSelected
                    ? choice.isCorrect
                      ? 'bg-zinc-900 text-white border-black dark:bg-white dark:text-black shadow-xs'
                      : 'bg-zinc-800 text-white border-zinc-700 shadow-xs'
                    : 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white border-zinc-200 dark:border-zinc-800 hover:border-black dark:hover:border-white'
                }`}
              >
                <span>{choice.text[language] || choice.text.en}</span>
                {isSelected && (
                  choice.isCorrect ? <CheckCircle2 className="w-5 h-5 flex-shrink-0 ml-2" /> : <XCircle className="w-5 h-5 flex-shrink-0 ml-2" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Feedback Banner */}
      {feedbackState && (
        <div className="p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 shadow-xs mb-8 animate-fade-in">
          <div className="flex items-center space-x-2 mb-2">
            <ShieldCheck className="w-5 h-5 text-zinc-900 dark:text-white" />
            <h4 className="text-lg font-bold">
              {feedbackState.isCorrect ? "Correct Decision" : "Risk Analysis"}
            </h4>
          </div>

          <p className="text-sm sm:text-base font-normal text-zinc-600 dark:text-zinc-300 mb-4 leading-relaxed">
            {feedbackState.feedback[language] || feedbackState.feedback.en}
          </p>

          <button
            onClick={handleNextSimulation}
            className="px-5 py-2.5 rounded-xl bg-black text-white dark:bg-white dark:text-black font-semibold text-xs hover:opacity-90 transition-all"
          >
            Next Scenario →
          </button>
        </div>
      )}
    </div>
  );
}
