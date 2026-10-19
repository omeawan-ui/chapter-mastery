import React, { useState, useEffect, useMemo } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { ChapterHeader, ActiveTab } from './components/ChapterHeader';
import { VisualMapTab } from './components/VisualMapTab';
import { RetrievalTab } from './components/RetrievalTab';
import { KeywordsTab } from './components/KeywordsTab';
import { ActiveRecallTab } from './components/ActiveRecallTab';
import { QuizArenaTab } from './components/QuizArenaTab';
import { CoachTab } from './components/CoachTab';
import { SpacedReviewTab } from './components/SpacedReviewTab';
import { PrintCheatSheetModal } from './components/PrintCheatSheetModal';
import { AddChapterModal } from './components/AddChapterModal';
import { FocusTimerModal } from './components/FocusTimerModal';
import { AiSettingsModal, AiSettings } from './components/AiSettingsModal';
import { AuthProfileModal } from './components/AuthProfileModal';
import { Chapter, UserStats, SourceItem, RetrievalRecord, DifficultyLevel, StudentProfile } from './types';
import { initialSampleChapters } from './data/sampleChapters';
import { generateStudyKit, evaluateStudentAnswer } from './services/aiService';
import { playChimeSound } from './utils/audio';
import {
  BookOpen,
  Sparkles,
  Map,
  KeyRound,
  Zap,
  CalendarCheck2,
  Plus,
  ArrowRight,
  ShieldCheck,
  Clock,
} from 'lucide-react';

const STORAGE_KEY_CHAPTERS = 'chapter_mastery_pro_v4';
const STORAGE_KEY_STATS = 'chapter_mastery_stats_v4';
const STORAGE_KEY_AI_SETTINGS = 'cms_ai_settings_v4';
const STORAGE_KEY_PROFILES = 'cms_student_profiles_v5';
const STORAGE_KEY_ACTIVE_PROFILE_ID = 'cms_active_student_id_v5';

