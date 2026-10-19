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
  Layers,
  Film,
  ExternalLink,
  Map as MapIcon,
  Zap,
  Globe,
} from 'lucide-react';
import { ChapterMap, MapDiagram, VideoRecommendation } from '../types';
import { speakText, stopSpeaking } from '../utils/speech';
import { DiagramViewer } from './DiagramViewer';
import { VideoGuideCard } from './VideoGuideCard';

interface VisualMapTabProps {
  map: ChapterMap;
  onGoToRetrievalTab?: () => void;
}

export const VisualMapTab: React.FC<VisualMapTabProps> = ({ map, onGoToRetrievalTab }) => {
  // Sub-view: 'roadmap' (default cards), 'diagrams' (all diagrams hub), 'videos' (all video hub)
  const [subView, setSubView] = useState<'roadmap' | 'diagrams' | 'videos'>('roadmap');

  // Index 0 is Big Idea Overview, 1..N are the branches
  const [activeStep, setActiveStep] = useState<number>(0);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  const branches = map.branches || [];
  const totalSteps = branches.length + 1; // 0 is Big Idea, 1..N are branches
  const isBigIdea = activeStep === 0;
  const currentBranch = !isBigIdea ? branches[activeStep - 1] : null;

  // Fallback overall diagram if none provided
  const effectiveOverallDiagram: MapDiagram = map.overallDiagram || {
    type: 'flow',
    title: `${map.chapterTitle} Core Progression`,
    caption: 'Interactive roadmap showing how foundational concepts transition into real-world outcomes.',
    steps: branches.length >= 3
      ? branches.slice(0, 4).map((b, idx) => ({
          label: b.branchName,
          desc: b.analogy || b.subPoints?.[0] || 'Key chapter phase',
          emoji: b.branchEmoji || (idx === 0 ? '🌱' : idx === 1 ? '⚙️' : idx === 2 ? '⚡' : '✨'),
        }))
      : [
          { label: 'Foundations', desc: 'Baseline elements and definitions.', emoji: '🌱' },
          { label: 'Mechanisms', desc: 'Core reaction or mechanical process.', emoji: '⚙️' },
          { label: 'Observations', desc: 'Visible real-world manifestations.', emoji: '⚡' },
          { label: 'Significance', desc: 'Overall impact and scientific principles.', emoji: '🌍' },
        ],
  };

  // Fallback recommended videos if none provided
  const effectiveVideos: VideoRecommendation[] =
    map.recommendedVideos && map.recommendedVideos.length > 0
      ? map.recommendedVideos
      : [
          {
            title: `${map.chapterTitle} Full Lesson & Visual Animations`,
            channel: 'Crash Course / Educational Hub',
            duration: '9:45',
            youtubeUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent(
              map.chapterTitle + ' lesson crash course'
            )}`,
            whyWatch: `Animated explanations and visual diagrams of ${map.chapterTitle} designed for students.`,
          },
          {
            title: `${map.chapterTitle} Fast Review & Common Questions`,
            channel: 'Khan Academy / Ted-Ed',
            duration: '6:30',
            youtubeUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent(
              map.chapterTitle + ' review khan academy'
            )}`,
            whyWatch: `Step-by-step breakdown of fundamental concepts and exam memory tips.`,
          },
        ];

  // Derive branch diagram if branch does not have one
  const currentBranchDiagram: MapDiagram | undefined =
    currentBranch?.diagram ||
    (currentBranch && currentBranch.subPoints && currentBranch.subPoints.length >= 2
      ? {
          type: 'steps',
          title: `${currentBranch.branchName}: Step-by-Step Breakdown`,
          caption: 'Interactive visual breakdown of the key stages in this topic.',
          steps: currentBranch.subPoints.slice(0, 4).map((pt, idx) => ({
            label: `Stage ${idx + 1}`,
            desc: pt,
            emoji: idx === 0 ? '🌱' : idx === 1 ? '⚙️' : idx === 2 ? '⚡' : '✅',
          })),
        }
      : undefined);

  // Derive branch video if branch does not have one
  const currentBranchVideo: VideoRecommendation =
    currentBranch?.video || {
      title: `${currentBranch?.branchName || map.chapterTitle} Deep-Dive`,
      channel: 'Curriculum Video Hub',
      duration: '5:15',
      youtubeUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent(
        map.chapterTitle + ' ' + (currentBranch?.branchName || '') + ' lesson'
      )}`,
      whyWatch: `Targeted visual explanation for ${currentBranch?.branchName || 'this topic'}.`,
    };

  // All diagrams across the chapter for the Diagrams Hub
  const allDiagrams: MapDiagram[] = [
    effectiveOverallDiagram,
    ...branches
      .map((b) => b.diagram)
      .filter((d): d is MapDiagram => Boolean(d)),
  ];

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
    <div className="max-w-4xl mx-auto py-6 px-4 space-y-5">
      {/* Top Header & Sub-View Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-sm sm:text-base font-extrabold text-slate-900 font-['Outfit'] flex items-center gap-2">
            <span className="p-1 rounded-lg bg-teal-100 text-teal-800">
              <MapIcon className="w-4 h-4" />
            </span>
            <span>Advance Organizer Map & Visuals</span>
          </h2>
          <p className="text-[11px] text-slate-500">
            Anchor concepts using Ausubel&apos;s mental schemas, step-by-step diagrams, and video guides.
          </p>
        </div>

        {/* View Switcher Pills */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl self-start sm:self-center">
          <button
            type="button"
            onClick={() => setSubView('roadmap')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              subView === 'roadmap'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <MapIcon className="w-3.5 h-3.5 text-teal-600" />
            <span>Roadmap Cards</span>
          </button>

          <button
            type="button"
            onClick={() => setSubView('diagrams')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              subView === 'diagrams'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-indigo-600" />
            <span>Diagrams ({allDiagrams.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setSubView('videos')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              subView === 'videos'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Film className="w-3.5 h-3.5 text-rose-600" />
            <span>Videos ({effectiveVideos.length})</span>
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* SUB-VIEW 1: ROADMAP STEP CARDS */}
      {/* ------------------------------------------------------------- */}
      {subView === 'roadmap' && (
        <div className="space-y-4">
          {/* Step Roadmap Bar */}
          <div>
            <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-2 px-1">
              <span>
                {isBigIdea
                  ? '🎯 Big Picture Overview'
                  : `Topic ${activeStep} of ${branches.length}: ${currentBranch?.branchName}`}
              </span>
              <span>{Math.round(((activeStep + 1) / totalSteps) * 100)}% Explored</span>
            </div>

            {/* Roadmap Dots / Pills */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              {/* Big Idea Step Dot */}
              <button
                type="button"
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
                    type="button"
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
                      type="button"
                      onClick={() =>
                        handleSpeak(
                          `${map.chapterTitle}. ${map.oneLineSummary}. Big idea: ${map.bigIdea}. Think of it like: ${map.bigIdeaAnalogy}`
                        )
                      }
                      className={`p-2.5 rounded-xl border transition shrink-0 cursor-pointer ${
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

                  {/* Visual Mechanism Diagram */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                        <Layers className="w-4 h-4 text-teal-600" />
                        <span>Interactive Visual Diagram:</span>
                      </span>
                    </div>
                    <DiagramViewer diagram={effectiveOverallDiagram} />
                  </div>

                  {/* Curated YouTube Video Guides */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                        <Film className="w-4 h-4 text-rose-600" />
                        <span>Curated Video Lessons:</span>
                      </span>
                      <a
                        href={`https://www.youtube.com/results?search_query=${encodeURIComponent(
                          map.chapterTitle + ' science animation'
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1"
                      >
                        <span>More on YouTube</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                    {effectiveVideos.map((vid, vIdx) => (
                      <VideoGuideCard key={vIdx} video={vid} />
                    ))}
                  </div>

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
                      type="button"
                      onClick={() =>
                        handleSpeak(
                          `${currentBranch?.branchName}. Analogy: ${currentBranch?.analogy}. Key points: ${(
                            currentBranch?.subPoints || []
                          ).join('. ')}. Key takeaways: ${(currentBranch?.keyTakeaways || []).join('. ')}`
                        )
                      }
                      className={`p-2.5 rounded-xl border transition shrink-0 cursor-pointer ${
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
                  {/* Relatable Analogy - Descriptive & Explainer with Simple English Words */}
                  {currentBranch?.analogy && (
                    <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/80 border border-amber-200/90 text-amber-950 shadow-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 rounded-xl bg-amber-200/80 text-amber-900">
                            <Lightbulb className="w-4 h-4" />
                          </div>
                          <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-900">
                            Relatable Analogy • Explained in Plain Everyday Words
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleSpeak(`Think of it like this: ${currentBranch.analogy}`)}
                          className="text-[11px] font-bold text-amber-800 hover:text-amber-950 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-200/60 hover:bg-amber-200 transition cursor-pointer"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                          <span>Listen</span>
                        </button>
                      </div>
                      <p className="text-sm sm:text-base font-medium leading-relaxed text-amber-950 bg-white/70 p-3 rounded-xl border border-amber-200/60">
                        {currentBranch.analogy}
                      </p>
                    </div>
                  )}

                  {/* Key Concepts & Mechanisms */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                        <Zap className="w-3.5 h-3.5 text-teal-600" />
                        <span>Key Concepts & Mechanisms:</span>
                      </h3>
                      <span className="text-[10px] text-slate-400 font-semibold">Self-learning guide</span>
                    </div>

                    <div className="space-y-2.5">
                      {(currentBranch?.subPoints || []).map((point, idx) => (
                        <div
                          key={idx}
                          className="p-3.5 rounded-xl bg-slate-50/90 border border-slate-200/70 text-slate-800 text-sm leading-relaxed flex items-start gap-3 hover:border-teal-300 transition"
                        >
                          <span className="w-5 h-5 rounded-full bg-teal-100 text-teal-800 font-extrabold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                            {idx + 1}
                          </span>
                          <div className="flex-1">
                            <span className="font-medium text-slate-900">{point}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Real-Life Everyday Examples Section */}
                  {((currentBranch?.realLifeExamples && currentBranch.realLifeExamples.length > 0) ||
                    (currentBranch?.mechanisms && currentBranch.mechanisms.length > 0)) && (
                    <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-emerald-50/80 via-teal-50/60 to-cyan-50/80 border border-teal-200/80 shadow-xs space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">🌍</span>
                          <div>
                            <h4 className="text-xs sm:text-sm font-extrabold text-teal-950 font-['Outfit']">
                              Real-Life Everyday Examples
                            </h4>
                            <p className="text-[11px] text-teal-800/80">
                              See this mechanism in action around your home, outdoors, and body
                            </p>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-teal-200/70 text-teal-900 px-2 py-0.5 rounded-full">
                          Interactive
                        </span>
                      </div>

                      {/* Structured mechanisms if available */}
                      {currentBranch?.mechanisms && currentBranch.mechanisms.length > 0 && (
                        <div className="grid grid-cols-1 gap-2 pt-1">
                          {currentBranch.mechanisms.map((mech, mIdx) => (
                            <div key={mIdx} className="p-3 bg-white/90 rounded-xl border border-teal-200/70 shadow-xs space-y-1">
                              <div className="flex items-center gap-2 font-bold text-xs text-slate-900">
                                <span>{mech.emoji || '⚙️'}</span>
                                <span>{mech.concept}</span>
                              </div>
                              <p className="text-xs text-slate-600 pl-6">{mech.explanation}</p>
                              <div className="mt-1 pl-6 flex items-start gap-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 p-2 rounded-lg border border-emerald-200/60">
                                <span className="text-emerald-600 shrink-0">📍 Daily life:</span>
                                <span>{mech.realLifeExample}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* General real-life examples list */}
                      {currentBranch?.realLifeExamples && currentBranch.realLifeExamples.length > 0 && (
                        <div className="space-y-2 pt-1">
                          {currentBranch.realLifeExamples.map((ex, exIdx) => (
                            <div
                              key={exIdx}
                              className="flex items-start gap-2.5 p-2.5 bg-white/80 rounded-xl border border-teal-100 text-xs sm:text-sm text-slate-800"
                            >
                              <span className="text-teal-600 font-bold shrink-0 mt-0.5">💡</span>
                              <span className="font-medium">{ex}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Self-Learning Interactive Reflection Prompt */}
                      <div className="pt-2 border-t border-teal-200/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-teal-900">
                        <span className="font-semibold flex items-center gap-1.5">
                          <span>🔎</span>
                          <span>Can you spot this in your house or outdoors today?</span>
                        </span>
                        {onGoToRetrievalTab && (
                          <button
                            type="button"
                            onClick={onGoToRetrievalTab}
                            className="font-bold text-teal-800 hover:text-teal-950 underline text-[11px] cursor-pointer"
                          >
                            Express what you learned in Retrieval Tab →
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Branch Diagram if available */}
                  {currentBranchDiagram && (
                    <div className="space-y-2">
                      <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-teal-600" />
                        <span>Interactive Diagram:</span>
                      </span>
                      <DiagramViewer diagram={currentBranchDiagram} />
                    </div>
                  )}

                  {/* Branch Video Guide */}
                  {currentBranchVideo && (
                    <div className="space-y-2">
                      <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                        <Film className="w-3.5 h-3.5 text-rose-600" />
                        <span>Topic Video Recommendation:</span>
                      </span>
                      <VideoGuideCard video={currentBranchVideo} />
                    </div>
                  )}

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
                type="button"
                onClick={handlePrev}
                disabled={activeStep === 0}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>

              <span className="text-xs font-bold text-slate-500">
                {activeStep + 1} of {totalSteps}
              </span>

              {activeStep === totalSteps - 1 ? (
                <button
                  type="button"
                  onClick={onGoToRetrievalTab || handleNext}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-slate-950 bg-teal-500 hover:bg-teal-400 transition shadow-sm cursor-pointer animate-pulse"
                >
                  <span>Practice Retrieval 🧠</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
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
      )}

      {/* ------------------------------------------------------------- */}
      {/* SUB-VIEW 2: DIAGRAMS HUB */}
      {/* ------------------------------------------------------------- */}
      {subView === 'diagrams' && (
        <div className="space-y-6">
          <div className="p-4 sm:p-5 bg-gradient-to-r from-teal-50/70 via-sky-50/50 to-white rounded-2xl border border-teal-200/80">
            <h3 className="text-sm sm:text-base font-extrabold text-slate-900 font-['Outfit'] flex items-center gap-2">
              <Layers className="w-4 h-4 text-teal-600" />
              <span>Visual Schematics & Mechanisms for {map.chapterTitle}</span>
            </h3>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Visualizing sequential cycles and steps cements cognitive memory 4x better than text alone. Click on each step in the diagrams below to inspect its mechanism!
            </p>
          </div>

          <div className="space-y-5">
            {allDiagrams.map((diag, dIdx) => (
              <div key={dIdx} className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-teal-800 bg-teal-100/70 px-2.5 py-0.5 rounded-full">
                    Diagram {dIdx + 1} of {allDiagrams.length}
                  </span>
                </div>
                <DiagramViewer diagram={diag} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* SUB-VIEW 3: YOUTUBE VIDEO HUB */}
      {/* ------------------------------------------------------------- */}
      {subView === 'videos' && (
        <div className="space-y-6">
          <div className="p-4 sm:p-5 bg-gradient-to-r from-rose-50/70 via-amber-50/40 to-white rounded-2xl border border-rose-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm sm:text-base font-extrabold text-slate-900 font-['Outfit'] flex items-center gap-2">
                <Film className="w-4 h-4 text-rose-600" />
                <span>Curated Educational Video Hub</span>
              </h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Watch curated 5-10 minute lessons with animations from top science creators.
              </p>
            </div>

            <a
              href={`https://www.youtube.com/results?search_query=${encodeURIComponent(
                map.chapterTitle + ' science animation lesson'
              )}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white transition shadow-sm shrink-0"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Search YouTube Directly</span>
            </a>
          </div>

          <div className="space-y-4">
            {effectiveVideos.map((vid, vIdx) => (
              <VideoGuideCard key={vIdx} video={vid} />
            ))}

            {/* Individual topic video cards */}
            {branches.map((b, bIdx) => (
              <div key={bIdx} className="bg-white p-4 rounded-2xl border border-slate-200/80">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1 block">
                  Topic {bIdx + 1}: {b.branchName}
                </span>
                <VideoGuideCard
                  video={
                    b.video || {
                      title: `${b.branchName}: Key Concepts & Explanation`,
                      channel: 'Educational Science',
                      duration: '5:20',
                      youtubeUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent(
                        map.chapterTitle + ' ' + b.branchName
                      )}`,
                      whyWatch: `Targeted visual walkthrough explaining ${b.branchName}.`,
                    }
                  }
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
