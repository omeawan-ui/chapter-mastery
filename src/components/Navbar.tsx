import React from 'react';
import {
  BookOpen,
  Flame,
  Clock,
  Printer,
  Plus,
  Menu,
  Sparkles,
  Bell,
  Cpu,
} from 'lucide-react';
import { UserStats } from '../types';

interface NavbarProps {
  stats: UserStats;
  reviewsDueCount: number;
  onOpenAddModal: () => void;
  onOpenTimerModal: () => void;
  onOpenCheatSheet: () => void;
  onOpenAiSettings: () => void;
  onToggleSidebar: () => void;
  onOpenReviews: () => void;
  isSidebarOpen: boolean;
  activeTimerRemaining?: string;
  hasActiveChapter: boolean;
  aiProvider?: 'gemini' | 'deepseek';
}

export const Navbar: React.FC<NavbarProps> = ({
  stats,
  reviewsDueCount,
  onOpenAddModal,
  onOpenTimerModal,
  onOpenCheatSheet,
  onOpenAiSettings,
  onToggleSidebar,
  onOpenReviews,
  activeTimerRemaining,
  hasActiveChapter,
  aiProvider = 'gemini',
}) => {
  return (
    <header className="sticky top-0 z-30 bg-slate-900 text-white border-b border-slate-800 shadow-md">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-15 flex items-center justify-between gap-2">
        {/* Left: Mobile Menu + Branding */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={onToggleSidebar}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition lg:hidden"
            aria-label="Toggle chapter list"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2.5 cursor-pointer">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-500 to-emerald-400 flex items-center justify-center shadow-lg shadow-teal-500/20 text-slate-950 font-bold">
              <BookOpen className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base tracking-tight text-white font-['Outfit']">
                  Chapter Mastery
                </span>
                <span className="bg-teal-500/20 text-teal-300 border border-teal-500/40 text-[10px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                  Pro
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block -mt-0.5">
                Master chapters through visual maps & active recall
              </p>
            </div>
          </div>
        </div>

        {/* Right: Quick Tools & Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          {/* Spaced Review Alert */}
          {reviewsDueCount > 0 && (
            <button
              onClick={onOpenReviews}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 transition animate-pulse"
              title={`${reviewsDueCount} spaced repetition review(s) due today!`}
            >
              <Bell className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Review Due</span>
              <span className="bg-amber-400 text-slate-950 text-[10px] px-1.5 py-0.2 rounded-full font-extrabold">
                {reviewsDueCount}
              </span>
            </button>
          )}

          {/* Streak Badge */}
          <div
            className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-800/80 border border-slate-700/80 text-orange-400"
            title="Daily Study Streak"
          >
            <Flame className="w-3.5 h-3.5 text-orange-500 fill-orange-500 animate-bounce" />
            <span className="font-bold">{stats.streakDays}</span>
            <span className="text-[10px] text-slate-400 hidden md:inline">day streak</span>
          </div>

          {/* XP Badge */}
          <div
            className="hidden md:flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-800/80 border border-slate-700/80 text-teal-300"
            title="Total Mastery Experience Points"
          >
            <Sparkles className="w-3.5 h-3.5 text-teal-400" />
            <span className="font-bold">{stats.xp}</span>
            <span className="text-[10px] text-slate-400">XP</span>
          </div>

          {/* Focus Timer Button */}
          <button
            onClick={onOpenTimerModal}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition ${
              activeTimerRemaining
                ? 'bg-teal-500/20 text-teal-300 border-teal-500/40 shadow-sm shadow-teal-500/20'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700 hover:text-white'
            }`}
            title="Focus Pomodoro Timer"
          >
            <Clock className="w-3.5 h-3.5" />
            <span className="font-mono font-semibold">
              {activeTimerRemaining || 'Timer'}
            </span>
          </button>

          {/* AI Settings / DeepSeek Button */}
          <button
            onClick={onOpenAiSettings}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition ${
              aiProvider === 'deepseek'
                ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700 hover:text-white'
            }`}
            title="AI Engine & DeepSeek Key Settings"
          >
            <Cpu className="w-3.5 h-3.5 text-teal-400" />
            <span className="hidden sm:inline">
              {aiProvider === 'deepseek' ? 'DeepSeek' : 'AI Model'}
            </span>
          </button>

          {/* Printable Cheat Sheet */}
          {hasActiveChapter && (
            <button
              onClick={onOpenCheatSheet}
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 hover:text-white transition"
              title="Printable 1-Page Revision Sheet"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cheat Sheet</span>
            </button>
          )}

          {/* Primary Add Chapter Button */}
          <button
            onClick={onOpenAddModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-teal-500 hover:bg-teal-400 text-slate-950 transition shadow-sm shadow-teal-500/30 active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span className="hidden sm:inline">Add Chapter</span>
            <span className="sm:hidden">Add</span>
          </button>
        </div>
      </div>
    </header>
  );
};
