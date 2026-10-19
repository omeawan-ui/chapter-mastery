export type SubjectType = 'Science' | 'Social Studies' | 'Biology' | 'Physics' | 'Chemistry' | 'Mathematics' | 'English' | 'History' | 'General';

export interface SourceItem {
  id: string;
  label: string;
  type: 'text' | 'pdf' | 'image' | 'link';
  text?: string;
  url?: string;
}

export interface MapDiagramStep {
  label: string;
  desc: string;
  emoji?: string;
  color?: string;
}

export interface MapDiagram {
  type: 'cycle' | 'flow' | 'steps' | 'structure';
  title: string;
  caption: string;
  steps: MapDiagramStep[];
}

export interface VideoRecommendation {
  title: string;
  youtubeId?: string;
  youtubeUrl: string;
  channel?: string;
  duration?: string;
  whyWatch: string;
}

export interface BranchMechanism {
  concept: string;
  explanation: string;
  realLifeExample: string;
  emoji?: string;
}

export interface MapBranch {
  id: string;
  branchName: string;
  branchEmoji: string;
  analogy: string; // Descriptive, friendly explainer in simple plain English
  subPoints: string[];
  realLifeExamples?: string[]; // Concrete daily life examples (kitchen, playground, bike, body, nature)
  mechanisms?: BranchMechanism[]; // Detailed concept + real-world example
  keyTakeaways: string[];
  diagram?: MapDiagram;
  video?: VideoRecommendation;
}

export interface ChapterMap {
  chapterTitle: string;
  oneLineSummary: string;
  bigIdea: string;
  bigIdeaEmoji: string;
  bigIdeaAnalogy: string;
  learningOutcomes: string[];
  estimatedStudyMinutes: number;
  branches: MapBranch[];
  overallDiagram?: MapDiagram;
  recommendedVideos?: VideoRecommendation[];
  realLifeConnections?: string[];
}

export interface Keyword {
  id: string;
  word: string;
  type: string;
  childMeaning: string;
  example: string;
  memoryHook: string;
  spellingTip: string;
  mastered?: boolean;
}

export interface AnswerEvaluation {
  score: number;
  maxScore: number;
  whatGood: string;
  howToImprove: string;
  encouragement: string;
  evaluatedAt: string;
}

export interface Question {
  id: string;
  type: 'short-answer' | 'reasoning' | 'definition' | 'diagram';
  question: string;
  modelAnswer: string;
  keyWordsUsed: string[];
  marks: number;
  studentAnswer?: string;
  evaluation?: AnswerEvaluation;
}

export interface MatchPair {
  left: string;
  right: string;
}

export interface QuizItem {
  id: string;
  type: 'mcq' | 'fill-blank' | 'match' | 'true-false';
  question: string;
  options?: string[];
  correctIndex?: number;
  answer?: string | boolean;
  pairs?: MatchPair[];
  explanation: string;
}

export interface ReviewScheduleItem {
  day: number;
  date: string;
  done: boolean;
}

export interface ReviewRecord {
  date: string;
  score: number;
  type: 'quiz' | 'question' | 'spaced_review';
}

export interface RetrievalEvaluation {
  retrievalScore: number;
  strengthBadge: 'Iron Memory' | 'Sharp Recall' | 'Good Recall' | 'Needs Reinforcement';
  recalledPoints: string[];
  missedPoints: string[];
  analogyFeedback: string;
  actionableTip: string;
  encouragement: string;
  evaluatedAt: string;
}

export interface RetrievalRecord {
  id: string;
  targetId: string;
  targetTitle: string;
  studentRecallText: string;
  evaluation?: RetrievalEvaluation;
  date: string;
}

export type DifficultyLevel = 'easy' | 'standard' | 'hard';

export interface Chapter {
  id: string;
  studentId?: string; // ID of student profile this study kit belongs to
  title: string;
  subject: string;
  grade: number;
  difficultyLevel?: DifficultyLevel;
  examDate?: string;
  dateAdded: string;
  lastStudied?: string;
  text: string;
  sources: SourceItem[];
  map: ChapterMap;
  keywords: Keyword[];
  questions: Question[];
  quiz: QuizItem[];
  retrievalRecords?: RetrievalRecord[];
  reviews: ReviewRecord[];
  reviewDates: ReviewScheduleItem[];
  quizScores: number[];
  masteryScore: number;
  xpEarned: number;
}

export interface StudentProfile {
  id: string;
  name: string;
  grade: number;
  phoneNumber: string; // Used as student password / login PIN
  avatarEmoji?: string;
  createdAt: string;
  lastLoginAt?: string;
}

export interface CoachMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  quickQuestions?: string[];
  resourceSuggestions?: Array<{
    title: string;
    type: 'video' | 'article' | 'book' | 'website';
    url?: string;
    description: string;
  }>;
}

export interface UserStats {
  xp: number;
  streakDays: number;
  lastActiveDate: string;
  chaptersCompleted: number;
  questionsAnswered: number;
  quizzesTaken: number;
}
