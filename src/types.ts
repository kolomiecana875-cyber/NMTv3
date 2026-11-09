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

/* ------------------------------------------------------------------ */
/*  Місто «Побудуй своє місто»                                         */
/* ------------------------------------------------------------------ */

export type BuildingType =
  | "house"
  | "shop"
  | "school"
  | "library"
  | "university"
  | "park"
  | "stadium"
  | "road"
  | "decoration";

export interface BuildingDef {
  type: BuildingType;
  name: string;
  shortName: string;
  description: string;
  emoji: string;
  baseCost: number;
  population: number;
  xp: number;
  maxLevel: number;
  unlockLevel: number;
  accent: string;
}

export interface PlacedBuilding {
  id: string;
  type: BuildingType;
  level: number;
  plot: number;
  builtAt: string;
}

export type MissionKind =
  | "answer_subject"
  | "complete_subject"
  | "correct_run"
  | "hard_topic"
  | "practice_subject";

export interface MissionDef {
  id: string;
  title: string;
  description: string;
  target: number;
  rewardCoins: number;
  rewardXp: number;
  kind: MissionKind;
  subject?: Subject;
}

export interface MissionProgress {
  progress: number;
  completedAt: string | null;
  claimedAt: string | null;
}

export interface CityMissions {
  day: string;
  items: Record<string, MissionProgress>;
}

export interface AchievementDef {
  id: string;
  title: string;
  description: string;
  emoji: string;
  rewardCoins: number;
  rewardXp: number;
}

export interface CityStats {
  coinsEarned: number;
  coinsSpent: number;
  totalAnswered: number;
  totalCorrect: number;
  answeredBySubject: Partial<Record<Subject, number>>;
  correctBySubject: Partial<Record<Subject, number>>;
  practiceSessions: number;
  dailySessions: number;
  correctRun: number;
  maxCorrectRun: number;
  correctRunDay: string | null;
  bestStreak: number;
  perfectSessions: number;
  hardTopics: string[];
  /** questionId -> day, коли востаннє нарахували монети за тренування */
  practiceAwarded: Record<string, string>;
  /** subject -> day, коли востаннє давали бонус за повний тест */
  testBonus: Partial<Record<Subject, string>>;
  processedDaily: string[];
  processedPractice: string[];
  streakRewarded: number[];
}

export interface CityState {
  version: 1;
  coins: number;
  xp: number;
  buildings: PlacedBuilding[];
  missions: CityMissions;
  achievements: Record<string, string>;
  stats: CityStats;
  createdAt: string;
  updatedAt: string;
}

export type CityMessageKind = "coins" | "mission" | "achievement" | "error" | "info";

export interface CityMessage {
  id: string;
  kind: CityMessageKind;
  text: string;
}

export interface CityActionResult {
  state: CityState;
  messages: CityMessage[];
  /** Скільки монет нараховано саме цією дією (для екрана тренування). */
  coinsAwarded?: number;
  /** Скільки XP нараховано саме цією дією. */
  xpAwarded?: number;
}

export interface PracticeSession extends DailySession {
  subject: Subject;
  coinsEarned: number;
  xpEarned: number;
}
