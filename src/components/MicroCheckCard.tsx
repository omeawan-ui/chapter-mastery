import React, { useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  HelpCircle,
  Sparkles,
  ArrowRight,
  RotateCcw,
  Lightbulb,
  Award,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { BranchMicroCheck } from '../types';
import { playSuccessSound, playWrongSound } from '../utils/audio';

interface MicroCheckCardProps {
  microCheck: BranchMicroCheck;
  branchName: string;
  isCompleted: boolean;
  onSuccess: () => void;
  onWrongAttempt: (selectedOption: string) => void;
  onRequestHint: () => void;
  onNextStep?: () => void;
  hasNextStep?: boolean;
}

export const MicroCheckCard: React.FC<MicroCheckCardProps> = ({
  microCheck,
  branchName,
  isCompleted,
  onSuccess,
  onWrongAttempt,
  onRequestHint,
  onNextStep,
  hasNextStep,
}) => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(isCompleted);
  const [lastAttemptWrong, setLastAttemptWrong] = useState<boolean>(false);
  const [showHint, setShowHint] = useState<boolean>(false);

  const letters = ['A', 'B', 'C', 'D'];

  const triggerCelebration = () => {
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#14b8a6', '#06b6d4', '#10b981', '#f59e0b'],
      });
    } catch (e) {
      // ignore
    }
  };

  const handleSelectOption = (index: number) => {
    if (isCompleted && isSubmitted) return;
    setSelectedIndex(index);
    setLastAttemptWrong(false);

    const isCorrect = index === microCheck.correctIndex;

    if (isCorrect) {
      playSuccessSound();
      triggerCelebration();
      setIsSubmitted(true);
      onSuccess();
    } else {
      playWrongSound();
      setLastAttemptWrong(true);
      onWrongAttempt(microCheck.options[index]);
    }
  };

  const handleRetry = () => {
    setSelectedIndex(null);
    setIsSubmitted(false);
    setLastAttemptWrong(false);
  };

  return (
    <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-teal-950 text-white shadow-xl border border-teal-500/30 relative overflow-hidden transition-all">
      {/* Background ambient glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-4 border-b border-slate-700/80 relative z-10">
        <div className="flex items-center gap-2.5">
          <span className="p-2 rounded-xl bg-teal-500/20 text-teal-300 border border-teal-500/30">
            <Award className="w-5 h-5 text-teal-400" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-teal-400">
                Low-Stakes Exam Micro-Check
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                <Sparkles className="w-3 h-3 text-amber-300" />
                +15 XP
              </span>
            </div>
            <h4 className="text-sm sm:text-base font-extrabold text-white font-['Outfit']">
              Prove You Understand {branchName}
            </h4>
          </div>
        </div>

        {/* Status Badge */}
        {isCompleted && (
          <div className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Mastered & Unlocked</span>
          </div>
        )}
      </div>

      {/* Question Prompt */}
      <div className="py-4 relative z-10">
        <p className="text-sm sm:text-base font-semibold text-slate-100 leading-relaxed">
          {microCheck.question}
        </p>
      </div>

      {/* Multiple Choice Options */}
      <div className="space-y-2.5 relative z-10">
        {microCheck.options.map((option, idx) => {
          const isSelected = selectedIndex === idx;
          const isCorrect = idx === microCheck.correctIndex;
          const showSuccessState = (isSubmitted || isCompleted) && isCorrect;
          const showFailureState = lastAttemptWrong && isSelected;

          let optionStyle =
            'bg-slate-800/80 hover:bg-slate-700/90 text-slate-200 border-slate-700 hover:border-teal-400/50';

          if (showSuccessState) {
            optionStyle =
              'bg-emerald-950/80 text-emerald-100 border-emerald-400 shadow-lg shadow-emerald-950/50 ring-2 ring-emerald-400/40';
          } else if (showFailureState) {
            optionStyle =
              'bg-rose-950/80 text-rose-200 border-rose-500 shadow-lg shadow-rose-950/50 animate-shake';
          }

          return (
            <button
              key={idx}
              type="button"
              disabled={isCompleted && isSubmitted}
              onClick={() => handleSelectOption(idx)}
              className={`w-full text-left p-3 sm:p-3.5 rounded-2xl border transition-all flex items-center gap-3 cursor-pointer group ${optionStyle}`}
            >
              <span
                className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black shrink-0 transition-colors ${
                  showSuccessState
                    ? 'bg-emerald-500 text-slate-950'
                    : showFailureState
                    ? 'bg-rose-500 text-white'
                    : isSelected
                    ? 'bg-teal-500 text-slate-950'
                    : 'bg-slate-700 text-slate-300 group-hover:bg-teal-500/20 group-hover:text-teal-300'
                }`}
              >
                {letters[idx] || idx + 1}
              </span>

              <span className="flex-1 text-xs sm:text-sm font-medium leading-normal">
                {option}
              </span>

              {showSuccessState && (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              )}
              {showFailureState && (
                <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
              )}
            </button>
          );
        })}
      </div>

      {/* Feedback & Actions */}
      <div className="mt-4 pt-3.5 border-t border-slate-700/70 relative z-10">
        {/* Wrong Answer Hint Banner */}
        {lastAttemptWrong && (
          <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-3">
            <div className="flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>Not quite! Think about the everyday analogy above. Try again!</span>
            </div>
            <button
              type="button"
              onClick={() => {
                setShowHint(true);
                onRequestHint();
              }}
              className="text-[11px] font-bold text-amber-300 hover:text-amber-200 underline flex items-center gap-1 cursor-pointer"
            >
              <Lightbulb className="w-3.5 h-3.5" />
              <span>Get Hint from Coach Sparky</span>
            </button>
          </div>
        )}

        {/* Correct Explanation Banner */}
        {(isSubmitted || isCompleted) && (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-100 text-xs sm:text-sm space-y-2 mb-3">
            <div className="flex items-center gap-2 font-bold text-emerald-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Exam Alignment Breakdown:</span>
            </div>
            <p className="text-emerald-200/90 leading-relaxed font-medium">
              {microCheck.explanation}
            </p>
          </div>
        )}

        {/* Revealed Hint if requested */}
        {showHint && microCheck.hint && (
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex items-start gap-2.5 mb-3">
            <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-amber-300 block mb-0.5">Sparky’s Compass Clue:</span>
              <span>{microCheck.hint}</span>
            </div>
          </div>
        )}

        {/* Bottom Action Buttons */}
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => {
              setShowHint(!showHint);
              if (!showHint) onRequestHint();
            }}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-amber-300 transition cursor-pointer"
          >
            <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
            <span>{showHint ? 'Hide Hint' : 'Need a Clue?'}</span>
          </button>

          <div className="flex items-center gap-2">
            {isCompleted && isSubmitted && (
              <button
                type="button"
                onClick={handleRetry}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
                title="Practice this question again"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Practice Again</span>
              </button>
            )}

            {(isSubmitted || isCompleted) && hasNextStep && onNextStep && (
              <button
                type="button"
                onClick={onNextStep}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black bg-teal-500 hover:bg-teal-400 text-slate-950 transition shadow-lg shadow-teal-500/25 cursor-pointer animate-pulse"
              >
                <span>Unlock Next Mystery</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
