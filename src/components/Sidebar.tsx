import React, { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  BookOpen,
  Calendar,
  X,
  Trash2,
  AlertCircle,
  GraduationCap,
  Flame,
  Sparkles,
  Clock,
} from 'lucide-react';
import { Chapter, StudentProfile, UserStats } from '../types';

interface SidebarProps {
  chapters: Chapter[];
  currentChapterId: string | null;
  onSelectChapter: (id: string) => void;
  onOpenAddModal: () => void;
  onDeleteChapter: (id: string) => void;
  isOpen: boolean;
  onClose: () => void;
  activeProfile: StudentProfile | null;
  onOpenProfileModal: () => void;
  stats?: UserStats;
  onOpenTimerModal?: () => void;
  activeTimerRemaining?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  chapters,
  currentChapterId,
  onSelectChapter,
  onOpenAddModal,
  onDeleteChapter,
  isOpen,
  onClose,
  activeProfile,
  onOpenProfileModal,
  stats,
  onOpenTimerModal,
  activeTimerRemaining,
}) => {
  const [search, setSearch] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>('All');

  // Extract unique subjects
  const subjects = useMemo(() => {
    const list = Array.from(new Set(chapters.map((c) => c.subject).filter(Boolean)));
    return ['All', ...list.sort()];
  }, [chapters]);

  // Subject counts
  const subjectCounts = useMemo(() => {
    const counts: Record<string, number> = { All: chapters.length };
    chapters.forEach((c) => {
      if (c.subject) {
        counts[c.subject] = (counts[c.subject] || 0) + 1;
      }
    });
    return counts;
  }, [chapters]);

  // Filter chapters
  const filteredChapters = useMemo(() => {
    return chapters.filter((c) => {
      const matchSubject = selectedSubject === 'All' || c.subject === selectedSubject;
      const matchSearch =
        c.title.toLowerCase().includes(search.toLowerCase()) ||
        c.subject.toLowerCase().includes(search.toLowerCase());
      return matchSubject && matchSearch;
    });
  }, [chapters, selectedSubject, search]);

  const getStatusBadge = (score: number) => {
    if (score >= 85) {
      return {
        label: 'Ready',
        bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        dot: 'bg-emerald-500',
      };
    }
    if (score >= 70) {
      return {
        label: 'Almost',
        bg: 'bg-amber-50 text-amber-700 border-amber-200',
        dot: 'bg-amber-500',
      };
    }
    if (score > 0) {
      return {
        label: 'Practice',
        bg: 'bg-rose-50 text-rose-700 border-rose-200',
        dot: 'bg-rose-500',
      };
    }
    return {
      label: 'New',
      bg: 'bg-slate-100 text-slate-600 border-slate-200',
      dot: 'bg-slate-400',
    };
  };

  const isReviewDue = (ch: Chapter) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return (ch.reviewDates || []).some((r) => {
      if (r.done) return false;
      const d = new Date(r.date);
      d.setHours(0, 0, 0, 0);
      return d <= today;
    });
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 z-40 w-80 sm:w-84 bg-white border-r border-slate-200/80 flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-teal-600" />
            <h2 className="font-extrabold text-sm text-slate-900 tracking-tight font-['Outfit'] uppercase">
              Chapter Library
            </h2>
            <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-semibold">
              {chapters.length}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={onOpenAddModal}
              className="p-1.5 rounded-lg bg-teal-50 text-teal-700 hover:bg-teal-100 border border-teal-200 transition"
              title="Add New Chapter"
            >
              <Plus className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 lg:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Student Profile Banner */}
        <div className="px-3.5 pt-3">
          <div className="p-3 bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 text-white rounded-2xl shadow-xs flex items-center justify-between gap-2 border border-slate-800">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-xl bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-lg shrink-0">
                {activeProfile?.avatarEmoji || '🎓'}
              </div>
              <div className="truncate">
                <div className="flex items-center gap-1.5 truncate">
                  <span className="font-extrabold text-xs text-white truncate">
                    {activeProfile?.name || 'Guest Student'}
                  </span>
                  {activeProfile?.grade && (
                    <span className="text-[10px] font-bold bg-teal-400 text-slate-950 px-1.5 py-0.2 rounded-md shrink-0">
                      Gr {activeProfile.grade}
                    </span>
                  )}
                </div>
                <div className="text-[10px] text-teal-300 font-medium">
                  {chapters.length} Permanent Kit{chapters.length === 1 ? '' : 's'}
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={onOpenProfileModal}
              className="py-1 px-2 rounded-lg bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 border border-teal-500/40 text-[10px] font-bold transition shrink-0 cursor-pointer"
              title="Switch or Manage Student Profiles"
            >
              Switch
            </button>
          </div>
        </div>

        {/* Study Stats & Focus Timer Widget */}
        <div className="px-3.5 pt-2.5">
          <div className="grid grid-cols-3 gap-1.5 p-1.5 bg-slate-50 border border-slate-200/80 rounded-xl">
            {/* Daily Streak */}
            <div
              className="flex flex-col items-center justify-center py-1 px-1 rounded-lg bg-white border border-slate-200/60 shadow-2xs text-center"
              title="Daily Study Streak"
            >
              <div className="flex items-center gap-1 text-orange-500">
                <Flame className="w-3.5 h-3.5 fill-orange-500" />
                <span className="text-xs font-black text-slate-800">{stats?.streakDays || 0}</span>
              </div>
              <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider">Streak</span>
            </div>

            {/* Total Mastery XP */}
            <div
              className="flex flex-col items-center justify-center py-1 px-1 rounded-lg bg-white border border-slate-200/60 shadow-2xs text-center"
              title="Total Mastery Experience Points"
            >
              <div className="flex items-center gap-1 text-teal-600">
                <Sparkles className="w-3.5 h-3.5 text-teal-500" />
                <span className="text-xs font-black text-slate-800">{stats?.xp || 0}</span>
              </div>
              <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider">XP</span>
            </div>

            {/* Focus Pomodoro Timer Button */}
            <button
              type="button"
              onClick={onOpenTimerModal}
              className={`flex flex-col items-center justify-center py-1 px-1 rounded-lg border shadow-2xs text-center transition cursor-pointer ${
                activeTimerRemaining
                  ? 'bg-teal-500/10 border-teal-400 text-teal-700 font-bold'
                  : 'bg-white hover:bg-slate-100 border-slate-200/60 text-slate-700'
              }`}
              title="Open Focus Pomodoro Timer"
            >
              <div className="flex items-center gap-1">
                <Clock className={`w-3.5 h-3.5 ${activeTimerRemaining ? 'text-teal-600 animate-spin' : 'text-slate-500'}`} style={{ animationDuration: '6s' }} />
                <span className="text-[11px] font-mono font-bold leading-tight">
                  {activeTimerRemaining || '25:00'}
                </span>
              </div>
              <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider">
                {activeTimerRemaining ? 'Timer' : 'Focus'}
              </span>
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="px-3.5 pt-2.5">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search chapters or topics..."
              className="w-full pl-9 pr-8 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 outline-none transition"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Subject Filter Tabs */}
        {subjects.length > 1 && (
          <div className="px-3 pt-2.5 pb-1 flex gap-1.5 overflow-x-auto scrollbar-none">
            {subjects.map((subj) => {
              const count = subjectCounts[subj] || 0;
              return (
                <button
                  key={subj}
                  onClick={() => setSelectedSubject(subj)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition flex items-center gap-1 cursor-pointer ${
                    selectedSubject === subj
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <span>{subj}</span>
                  <span
                    className={`text-[10px] px-1 py-0.2 rounded-full font-extrabold ${
                      selectedSubject === subj
                        ? 'bg-teal-400 text-slate-950'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* Chapter List */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1.5">
          {filteredChapters.length === 0 ? (
            <div className="text-center py-12 px-4">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
                <BookOpen className="w-6 h-6" />
              </div>
              <p className="text-xs font-bold text-slate-700">No chapters found</p>
              <p className="text-[11px] text-slate-400 mt-1">
                {search ? 'Try clearing your search keyword.' : 'Click + to generate your first study kit!'}
              </p>
              <button
                onClick={onOpenAddModal}
                className="mt-4 px-3 py-1.5 rounded-lg text-xs font-bold bg-teal-500 hover:bg-teal-400 text-slate-950 transition inline-flex items-center gap-1.5 shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" /> Add Chapter
              </button>
            </div>
          ) : (
            filteredChapters.map((ch) => {
              const active = ch.id === currentChapterId;
              const status = getStatusBadge(ch.masteryScore);
              const due = isReviewDue(ch);

              return (
                <div
                  key={ch.id}
                  onClick={() => {
                    onSelectChapter(ch.id);
                    onClose();
                  }}
                  className={`group relative p-3 rounded-2xl cursor-pointer transition-all border ${
                    active
                      ? 'bg-teal-50/70 border-teal-300 shadow-sm ring-1 ring-teal-500/20'
                      : 'bg-white border-slate-100 hover:border-slate-200 hover:bg-slate-50/80'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-teal-700 bg-teal-100/60 px-2 py-0.5 rounded-md">
                        Grade {ch.grade} · {ch.subject}
                      </span>
                      {ch.difficultyLevel && (
                        <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-md">
                          {ch.difficultyLevel === 'easy' ? '🌱 Easy' : ch.difficultyLevel === 'hard' ? '🚀 Adv' : '⚖️ Std'}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      {due && (
                        <span
                          className="flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-100/70 px-1.5 py-0.5 rounded-md border border-amber-200 animate-pulse"
                          title="Spaced repetition review is due today!"
                        >
                          <AlertCircle className="w-3 h-3 text-amber-600" /> Due
                        </span>
                      )}

                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 ${status.bg}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                        {ch.masteryScore}%
                      </span>
                    </div>
                  </div>

                  <h3
                    className={`text-xs font-bold leading-snug line-clamp-2 ${
                      active ? 'text-slate-950' : 'text-slate-800'
                    }`}
                  >
                    {ch.title}
                  </h3>

                  {/* Metadata Row */}
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2">
                    <div className="flex items-center gap-1.5">
                      {ch.examDate ? (
                        <span className="flex items-center gap-1 text-slate-500">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          {new Date(ch.examDate).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      ) : (
                        <span>{ch.map?.branches?.length || 0} topics</span>
                      )}
                      <span>•</span>
                      <span>{ch.keywords?.length || 0} words</span>
                    </div>

                    {/* Delete button (hover only) */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteChapter(ch.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition"
                      title="Delete chapter"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Tiny Mastery Progress Fill Bar */}
                  <div className="mt-2 h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-teal-500 rounded-full transition-all duration-500"
                      style={{ width: `${ch.masteryScore}%` }}
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/50 text-center">
          <p className="text-[10px] text-slate-400 font-medium">
            Daily practice locks facts into long-term memory 🧠
          </p>
        </div>
      </aside>
    </>
  );
};
