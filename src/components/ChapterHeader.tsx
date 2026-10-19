import {
  Map,
  Brain,
  KeyRound,
  FileQuestion,
  Zap,
  Bot,
  CalendarCheck2,
  Calendar,
  Edit3,
  Trash2,
  Printer,
  Sparkles,
} from 'lucide-react';
import { Chapter } from '../types';

export type ActiveTab = 'map' | 'retrieval' | 'keywords' | 'questions' | 'quiz' | 'coach' | 'spaced';

interface ChapterHeaderProps {
  chapter: Chapter;
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  onEdit: () => void;
  onDelete: () => void;
  onPrintCheatSheet: () => void;
}

export const ChapterHeader: React.FC<ChapterHeaderProps> = ({
  chapter,
  activeTab,
  onTabChange,
  onEdit,
  onDelete,
  onPrintCheatSheet,
}) => {
  const getExamCountdown = (examDateStr?: string) => {
    if (!examDateStr) return null;
    const examDate = new Date(examDateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diffTime = examDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return 'Exam passed';
    if (diffDays === 0) return 'Exam Today! 🔥';
    if (diffDays === 1) return 'Exam Tomorrow! ⚡';
    return `${diffDays} days until exam`;
  };

  const getMasteryRank = (score: number) => {
    if (score >= 90) return { title: 'Master', color: 'text-amber-600 bg-amber-50 border-amber-200' };
    if (score >= 75) return { title: 'Scholar', color: 'text-teal-700 bg-teal-50 border-teal-200' };
    if (score >= 50) return { title: 'Explorer', color: 'text-sky-700 bg-sky-50 border-sky-200' };
    return { title: 'Apprentice', color: 'text-slate-700 bg-slate-100 border-slate-200' };
  };

  const countdown = getExamCountdown(chapter.examDate);
  const rank = getMasteryRank(chapter.masteryScore);

  const tabs: Array<{ id: ActiveTab; label: string; icon: React.ReactNode; count?: number }> = [
    { id: 'map', label: 'Advance Map', icon: <Map className="w-4 h-4" /> },
    {
      id: 'retrieval',
      label: 'Retrieval Practice',
      icon: <Brain className="w-4 h-4" />,
      count: chapter.retrievalRecords?.length,
    },
    { id: 'keywords', label: 'Keywords Vault', icon: <KeyRound className="w-4 h-4" />, count: chapter.keywords?.length },
    { id: 'questions', label: 'Active Recall', icon: <FileQuestion className="w-4 h-4" />, count: chapter.questions?.length },
    { id: 'quiz', label: 'Quiz Arena', icon: <Zap className="w-4 h-4" />, count: chapter.quiz?.length },
    { id: 'coach', label: 'Coach Sparky', icon: <Bot className="w-4 h-4" /> },
    { id: 'spaced', label: 'Spaced Review', icon: <CalendarCheck2 className="w-4 h-4" /> },
  ];

  return (
    <div className="bg-white border-b border-slate-200/80 shrink-0">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-5 pb-0">
        {/* Top Row: Meta, Title, Actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-teal-800 bg-teal-100/70 border border-teal-200/80 px-2.5 py-0.5 rounded-full">
                Grade {chapter.grade} • {chapter.subject}
              </span>

              {chapter.difficultyLevel && (
                <span
                  className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full border flex items-center gap-1 ${
                    chapter.difficultyLevel === 'easy'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : chapter.difficultyLevel === 'hard'
                      ? 'bg-indigo-50 text-indigo-800 border-indigo-200'
                      : 'bg-teal-50 text-teal-800 border-teal-200'
                  }`}
                >
                  <span>
                    {chapter.difficultyLevel === 'easy'
                      ? '🌱 Foundational'
                      : chapter.difficultyLevel === 'hard'
                      ? '🚀 Advanced'
                      : '⚖️ Standard'}
                  </span>
                </span>
              )}

              {countdown && (
                <span className="flex items-center gap-1 text-[11px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded-full">
                  <Calendar className="w-3 h-3" />
                  {countdown}
                </span>
              )}

              <span
                className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border flex items-center gap-1 ${rank.color}`}
              >
                <Sparkles className="w-3 h-3" />
                {rank.title} Rank
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight font-['Outfit']">
              {chapter.title}
            </h1>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 self-start md:self-center">
            <button
              onClick={onPrintCheatSheet}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
              title="Print Revision Cheat Sheet"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Cheat Sheet</span>
            </button>

            <button
              onClick={onEdit}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
              title="Edit chapter details or sources"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit</span>
            </button>

            <button
              onClick={onDelete}
              className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
              title="Delete this chapter"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mastery Progress Bar */}
        <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center font-bold text-teal-700 text-sm">
              {chapter.masteryScore}%
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold text-slate-800">
                  Chapter Mastery Meter
                </span>
                <span className="text-[11px] text-slate-500">
                  {chapter.masteryScore >= 85
                    ? '🎉 Exam Ready! Excellent retention.'
                    : chapter.masteryScore >= 70
                    ? '👍 Good progress! Take another quiz to reach 90%.'
                    : '🌱 Keep practicing keywords and active recall!'}
                </span>
              </div>
              <div className="w-48 sm:w-64 h-2 bg-slate-200 rounded-full overflow-hidden mt-1.5">
                <div
                  className="h-full bg-gradient-to-r from-teal-500 to-emerald-400 rounded-full transition-all duration-700 shadow-xs"
                  style={{ width: `${chapter.masteryScore}%` }}
                />
              </div>
            </div>
          </div>

          <div className="text-right flex items-center gap-3 sm:gap-4 self-end sm:self-center">
            <div className="text-left sm:text-right">
              <span className="block text-[10px] uppercase font-bold text-slate-400">
                XP Earned
              </span>
              <span className="text-xs font-extrabold text-teal-600">
                +{chapter.xpEarned || 0} XP
              </span>
            </div>
            <div className="text-left sm:text-right">
              <span className="block text-[10px] uppercase font-bold text-slate-400">
                Quizzes Taken
              </span>
              <span className="text-xs font-extrabold text-slate-700">
                {chapter.quizScores?.length || 0} attempts
              </span>
            </div>
          </div>
        </div>

        {/* Tab Navigation Row */}
        <nav className="flex gap-1 overflow-x-auto scrollbar-none border-t border-slate-100 pt-1 -mb-px">
          {tabs.map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-3 border-b-2 font-bold text-xs whitespace-nowrap transition cursor-pointer ${
                  active
                    ? 'border-teal-500 text-teal-700 bg-teal-50/40 rounded-t-lg'
                    : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
                }`}
              >
                <span className={active ? 'text-teal-600' : 'text-slate-400'}>
                  {tab.icon}
                </span>
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                      active
                        ? 'bg-teal-200/60 text-teal-900'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};
