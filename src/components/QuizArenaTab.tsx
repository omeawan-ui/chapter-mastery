import React, { useState, useEffect } from 'react';
import {
  Zap,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Sparkles,
  Trophy,
  ArrowRight,
  HelpCircle,
  Flame,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { QuizItem, MatchPair } from '../types';
import { playSuccessSound, playWrongSound } from '../utils/audio';

interface QuizArenaTabProps {
  quiz: QuizItem[];
  chapterTitle: string;
  onRecordScore: (scorePercent: number) => void;
}

export const QuizArenaTab: React.FC<QuizArenaTabProps> = ({
  quiz,
  chapterTitle,
  onRecordScore,
}) => {
  const [quizStarted, setQuizStarted] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [answeredState, setAnsweredState] = useState<{
    answered: boolean;
    isCorrect: boolean;
    userChoice?: any;
    explanation?: string;
  }>({ answered: false, isCorrect: false });

  // For fill-blank
  const [fillInput, setFillInput] = useState('');
  const [revealedLetters, setRevealedLetters] = useState(0);

  // For match pairs
  const [matchedPairs, setMatchedPairs] = useState<Record<string, string>>({});
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [shuffledRights, setShuffledRights] = useState<string[]>([]);

  // Streak within quiz
  const [streak, setStreak] = useState(0);

  // Finished state
  const [quizFinished, setQuizFinished] = useState(false);

  const currentQ = quiz[currentIdx];

  // Shuffle right items when reaching a match question
  useEffect(() => {
    if (quizStarted && currentQ && currentQ.type === 'match' && currentQ.pairs) {
      const rights = currentQ.pairs.map((p) => p.right);
      setShuffledRights([...rights].sort(() => Math.random() - 0.5));
      setMatchedPairs({});
      setSelectedLeft(null);
    }
    setFillInput('');
    setRevealedLetters(0);
    setAnsweredState({ answered: false, isCorrect: false });
  }, [currentIdx, quizStarted]);

  const handleStart = () => {
    setQuizStarted(true);
    setCurrentIdx(0);
    setScore(0);
    setStreak(0);
    setQuizFinished(false);
    setAnsweredState({ answered: false, isCorrect: false });
  };

  // MCQ Selection
  const handleSelectMCQ = (index: number) => {
    if (answeredState.answered) return;
    const isCorrect = index === currentQ.correctIndex;

    if (isCorrect) {
      setScore((s) => s + 1);
      setStreak((st) => st + 1);
      playSuccessSound();
    } else {
      setStreak(0);
      playWrongSound();
    }

    setAnsweredState({
      answered: true,
      isCorrect,
      userChoice: index,
      explanation: currentQ.explanation,
    });
  };

  // True / False Selection
  const handleSelectTF = (val: boolean) => {
    if (answeredState.answered) return;
    const isCorrect = val === currentQ.answer;

    if (isCorrect) {
      setScore((s) => s + 1);
      setStreak((st) => st + 1);
      playSuccessSound();
    } else {
      setStreak(0);
      playWrongSound();
    }

    setAnsweredState({
      answered: true,
      isCorrect,
      userChoice: val,
      explanation: currentQ.explanation,
    });
  };

  // Fill in the Blank Check
  const handleCheckFillBlank = () => {
    if (answeredState.answered || !fillInput.trim()) return;
    const target = String(currentQ.answer || '').trim().toLowerCase();
    const user = fillInput.trim().toLowerCase();

    // Tolerant comparison
    const isCorrect = user === target || target.includes(user) || user.includes(target);

    if (isCorrect) {
      setScore((s) => s + 1);
      setStreak((st) => st + 1);
      playSuccessSound();
    } else {
      setStreak(0);
      playWrongSound();
    }

    setAnsweredState({
      answered: true,
      isCorrect,
      userChoice: fillInput,
      explanation: currentQ.explanation,
    });
  };

  // Give Letter Hint
  const handleGiveHint = () => {
    const target = String(currentQ.answer || '');
    if (revealedLetters < target.length) {
      setRevealedLetters((r) => r + 1);
    }
  };

  // Match Pair Left Select
  const handleLeftClick = (left: string) => {
    if (answeredState.answered || matchedPairs[left]) return;
    setSelectedLeft(left);
  };

  // Match Pair Right Select
  const handleRightClick = (right: string) => {
    if (answeredState.answered || !selectedLeft) return;

    // Check if this matches
    const correctPair = currentQ.pairs?.find((p) => p.left === selectedLeft);
    if (correctPair && correctPair.right === right) {
      const updated = { ...matchedPairs, [selectedLeft]: right };
      setMatchedPairs(updated);
      setSelectedLeft(null);
      playSuccessSound();

      // If all matched
      if (Object.keys(updated).length === (currentQ.pairs?.length || 0)) {
        setScore((s) => s + 1);
        setStreak((st) => st + 1);
        setAnsweredState({
          answered: true,
          isCorrect: true,
          explanation: currentQ.explanation,
        });
      }
    } else {
      playWrongSound();
      setSelectedLeft(null);
    }
  };

  // Next Question or Finish
  const handleNext = () => {
    if (currentIdx < quiz.length - 1) {
      setCurrentIdx(currentIdx + 1);
    } else {
      // Quiz Finished!
      const finalPercent = Math.round((score / quiz.length) * 100);
      setQuizFinished(true);
      onRecordScore(finalPercent);

      // Trigger Confetti fireworks if 70%+
      if (finalPercent >= 70) {
        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
          });
        } catch (e) {
          // ignore
        }
      }
    }
  };

  // START SCREEN
  if (!quizStarted) {
    return (
      <div className="max-w-xl mx-auto py-10 px-4 text-center">
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl p-8 sm:p-10 space-y-6">
          <div className="w-16 h-16 mx-auto rounded-3xl bg-gradient-to-tr from-teal-500 to-emerald-400 flex items-center justify-center text-slate-950 shadow-lg shadow-teal-500/20">
            <Zap className="w-8 h-8 fill-slate-950 text-slate-950" />
          </div>

          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 font-['Outfit'] mb-2">
              Ready for the Mastery Quiz?
            </h2>
            <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
              Test your recall across {quiz.length} varied questions: Multiple Choice, Fill in the Blanks, Match Pairs, and True / False.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-around text-xs font-semibold text-slate-700">
            <div>
              <span className="block text-xl font-extrabold text-slate-900 font-['Outfit']">
                {quiz.length}
              </span>
              <span className="text-[11px] text-slate-400 uppercase">Questions</span>
            </div>
            <div className="w-px h-8 bg-slate-200" />
            <div>
              <span className="block text-xl font-extrabold text-teal-600 font-['Outfit']">
                +60 XP
              </span>
              <span className="text-[11px] text-slate-400 uppercase">Reward</span>
            </div>
            <div className="w-px h-8 bg-slate-200" />
            <div>
              <span className="block text-xl font-extrabold text-orange-500 font-['Outfit']">
                🔥 1x
              </span>
              <span className="text-[11px] text-slate-400 uppercase">Streak</span>
            </div>
          </div>

          <button
            onClick={handleStart}
            className="w-full py-3.5 px-6 rounded-2xl text-sm font-extrabold bg-teal-500 hover:bg-teal-400 text-slate-950 transition shadow-lg shadow-teal-500/20 cursor-pointer active:scale-98 flex items-center justify-center gap-2"
          >
            <Zap className="w-4 h-4 fill-slate-950" />
            <span>Start Chapter Quiz Now</span>
          </button>
        </div>
      </div>
    );
  }

  // FINISHED SCREEN
  if (quizFinished) {
    const finalPercent = Math.round((score / quiz.length) * 100);
    const isPassed = finalPercent >= 80;
    const isGood = finalPercent >= 60;

    return (
      <div className="max-w-xl mx-auto py-10 px-4 text-center">
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl p-8 sm:p-10 space-y-6 animate-fadeIn">
          {/* Trophy Icon */}
          <div className="w-20 h-20 mx-auto rounded-full bg-amber-100 border-4 border-amber-200 flex items-center justify-center text-amber-600 shadow-lg shadow-amber-500/10">
            <Trophy className="w-10 h-10" />
          </div>

          <div>
            <span className="text-xs font-extrabold uppercase tracking-wider text-teal-700 bg-teal-100 px-3 py-1 rounded-full">
              Quiz Completed
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-['Outfit'] mt-3 mb-1">
              {isPassed ? 'Outstanding! Exam Ready! 🎉' : isGood ? 'Good Job! Almost There! 👍' : 'Keep Practicing! 💪'}
            </h2>
            <p className="text-xs text-slate-500">
              {chapterTitle}
            </p>
          </div>

          {/* Big Score Ring Display */}
          <div className="flex items-center justify-center py-2">
            <div className="relative w-36 h-36 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="72"
                  cy="72"
                  r="60"
                  stroke="#e2e8f0"
                  strokeWidth="10"
                  fill="transparent"
                />
                <circle
                  cx="72"
                  cy="72"
                  r="60"
                  stroke={isPassed ? '#10b981' : isGood ? '#f59e0b' : '#ef4444'}
                  strokeWidth="10"
                  strokeDasharray={377}
                  strokeDashoffset={377 - (377 * finalPercent) / 100}
                  strokeLinecap="round"
                  fill="transparent"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-3xl font-extrabold text-slate-900 font-['Outfit']">
                  {finalPercent}%
                </span>
                <span className="text-[10px] font-bold text-slate-400 uppercase">
                  Final Score
                </span>
              </div>
            </div>
          </div>

          {/* Stats Breakdown */}
          <div className="grid grid-cols-3 gap-2 p-4 rounded-2xl bg-slate-50 border border-slate-100 text-center">
            <div>
              <span className="block text-lg font-extrabold text-emerald-600 font-['Outfit']">
                {score}
              </span>
              <span className="text-[10px] font-bold text-slate-400 uppercase">Correct</span>
            </div>
            <div>
              <span className="block text-lg font-extrabold text-rose-500 font-['Outfit']">
                {quiz.length - score}
              </span>
              <span className="text-[10px] font-bold text-slate-400 uppercase">Incorrect</span>
            </div>
            <div>
              <span className="block text-lg font-extrabold text-teal-600 font-['Outfit']">
                +{finalPercent >= 70 ? 60 : 30} XP
              </span>
              <span className="text-[10px] font-bold text-slate-400 uppercase">XP Gained</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleStart}
              className="flex-1 py-3 px-4 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Retry Quiz</span>
            </button>
            <button
              onClick={() => setQuizStarted(false)}
              className="flex-1 py-3 px-4 rounded-xl text-xs font-bold bg-teal-500 hover:bg-teal-400 text-slate-950 transition flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Sparkles className="w-4 h-4" />
              <span>Review Summary</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ACTIVE QUIZ QUESTION SCREEN
  const progressPercent = Math.round(((currentIdx + 1) / quiz.length) * 100);

  return (
    <div className="max-w-2xl mx-auto py-6 px-4">
      {/* Quiz Header Bar: Progress, Question number, Streak */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 mb-4 shadow-xs">
        <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-2">
          <span>
            Question {currentIdx + 1} of {quiz.length}
          </span>

          <div className="flex items-center gap-3">
            {streak > 1 && (
              <span className="flex items-center gap-1 text-orange-600 bg-orange-50 border border-orange-200 px-2 py-0.5 rounded-full text-[11px] font-extrabold animate-bounce">
                <Flame className="w-3.5 h-3.5 fill-orange-500 text-orange-500" />
                {streak}x Streak!
              </span>
            )}

            <span className="font-extrabold text-teal-600">{score} Correct</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-teal-500 rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Main Question Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl p-6 sm:p-8 space-y-6">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-teal-800 bg-teal-100/70 border border-teal-200 px-2.5 py-0.5 rounded-md">
            {currentQ.type.replace('-', ' ')}
          </span>

          <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight font-['Outfit'] mt-2.5 leading-snug">
            {currentQ.question}
          </h3>
        </div>

        {/* 1. MCQ OPTIONS */}
        {currentQ.type === 'mcq' && (
          <div className="space-y-2.5">
            {(currentQ.options || []).map((opt, optIdx) => {
              const letter = ['A', 'B', 'C', 'D'][optIdx];
              const isSelected = answeredState.userChoice === optIdx;
              const isCorrectOpt = optIdx === currentQ.correctIndex;

              let buttonStyle =
                'bg-slate-50 border-slate-200 text-slate-800 hover:border-teal-400 hover:bg-teal-50/30';
              if (answeredState.answered) {
                if (isCorrectOpt) {
                  buttonStyle = 'bg-emerald-50 border-emerald-400 text-emerald-950 font-bold';
                } else if (isSelected) {
                  buttonStyle = 'bg-rose-50 border-rose-300 text-rose-950';
                } else {
                  buttonStyle = 'bg-slate-50 border-slate-200 text-slate-400 opacity-60';
                }
              }

              return (
                <button
                  key={optIdx}
                  onClick={() => handleSelectMCQ(optIdx)}
                  disabled={answeredState.answered}
                  className={`w-full p-3.5 sm:p-4 rounded-2xl border-2 text-left text-xs sm:text-sm font-semibold transition flex items-center gap-3.5 cursor-pointer ${buttonStyle}`}
                >
                  <span
                    className={`w-7 h-7 rounded-xl flex items-center justify-center font-extrabold text-xs shrink-0 ${
                      answeredState.answered && isCorrectOpt
                        ? 'bg-emerald-500 text-white'
                        : answeredState.answered && isSelected
                        ? 'bg-rose-500 text-white'
                        : 'bg-white border border-slate-200 text-slate-700'
                    }`}
                  >
                    {letter}
                  </span>
                  <span className="flex-1 leading-snug">{opt}</span>
                  {answeredState.answered && isCorrectOpt && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  )}
                  {answeredState.answered && isSelected && !isCorrectOpt && (
                    <XCircle className="w-5 h-5 text-rose-500 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* 2. TRUE / FALSE OPTIONS */}
        {currentQ.type === 'true-false' && (
          <div className="grid grid-cols-2 gap-4">
            {[true, false].map((val) => {
              const label = val ? 'TRUE' : 'FALSE';
              const isSelected = answeredState.userChoice === val;
              const isCorrectVal = val === currentQ.answer;

              let btnStyle =
                'bg-slate-50 border-slate-200 text-slate-800 hover:border-teal-500 hover:bg-teal-50';
              if (answeredState.answered) {
                if (isCorrectVal) {
                  btnStyle = 'bg-emerald-50 border-emerald-500 text-emerald-950 font-bold';
                } else if (isSelected) {
                  btnStyle = 'bg-rose-50 border-rose-400 text-rose-950';
                } else {
                  btnStyle = 'bg-slate-50 border-slate-200 text-slate-400 opacity-60';
                }
              }

              return (
                <button
                  key={label}
                  onClick={() => handleSelectTF(val)}
                  disabled={answeredState.answered}
                  className={`py-6 px-4 rounded-2xl border-2 text-center text-base font-extrabold tracking-wider transition cursor-pointer ${btnStyle}`}
                >
                  <span>{label}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* 3. FILL IN THE BLANK */}
        {currentQ.type === 'fill-blank' && (
          <div className="space-y-3">
            <div className="flex gap-2">
              <input
                type="text"
                value={fillInput}
                disabled={answeredState.answered}
                onChange={(e) => setFillInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCheckFillBlank();
                }}
                placeholder="Type the missing word..."
                className="flex-1 p-3.5 text-sm bg-slate-50 border-2 border-slate-200 rounded-2xl focus:bg-white focus:border-teal-500 outline-none font-semibold text-slate-800"
              />
              {!answeredState.answered && (
                <button
                  onClick={handleCheckFillBlank}
                  disabled={!fillInput.trim()}
                  className="px-5 py-3.5 rounded-2xl text-xs font-bold bg-teal-500 hover:bg-teal-400 text-slate-950 transition cursor-pointer disabled:opacity-40"
                >
                  Check
                </button>
              )}
            </div>

            {/* Letter hint feature */}
            {!answeredState.answered && (
              <div className="flex items-center justify-between text-xs text-slate-400">
                <button
                  onClick={handleGiveHint}
                  className="text-teal-600 hover:text-teal-700 font-bold flex items-center gap-1 cursor-pointer"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>Stuck? Reveal a letter hint</span>
                </button>

                {revealedLetters > 0 && (
                  <span className="font-mono font-bold tracking-widest text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                    {String(currentQ.answer || '')
                      .slice(0, revealedLetters)
                      .padEnd(String(currentQ.answer || '').length, '_')}
                  </span>
                )}
              </div>
            )}
          </div>
        )}

        {/* 4. MATCH PAIRS */}
        {currentQ.type === 'match' && (
          <div className="space-y-4">
            <p className="text-xs text-slate-500 font-medium">
              Tap a card on the left, then tap its corresponding match on the right.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Left Column */}
              <div className="space-y-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1">
                  Concept / Term:
                </span>
                {(currentQ.pairs || []).map((p, pIdx) => {
                  const isMatched = !!matchedPairs[p.left];
                  const isSelected = selectedLeft === p.left;

                  return (
                    <button
                      key={pIdx}
                      onClick={() => handleLeftClick(p.left)}
                      disabled={isMatched || answeredState.answered}
                      className={`w-full p-3 rounded-xl border-2 text-left text-xs font-semibold transition cursor-pointer ${
                        isMatched
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                          : isSelected
                          ? 'bg-slate-900 border-slate-900 text-white ring-2 ring-slate-400'
                          : 'bg-slate-50 border-slate-200 text-slate-800 hover:border-slate-300'
                      }`}
                    >
                      {p.left} {isMatched && '✓'}
                    </button>
                  );
                })}
              </div>

              {/* Right Column */}
              <div className="space-y-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1">
                  Definition / Match:
                </span>
                {shuffledRights.map((r, rIdx) => {
                  const isMatched = Object.values(matchedPairs).includes(r);

                  return (
                    <button
                      key={rIdx}
                      onClick={() => handleRightClick(r)}
                      disabled={isMatched || answeredState.answered || !selectedLeft}
                      className={`w-full p-3 rounded-xl border-2 text-left text-xs font-semibold transition cursor-pointer ${
                        isMatched
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                          : selectedLeft
                          ? 'bg-teal-50 border-teal-300 text-teal-950 hover:bg-teal-100'
                          : 'bg-slate-50 border-slate-200 text-slate-600'
                      }`}
                    >
                      {r} {isMatched && '✓'}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* FEEDBACK BANNER ON ANSWER */}
        {answeredState.answered && (
          <div
            className={`p-4 rounded-2xl border text-xs sm:text-sm animate-fadeIn ${
              answeredState.isCorrect
                ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                : 'bg-rose-50 border-rose-200 text-rose-950'
            }`}
          >
            <div className="flex items-center gap-2 font-extrabold mb-1">
              {answeredState.isCorrect ? (
                <>
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>Correct! Spot on! 🎉</span>
                </>
              ) : (
                <>
                  <XCircle className="w-5 h-5 text-rose-500 shrink-0" />
                  <span>
                    Not quite! The correct answer was:{' '}
                    <strong>
                      {currentQ.type === 'mcq' && currentQ.options
                        ? currentQ.options[currentQ.correctIndex || 0]
                        : String(currentQ.answer)}
                    </strong>
                  </span>
                </>
              )}
            </div>
            <p className="mt-1 text-slate-700 leading-relaxed font-medium">
              {answeredState.explanation}
            </p>
          </div>
        )}

        {/* NEXT QUESTION BUTTON */}
        {answeredState.answered && (
          <div className="pt-2 flex justify-end">
            <button
              onClick={handleNext}
              className="py-3 px-6 rounded-2xl text-xs font-extrabold bg-teal-500 hover:bg-teal-400 text-slate-950 transition shadow-md shadow-teal-500/20 cursor-pointer flex items-center gap-2"
            >
              <span>{currentIdx < quiz.length - 1 ? 'Next Question' : 'View Results'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
