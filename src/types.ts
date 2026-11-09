export type Subject =
  | "history"
  | "ukrainian"
  | "math"
  | "physics"
  | "chemistry"
  | "biology"
  | "english"
  | "geography";

export type Difficulty = "easy" | "medium" | "hard";

export interface Question {
  id: string;
  subject: Subject;
  topic: string;
  prompt: string;
  options: string[]; // exactly 4
  correctIndex: number; // 0..3
  explanation: string;
  difficulty?: Difficulty;
  taskType?: string;
}

export type QuizPhase = "empty" | "active" | "result" | "error" | "progress";

export interface SubjectMeta {
  id: Subject;
  label: string;
  emoji: string;
  color: string;
  topics: string[];
}

export interface OpenRouterConfig {
  apiKey: string;
  model: string;
}

export interface Attempt {
  id: string;
  date: string; // ISO
  subject: Subject;
  topic: string | null;
  correctCount: number;
  total: number;
  score: number;
  source: "ai" | "mock" | "repeat";
}

/* ------------------------------------------------------------------ */
/*  Щоденне повторення                                                 */
/* ------------------------------------------------------------------ */

export type DailyCount = 3 | 5 | 10;

export interface DailyAnswer {
  questionId: string;
  selectedIndex: number | null;
  correct: boolean;
}

export interface DailySession {
  id: string;
  count: DailyCount;
  startedAt: string;
  questions: Question[];
  currentIndex: number;
  answers: DailyAnswer[];
  completedAt: string | null;
}

export interface TopicResult {
  subject: Subject;
  topic: string;
  total: number;
  correct: number;
}

export interface DailyHistoryEntry {
  id: string;
  completedAt: string;
  count: DailyCount;
  correct: number;
  stars: number;
  topics: TopicResult[];
  answers: Array<DailyAnswer & { subject: Subject; topic: string }>;
}

export interface DailyProfile {
  totalStars: number;
  currentStreak: number;
  longestStreak: number;
  lastCompletedDay: string | null; // YYYY-MM-DD (local)
  lastCompletedAt: string | null; // ISO
  totalSessions: number;
  totalAnswered: number;
  totalCorrect: number;
}

export interface DailyState {
  version: 2;
  profile: DailyProfile;
  session: DailySession | null;
  history: DailyHistoryEntry[];
  /** questionId -> ISO timestamp of the last time it was used */
  usage: Record<string, string>;
  /** ISO timestamp when the next daily review becomes available */
  nextAvailableAt: string | null;
  lastCompletedSessionId: string | null;
}

export interface DailySystem {
  state: DailyState;
  now: number;
  isLocked: boolean;
  remainingMs: number;
  canStart: boolean;
  displayStreak: number;
  activeSession: DailySession | null;
  latestResult: DailyHistoryEntry | null;
}
