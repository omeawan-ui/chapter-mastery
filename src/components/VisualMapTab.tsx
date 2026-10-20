import React, { useState, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Volume2,
  VolumeX,
  Lightbulb,
  CheckCircle2,
  Sparkles,
  BookMarked,
  Layers,
  Film,
  ExternalLink,
  Map as MapIcon,
  Zap,
  Lock,
  Unlock,
  Compass,
  Award,
  HelpCircle,
  Eye,
  AlertTriangle,
} from 'lucide-react';
import { ChapterMap, MapDiagram, VideoRecommendation, MapBranch } from '../types';
import { speakText, stopSpeaking } from '../utils/speech';
import { DiagramViewer } from './DiagramViewer';
import { VideoGuideCard } from './VideoGuideCard';
import { MicroCheckCard } from './MicroCheckCard';
import { CoachSparkyCompass } from './CoachSparkyCompass';
import {
  getCuriosityHook,
  getBranchMicroCheck,
  getStoredUnlockedStep,
  saveStoredUnlockedStep,
  getCompletedMicroChecks,
  saveCompletedMicroCheck,
} from '../utils/mapProgress';

interface VisualMapTabProps {
  map: ChapterMap;
  chapterId?: string;
  onGoToRetrievalTab?: () => void;
  onAddXp?: (amount: number, reason?: string) => void;
}

