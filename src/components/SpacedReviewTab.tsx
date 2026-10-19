import React from 'react';
import {
  CalendarCheck2,
  CheckCircle2,
  Clock,
  Sparkles,
  Zap,
  Flame,
  BrainCircuit,
  Info,
} from 'lucide-react';
import { Chapter } from '../types';

interface SpacedReviewTabProps {
  chapter: Chapter;
  onMarkReviewDone: (day: number) => void;
  onLaunchReviewQuiz: () => void;
}

export const SpacedReviewTab: React.FC<SpacedReviewTabProps> = ({
  chapter,
  onMarkReviewDone,
  onLaunchReviewQuiz,
}) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const reviews = chapter.reviewDates || [];

  const getStatus = (r: { day: number; date: string; done: boolean }) => {
    if (r.done) return { label: 'Completed', color: 'emerald', isDue: false };
    const rDate = new Date(r.date);
    rDate.setHours(0, 0, 0, 0);
    if (rDate <= today) return { label: 'Due Today!', color: 'amber', isDue: true };
    const diff = Math.ceil((rDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return { label: `In ${diff} day${diff > 1 ? 's' : ''}`, color: 'slate', isDue: false };
  };

  const hasDueToday = reviews.some((r) => !r.done && new Date(r.date).setHours(0, 0, 0, 0) <= today.getTime());

  return (
    <div className="max-w-4xl mx-auto py-6 px-4">
      {/* Forgetting Curve Concept Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 mb-6 shadow-xl relative overflow-hidden">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-teal-500/20 text-teal-300 border border-teal-500/30 mb-3">
              <BrainCircuit className="w-3.5 h-3.5" />
              Ebbinghaus Spaced Repetition Engine
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight font-['Outfit']">
              Lock into Long-Term Memory
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
              Without review, the human brain forgets 70% of new information within 48 hours. By testing yourself on <strong>Day 2, Day 3, Day 7, and Day 21</strong>, recall becomes permanent with zero cramming stress!
            </p>
          </div>

          {hasDueToday && (
            <button
              onClick={onLaunchReviewQuiz}
              className="px-4 py-2.5 rounded-2xl text-xs font-extrabold bg-teal-500 hover:bg-teal-400 text-slate-950 shadow-lg shadow-teal-500/20 transition shrink-0 cursor-pointer flex items-center gap-1.5"
            >
              <Zap className="w-4 h-4 fill-slate-950" />
              <span>Review Now</span>
            </button>
          )}
        </div>
      </div>

      {/* Review Milestones Timeline */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6">
        <h3 className="text-sm font-extrabold text-slate-900 font-['Outfit'] uppercase tracking-wider flex items-center gap-2">
          <CalendarCheck2 className="w-4 h-4 text-teal-600" />
          Mastery Schedule for "{chapter.title}"
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {reviews.map((item) => {
            const st = getStatus(item);
            const dateStr = new Date(item.date).toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
            });

            return (
              <div
                key={item.day}
                className={`p-5 rounded-2xl border-2 transition-all flex flex-col justify-between ${
                  item.done
                    ? 'bg-emerald-50/50 border-emerald-300 text-emerald-950'
                    : st.isDue
                    ? 'bg-amber-50/80 border-amber-400 text-amber-950 ring-2 ring-amber-500/20 shadow-md'
                    : 'bg-slate-50 border-slate-200 text-slate-800'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-2">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                      Day {item.day} Review
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        item.done
                          ? 'bg-emerald-200 text-emerald-900 border-emerald-300'
                          : st.isDue
                          ? 'bg-amber-200 text-amber-900 border-amber-300 animate-pulse'
                          : 'bg-slate-200 text-slate-700 border-slate-300'
                      }`}
                    >
                      {st.label}
                    </span>
                  </div>

                  <h4 className="text-lg font-extrabold font-['Outfit'] mb-1">
                    {item.day === 2
                      ? '48-Hour Recall'
                      : item.day === 3
                      ? 'Concept Lock'
                      : item.day === 7
                      ? '1-Week Deep Dive'
                      : '3-Week Mastery'}
                  </h4>

                  <p className="text-xs text-slate-500 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    Target: {dateStr}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-200/60">
                  {item.done ? (
                    <div className="text-xs font-bold text-emerald-700 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Review Done ✓</span>
                    </div>
                  ) : st.isDue ? (
                    <button
                      onClick={() => onMarkReviewDone(item.day)}
                      className="w-full py-2 px-3 rounded-xl text-xs font-extrabold bg-amber-500 hover:bg-amber-400 text-slate-950 transition cursor-pointer shadow-xs flex items-center justify-center gap-1"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Complete Review</span>
                    </button>
                  ) : (
                    <div className="text-[11px] text-slate-400 font-semibold text-center">
                      Scheduled
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Study Tip Box */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-3 text-xs text-slate-600 leading-relaxed">
          <Info className="w-4 h-4 text-teal-600 mt-0.5 shrink-0" />
          <div>
            <strong>Parent / Student Tip:</strong> A 5-minute review on Day 2 and Day 7 does more for exam grades than 4 hours of last-minute cramming the night before!
          </div>
        </div>
      </div>
    </div>
  );
};
