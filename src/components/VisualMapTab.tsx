import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Volume2,
  VolumeX,
  Lightbulb,
  CheckCircle2,
  Sparkles,
  BookMarked,
  ArrowRight,
} from 'lucide-react';
import { ChapterMap } from '../types';
import { speakText, stopSpeaking } from '../utils/speech';

interface VisualMapTabProps {
  map: ChapterMap;
  onGoToRetrievalTab?: () => void;
}

export const VisualMapTab: React.FC<VisualMapTabProps> = ({ map, onGoToRetrievalTab }) => {
  // Index 0 is Big Idea Overview, 1..N are the branches
  const [activeStep, setActiveStep] = useState<number>(0);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  const branches = map.branches || [];
  const totalSteps = branches.length + 1; // 0 is Big Idea, 1..N are branches
  const isBigIdea = activeStep === 0;
  const currentBranch = !isBigIdea ? branches[activeStep - 1] : null;

  const handleSpeak = (textToRead: string) => {
    if (isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
    } else {
      setIsSpeaking(true);
      speakText(textToRead, () => setIsSpeaking(false));
    }
  };

  const handleNext = () => {
    if (activeStep < totalSteps - 1) {
      setActiveStep(activeStep + 1);
      stopSpeaking();
      setIsSpeaking(false);
    }
  };

  const handlePrev = () => {
    if (activeStep > 0) {
      setActiveStep(activeStep - 1);
      stopSpeaking();
      setIsSpeaking(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-6 px-4">
      {/* Step Roadmap Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-2 px-1">
          <span>
            {isBigIdea ? '🎯 Big Picture' : `Step ${activeStep} of ${branches.length}: ${currentBranch?.branchName}`}
          </span>
          <span>{Math.round(((activeStep + 1) / totalSteps) * 100)}% Explored</span>
        </div>

        {/* Roadmap Dots / Pills */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Big Idea Step Dot */}
          <button
            onClick={() => {
              setActiveStep(0);
              stopSpeaking();
              setIsSpeaking(false);
            }}
            className={`h-2.5 rounded-full transition-all cursor-pointer ${
              activeStep === 0
                ? 'w-10 bg-teal-500 shadow-xs ring-2 ring-teal-500/20'
                : 'w-2.5 bg-teal-200 hover:bg-teal-300'
            }`}
            title="Big Idea Overview"
          />

          {/* Branch Dots */}
          {branches.map((b, idx) => {
            const stepNum = idx + 1;
            const isCurrent = activeStep === stepNum;
            const isDone = activeStep > stepNum;
            return (
              <button
                key={b.id || idx}
                onClick={() => {
                  setActiveStep(stepNum);
                  stopSpeaking();
                  setIsSpeaking(false);
                }}
                className={`h-2.5 rounded-full transition-all cursor-pointer ${
                  isCurrent
                    ? 'w-10 bg-teal-500 shadow-xs ring-2 ring-teal-500/20'
                    : isDone
                    ? 'w-2.5 bg-emerald-400 hover:bg-emerald-500'
                    : 'w-2.5 bg-slate-200 hover:bg-slate-300'
                }`}
                title={b.branchName}
              />
            );
          })}
        </div>
      </div>

      {/* Main Advance Card Container */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl shadow-slate-100 overflow-hidden transition-all duration-300">
        {isBigIdea ? (
          /* BIG IDEA HERO SCREEN */
          <div>
            <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-teal-950 text-white p-6 sm:p-8 relative overflow-hidden">
              {/* Subtle background glow */}
              <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-teal-500/15 blur-2xl pointer-events-none" />

              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-teal-500/20 text-teal-300 border border-teal-500/30 mb-3">
                    <Sparkles className="w-3.5 h-3.5" />
                    Chapter Advance Organizer
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-['Outfit']">
                    {map.bigIdeaEmoji || '💡'} {map.bigIdea || map.chapterTitle}
                  </h2>
                </div>

                <button
                  onClick={() =>
                    handleSpeak(
                      `${map.chapterTitle}. ${map.oneLineSummary}. Big idea: ${map.bigIdea}. Think of it like: ${map.bigIdeaAnalogy}`
                    )
                  }
                  className={`p-2.5 rounded-xl border transition shrink-0 ${
                    isSpeaking
                      ? 'bg-teal-500 text-slate-950 border-teal-400 animate-pulse'
                      : 'bg-white/10 hover:bg-white/20 text-white border-white/20'
                  }`}
                  title={isSpeaking ? 'Stop read aloud' : 'Read aloud with voice'}
                >
                  {isSpeaking ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </button>
              </div>

              <p className="mt-4 text-slate-300 text-sm sm:text-base leading-relaxed font-medium max-w-2xl">
                {map.oneLineSummary}
              </p>
            </div>

            {/* Big Idea Body */}
            <div className="p-6 sm:p-8 space-y-6">
              {/* Analogy Box */}
              {map.bigIdeaAnalogy && (
                <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/80 border border-amber-200/80 text-amber-950 flex items-start gap-3.5">
                  <div className="p-2 rounded-xl bg-amber-200/70 text-amber-800 shrink-0 mt-0.5">
                    <Lightbulb className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="block text-[11px] font-extrabold uppercase tracking-wider text-amber-800 mb-1">
                      Mental Anchor • Think of it like this:
                    </span>
                    <p className="text-sm sm:text-base text-amber-950 font-medium leading-relaxed">
                      {map.bigIdeaAnalogy}
                    </p>
                  </div>
                </div>
              )}

              {/* Learning Outcomes */}
              {map.learningOutcomes && map.learningOutcomes.length > 0 && (
                <div>
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-teal-600" />
                    What you will master in this chapter:
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {map.learningOutcomes.map((outcome, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 text-slate-800 text-xs sm:text-sm font-semibold flex items-start gap-2.5"
                      >
                        <span className="w-5 h-5 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <span>{outcome}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Study time estimate */}
              {map.estimatedStudyMinutes && (
                <div className="text-xs text-slate-400 font-medium flex items-center gap-2 pt-2 border-t border-slate-100">
                  <BookMarked className="w-4 h-4 text-slate-400" />
                  <span>
                    Estimated study time: <strong>{map.estimatedStudyMinutes} minutes</strong>
                  </span>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* BRANCH TOPIC CARD */
          <div>
            <div className="p-6 sm:p-8 border-b border-slate-100 bg-gradient-to-r from-slate-50 via-teal-50/20 to-white">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-teal-800 bg-teal-100/80 border border-teal-200 px-2 py-0.5 rounded-md">
                      Topic {activeStep} of {branches.length}
                    </span>
                    <span className="text-xs text-slate-400 font-semibold">• Sequential Roadmap</span>
                  </div>

                  <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight font-['Outfit'] flex items-center gap-2.5">
                    <span className="text-3xl">{currentBranch?.branchEmoji || '📌'}</span>
                    <span>{currentBranch?.branchName}</span>
                  </h2>
                </div>

                <button
                  onClick={() =>
                    handleSpeak(
                      `${currentBranch?.branchName}. Analogy: ${currentBranch?.analogy}. Key points: ${(
                        currentBranch?.subPoints || []
                      ).join('. ')}. Key takeaways: ${(currentBranch?.keyTakeaways || []).join('. ')}`
                    )
                  }
                  className={`p-2.5 rounded-xl border transition shrink-0 ${
                    isSpeaking
                      ? 'bg-teal-500 text-slate-950 border-teal-400 animate-pulse'
                      : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                  }`}
                  title={isSpeaking ? 'Stop read aloud' : 'Read aloud with voice'}
                >
                  {isSpeaking ? <VolumeX className="w-5 h-5 text-slate-950" /> : <Volume2 className="w-5 h-5 text-slate-700" />}
                </button>
              </div>
            </div>

            <div className="p-6 sm:p-8 space-y-6">
              {/* Relatable Analogy */}
              {currentBranch?.analogy && (
                <div className="p-4 sm:p-5 rounded-2xl bg-teal-50/60 border border-teal-200/70 text-teal-950 flex items-start gap-3.5">
                  <div className="p-2 rounded-xl bg-teal-100 text-teal-800 shrink-0 mt-0.5">
                    <Lightbulb className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="block text-[11px] font-extrabold uppercase tracking-wider text-teal-800 mb-1">
                      Relatable Analogy:
                    </span>
                    <p className="text-sm sm:text-base font-medium leading-relaxed text-teal-950">
                      {currentBranch.analogy}
                    </p>
                  </div>
                </div>
              )}

              {/* Sub Points / Mechanisms */}
              <div>
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-3">
                  Key Concepts & Mechanisms:
                </h3>
                <ul className="space-y-3">
                  {(currentBranch?.subPoints || []).map((point, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-3 p-3 rounded-xl bg-slate-50/70 border border-slate-100 text-slate-800 text-sm leading-relaxed"
                    >
                      <ArrowRight className="w-4 h-4 text-teal-600 mt-1 shrink-0" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Key Takeaways Bar at bottom of card */}
              {currentBranch?.keyTakeaways && currentBranch.keyTakeaways.length > 0 && (
                <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 text-white shadow-md">
                  <div className="text-[11px] font-extrabold uppercase tracking-wider text-amber-400 mb-2 flex items-center gap-1.5">
                    <span>★</span>
                    <span>Essential Exam Takeaways to Memorize</span>
                  </div>
                  <div className="space-y-1.5">
                    {currentBranch.keyTakeaways.map((takeaway, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-slate-200">
                        <span className="text-amber-400 font-bold shrink-0">•</span>
                        <span>{takeaway}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Card Navigation Footer */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
          <button
            onClick={handlePrev}
            disabled={activeStep === 0}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          <span className="text-xs font-bold text-slate-500">
            {activeStep + 1} of {totalSteps}
          </span>

          {activeStep === totalSteps - 1 ? (
            <button
              onClick={onGoToRetrievalTab || handleNext}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-slate-950 bg-teal-500 hover:bg-teal-400 transition shadow-sm cursor-pointer animate-pulse"
            >
              <span>Practice Retrieval 🧠</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-slate-950 bg-teal-500 hover:bg-teal-400 transition shadow-xs cursor-pointer"
            >
              <span>Next Topic</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