export const VisualMapTab: React.FC<VisualMapTabProps> = ({
  map,
  chapterId = 'default_chapter',
  onGoToRetrievalTab,
  onAddXp,
}) => {
  // Sub-view: 'roadmap' (stepping stones), 'diagrams' (diagram hub), 'videos' (video hub)
  const [subView, setSubView] = useState<'roadmap' | 'diagrams' | 'videos'>('roadmap');

  // Progressive Disclosure: 'guided' (Fog of War) vs 'free' (All unlocked for review)
  const [isGuidedMode, setIsGuidedMode] = useState<boolean>(true);

  // Highest unlocked step index (0 is Big Idea, 1..N are branches)
  const [unlockedStepMax, setUnlockedStepMax] = useState<number>(() => {
    return getStoredUnlockedStep(chapterId);
  });

  // Track completed micro-checks: branchId or stepIndex -> boolean
  const [completedMicroChecks, setCompletedMicroChecks] = useState<Record<string, boolean>>(() => {
    return getCompletedMicroChecks(chapterId);
  });

  // Active step in the stepping-stone roadmap: 0 = Big Idea, 1..N = branches
  const [activeStep, setActiveStep] = useState<number>(0);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  // Wrong attempt alert to trigger Coach Sparky hint
  const [wrongAnswerTrigger, setWrongAnswerTrigger] = useState<boolean>(false);

  // Animated unlock pulse for line transitions
  const [justUnlockedStep, setJustUnlockedStep] = useState<number | null>(null);

  const branches = map.branches || [];
  const totalSteps = branches.length + 1; // 0 is Big Idea, 1..N are branches
  const isBigIdea = activeStep === 0;
  const currentBranch: MapBranch | null = !isBigIdea ? branches[activeStep - 1] : null;

  // Sync unlocked step from storage when chapter changes
  useEffect(() => {
    const saved = getStoredUnlockedStep(chapterId);
    setUnlockedStepMax(saved);
    setCompletedMicroChecks(getCompletedMicroChecks(chapterId));
    setActiveStep(0);
  }, [chapterId]);

  // Overall fallback diagram
  const effectiveOverallDiagram: MapDiagram = map.overallDiagram || {
    type: 'flow',
    title: `${map.chapterTitle} Core Progression`,
    caption: 'Interactive roadmap showing how foundational concepts transition into real-world outcomes.',
    steps:
      branches.length >= 3
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

  // Video guides
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

  // Derive branch diagram
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

  // Derive branch video
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

  // All diagrams across the chapter
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

  const isStepLocked = (stepIdx: number): boolean => {
    if (!isGuidedMode) return false;
    if (stepIdx === 0) return false; // Big Idea is always unlocked
    if (stepIdx === 1) return false; // First topic is always unlocked
    return stepIdx > unlockedStepMax;
  };

  const handleStepClick = (stepIdx: number) => {
    if (isStepLocked(stepIdx)) {
      // Gentle intervention
      setWrongAnswerTrigger(true);
      return;
    }
    setActiveStep(stepIdx);
    stopSpeaking();
    setIsSpeaking(false);
  };

  const handleMicroCheckSuccess = (branchId: string, stepIdx: number) => {
    // Record completion
    saveCompletedMicroCheck(chapterId, branchId);
    setCompletedMicroChecks((prev) => ({ ...prev, [branchId]: true }));

    // Award +15 XP
    if (onAddXp) {
      onAddXp(15, `Micro-Check: ${currentBranch?.branchName}`);
    }

    // Unlock next step
    const nextStepIdx = stepIdx + 1;
    if (nextStepIdx < totalSteps && nextStepIdx > unlockedStepMax) {
      setUnlockedStepMax(nextStepIdx);
      saveStoredUnlockedStep(chapterId, nextStepIdx);
      setJustUnlockedStep(nextStepIdx);
      setTimeout(() => setJustUnlockedStep(null), 3500);
    }
  };

  const handleNext = () => {
    if (activeStep < totalSteps - 1) {
      const next = activeStep + 1;
      if (!isStepLocked(next)) {
        setActiveStep(next);
        stopSpeaking();
        setIsSpeaking(false);
      }
    }
  };

  const handlePrev = () => {
    if (activeStep > 0) {
      setActiveStep(activeStep - 1);
      stopSpeaking();
      setIsSpeaking(false);
    }
  };

  // Stepping stone curiosity hook & micro-check for current step
  const activeCuriosityHook = currentBranch
    ? getCuriosityHook(currentBranch, activeStep - 1)
    : undefined;

  const activeMicroCheck = currentBranch
    ? getBranchMicroCheck(currentBranch, map.chapterTitle, activeStep - 1)
    : null;

  const currentBranchId = currentBranch?.id || `b_${activeStep}`;
  const isCurrentMicroCheckDone = Boolean(completedMicroChecks[currentBranchId]);

  // Overall progression calculations
  const totalMasteredCount = Object.keys(completedMicroChecks).length;
  const progressPercent = Math.min(
    100,
    Math.round(((Math.min(unlockedStepMax, branches.length) + totalMasteredCount * 0.5) / (totalSteps * 1.5)) * 100)
  );

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 space-y-6 relative">
      {/* ------------------------------------------------------------- */}
      {/* Top Header & Strategy Controls */}
      {/* ------------------------------------------------------------- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/90 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-xl bg-teal-500/15 text-teal-800">
              <Compass className="w-4 h-4 text-teal-600" />
            </span>
            <h2 className="text-base sm:text-lg font-black text-slate-900 font-['Outfit'] tracking-tight">
              Advance Organizer Map & Stepping Stones
            </h2>
          </div>
          <p className="text-xs text-slate-500 max-w-xl leading-relaxed">
            Progressive narrative journey: curiosity mysteries precede academic exam terms, reinforced by 1-minute micro-checks.
          </p>
        </div>

        {/* Action Toggles: Guided Mode & Views */}
        <div className="flex flex-wrap items-center gap-2 self-start md:self-center">
          {/* Fog of War Toggle */}
          <button
            type="button"
            onClick={() => setIsGuidedMode(!isGuidedMode)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer border ${
              isGuidedMode
                ? 'bg-teal-500/10 text-teal-800 border-teal-500/30'
                : 'bg-slate-100 text-slate-600 border-slate-200 hover:text-slate-900'
            }`}
            title={
              isGuidedMode
                ? 'Fog of War Active: Unlocks stepping stones sequentially'
                : 'Free Explorer: All topics open for revision'
            }
          >
            {isGuidedMode ? (
              <>
                <Lock className="w-3.5 h-3.5 text-teal-600" />
                <span>Fog of War Guided</span>
              </>
            ) : (
              <>
                <Unlock className="w-3.5 h-3.5 text-amber-600" />
                <span>Free Explorer</span>
              </>
            )}
          </button>

          {/* Sub-view switcher */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setSubView('roadmap')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                subView === 'roadmap'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <MapIcon className="w-3 h-3 text-teal-600" />
              <span>Map</span>
            </button>
            <button
              type="button"
              onClick={() => setSubView('diagrams')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                subView === 'diagrams'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3 h-3 text-indigo-600" />
              <span>Diagrams</span>
            </button>
            <button
              type="button"
              onClick={() => setSubView('videos')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                subView === 'videos'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Film className="w-3 h-3 text-rose-600" />
              <span>Videos</span>
            </button>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* SUB-VIEW 1: STEPPING STONE ROADMAP (PROGRESSIVE DISCLOSURE) */}
      {/* ------------------------------------------------------------- */}
      {subView === 'roadmap' && (
        <div className="space-y-5">
          {/* Progression Overview Bar */}
          <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/90 shadow-sm space-y-3">
            <div className="flex items-center justify-between text-xs font-extrabold text-slate-600">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-teal-600" />
                <span>
                  {isBigIdea
                    ? '🎯 Step 0: Big Picture Mental Anchor'
                    : `Topic ${activeStep} of ${branches.length}: ${currentBranch?.branchName}`}
                </span>
              </span>

              <div className="flex items-center gap-2">
                <span className="text-[11px] text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200/70 font-black">
                  {totalMasteredCount}/{branches.length} Micro-Checks Conquered
                </span>
                <span className="text-slate-500">{progressPercent}% Explored</span>
              </div>
            </div>

            {/* Stepping Stone Dots & Connecting Path */}
            <div className="relative pt-2 pb-1">
              <div className="flex items-center justify-between gap-1 sm:gap-2 overflow-x-auto pb-2 scrollbar-none">
                {/* Step 0: Big Idea Node */}
                <button
                  type="button"
                  onClick={() => handleStepClick(0)}
                  className={`flex flex-col items-center group cursor-pointer shrink-0 transition-transform ${
                    activeStep === 0 ? 'scale-105' : 'hover:scale-102'
                  }`}
                  title="Big Picture Overview Anchor"
                >
                  <div
                    className={`w-9 h-9 sm:w-10 sm:h-10 rounded-2xl flex items-center justify-center font-black text-xs transition-all shadow-sm ${
                      activeStep === 0
                        ? 'bg-teal-500 text-slate-950 ring-4 ring-teal-500/20 shadow-teal-500/30'
                        : 'bg-teal-50 text-teal-700 border border-teal-200 hover:bg-teal-100'
                    }`}
                  >
                    🎯
                  </div>
                  <span className="text-[10px] font-bold text-slate-700 mt-1.5 max-w-[70px] truncate text-center">
                    Big Idea
                  </span>
                </button>

                {/* Branches as Stepping Stones */}
                {branches.map((b, idx) => {
                  const stepNum = idx + 1;
                  const isCurrent = activeStep === stepNum;
                  const isLocked = isStepLocked(stepNum);
                  const branchId = b.id || `b_${stepNum}`;
                  const isMastered = Boolean(completedMicroChecks[branchId]);
                  const isJustUnlocked = justUnlockedStep === stepNum;
                  const hookQuestion = getCuriosityHook(b, idx);

                  return (
                    <React.Fragment key={b.id || idx}>
                      {/* Animated Connector Line */}
                      <div className="flex-1 min-w-[20px] max-w-[60px] h-1 rounded-full relative overflow-hidden bg-slate-200">
                        <div
                          className={`h-full transition-all duration-700 ${
                            isMastered || (!isLocked && stepNum <= unlockedStepMax)
                              ? 'bg-teal-500 w-full'
                              : 'w-0'
                          } ${isJustUnlocked ? 'animate-pulse bg-emerald-400' : ''}`}
                        />
                      </div>

                      {/* Stepping Stone Node */}
                      <button
                        type="button"
                        onClick={() => handleStepClick(stepNum)}
                        disabled={isLocked}
                        className={`flex flex-col items-center group shrink-0 transition-all ${
                          isLocked ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                        } ${isCurrent ? 'scale-105' : 'hover:scale-102'} ${
                          isJustUnlocked ? 'animate-bounce' : ''
                        }`}
                        title={
                          isLocked
                            ? `🔒 Locked: Complete Step ${stepNum - 1} micro-check to reveal "${hookQuestion}"`
                            : hookQuestion
                        }
                      >
                        <div
                          className={`w-9 h-9 sm:w-10 sm:h-10 rounded-2xl flex items-center justify-center font-black text-xs transition-all shadow-sm relative ${
                            isCurrent
                              ? 'bg-teal-500 text-slate-950 ring-4 ring-teal-500/20 shadow-teal-500/30'
                              : isMastered
                              ? 'bg-emerald-500 text-white shadow-emerald-500/20'
                              : isLocked
                              ? 'bg-slate-100 text-slate-400 border border-slate-300/80'
                              : 'bg-white text-slate-800 border-2 border-teal-500/40 hover:border-teal-500'
                          }`}
                        >
                          {isLocked ? (
                            <Lock className="w-4 h-4 text-slate-400" />
                          ) : isMastered ? (
                            <CheckCircle2 className="w-5 h-5 text-white" />
                          ) : (
                            <span>{b.branchEmoji || stepNum}</span>
                          )}

                          {/* XP Pill if mastered */}
                          {isMastered && (
                            <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-amber-400 text-slate-950 font-black text-[9px] flex items-center justify-center border border-white">
                              ★
                            </span>
                          )}
                        </div>

                        {/* Curiosity Hook Title underneath (truncated) */}
                        <span
                          className={`text-[10px] font-extrabold mt-1.5 max-w-[85px] sm:max-w-[100px] truncate text-center ${
                            isCurrent
                              ? 'text-teal-700 font-black'
                              : isLocked
                              ? 'text-slate-400'
                              : 'text-slate-700'
                          }`}
                        >
                          {isLocked ? `Step ${stepNum} (Locked)` : `Step ${stepNum}: ${b.branchEmoji || ''}`}
                        </span>
                      </button>
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ------------------------------------------------------------- */}
          {/* Main Card View: Either Big Idea Hero or Branch Mystery Card */}
          {/* ------------------------------------------------------------- */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl shadow-slate-100 overflow-hidden transition-all duration-300">
            {isBigIdea ? (
              /* ========================================================= */
              /* STEP 0: BIG IDEA OVERVIEW HERO                            */
              /* ========================================================= */
              <div>
                <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-teal-950 text-white p-6 sm:p-8 relative overflow-hidden">
                  <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-teal-500/15 blur-2xl pointer-events-none" />

                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-teal-500/20 text-teal-300 border border-teal-500/30 mb-3">
                        <Sparkles className="w-3.5 h-3.5" />
                        Big Picture Mental Anchor
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

                <div className="p-6 sm:p-8 space-y-6">
                  {/* Big Idea Analogy Box */}
                  {map.bigIdeaAnalogy && (
                    <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/80 border border-amber-200/80 text-amber-950 flex items-start gap-3.5 shadow-xs">
                      <div className="p-2 rounded-xl bg-amber-200/70 text-amber-800 shrink-0 mt-0.5">
                        <Lightbulb className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="block text-[11px] font-extrabold uppercase tracking-wider text-amber-800 mb-1">
                          Everyday Mental Model • Think of it like this:
                        </span>
                        <p className="text-sm sm:text-base text-amber-950 font-medium leading-relaxed">
                          {map.bigIdeaAnalogy}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Visual Diagram */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                        <Layers className="w-4 h-4 text-teal-600" />
                        <span>Interactive Visual Diagram:</span>
                      </span>
                    </div>
                    <DiagramViewer diagram={effectiveOverallDiagram} />
                  </div>

                  {/* Start Guided Journey Callout */}
                  <div className="p-5 rounded-3xl bg-gradient-to-r from-teal-500/10 via-cyan-500/10 to-teal-500/10 border-2 border-teal-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-teal-800 bg-teal-100 px-2 py-0.5 rounded-full inline-block mb-1">
                        Step 1 Awaits
                      </span>
                      <h4 className="text-sm sm:text-base font-extrabold text-slate-900 font-['Outfit']">
                        Ready to begin your guided exploration?
                      </h4>
                      <p className="text-xs text-slate-600 mt-0.5">
                        Start with Mystery 1: &quot;{branches[0] ? getCuriosityHook(branches[0], 0) : 'First Topic'}&quot;
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleStepClick(1)}
                      className="px-5 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-extrabold text-xs sm:text-sm transition shadow-md shadow-teal-500/25 flex items-center gap-2 shrink-0 cursor-pointer"
                    >
                      <span>Begin Guided Journey</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Learning Outcomes */}
                  {map.learningOutcomes && map.learningOutcomes.length > 0 && (
                    <div>
                      <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-teal-600" />
                        What you will conquer in this chapter:
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

                  {/* Video Guides */}
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
                </div>
              </div>
            ) : isStepLocked(activeStep) ? (
              /* ========================================================= */
              /* LOCKED "FOG OF WAR" CARD                                  */
              /* ========================================================= */
              <div className="p-8 sm:p-12 text-center space-y-4 bg-slate-50/80 relative backdrop-blur-md">
                <div className="w-16 h-16 rounded-3xl bg-slate-200/80 border border-slate-300 text-slate-500 flex items-center justify-center mx-auto shadow-inner">
                  <Lock className="w-8 h-8 text-slate-400" />
                </div>

                <div className="max-w-md mx-auto">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-slate-200 text-slate-700 mb-2">
                    🌫️ Shrouded in Fog of War
                  </div>
                  <h3 className="text-xl font-extrabold text-slate-900 font-['Outfit']">
                    Topic {activeStep} is Locked
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed">
                    To prevent cognitive overload, master the prerequisite knowledge first! Solve the micro-check in{' '}
                    <strong>Topic {activeStep - 1}</strong> to clear the fog and unlock this mystery.
                  </p>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => handleStepClick(activeStep - 1)}
                    className="px-5 py-2.5 rounded-2xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-extrabold text-xs sm:text-sm transition shadow-md shadow-teal-500/20 cursor-pointer"
                  >
                    Go Back to Topic {activeStep - 1} →
                  </button>
                </div>
              </div>
            ) : (
              /* ========================================================= */
              /* UNLOCKED BRANCH TOPIC CARD (CURIOSITY HOOK + MECHANISMS)   */
              /* ========================================================= */
              <div>
                {/* 1. Curiosity Hook Mystery Banner (FIRST BEFORE ACADEMIC HEADING) */}
                <div className="p-6 sm:p-8 bg-gradient-to-br from-amber-500/10 via-teal-500/10 to-white border-b border-amber-200/60">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-black uppercase tracking-wider text-amber-900 bg-amber-200/80 border border-amber-300/80 px-2.5 py-0.5 rounded-md flex items-center gap-1">
                          <HelpCircle className="w-3 h-3 text-amber-800" />
                          <span>The Everyday Mystery • Step {activeStep}</span>
                        </span>
                        {isCurrentMicroCheckDone && (
                          <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-md flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Micro-Check Mastered</span>
                          </span>
                        )}
                      </div>

                      {/* Prominent Curiosity Hook Question */}
                      <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-amber-950 tracking-tight font-['Outfit'] leading-tight">
                        &quot;{activeCuriosityHook}&quot;
                      </h2>

                      {/* Revealed Exam Academic Heading */}
                      <div className="pt-1 flex items-center gap-2 text-xs sm:text-sm text-slate-600">
                        <span className="font-extrabold uppercase tracking-wider text-[11px] text-teal-800 bg-teal-100/80 px-2 py-0.5 rounded">
                          Exam Academic Heading:
                        </span>
                        <span className="font-extrabold text-slate-900 flex items-center gap-1">
                          <span>{currentBranch?.branchEmoji || '📌'}</span>
                          <span>{currentBranch?.branchName}</span>
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        handleSpeak(
                          `Mystery: ${activeCuriosityHook}. Academic term: ${currentBranch?.branchName}. Analogy: ${
                            currentBranch?.analogy
                          }. Key points: ${(currentBranch?.subPoints || []).join('. ')}`
                        )
                      }
                      className={`p-2.5 rounded-2xl border transition shrink-0 cursor-pointer ${
                        isSpeaking
                          ? 'bg-teal-500 text-slate-950 border-teal-400 animate-pulse'
                          : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 shadow-xs'
                      }`}
                      title={isSpeaking ? 'Stop read aloud' : 'Read aloud with voice'}
                    >
                      {isSpeaking ? (
                        <VolumeX className="w-5 h-5 text-slate-950" />
                      ) : (
                        <Volume2 className="w-5 h-5 text-slate-700" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="p-6 sm:p-8 space-y-6">
                  {/* 2. Relatable Analogy in Plain Everyday Words */}
                  {currentBranch?.analogy && (
                    <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/90 border border-amber-200/90 text-amber-950 shadow-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 rounded-xl bg-amber-200/80 text-amber-900">
                            <Lightbulb className="w-4 h-4" />
                          </div>
                          <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-900">
                            Relatable Analogy • Explained in Easy English
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
                      <p className="text-sm sm:text-base font-medium leading-relaxed text-amber-950 bg-white/80 p-3.5 rounded-xl border border-amber-200/60">
                        {currentBranch.analogy}
                      </p>
                    </div>
                  )}

                  {/* 3. Key Concepts & Mechanisms */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                        <Zap className="w-3.5 h-3.5 text-teal-600" />
                        <span>Core Exam Mechanisms:</span>
                      </h3>
                      <span className="text-[10px] text-slate-400 font-semibold">Self-learning guide</span>
                    </div>

                    <div className="space-y-2.5">
                      {(currentBranch?.subPoints || []).map((point, idx) => (
                        <div
                          key={idx}
                          className="p-3.5 rounded-2xl bg-slate-50/90 border border-slate-200/70 text-slate-800 text-sm leading-relaxed flex items-start gap-3 hover:border-teal-300 transition"
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

                  {/* 4. Real-Life Everyday Examples Section */}
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
                          Observe Today
                        </span>
                      </div>

                      {/* Structured mechanisms */}
                      {currentBranch?.mechanisms && currentBranch.mechanisms.length > 0 && (
                        <div className="grid grid-cols-1 gap-2 pt-1">
                          {currentBranch.mechanisms.map((mech, mIdx) => (
                            <div
                              key={mIdx}
                              className="p-3.5 bg-white/90 rounded-xl border border-teal-200/70 shadow-xs space-y-1"
                            >
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
                    </div>
                  )}

                  {/* 5. Interactive Diagram (if available) */}
                  {currentBranchDiagram && (
                    <div className="space-y-2">
                      <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-teal-600" />
                        <span>Interactive Diagram:</span>
                      </span>
                      <DiagramViewer diagram={currentBranchDiagram} />
                    </div>
                  )}

                  {/* 6. Topic Video Recommendation */}
                  {currentBranchVideo && (
                    <div className="space-y-2">
                      <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                        <Film className="w-3.5 h-3.5 text-rose-600" />
                        <span>Watch Before Micro-Check:</span>
                      </span>
                      <VideoGuideCard video={currentBranchVideo} />
                    </div>
                  )}

                  {/* 7. Key Exam Takeaways to Memorize */}
                  {currentBranch?.keyTakeaways && currentBranch.keyTakeaways.length > 0 && (
                    <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 text-white shadow-md">
                      <div className="text-[11px] font-extrabold uppercase tracking-wider text-amber-400 mb-2 flex items-center gap-1.5">
                        <span>★</span>
                        <span>Essential Exam Takeaways</span>
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

                  {/* 8. EMBEDDED MICRO-CHECK (REQUIREMENT 3: INSTANT EXAM ALIGNMENT) */}
                  {activeMicroCheck && currentBranch && (
                    <div className="pt-2">
                      <MicroCheckCard
                        microCheck={activeMicroCheck}
                        branchName={currentBranch.branchName}
                        isCompleted={isCurrentMicroCheckDone}
                        onSuccess={() => handleMicroCheckSuccess(currentBranchId, activeStep)}
                        onWrongAttempt={() => setWrongAnswerTrigger(true)}
                        onRequestHint={() => setWrongAnswerTrigger(true)}
                        hasNextStep={activeStep < totalSteps - 1}
                        onNextStep={handleNext}
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Navigation Footer */}
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
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black text-slate-950 bg-teal-500 hover:bg-teal-400 transition shadow-sm cursor-pointer animate-pulse"
                >
                  <span>Practice Retrieval 🧠</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={isStepLocked(activeStep + 1)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black transition shadow-xs cursor-pointer ${
                    isStepLocked(activeStep + 1)
                      ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      : 'bg-teal-500 hover:bg-teal-400 text-slate-950'
                  }`}
                  title={isStepLocked(activeStep + 1) ? 'Complete Micro-Check to Unlock' : 'Next Topic'}
                >
                  <span>Next Topic</span>
                  {isStepLocked(activeStep + 1) ? (
                    <Lock className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* SUB-VIEW 2: DIAGRAMS HUB                                      */}
      {/* ------------------------------------------------------------- */}
      {subView === 'diagrams' && (
        <div className="space-y-6">
          <div className="p-4 sm:p-5 bg-gradient-to-r from-teal-50/70 via-sky-50/50 to-white rounded-3xl border border-teal-200/80">
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
      {/* SUB-VIEW 3: YOUTUBE VIDEO HUB                                 */}
      {/* ------------------------------------------------------------- */}
      {subView === 'videos' && (
        <div className="space-y-6">
          <div className="p-4 sm:p-5 bg-gradient-to-r from-rose-50/70 via-amber-50/40 to-white rounded-3xl border border-rose-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
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

      {/* ------------------------------------------------------------- */}
      {/* 4. ACTIVATE "COACH SPARKY" AS AN ON-PAGE COMPASS (REQUIREMENT 4) */}
      {/* ------------------------------------------------------------- */}
      <CoachSparkyCompass
        chapterTitle={map.chapterTitle}
        activeTopicName={currentBranch?.branchName}
        curiosityHook={activeCuriosityHook}
        isBigIdea={isBigIdea}
        stepNumber={activeStep}
        totalSteps={branches.length}
        hintText={activeMicroCheck?.hint}
        simpleExplanation={currentBranch?.analogy}
        examRelevance={currentBranch?.keyTakeaways?.[0]}
        wrongAnswerAlert={wrongAnswerTrigger}
        onClearWrongAlert={() => setWrongAnswerTrigger(false)}
      />
    </div>
  );
};