export default function App() {
  // Student Profiles & Authentication
  const [profiles, setProfiles] = useState<StudentProfile[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_PROFILES);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return [
      {
        id: 'stud_default_1',
        name: 'Alex Rivera',
        grade: 6,
        phoneNumber: '9876543210',
        avatarEmoji: '🚀',
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
      },
    ];
  });

  const [activeProfileId, setActiveProfileId] = useState<string>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_ACTIVE_PROFILE_ID);
      if (stored) return stored;
    } catch (e) {}
    return 'stud_default_1';
  });

  const activeProfile = useMemo(() => {
    return profiles.find((p) => p.id === activeProfileId) || profiles[0] || null;
  }, [profiles, activeProfileId]);

  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Load chapters from local storage or default sample data
  const [chapters, setChapters] = useState<Chapter[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_CHAPTERS);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Failed to load stored chapters', e);
    }
    return initialSampleChapters;
  });

  // Current active chapter ID
  const [currentChapterId, setCurrentChapterId] = useState<string | null>(() => {
    return chapters[0]?.id || null;
  });

  // Active Tab
  const [activeTab, setActiveTab] = useState<ActiveTab>('map');

  // User Gamification Stats
  const [stats, setStats] = useState<UserStats>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_STATS);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      // ignore
    }
    return {
      xp: 420,
      streakDays: 4,
      lastActiveDate: new Date().toISOString(),
      chaptersCompleted: 1,
      questionsAnswered: 4,
      quizzesTaken: 3,
    };
  });

  // UI Modals & Drawers
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingChapter, setEditingChapter] = useState<Chapter | null>(null);
  const [isTimerModalOpen, setIsTimerModalOpen] = useState(false);
  const [isCheatSheetOpen, setIsCheatSheetOpen] = useState(false);
  const [isAiSettingsOpen, setIsAiSettingsOpen] = useState(false);

  // AI Model Provider & DeepSeek settings
  const [aiSettings, setAiSettings] = useState<AiSettings>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_AI_SETTINGS);
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    return {
      provider: 'gemini',
      deepseekApiKey: '',
      deepseekModel: 'deepseek-chat',
    };
  });

  // Focus Timer State
  const [timerSeconds, setTimerSeconds] = useState(25 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerMode, setTimerMode] = useState<'focus' | 'break'>('focus');

  // Sync to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_CHAPTERS, JSON.stringify(chapters));
    } catch (e) {
      console.error('Failed to save chapters', e);
    }
  }, [chapters]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_STATS, JSON.stringify(stats));
    } catch (e) {
      console.error('Failed to save stats', e);
    }
  }, [stats]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_AI_SETTINGS, JSON.stringify(aiSettings));
    } catch (e) {
      console.error('Failed to save aiSettings', e);
    }
  }, [aiSettings]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_PROFILES, JSON.stringify(profiles));
    } catch (e) {
      console.error('Failed to save profiles', e);
    }
  }, [profiles]);

  useEffect(() => {
    try {
      if (activeProfileId) {
        localStorage.setItem(STORAGE_KEY_ACTIVE_PROFILE_ID, activeProfileId);
      }
    } catch (e) {
      console.error('Failed to save activeProfileId', e);
    }
  }, [activeProfileId]);

  // Pomodoro Timer Interval
  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev - 1);
      }, 1000);
    } else if (timerSeconds === 0 && isTimerRunning) {
      setIsTimerRunning(false);
      playChimeSound();

      // Switch mode and award XP
      if (timerMode === 'focus') {
        setStats((prev) => ({ ...prev, xp: prev.xp + 40 }));
        setTimerMode('break');
        setTimerSeconds(5 * 60);
      } else {
        setTimerMode('focus');
        setTimerSeconds(25 * 60);
      }
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerSeconds, timerMode]);

  // Filter chapters for the active student profile (permanent personal library)
  const studentChapters = useMemo(() => {
    if (!activeProfile) return chapters;
    const owned = chapters.filter((c) => !c.studentId || c.studentId === activeProfile.id);
    return owned.length > 0 ? owned : chapters;
  }, [chapters, activeProfile]);

  // Selected Chapter Object
  const currentChapter = useMemo(() => {
    return studentChapters.find((c) => c.id === currentChapterId) || studentChapters[0] || null;
  }, [studentChapters, currentChapterId]);

  // Spaced Repetition Due Count
  const reviewsDueCount = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let count = 0;
    studentChapters.forEach((ch) => {
      (ch.reviewDates || []).forEach((r) => {
        if (!r.done && new Date(r.date).setHours(0, 0, 0, 0) <= today.getTime()) {
          count++;
        }
      });
    });
    return count;
  }, [studentChapters]);

  // Profile & Auth Handlers
  const handleSignUp = (newProfileData: Omit<StudentProfile, 'id' | 'createdAt' | 'lastLoginAt'>) => {
    const newProfile: StudentProfile = {
      ...newProfileData,
      id: `stud_${Date.now()}_${newProfileData.phoneNumber.replace(/\D/g, '')}`,
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
    };
    setProfiles((prev) => [...prev, newProfile]);
    setActiveProfileId(newProfile.id);
  };

  const handleLogin = (phoneNumber: string): boolean => {
    const cleanPhone = phoneNumber.trim().replace(/\D/g, '');
    const found = profiles.find(
      (p) => p.phoneNumber.trim().replace(/\D/g, '') === cleanPhone
    );
    if (found) {
      setActiveProfileId(found.id);
      const studentKits = chapters.filter((c) => !c.studentId || c.studentId === found.id);
      if (studentKits.length > 0) {
        setCurrentChapterId(studentKits[0].id);
      }
      return true;
    }
    return false;
  };

  const handleSwitchProfile = (profileId: string) => {
    setActiveProfileId(profileId);
    const studentKits = chapters.filter((c) => !c.studentId || c.studentId === profileId);
    if (studentKits.length > 0) {
      setCurrentChapterId(studentKits[0].id);
    }
  };

  const handleExportData = () => {
    const payload = {
      exportedAt: new Date().toISOString(),
      activeProfile,
      profiles,
      chapters,
      stats,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chapter_mastery_library_${activeProfile?.name || 'student'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (Array.isArray(data.chapters)) {
          setChapters(data.chapters);
        }
        if (Array.isArray(data.profiles)) {
          setProfiles(data.profiles);
        }
      } catch (err) {
        console.error('Import failed', err);
      }
    };
    reader.readAsText(file);
  };

  // Timer formatted for Navbar
  const activeTimerRemaining = useMemo(() => {
    if (!isTimerRunning && timerSeconds === 25 * 60) return undefined;
    const m = Math.floor(timerSeconds / 60);
    const s = timerSeconds % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  }, [timerSeconds, isTimerRunning]);

  // Chapter Deletion
  const handleDeleteChapter = (id: string) => {
    const ch = chapters.find((c) => c.id === id);
    if (!window.confirm(`Delete "${ch?.title || 'chapter'}"? This cannot be undone.`)) return;

    const remaining = chapters.filter((c) => c.id !== id);
    setChapters(remaining);
    if (currentChapterId === id) {
      setCurrentChapterId(remaining[0]?.id || null);
    }
  };

  // Toggle Keyword Mastered
  const handleToggleKeywordMastered = (keywordId: string, mastered: boolean) => {
    if (!currentChapter) return;
    const updatedKeywords = currentChapter.keywords.map((k) =>
      k.id === keywordId ? { ...k, mastered } : k
    );

    // Calculate new mastery score
    const masteredCount = updatedKeywords.filter((k) => k.mastered).length;
    const kwPercent = Math.round((masteredCount / Math.max(1, updatedKeywords.length)) * 100);
    const quizAvg = currentChapter.quizScores?.length
      ? Math.round(
          currentChapter.quizScores.reduce((a, b) => a + b, 0) / currentChapter.quizScores.length
        )
      : currentChapter.masteryScore;
    const newMastery = Math.round(quizAvg * 0.6 + kwPercent * 0.4);

    const updatedChapter: Chapter = {
      ...currentChapter,
      keywords: updatedKeywords,
      masteryScore: newMastery,
    };

    setChapters((prev) => prev.map((c) => (c.id === currentChapter.id ? updatedChapter : c)));
    if (mastered) {
      setStats((prev) => ({ ...prev, xp: prev.xp + 5 }));
    }
  };

  // Save Student Answer
  const handleSaveAnswer = (questionId: string, studentAnswer: string) => {
    if (!currentChapter) return;
    const updatedQuestions = currentChapter.questions.map((q) =>
      q.id === questionId ? { ...q, studentAnswer } : q
    );
    setChapters((prev) =>
      prev.map((c) => (c.id === currentChapter.id ? { ...c, questions: updatedQuestions } : c))
    );
  };

  // Evaluate Answer
  const handleEvaluateAnswer = async (questionId: string, studentAnswer: string) => {
    if (!currentChapter) return;
    const targetQ = currentChapter.questions.find((q) => q.id === questionId);
    if (!targetQ) return;

    try {
      const evalData = await evaluateStudentAnswer(
        {
          question: targetQ.question,
          modelAnswer: targetQ.modelAnswer,
          keyWordsUsed: targetQ.keyWordsUsed,
          marks: targetQ.marks,
          studentAnswer,
        },
        aiSettings,
        currentChapter.grade
      );

      const updatedQuestions = currentChapter.questions.map((q) =>
        q.id === questionId ? { ...q, studentAnswer, evaluation: evalData } : q
      );

      const xpGain = (evalData.score || 1) * 15;
      setStats((prev) => ({
        ...prev,
        xp: prev.xp + xpGain,
        questionsAnswered: prev.questionsAnswered + 1,
      }));

      // Update mastery score
      const answeredCount = updatedQuestions.filter((q) => !!q.evaluation).length;
      const questionProgress = Math.round((answeredCount / updatedQuestions.length) * 100);
      const newMastery = Math.min(100, Math.round(currentChapter.masteryScore * 0.8 + questionProgress * 0.2));

      setChapters((prev) =>
        prev.map((c) =>
          c.id === currentChapter.id
            ? {
                ...c,
                questions: updatedQuestions,
                masteryScore: newMastery,
                xpEarned: (c.xpEarned || 0) + xpGain,
              }
            : c
        )
      );
    } catch (err: any) {
      alert(`Could not evaluate answer: ${err.message || 'Please try again'}`);
    }
  };

  // Record Quiz Score
  const handleRecordQuizScore = (scorePercent: number) => {
    if (!currentChapter) return;
    const scores = [...(currentChapter.quizScores || []), scorePercent];
    const avgScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);

    // Calculate new overall mastery
    const reviewsDone = (currentChapter.reviewDates || []).filter((r) => r.done).length;
    const newMastery = Math.min(
      100,
      Math.round(avgScore * 0.7 + (reviewsDone / 4) * 30)
    );

    const xpEarned = scorePercent >= 80 ? 60 : 30;
    setStats((prev) => ({
      ...prev,
      xp: prev.xp + xpEarned,
      quizzesTaken: prev.quizzesTaken + 1,
    }));

    setChapters((prev) =>
      prev.map((c) =>
        c.id === currentChapter.id
          ? {
              ...c,
              quizScores: scores,
              masteryScore: newMastery,
              lastStudied: new Date().toISOString(),
              xpEarned: (c.xpEarned || 0) + xpEarned,
            }
          : c
      )
    );
  };

  // Mark Spaced Repetition Review Done
  const handleMarkReviewDone = (day: number) => {
    if (!currentChapter) return;
    const updatedReviews = (currentChapter.reviewDates || []).map((r) =>
      r.day === day ? { ...r, done: true } : r
    );

    const reviewsDone = updatedReviews.filter((r) => r.done).length;
    const newMastery = Math.min(100, currentChapter.masteryScore + 10);

    setStats((prev) => ({ ...prev, xp: prev.xp + 50 }));

    setChapters((prev) =>
      prev.map((c) =>
        c.id === currentChapter.id
          ? {
              ...c,
              reviewDates: updatedReviews,
              masteryScore: newMastery,
              reviews: [
                ...(c.reviews || []),
                {
                  date: new Date().toISOString(),
                  score: 95,
                  type: 'spaced_review',
                },
              ],
            }
          : c
      )
    );
  };

  // Save Retrieval Practice Record
  const handleSaveRetrievalRecord = (record: RetrievalRecord) => {
    if (!currentChapter) return;
    const existingIndex = (currentChapter.retrievalRecords || []).findIndex(
      (r) => r.targetId === record.targetId
    );
    let updatedRecords: RetrievalRecord[] = [];
    if (existingIndex >= 0) {
      updatedRecords = [...(currentChapter.retrievalRecords || [])];
      updatedRecords[existingIndex] = record;
    } else {
      updatedRecords = [...(currentChapter.retrievalRecords || []), record];
    }

    const xpEarned =
      record.evaluation?.retrievalScore && record.evaluation.retrievalScore >= 70 ? 40 : 25;
    setStats((prev) => ({ ...prev, xp: prev.xp + xpEarned }));

    const newMastery = Math.min(100, currentChapter.masteryScore + 4);

    setChapters((prev) =>
      prev.map((c) =>
        c.id === currentChapter.id
          ? {
              ...c,
              retrievalRecords: updatedRecords,
              masteryScore: newMastery,
              lastStudied: new Date().toISOString(),
              xpEarned: (c.xpEarned || 0) + xpEarned,
            }
          : c
      )
    );
  };

  // Generate / Create / Edit Chapter
  const handleGenerateChapter = async (data: {
    title: string;
    subject: string;
    grade: number;
    difficultyLevel: DifficultyLevel;
    examDate?: string;
    text: string;
    depthMode: 'in-depth' | 'on-the-go';
    sources: SourceItem[];
  }) => {
    const kit = await generateStudyKit(data, aiSettings);

    const now = new Date();
    const reviewDates = [2, 3, 7, 21].map((d) => {
      const dt = new Date(now);
      dt.setDate(dt.getDate() + d);
      return { day: d, date: dt.toISOString(), done: false };
    });

    if (editingChapter) {
      // Update existing
      const updated: Chapter = {
        ...editingChapter,
        studentId: editingChapter.studentId || activeProfile?.id,
        title: data.title,
        subject: data.subject,
        grade: data.grade,
        difficultyLevel: data.difficultyLevel,
        examDate: data.examDate,
        text: data.text,
        sources: data.sources,
        map: kit.map,
        keywords: kit.keywords || [],
        questions: kit.questions || [],
        quiz: kit.quiz || [],
      };
      setChapters((prev) => prev.map((c) => (c.id === editingChapter.id ? updated : c)));
      setCurrentChapterId(updated.id);
      setEditingChapter(null);
    } else {
      // Create new permanent study kit for active student profile
      const newCh: Chapter = {
        id: `ch_${Date.now()}`,
        studentId: activeProfile?.id,
        title: data.title,
        subject: data.subject,
        grade: data.grade,
        difficultyLevel: data.difficultyLevel,
        examDate: data.examDate,
        dateAdded: now.toISOString(),
        lastStudied: now.toISOString(),
        text: data.text,
        sources: data.sources,
        map: kit.map,
        keywords: kit.keywords || [],
        questions: kit.questions || [],
        quiz: kit.quiz || [],
        reviews: [],
        reviewDates,
        quizScores: [],
        masteryScore: 10,
        xpEarned: 50,
      };

      setChapters((prev) => [newCh, ...prev]);
      setCurrentChapterId(newCh.id);
      setStats((prev) => ({ ...prev, xp: prev.xp + 50, chaptersCompleted: prev.chaptersCompleted + 1 }));
    }

    setActiveTab('map');
  };

  // Add Source to active chapter
  const handleAddSource = (label: string, sourceText: string) => {
    if (!currentChapter) return;
    const newSource: SourceItem = {
      id: `s_${Date.now()}`,
      label,
      type: 'link',
      text: sourceText,
    };

    setChapters((prev) =>
      prev.map((c) =>
        c.id === currentChapter.id
          ? {
              ...c,
              sources: [...(c.sources || []), newSource],
              text: `${c.text}\n\n[Added Source: ${label}]\n${sourceText}`,
            }
          : c
      )
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-800">
      {/* Top Navbar */}
      <Navbar
        stats={stats}
        reviewsDueCount={reviewsDueCount}
        onOpenAddModal={() => {
          setEditingChapter(null);
          setIsAddModalOpen(true);
        }}
        onOpenTimerModal={() => setIsTimerModalOpen(true)}
        onOpenCheatSheet={() => setIsCheatSheetOpen(true)}
        onOpenAiSettings={() => setIsAiSettingsOpen(true)}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        onOpenReviews={() => {
          setActiveTab('spaced');
          setIsSidebarOpen(false);
        }}
        isSidebarOpen={isSidebarOpen}
        activeTimerRemaining={activeTimerRemaining}
        hasActiveChapter={!!currentChapter}
        aiProvider={aiSettings.provider}
        activeProfile={activeProfile}
        onOpenProfileModal={() => setIsProfileModalOpen(true)}
      />

      {/* Main Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <Sidebar
          chapters={studentChapters}
          currentChapterId={currentChapterId}
          onSelectChapter={(id) => {
            setCurrentChapterId(id);
            setActiveTab('map');
          }}
          onOpenAddModal={() => {
            setEditingChapter(null);
            setIsAddModalOpen(true);
          }}
          onDeleteChapter={handleDeleteChapter}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          activeProfile={activeProfile}
          onOpenProfileModal={() => setIsProfileModalOpen(true)}
          stats={stats}
          onOpenTimerModal={() => setIsTimerModalOpen(true)}
          activeTimerRemaining={activeTimerRemaining}
        />

        {/* Center Content View */}
        <main className="flex-1 overflow-y-auto flex flex-col">
          {currentChapter ? (
            <div className="flex-1 flex flex-col">
              {/* Sticky Chapter Sub-Header & Tabs */}
              <ChapterHeader
                chapter={currentChapter}
                activeTab={activeTab}
                onTabChange={setActiveTab}
                onEdit={() => {
                  setEditingChapter(currentChapter);
                  setIsAddModalOpen(true);
                }}
                onDelete={() => handleDeleteChapter(currentChapter.id)}
                onPrintCheatSheet={() => setIsCheatSheetOpen(true)}
              />

              {/* Tab Content Panels */}
              <div className="flex-1 p-2 sm:p-4">
                {activeTab === 'map' && (
                  <VisualMapTab
                    map={currentChapter.map}
                    onGoToRetrievalTab={() => setActiveTab('retrieval')}
                  />
                )}
                {activeTab === 'retrieval' && (
                  <RetrievalTab
                    map={currentChapter.map}
                    chapterTitle={currentChapter.title}
                    grade={currentChapter.grade}
                    retrievalRecords={currentChapter.retrievalRecords || []}
                    onSaveRecord={handleSaveRetrievalRecord}
                    onGoToMapTab={() => setActiveTab('map')}
                  />
                )}
                {activeTab === 'keywords' && (
                  <KeywordsTab
                    keywords={currentChapter.keywords || []}
                    onToggleMastered={handleToggleKeywordMastered}
                  />
                )}
                {activeTab === 'questions' && (
                  <ActiveRecallTab
                    questions={currentChapter.questions || []}
                    onSaveAnswer={handleSaveAnswer}
                    onEvaluateAnswer={(qId, ans) => handleEvaluateAnswer(qId, ans)}
                  />
                )}
                {activeTab === 'quiz' && (
                  <QuizArenaTab
                    quiz={currentChapter.quiz || []}
                    chapterTitle={currentChapter.title}
                    onRecordScore={handleRecordQuizScore}
                  />
                )}
                {activeTab === 'coach' && (
                  <CoachTab chapter={currentChapter} onAddSource={handleAddSource} />
                )}
                {activeTab === 'spaced' && (
                  <SpacedReviewTab
                    chapter={currentChapter}
                    onMarkReviewDone={handleMarkReviewDone}
                    onLaunchReviewQuiz={() => setActiveTab('quiz')}
                  />
                )}
              </div>
            </div>
          ) : (
            /* WELCOME / EMPTY STATE */
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-xl mx-auto">
              <div className="w-20 h-20 rounded-3xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-600 mb-6 shadow-sm">
                <BookOpen className="w-10 h-10" />
              </div>

              <h1 className="text-3xl font-extrabold text-slate-900 font-['Outfit'] tracking-tight mb-3">
                Welcome to Chapter Mastery Kit Pro
              </h1>
              <p className="text-sm text-slate-500 max-w-md leading-relaxed mb-8">
                Empower your child to conquer school chapters through Ausubel's visual mental scaffolds, Feynman active recall, and spaced repetition.
              </p>

              <button
                onClick={() => {
                  setEditingChapter(null);
                  setIsAddModalOpen(true);
                }}
                className="px-6 py-3.5 rounded-2xl text-sm font-extrabold bg-teal-500 hover:bg-teal-400 text-slate-950 shadow-lg shadow-teal-500/20 transition cursor-pointer flex items-center gap-2"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>Create Your First Study Kit</span>
              </button>
            </div>
          )}
        </main>
      </div>

      {/* MODALS */}
      <AddChapterModal
        isOpen={isAddModalOpen}
        editingChapter={editingChapter}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingChapter(null);
        }}
        onGenerate={handleGenerateChapter}
      />

      {currentChapter && (
        <PrintCheatSheetModal
          chapter={currentChapter}
          isOpen={isCheatSheetOpen}
          onClose={() => setIsCheatSheetOpen(false)}
        />
      )}

      <FocusTimerModal
        isOpen={isTimerModalOpen}
        onClose={() => setIsTimerModalOpen(false)}
        timerSeconds={timerSeconds}
        isRunning={isTimerRunning}
        onStart={() => setIsTimerRunning(true)}
        onPause={() => setIsTimerRunning(false)}
        onReset={(newMinutes) => {
          setIsTimerRunning(false);
          const mins = newMinutes || (timerMode === 'focus' ? 25 : 5);
          setTimerSeconds(mins * 60);
        }}
        mode={timerMode}
      />

      <AiSettingsModal
        isOpen={isAiSettingsOpen}
        onClose={() => setIsAiSettingsOpen(false)}
        settings={aiSettings}
        onSaveSettings={setAiSettings}
      />

      <AuthProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        profiles={profiles}
        activeProfile={activeProfile}
        onSignUp={handleSignUp}
        onLogin={handleLogin}
        onSwitchProfile={handleSwitchProfile}
        onExportData={handleExportData}
        onImportData={handleImportData}
        totalKitsForActiveProfile={studentChapters.length}
      />

      {/* Floating Active Focus Countdown (only visible when timer is running) */}
      {isTimerRunning && (
        <button
          type="button"
          onClick={() => setIsTimerModalOpen(true)}
          className="fixed bottom-4 right-4 z-40 flex items-center gap-2 px-3.5 py-2 bg-slate-900/95 hover:bg-slate-900 text-white rounded-full shadow-xl border border-teal-500/50 hover:border-teal-400 transition cursor-pointer backdrop-blur-xs group"
          title="Pomodoro Focus Timer Running - Click to manage"
        >
          <Clock className="w-4 h-4 text-teal-400 animate-spin" style={{ animationDuration: '6s' }} />
          <span className="font-mono text-xs font-bold tracking-tight text-teal-300">
            {activeTimerRemaining}
          </span>
          <span className="text-[10px] text-slate-400 group-hover:text-slate-200">
            {timerMode === 'focus' ? 'Focusing' : 'Break'}
          </span>
        </button>
      )}
    </div>
  );
}
