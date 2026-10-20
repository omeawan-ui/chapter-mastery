import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Bot,
  Lightbulb,
  HelpCircle,
  Volume2,
  VolumeX,
  X,
  Compass,
  ChevronDown,
  ChevronUp,
  BookOpen,
} from 'lucide-react';
import { speakText, stopSpeaking } from '../utils/speech';

interface CoachSparkyCompassProps {
  chapterTitle: string;
  activeTopicName?: string;
  curiosityHook?: string;
  isBigIdea: boolean;
  stepNumber: number;
  totalSteps: number;
  hintText?: string;
  simpleExplanation?: string;
  examRelevance?: string;
  wrongAnswerAlert?: boolean;
  onClearWrongAlert?: () => void;
}

export const CoachSparkyCompass: React.FC<CoachSparkyCompassProps> = ({
  chapterTitle,
  activeTopicName,
  curiosityHook,
  isBigIdea,
  stepNumber,
  totalSteps,
  hintText,
  simpleExplanation,
  examRelevance,
  wrongAnswerAlert,
  onClearWrongAlert,
}) => {
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'guide' | 'hint' | 'simple' | 'exam'>('guide');
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [hasUnreadAlert, setHasUnreadAlert] = useState<boolean>(false);
  const [lingeringPrompt, setLingeringPrompt] = useState<boolean>(false);

  // Inactivity / Lingering tracker (18 seconds on a node without interaction)
  useEffect(() => {
    setLingeringPrompt(false);
    const timer = setTimeout(() => {
      setLingeringPrompt(true);
      setHasUnreadAlert(true);
    }, 18000);

    return () => clearTimeout(timer);
  }, [stepNumber]);

  // When wrong answer occurs, automatically expand Sparky and switch to hint
  useEffect(() => {
    if (wrongAnswerAlert) {
      setIsMinimized(false);
      setActiveTab('hint');
      setHasUnreadAlert(true);
      onClearWrongAlert?.();
    }
  }, [wrongAnswerAlert, onClearWrongAlert]);

  // Derive Sparky's compass speech based on current context
  const getSparkyCompassSpeech = () => {
    if (lingeringPrompt) {
      return `Getting lost? Remember, we are just tracking how a single drop of water moves through the sky. Want a hint for this mystery?`;
    }

    if (isBigIdea) {
      return `Welcome explorer! I'm Sparky, your Map Compass. Don't worry about memorizing every heading all at once — we'll take it one mystery at a time. Click Step 1 to begin!`;
    }

    if (curiosityHook) {
      return `Right now we're cracking the mystery: "${curiosityHook}"! Check out the friendly analogy, then test yourself in the quick Micro-Check below!`;
    }

    return `You're exploring ${activeTopicName || chapterTitle}. Take your time, picture the everyday analogy, and ace the micro-check!`;
  };

  const currentSpeech = getSparkyCompassSpeech();

  const handleSpeak = (text: string) => {
    if (isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
    } else {
      setIsSpeaking(true);
      speakText(text, () => setIsSpeaking(false));
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-40 max-w-sm w-[calc(100vw-2rem)] sm:w-96 select-none transition-all duration-300">
      {/* Minimized Floating Button */}
      {isMinimized ? (
        <button
          type="button"
          onClick={() => {
            setIsMinimized(false);
            setHasUnreadAlert(false);
          }}
          className="ml-auto flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-slate-900 text-white shadow-2xl border border-teal-500/40 hover:border-teal-400 hover:bg-slate-800 transition cursor-pointer group"
        >
          <div className="relative">
            <span className="w-8 h-8 rounded-full bg-teal-500/20 text-teal-300 flex items-center justify-center font-bold text-base group-hover:scale-110 transition-transform">
              ⚡
            </span>
            {hasUnreadAlert && (
              <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-amber-400 border-2 border-slate-900 animate-ping" />
            )}
          </div>
          <div className="text-left">
            <span className="block text-xs font-black text-teal-300 tracking-wide font-['Outfit']">
              Coach Sparky
            </span>
            <span className="block text-[10px] text-slate-400 font-semibold">
              {hasUnreadAlert ? 'Compass clue ready!' : `Guiding Step ${stepNumber} of ${totalSteps}`}
            </span>
          </div>
          <ChevronUp className="w-4 h-4 text-slate-400 ml-1" />
        </button>
      ) : (
        /* Full Expanded Sparky Compass Card */
        <div className="bg-slate-900 text-white rounded-3xl border border-teal-500/40 shadow-2xl shadow-slate-950/60 overflow-hidden backdrop-blur-xl">
          {/* Sparky Header Bar */}
          <div className="px-4 py-3 bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 border-b border-teal-500/20 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <div className="w-8 h-8 rounded-2xl bg-teal-500/20 text-teal-300 border border-teal-500/30 flex items-center justify-center font-bold text-base shadow-sm">
                  ⚡
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border border-slate-900" />
              </div>

              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="text-xs font-black tracking-wide text-teal-300 font-['Outfit']">
                    Coach Sparky
                  </h4>
                  <span className="text-[10px] uppercase font-extrabold px-1.5 py-0.2 rounded bg-teal-500/20 text-teal-400 border border-teal-500/30">
                    On-Page Compass
                  </span>
                </div>
                <p className="text-[10px] text-slate-400">
                  {isBigIdea ? 'Anchoring Big Picture' : `Navigating Step ${stepNumber} of ${totalSteps}`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() =>
                  handleSpeak(
                    activeTab === 'hint'
                      ? hintText || currentSpeech
                      : activeTab === 'simple'
                      ? simpleExplanation || currentSpeech
                      : activeTab === 'exam'
                      ? examRelevance || currentSpeech
                      : currentSpeech
                  )
                }
                className={`p-1.5 rounded-xl border transition cursor-pointer ${
                  isSpeaking
                    ? 'bg-teal-500 text-slate-950 border-teal-400 animate-pulse'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
                }`}
                title={isSpeaking ? 'Mute Sparky' : 'Read Sparky aloud'}
              >
                {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              </button>

              <button
                type="button"
                onClick={() => setIsMinimized(true)}
                className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white border border-slate-700 transition cursor-pointer"
                title="Minimize Sparky"
              >
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Sparky Speech Bubble */}
          <div className="p-4 space-y-3">
            <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/80 text-xs sm:text-[13px] leading-relaxed text-slate-200">
              {activeTab === 'guide' && (
                <div>
                  <span className="block text-[10px] font-extrabold uppercase tracking-wider text-teal-400 mb-1">
                    🧭 Compass Guide:
                  </span>
                  <p>{currentSpeech}</p>
                </div>
              )}

              {activeTab === 'hint' && (
                <div>
                  <span className="block text-[10px] font-extrabold uppercase tracking-wider text-amber-400 mb-1 flex items-center gap-1">
                    <Lightbulb className="w-3 h-3" />
                    <span>Sparky’s Secret Clue:</span>
                  </span>
                  <p className="text-amber-100">
                    {hintText ||
                      `Think about how water behaves in real life! Evaporation moves water up into the sky; condensation packs it into clouds; gravity pulls it down as rain!`}
                  </p>
                </div>
              )}

              {activeTab === 'simple' && (
                <div>
                  <span className="block text-[10px] font-extrabold uppercase tracking-wider text-cyan-400 mb-1 flex items-center gap-1">
                    <span>🧒</span>
                    <span>Explain Like I’m 5:</span>
                  </span>
                  <p className="text-cyan-100">
                    {simpleExplanation ||
                      `Water never disappears! It just gets hot, flies into the air as invisible steam, chills into cloud drops, and rains right back down into rivers!`}
                  </p>
                </div>
              )}

              {activeTab === 'exam' && (
                <div>
                  <span className="block text-[10px] font-extrabold uppercase tracking-wider text-emerald-400 mb-1 flex items-center gap-1">
                    <BookOpen className="w-3 h-3" />
                    <span>Exam Trap to Avoid:</span>
                  </span>
                  <p className="text-emerald-100">
                    {examRelevance ||
                      `Exams love testing the difference between evaporation and condensation! Remember: Evaporation = Liquid to Gas (needs heat). Condensation = Gas to Liquid (needs cooling).`}
                  </p>
                </div>
              )}
            </div>

            {/* Quick Interactive Prompt Buttons */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              <button
                type="button"
                onClick={() => setActiveTab('guide')}
                className={`px-2.5 py-1 rounded-xl text-[11px] font-bold shrink-0 transition cursor-pointer ${
                  activeTab === 'guide'
                    ? 'bg-teal-500 text-slate-950'
                    : 'bg-slate-800 text-slate-400 hover:text-white border border-slate-700'
                }`}
              >
                🧭 Compass
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('hint')}
                className={`px-2.5 py-1 rounded-xl text-[11px] font-bold shrink-0 transition cursor-pointer flex items-center gap-1 ${
                  activeTab === 'hint'
                    ? 'bg-amber-400 text-slate-950 font-black'
                    : 'bg-slate-800 text-slate-400 hover:text-amber-300 border border-slate-700'
                }`}
              >
                <Lightbulb className="w-3 h-3 text-amber-400" />
                <span>Give Clue</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('simple')}
                className={`px-2.5 py-1 rounded-xl text-[11px] font-bold shrink-0 transition cursor-pointer ${
                  activeTab === 'simple'
                    ? 'bg-cyan-400 text-slate-950 font-black'
                    : 'bg-slate-800 text-slate-400 hover:text-cyan-300 border border-slate-700'
                }`}
              >
                🧒 Simple Words
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('exam')}
                className={`px-2.5 py-1 rounded-xl text-[11px] font-bold shrink-0 transition cursor-pointer ${
                  activeTab === 'exam'
                    ? 'bg-emerald-400 text-slate-950 font-black'
                    : 'bg-slate-800 text-slate-400 hover:text-emerald-300 border border-slate-700'
                }`}
              >
                🎯 Exam Tip
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
