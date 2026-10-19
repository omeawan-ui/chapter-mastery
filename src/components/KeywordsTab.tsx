import React, { useState } from 'react';
import {
  Volume2,
  Sparkles,
  CheckCircle,
  HelpCircle,
  RotateCw,
  LayoutGrid,
  CreditCard,
  ChevronLeft,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { Keyword } from '../types';
import { speakText } from '../utils/speech';

interface KeywordsTabProps {
  keywords: Keyword[];
  onToggleMastered: (keywordId: string, mastered: boolean) => void;
}

export const KeywordsTab: React.FC<KeywordsTabProps> = ({
  keywords,
  onToggleMastered,
}) => {
  const [flippedIds, setFlippedIds] = useState<Record<string, boolean>>({});
  const [filter, setFilter] = useState<'all' | 'mastered' | 'practice'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'carousel'>('grid');
  const [carouselIdx, setCarouselIdx] = useState<number>(0);

  const toggleFlip = (id: string) => {
    setFlippedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSpeak = (word: string, meaning: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    speakText(`${word}. Meaning: ${meaning}`);
  };

  const filteredKeywords = keywords.filter((k) => {
    if (filter === 'mastered') return !!k.mastered;
    if (filter === 'practice') return !k.mastered;
    return true;
  });

  const masteredCount = keywords.filter((k) => k.mastered).length;
  const practiceCount = keywords.length - masteredCount;
  const masteryPercentage = Math.round((masteredCount / Math.max(1, keywords.length)) * 100);

  return (
    <div className="max-w-5xl mx-auto py-6 px-4">
      {/* Top Header & Filter Controls */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 mb-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="font-extrabold text-lg text-slate-900 font-['Outfit']">
              Keywords & Vocabulary Vault
            </h2>
            <span className="text-xs bg-teal-100 text-teal-800 font-bold px-2 py-0.5 rounded-full">
              {masteredCount} of {keywords.length} Mastered ({masteryPercentage}%)
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Tap cards to flip between child-friendly definitions and spelling tips. Mark terms you know to track mastery!
          </p>

          {/* Progress bar */}
          <div className="w-56 h-1.5 bg-slate-100 rounded-full overflow-hidden mt-2">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${masteryPercentage}%` }}
            />
          </div>
        </div>

        {/* View Toggle & Filter Pills */}
        <div className="flex items-center gap-2 flex-wrap self-start md:self-center">
          {/* View mode toggle */}
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200/60">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition ${
                viewMode === 'grid'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
              <span className="hidden sm:inline">Grid</span>
            </button>
            <button
              onClick={() => setViewMode('carousel')}
              className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition ${
                viewMode === 'carousel'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Focus Flashcard Mode"
            >
              <CreditCard className="w-4 h-4" />
              <span className="hidden sm:inline">Focus</span>
            </button>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200/60 text-xs">
            <button
              onClick={() => setFilter('all')}
              className={`px-2.5 py-1 rounded-lg font-bold transition ${
                filter === 'all'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              All ({keywords.length})
            </button>
            <button
              onClick={() => setFilter('practice')}
              className={`px-2.5 py-1 rounded-lg font-bold transition ${
                filter === 'practice'
                  ? 'bg-white text-amber-800 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Practice ({practiceCount})
            </button>
            <button
              onClick={() => setFilter('mastered')}
              className={`px-2.5 py-1 rounded-lg font-bold transition ${
                filter === 'mastered'
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Mastered ({masteredCount})
            </button>
          </div>
        </div>
      </div>

      {/* CAROUSEL / FOCUS FLASHCARD MODE */}
      {viewMode === 'carousel' && filteredKeywords.length > 0 && (
        <div className="max-w-xl mx-auto py-4">
          {(() => {
            const currentKw = filteredKeywords[carouselIdx % filteredKeywords.length];
            const isFlipped = !!flippedIds[currentKw.id];

            return (
              <div>
                <div
                  onClick={() => toggleFlip(currentKw.id)}
                  className="perspective-1000 min-h-[340px] cursor-pointer group"
                >
                  <div
                    className={`relative w-full min-h-[340px] rounded-3xl transition-transform duration-500 transform-style-3d shadow-lg shadow-slate-200/50 ${
                      isFlipped ? 'rotate-y-180' : ''
                    }`}
                  >
                    {/* FRONT */}
                    <div className="absolute inset-0 backface-hidden bg-white border-2 border-slate-200/90 rounded-3xl p-6 sm:p-8 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-4">
                          <span className="text-[11px] font-extrabold uppercase tracking-wider text-teal-800 bg-teal-100/70 border border-teal-200 px-2.5 py-0.5 rounded-full">
                            {currentKw.type || 'term'}
                          </span>

                          <button
                            onClick={(e) => handleSpeak(currentKw.word, currentKw.childMeaning, e)}
                            className="p-2 rounded-xl text-slate-500 hover:text-teal-700 hover:bg-teal-50 transition"
                            title="Hear pronunciation"
                          >
                            <Volume2 className="w-5 h-5" />
                          </button>
                        </div>

                        <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight font-['Outfit'] mb-3">
                          {currentKw.word}
                        </h3>

                        <p className="text-base text-slate-700 font-medium leading-relaxed mb-4">
                          {currentKw.childMeaning}
                        </p>

                        {currentKw.memoryHook && (
                          <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200/70 text-amber-900 text-xs sm:text-sm font-semibold flex items-start gap-2.5">
                            <Sparkles className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                            <span>
                              <strong>Memory Hook:</strong> {currentKw.memoryHook}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                        <span className="flex items-center gap-1 font-semibold text-teal-600">
                          <RotateCw className="w-3.5 h-3.5" /> Tap card to flip
                        </span>
                        <span>
                          Card {(carouselIdx % filteredKeywords.length) + 1} of{' '}
                          {filteredKeywords.length}
                        </span>
                      </div>
                    </div>

                    {/* BACK */}
                    <div className="absolute inset-0 backface-hidden rotate-y-180 bg-slate-900 text-white rounded-3xl p-6 sm:p-8 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-3">
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-teal-400 bg-teal-950/80 border border-teal-800 px-2.5 py-0.5 rounded-full">
                            Deep Dive & Spelling
                          </span>
                          <span className="text-xs text-slate-400">Tap to flip back</span>
                        </div>

                        <h3 className="text-2xl font-extrabold text-white tracking-tight mb-4 font-['Outfit']">
                          {currentKw.word}
                        </h3>

                        {currentKw.example && (
                          <div className="mb-4">
                            <span className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">
                              Real-World Context
                            </span>
                            <p className="text-sm text-slate-200 leading-relaxed italic">
                              "{currentKw.example}"
                            </p>
                          </div>
                        )}

                        {currentKw.spellingTip && (
                          <div className="p-3.5 rounded-2xl bg-slate-800 border border-slate-700 text-slate-200 text-xs sm:text-sm font-medium">
                            <span className="block text-[10px] uppercase font-bold text-amber-400 tracking-wider mb-1">
                              Spelling & Breakdown Tip:
                            </span>
                            {currentKw.spellingTip}
                          </div>
                        )}
                      </div>

                      {/* Self Assessment Actions */}
                      <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleMastered(currentKw.id, false);
                          }}
                          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                            !currentKw.mastered
                              ? 'bg-amber-500/30 text-amber-300 border border-amber-500/50'
                              : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                          }`}
                        >
                          <HelpCircle className="w-4 h-4" />
                          <span>Still Practicing</span>
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleMastered(currentKw.id, true);
                          }}
                          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                            currentKw.mastered
                              ? 'bg-emerald-500 text-slate-950 shadow-xs'
                              : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                          }`}
                        >
                          <CheckCircle className="w-4 h-4" />
                          <span>I Mastered It!</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Carousel Navigation */}
                <div className="flex items-center justify-between gap-3 mt-4">
                  <button
                    onClick={() =>
                      setCarouselIdx(
                        (carouselIdx - 1 + filteredKeywords.length) % filteredKeywords.length
                      )
                    }
                    className="flex items-center gap-1 px-4 py-2 rounded-xl text-xs font-bold bg-white border border-slate-200 hover:bg-slate-50 transition text-slate-700"
                  >
                    <ChevronLeft className="w-4 h-4" /> Previous
                  </button>

                  <span className="text-xs font-bold text-slate-500">
                    {(carouselIdx % filteredKeywords.length) + 1} of {filteredKeywords.length}
                  </span>

                  <button
                    onClick={() => setCarouselIdx((carouselIdx + 1) % filteredKeywords.length)}
                    className="flex items-center gap-1 px-4 py-2 rounded-xl text-xs font-bold bg-white border border-slate-200 hover:bg-slate-50 transition text-slate-700"
                  >
                    Next <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* GRID VIEW */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredKeywords.map((kw) => {
            const isFlipped = !!flippedIds[kw.id];

            return (
              <div
                key={kw.id}
                onClick={() => toggleFlip(kw.id)}
                className="perspective-1000 min-h-[260px] cursor-pointer group"
              >
                <div
                  className={`relative w-full h-full min-h-[260px] rounded-2xl transition-transform duration-500 transform-style-3d border ${
                    kw.mastered
                      ? 'border-emerald-200/80 shadow-xs'
                      : 'border-slate-200/80 hover:border-slate-300 shadow-xs'
                  } ${isFlipped ? 'rotate-y-180' : ''}`}
                >
                  {/* FRONT */}
                  <div className="absolute inset-0 backface-hidden bg-white rounded-2xl p-5 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-teal-800 bg-teal-100/70 border border-teal-200 px-2 py-0.5 rounded-md">
                          {kw.type || 'term'}
                        </span>

                        <div className="flex items-center gap-1">
                          {kw.mastered && (
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-md flex items-center gap-1">
                              <CheckCircle className="w-3 h-3" /> Mastered
                            </span>
                          )}
                          <button
                            onClick={(e) => handleSpeak(kw.word, kw.childMeaning, e)}
                            className="p-1 rounded-lg text-slate-400 hover:text-teal-700 hover:bg-teal-50 transition"
                            title="Hear pronunciation"
                          >
                            <Volume2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <h3 className="text-lg font-extrabold text-slate-900 tracking-tight font-['Outfit'] mb-1.5">
                        {kw.word}
                      </h3>

                      <p className="text-xs text-slate-600 font-medium leading-relaxed">
                        {kw.childMeaning}
                      </p>

                      {kw.memoryHook && (
                        <div className="mt-3 p-2.5 rounded-xl bg-amber-50/70 border border-amber-200/70 text-amber-900 text-[11px] font-medium leading-snug">
                          <span className="font-bold text-amber-800">💡 Hook:</span> {kw.memoryHook}
                        </div>
                      )}
                    </div>

                    <div className="pt-2 text-[10px] font-semibold text-slate-400 flex items-center justify-between">
                      <span className="flex items-center gap-1 text-teal-600">
                        <RotateCw className="w-3 h-3" /> Tap to flip
                      </span>
                      <span>Spelling & example →</span>
                    </div>
                  </div>

                  {/* BACK */}
                  <div className="absolute inset-0 backface-hidden rotate-y-180 bg-slate-900 text-white rounded-2xl p-5 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-teal-400">
                          Spelling & Example
                        </span>
                        <span className="text-[10px] text-slate-400">Tap to flip back</span>
                      </div>

                      <h3 className="text-base font-extrabold text-white mb-2 font-['Outfit']">
                        {kw.word}
                      </h3>

                      {kw.example && (
                        <p className="text-xs text-slate-300 leading-relaxed italic mb-2">
                          "{kw.example}"
                        </p>
                      )}

                      {kw.spellingTip && (
                        <div className="p-2 rounded-xl bg-slate-800 text-[11px] text-slate-300 font-medium">
                          <span className="text-amber-400 font-bold block">Spelling tip:</span>
                          {kw.spellingTip}
                        </div>
                      )}
                    </div>

                    {/* Quick status toggle button */}
                    <div className="pt-2 flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleMastered(kw.id, !kw.mastered);
                        }}
                        className={`w-full py-1.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                          kw.mastered
                            ? 'bg-emerald-500 text-slate-950'
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                        }`}
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>{kw.mastered ? 'Mastered ✓' : 'Mark as Mastered'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
