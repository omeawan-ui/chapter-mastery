import React, { useState, useEffect, useRef } from 'react';
import {
  Brain,
  Sparkles,
  Mic,
  MicOff,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  BookOpen,
  ArrowRight,
  RotateCcw,
  Eye,
  EyeOff,
  Clock,
  Award,
  Lightbulb,
  Loader2,
  ChevronRight,
} from 'lucide-react';
import { ChapterMap, MapBranch, RetrievalRecord, RetrievalEvaluation } from '../types';
import { playSuccessSound } from '../utils/audio';

interface RetrievalTabProps {
  map: ChapterMap;
  chapterTitle: string;
  grade: number;
  retrievalRecords?: RetrievalRecord[];
  onSaveRecord: (record: RetrievalRecord) => void;
  onGoToMapTab: () => void;
}

export const RetrievalTab: React.FC<RetrievalTabProps> = ({
  map,
  chapterTitle,
  grade,
  retrievalRecords = [],
  onSaveRecord,
  onGoToMapTab,
}) => {
  const branches = map.branches || [];

  // Options: 'big-idea', or branch ID 'b1', 'b2', etc.
  const [selectedTargetId, setSelectedTargetId] = useState<string>('big-idea');
  const [recallText, setRecallText] = useState<string>('');
  const [isRecordingVoice, setIsRecordingVoice] = useState<boolean>(false);
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [currentEvaluation, setCurrentEvaluation] = useState<RetrievalEvaluation | null>(null);
  const [showAdvanceMapPeek, setShowAdvanceMapPeek] = useState<boolean>(false);
  const [showHintNudge, setShowHintNudge] = useState<boolean>(false);

  // Stop recognition ref
  const recognitionRef = useRef<any>(null);

  // Target object details
  const isBigIdea = selectedTargetId === 'big-idea';
  const currentBranch = !isBigIdea ? branches.find((b) => b.id === selectedTargetId) || branches[0] : null;

  const targetTitle = isBigIdea ? map.bigIdea || map.chapterTitle : currentBranch?.branchName || '';
  const targetEmoji = isBigIdea ? map.bigIdeaEmoji || '💡' : currentBranch?.branchEmoji || '📌';
  const expectedPoints = isBigIdea
    ? [map.oneLineSummary, ...(map.learningOutcomes || [])]
    : currentBranch
    ? [...(currentBranch.subPoints || []), ...(currentBranch.keyTakeaways || [])]
    : [];
  const expectedAnalogy = isBigIdea ? map.bigIdeaAnalogy : currentBranch?.analogy || '';

  // Check if target already has an evaluation in records
  useEffect(() => {
    const existing = retrievalRecords.find((r) => r.targetId === selectedTargetId);
    if (existing) {
      setRecallText(existing.studentRecallText || '');
      setCurrentEvaluation(existing.evaluation || null);
    } else {
      setRecallText('');
      setCurrentEvaluation(null);
    }
    setShowAdvanceMapPeek(false);
    setShowHintNudge(false);
  }, [selectedTargetId, retrievalRecords]);

  // Speech Recognition Setup (Web Speech API)
  const toggleVoiceDictation = () => {
    if (isRecordingVoice) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsRecordingVoice(false);
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Voice dictation is not supported by your browser. You can type your recall directly!');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsRecordingVoice(true);
      };

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          transcript += event.results[i][0].transcript;
        }
        setRecallText((prev) => (prev ? `${prev} ${transcript}` : transcript));
      };

      recognition.onerror = () => {
        setIsRecordingVoice(false);
      };

      recognition.onend = () => {
        setIsRecordingVoice(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e) {
      setIsRecordingVoice(false);
    }
  };

  const handleEvaluate = async () => {
    if (recallText.trim().split(/\s+/).length < 5) {
      alert('Please express a little bit more from memory before evaluating!');
      return;
    }

    setIsEvaluating(true);
    try {
      let aiSettings: any = {};
      try {
        const raw = localStorage.getItem('cms_ai_settings_v4');
        if (raw) aiSettings = JSON.parse(raw);
      } catch (e) {}

      const res = await fetch('/api/evaluate-retrieval', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetTitle,
          targetType: isBigIdea ? 'Big Idea Overview' : 'Topic Branch',
          expectedPoints,
          expectedAnalogy,
          studentRecallText: recallText.trim(),
          chapterTitle,
          grade,
          aiProvider: aiSettings.provider,
          deepseekApiKey: aiSettings.deepseekApiKey,
          deepseekModel: aiSettings.deepseekModel,
        }),
      });

      if (!res.ok) throw new Error('Evaluation failed');
      const evalData: RetrievalEvaluation = await res.json();
      setCurrentEvaluation(evalData);
      playSuccessSound();

      // Save to parent state
      const record: RetrievalRecord = {
        id: `ret_${Date.now()}`,
        targetId: selectedTargetId,
        targetTitle,
        studentRecallText: recallText.trim(),
        evaluation: evalData,
        date: new Date().toISOString(),
      };
      onSaveRecord(record);
    } catch (err: any) {
      alert(`Could not evaluate retrieval: ${err.message || 'Please try again'}`);
    } finally {
      setIsEvaluating(false);
    }
  };

  const wordCount = recallText.trim() ? recallText.trim().split(/\s+/).length : 0;

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 space-y-6">
      {/* Intro Banner: The Science of Retrieval */}
      <div className="bg-gradient-to-r from-teal-950 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-7 shadow-lg relative overflow-hidden">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-teal-500/20 text-teal-300 border border-teal-500/30 mb-2.5">
              <Brain className="w-3.5 h-3.5 text-teal-400" />
              <span>Cognitive Retrieval Practice (Brain Dump)</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold font-['Outfit'] tracking-tight">
              Test Your Recall: Closed-Book Brain Dump
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl font-medium">
              After viewing the <strong>Advance Map</strong>, don't just re-read! Try to pull the concepts out of your own memory. Straining to remember creates <strong>3x deeper memory pathways</strong> than passive reading.
            </p>
          </div>

          <button
            onClick={onGoToMapTab}
            className="hidden sm:flex items-center gap-1 px-3.5 py-2 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-white border border-white/20 transition shrink-0 cursor-pointer"
            title="Peek at the Advance Map"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>View Advance Map</span>
          </button>
        </div>
      </div>

      {/* Target Topic Selector Pills */}
      <div>
        <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-400 mb-2 px-1">
          Select Topic to Retrieve from Memory:
        </label>
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
          {/* Big Idea Pill */}
          <button
            onClick={() => setSelectedTargetId('big-idea')}
            className={`px-3.5 py-2 rounded-2xl text-xs font-bold flex items-center gap-2 whitespace-nowrap transition border cursor-pointer ${
              selectedTargetId === 'big-idea'
                ? 'bg-slate-900 text-white border-slate-900 shadow-sm ring-2 ring-teal-500/30'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <span>{map.bigIdeaEmoji || '💡'}</span>
            <span>Big Picture Overview</span>
            {retrievalRecords.some((r) => r.targetId === 'big-idea') && (
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
            )}
          </button>

          {/* Branch Pills */}
          {branches.map((b, idx) => {
            const isSelected = selectedTargetId === b.id;
            const hasRecord = retrievalRecords.some((r) => r.targetId === b.id);

            return (
              <button
                key={b.id || idx}
                onClick={() => setSelectedTargetId(b.id)}
                className={`px-3.5 py-2 rounded-2xl text-xs font-bold flex items-center gap-2 whitespace-nowrap transition border cursor-pointer ${
                  isSelected
                    ? 'bg-slate-900 text-white border-slate-900 shadow-sm ring-2 ring-teal-500/30'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span>{b.branchEmoji || '📌'}</span>
                <span>{b.branchName}</span>
                {hasRecord && <span className="w-2 h-2 rounded-full bg-emerald-400" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Retrieval Prompt & Writing Arena */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl p-6 sm:p-8 space-y-6">
        {/* Topic Header & Prompts */}
        <div className="border-b border-slate-100 pb-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-teal-800 bg-teal-100/70 border border-teal-200 px-2.5 py-0.5 rounded-md">
                {isBigIdea ? 'Big Idea Recall' : 'Branch Topic Recall'}
              </span>
              <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-['Outfit'] mt-1.5 flex items-center gap-2">
                <span>{targetEmoji}</span>
                <span>{targetTitle}</span>
              </h3>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowAdvanceMapPeek(!showAdvanceMapPeek)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                title="Peek at original map card"
              >
                {showAdvanceMapPeek ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">
                  {showAdvanceMapPeek ? 'Hide Peek' : 'Map Peek'}
                </span>
              </button>
            </div>
          </div>

          {/* Guided Prompt Questions */}
          <div className="mt-3 p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-amber-950 text-xs sm:text-sm space-y-1.5">
            <span className="font-extrabold text-[11px] uppercase tracking-wider text-amber-800 flex items-center gap-1.5">
              <Lightbulb className="w-4 h-4 text-amber-600" />
              Retrieval Challenge Prompts:
            </span>
            <ul className="text-xs space-y-1 text-amber-900 font-medium pl-5 list-disc">
              <li>What was the real-world analogy used in the Advance Map?</li>
              <li>What are the step-by-step mechanisms or facts that happen?</li>
              <li>What was the #1 key takeaway you need to remember for the exam?</li>
            </ul>
          </div>
        </div>

        {/* Peek Card Drawer if requested */}
        {showAdvanceMapPeek && (
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-2 animate-fadeIn">
            <div className="font-bold text-slate-900 flex items-center justify-between">
              <span>Advance Map Reference:</span>
              <span className="text-[10px] text-slate-400">Try not to copy word-for-word!</span>
            </div>
            {expectedAnalogy && (
              <p className="italic text-teal-900 bg-teal-50/70 p-2.5 rounded-xl border border-teal-200">
                <strong>Analogy:</strong> {expectedAnalogy}
              </p>
            )}
            <ul className="pl-4 list-disc space-y-1 text-slate-600">
              {expectedPoints.slice(0, 4).map((pt, idx) => (
                <li key={idx}>{pt}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Student Recall Writing Area */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
              Write Everything You Remember:
            </label>

            {/* Voice Dictation Button */}
            <button
              onClick={toggleVoiceDictation}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${
                isRecordingVoice
                  ? 'bg-rose-500 text-white animate-pulse'
                  : 'bg-slate-100 hover:bg-teal-50 text-slate-700 hover:text-teal-900 border border-slate-200'
              }`}
              title={isRecordingVoice ? 'Stop recording voice' : 'Dictate your recall by speaking!'}
            >
              {isRecordingVoice ? (
                <>
                  <MicOff className="w-3.5 h-3.5" />
                  <span>Stop Dictating</span>
                </>
              ) : (
                <>
                  <Mic className="w-3.5 h-3.5 text-teal-600" />
                  <span>Speak Your Recall</span>
                </>
              )}
            </button>
          </div>

          <textarea
            rows={5}
            value={recallText}
            onChange={(e) => setRecallText(e.target.value)}
            placeholder="Close your eyes for 3 seconds... then write down everything you learned about this topic in your own words..."
            className="w-full p-4 text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 outline-none leading-relaxed text-slate-800 transition"
          />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-1">
            <div className="text-[11px] text-slate-400 font-medium">
              {wordCount === 0 ? (
                'Aim for 25+ words of free recall'
              ) : (
                <span>
                  <strong className="text-slate-700">{wordCount} words</strong>
                  {wordCount < 20 ? ' • Keep going, what else happened?' : ' • Great depth of recall!'}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setRecallText('')}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl transition"
                title="Clear text"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <button
                onClick={handleEvaluate}
                disabled={isEvaluating || wordCount < 4}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-extrabold bg-teal-500 hover:bg-teal-400 text-slate-950 transition shadow-md shadow-teal-500/20 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                {isEvaluating ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Analyzing Recall...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Check My Retrieval</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* EVALUATION / COGNITIVE GAP ANALYSIS RESULT */}
        {currentEvaluation && (
          <div className="mt-6 rounded-3xl border border-teal-200 bg-teal-50/40 p-5 sm:p-6 space-y-4 animate-fadeIn">
            {/* Header: Score & Strength Badge */}
            <div className="flex items-center justify-between gap-3 border-b border-teal-200/60 pb-3.5 flex-wrap">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-teal-700" />
                <span className="font-extrabold text-sm text-teal-950 font-['Outfit']">
                  Cognitive Recall Analysis
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-slate-900 text-white shadow-xs">
                  {currentEvaluation.strengthBadge}
                </span>
                <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-teal-600 text-white shadow-xs">
                  {currentEvaluation.retrievalScore}% Recall
                </span>
              </div>
            </div>

            {/* Two-Column Matrix: Recalled vs Missed Gaps */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Recalled Box */}
              <div className="p-4 rounded-2xl bg-white border border-emerald-200 shadow-xs space-y-2">
                <span className="text-xs font-extrabold text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  What You Successfully Recalled:
                </span>
                <ul className="text-xs text-slate-700 space-y-1.5 pl-4 list-disc font-medium">
                  {currentEvaluation.recalledPoints.map((pt, pIdx) => (
                    <li key={pIdx} className="leading-snug">
                      {pt}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Missed Nuances Box (The Gap for Growth) */}
              <div className="p-4 rounded-2xl bg-white border border-amber-200 shadow-xs space-y-2">
                <span className="text-xs font-extrabold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  Omitted Concepts (The Growth Gap):
                </span>
                {currentEvaluation.missedPoints && currentEvaluation.missedPoints.length > 0 ? (
                  <ul className="text-xs text-slate-700 space-y-1.5 pl-4 list-disc font-medium">
                    {currentEvaluation.missedPoints.map((pt, mIdx) => (
                      <li key={mIdx} className="leading-snug">
                        {pt}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-emerald-700 font-semibold">
                    Zero gaps detected! You retrieved every major concept from the map.
                  </p>
                )}
              </div>
            </div>

            {/* Analogy & Tip Feedback */}
            <div className="p-3.5 rounded-2xl bg-white/80 border border-teal-200/70 text-xs text-slate-700 space-y-1.5">
              {currentEvaluation.analogyFeedback && (
                <p>
                  <strong>Analogy & Clarity:</strong> {currentEvaluation.analogyFeedback}
                </p>
              )}
              {currentEvaluation.actionableTip && (
                <p className="text-teal-900 font-semibold">
                  <strong>Next Step:</strong> {currentEvaluation.actionableTip}
                </p>
              )}
            </div>

            {/* Encouragement Quote */}
            {currentEvaluation.encouragement && (
              <div className="text-xs italic text-teal-800 text-center font-medium pt-1">
                "{currentEvaluation.encouragement}"
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
