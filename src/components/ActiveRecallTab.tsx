import React, { useState } from 'react';
import {
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Send,
  Loader2,
  Award,
  BookOpen,
} from 'lucide-react';
import { Question } from '../types';

interface ActiveRecallTabProps {
  questions: Question[];
  onSaveAnswer: (questionId: string, answer: string) => void;
  onEvaluateAnswer: (questionId: string, answer: string) => Promise<void>;
}

export const ActiveRecallTab: React.FC<ActiveRecallTabProps> = ({
  questions,
  onSaveAnswer,
  onEvaluateAnswer,
}) => {
  const [answers, setAnswers] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    questions.forEach((q) => {
      if (q.studentAnswer) init[q.id] = q.studentAnswer;
    });
    return init;
  });

  const [loadingIds, setLoadingIds] = useState<Record<string, boolean>>({});
  const [expandedModelAnswers, setExpandedModelAnswers] = useState<Record<string, boolean>>({});

  const handleTextChange = (id: string, text: string) => {
    setAnswers((prev) => ({ ...prev, [id]: text }));
    onSaveAnswer(id, text);
  };

  const handleEvaluate = async (q: Question) => {
    const ans = (answers[q.id] || '').trim();
    if (ans.split(/\s+/).length < 4) {
      alert('Please write at least a few words before asking the examiner to score your answer!');
      return;
    }

    setLoadingIds((prev) => ({ ...prev, [q.id]: true }));
    try {
      await onEvaluateAnswer(q.id, ans);
    } finally {
      setLoadingIds((prev) => ({ ...prev, [q.id]: false }));
    }
  };

  const toggleModelAnswer = (id: string) => {
    setExpandedModelAnswers((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const getTypeStyle = (type: string) => {
    switch (type) {
      case 'reasoning':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'definition':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'diagram':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      default:
        return 'bg-teal-100 text-teal-800 border-teal-200';
    }
  };

  const totalAnswered = questions.filter((q) => !!q.evaluation).length;

  return (
    <div className="max-w-4xl mx-auto py-6 px-4">
      {/* Intro Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 mb-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Award className="w-5 h-5 text-teal-600" />
            <h2 className="font-extrabold text-lg text-slate-900 font-['Outfit']">
              Active Recall & Feynman Arena
            </h2>
            <span className="text-xs bg-teal-100 text-teal-800 font-bold px-2 py-0.5 rounded-full">
              {totalAnswered} of {questions.length} Scored
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Write your answer in your own words before checking the model solution. The AI Examiner scores your answer against official marking criteria!
          </p>
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-6">
        {questions.map((q, idx) => {
          const studentAns = answers[q.id] || '';
          const wordCount = studentAns.trim() ? studentAns.trim().split(/\s+/).length : 0;
          const isLoading = !!loadingIds[q.id];
          const evalResult = q.evaluation;
          const isModelOpen = !!expandedModelAnswers[q.id];

          return (
            <div
              key={q.id}
              className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-5 sm:p-6 transition-all"
            >
              {/* Question Header */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="w-7 h-7 rounded-xl bg-slate-900 text-white font-extrabold text-xs flex items-center justify-center">
                    Q{idx + 1}
                  </span>
                  <span
                    className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-md border ${getTypeStyle(
                      q.type
                    )}`}
                  >
                    {q.type.replace('-', ' ')}
                  </span>
                </div>

                <div className="text-xs font-extrabold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
                  {q.marks || 2} marks
                </div>
              </div>

              {/* Question Prompt */}
              <p className="text-base sm:text-lg font-bold text-slate-900 leading-snug mb-4 font-['Outfit']">
                {q.question}
              </p>

              {/* Student Writing Area */}
              <div className="space-y-2">
                <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                  Your Written Answer:
                </label>
                <textarea
                  rows={4}
                  value={studentAns}
                  onChange={(e) => handleTextChange(q.id, e.target.value)}
                  placeholder="Explain as if teaching someone who has never heard of this before..."
                  className="w-full p-3.5 text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 outline-none transition leading-relaxed text-slate-800"
                />

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
                  <div className="text-[11px] text-slate-400 font-medium">
                    {wordCount === 0 ? (
                      'Aim for 20+ words to cover all key curriculum points'
                    ) : (
                      <span>
                        <strong className="text-slate-700">{wordCount} words</strong>
                        {wordCount < 15 ? ' • Add a bit more detail!' : ' • Looks solid!'}
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => handleEvaluate(q)}
                    disabled={isLoading || wordCount < 3}
                    className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-teal-500 hover:bg-teal-400 text-slate-950 transition shadow-xs disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Scoring with AI...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>{evalResult ? 'Re-Score Answer' : 'Check My Answer'}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Examiner Feedback Result */}
              {evalResult && (
                <div className="mt-5 rounded-2xl border border-teal-200 bg-teal-50/40 p-4 sm:p-5 space-y-3.5">
                  <div className="flex items-center justify-between gap-3 border-b border-teal-200/60 pb-3">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-teal-700" />
                      <span className="text-xs font-extrabold uppercase tracking-wider text-teal-900">
                        Examiner Rubric Feedback
                      </span>
                    </div>

                    <div
                      className={`text-xs font-extrabold px-3 py-1 rounded-full border ${
                        evalResult.score === evalResult.maxScore
                          ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                          : evalResult.score > 0
                          ? 'bg-amber-400 text-slate-950 border-amber-300'
                          : 'bg-rose-400 text-white border-rose-300'
                      }`}
                    >
                      {evalResult.score} / {evalResult.maxScore} Marks
                    </div>
                  </div>

                  {evalResult.whatGood && (
                    <div className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-800">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                      <div>
                        <strong className="text-emerald-900 font-extrabold block">
                          What you nailed:
                        </strong>
                        <p className="mt-0.5 text-slate-700">{evalResult.whatGood}</p>
                      </div>
                    </div>
                  )}

                  {evalResult.howToImprove && (
                    <div className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-800">
                      <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                      <div>
                        <strong className="text-amber-900 font-extrabold block">
                          How to level up to full marks:
                        </strong>
                        <p className="mt-0.5 text-slate-700">{evalResult.howToImprove}</p>
                      </div>
                    </div>
                  )}

                  {evalResult.encouragement && (
                    <div className="p-2.5 rounded-xl bg-white/70 border border-teal-200/50 text-xs italic text-slate-600">
                      "{evalResult.encouragement}"
                    </div>
                  )}
                </div>
              )}

              {/* Model Answer Toggle */}
              <div className="mt-4 pt-3 border-t border-slate-100">
                <button
                  onClick={() => toggleModelAnswer(q.id)}
                  className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition cursor-pointer"
                >
                  <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                  <span>{isModelOpen ? 'Hide Model Answer' : 'View Official Model Answer'}</span>
                  {isModelOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>

                {isModelOpen && (
                  <div className="mt-3 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-800 text-xs sm:text-sm space-y-2.5 animate-fadeIn">
                    <span className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                      Curriculum Standard Model Solution:
                    </span>
                    <p className="leading-relaxed font-medium">{q.modelAnswer}</p>

                    {q.keyWordsUsed && q.keyWordsUsed.length > 0 && (
                      <div className="pt-2 flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mr-1">
                          Key Terms:
                        </span>
                        {q.keyWordsUsed.map((kw, kIdx) => (
                          <span
                            key={kIdx}
                            className="bg-teal-100 text-teal-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-teal-200"
                          >
                            {kw}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
