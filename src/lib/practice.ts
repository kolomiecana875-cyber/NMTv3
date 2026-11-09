import type {
  CityActionResult,
  DailyAnswer,
  DailyCount,
  PracticeSession,
  Question,
  Subject,
} from "@/types";
import { QUESTIONS_BY_SUBJECT, getQuestionById } from "@/data/nmtQuestions";
import { CITY_SUBJECTS } from "@/lib/cityConfig";
import { dayKey, loadDailyState } from "@/lib/daily";
import {
  loadCityState,
  recordPracticeAnswer,
  recordPracticeCompletion,
} from "@/lib/city";

const STORAGE_KEY = "nmt_practice_v1";
const PRACTICE_EVENT = "nmt-practice-update";

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isPracticeSubject(value: unknown): value is Subject {
  return typeof value === "string" && (CITY_SUBJECTS as string[]).includes(value);
}

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const target = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[target]] = [copy[target], copy[index]];
  }
  return copy;
}

function makeSessionId(now: number): string {
  return `practice-${now}-${Math.random().toString(36).slice(2, 9)}`;
}

function normalizeAnswer(raw: unknown): DailyAnswer | null {
  if (!isObject(raw) || typeof raw.questionId !== "string") return null;
  const selected = raw.selectedIndex;
  return {
    questionId: raw.questionId,
    selectedIndex: typeof selected === "number" ? selected : null,
    correct: Boolean(raw.correct),
  };
}

function normalizeSession(raw: unknown): PracticeSession | null {
  if (!isObject(raw)) return null;
  if (!isPracticeSubject(raw.subject)) return null;
  if (raw.count !== 3 && raw.count !== 5 && raw.count !== 10) return null;
  if (!Array.isArray(raw.questions) || raw.questions.length === 0) return null;

  const questions = raw.questions
    .map((item) => (isObject(item) && typeof item.id === "string" ? getQuestionById(item.id) ?? item : null))
    .filter((item): item is Question => Boolean(item));
  if (questions.length === 0) return null;

  const answers = Array.isArray(raw.answers)
    ? raw.answers.map(normalizeAnswer).filter((item): item is DailyAnswer => Boolean(item))
    : [];

  return {
    id: typeof raw.id === "string" ? raw.id : makeSessionId(Date.now()),
    subject: raw.subject,
    count: raw.count,
    startedAt: typeof raw.startedAt === "string" ? raw.startedAt : new Date().toISOString(),
    questions,
    currentIndex: Math.max(0, Math.min(Number(raw.currentIndex) || 0, questions.length - 1)),
    answers,
    completedAt: typeof raw.completedAt === "string" ? raw.completedAt : null,
    coinsEarned: Math.max(0, Number(raw.coinsEarned) || 0),
    xpEarned: Math.max(0, Number(raw.xpEarned) || 0),
  };
}

export function loadPracticeSession(): PracticeSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return normalizeSession(JSON.parse(raw));
  } catch {
    return null;
  }
}

export function savePracticeSession(session: PracticeSession): PracticeSession {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  } catch {
    // ignore storage errors
  }
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(PRACTICE_EVENT));
  }
  return session;
}

export function clearPracticeSession(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore storage errors
  }
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(PRACTICE_EVENT));
  }
}

export function subscribePracticeSession(listener: () => void): () => void {
  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) listener();
  };
  const onCustom = () => listener();
  window.addEventListener("storage", onStorage);
  window.addEventListener(PRACTICE_EVENT, onCustom);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(PRACTICE_EVENT, onCustom);
  };
}

/**
 * Обирає завдання з наявного банку предмета. Спочатку — ті, які
 * давно не траплялися в щоденному повторенні, потім випадкові.
 */
export function selectPracticeQuestions(subject: Subject, count: DailyCount): Question[] {
  const pool = QUESTIONS_BY_SUBJECT[subject] ?? [];
  if (pool.length < count) {
    throw new Error("У банку недостатньо завдань для цього тренування.");
  }
  const usage = loadDailyState().usage;
  const city = loadCityState();
  const today = dayKey();
  const ranked = [...pool].sort((a, b) => {
    // Спершу — завдання, які сьогодні ще не приносили монет.
    const aAwarded = city.stats.practiceAwarded[a.id] === today;
    const bAwarded = city.stats.practiceAwarded[b.id] === today;
    if (aAwarded !== bAwarded) return aAwarded ? 1 : -1;

    const aUsed = usage[a.id] ? Date.parse(usage[a.id]) : 0;
    const bUsed = usage[b.id] ? Date.parse(usage[b.id]) : 0;
    if (aUsed !== bUsed) return aUsed - bUsed;
    return Math.random() - 0.5;
  });
  return shuffle(ranked.slice(0, Math.max(count, Math.min(pool.length, count + 3)))).slice(0, count);
}

export function startPracticeSession(
  subject: Subject,
  count: DailyCount,
  now = Date.now()
): PracticeSession {
  const questions = selectPracticeQuestions(subject, count);
  const session: PracticeSession = {
    id: makeSessionId(now),
    subject,
    count,
    startedAt: new Date(now).toISOString(),
    questions,
    currentIndex: 0,
    answers: [],
    completedAt: null,
    coinsEarned: 0,
    xpEarned: 0,
  };
  return savePracticeSession(session);
}

export interface PracticeAnswerResult {
  session: PracticeSession;
  city: CityActionResult | null;
}

export function answerPracticeSession(
  session: PracticeSession,
  selectedIndex: number,
  now = Date.now()
): PracticeAnswerResult {
  const current = loadPracticeSession() ?? session;
  if (current.completedAt) return { session: current, city: null };

  const question = current.questions[current.currentIndex];
  if (!question) return { session: current, city: null };
  if (current.answers.some((answer) => answer.questionId === question.id)) {
    return { session: current, city: null };
  }

  const correct = selectedIndex === question.correctIndex;
  const answer: DailyAnswer = {
    questionId: question.id,
    selectedIndex,
    correct,
  };

  const city = recordPracticeAnswer(
    {
      questionId: question.id,
      subject: question.subject,
      topic: question.topic,
      difficulty: question.difficulty,
      correct,
    },
    now
  );

  const next: PracticeSession = {
    ...current,
    answers: [...current.answers, answer],
    coinsEarned: current.coinsEarned + (city.coinsAwarded ?? 0),
    xpEarned: current.xpEarned + (city.xpAwarded ?? 0),
  };

  return { session: savePracticeSession(next), city };
}

export interface PracticeAdvanceResult {
  session: PracticeSession | null;
  completed: boolean;
  city: CityActionResult | null;
}

export function advancePracticeSession(
  session: PracticeSession,
  now = Date.now()
): PracticeAdvanceResult {
  const current = loadPracticeSession() ?? session;
  if (current.completedAt) {
    return { session: current, completed: true, city: null };
  }

  const question = current.questions[current.currentIndex];
  const answered = question
    ? current.answers.some((answer) => answer.questionId === question.id)
    : false;
  if (!answered) return { session: current, completed: false, city: null };

  if (current.currentIndex + 1 >= current.questions.length) {
    const completed: PracticeSession = {
      ...current,
      completedAt: new Date(now).toISOString(),
    };
    const city = recordPracticeCompletion(completed, now);
    const finalSession: PracticeSession = {
      ...completed,
      coinsEarned: completed.coinsEarned + (city.coinsAwarded ?? 0),
      xpEarned: completed.xpEarned + (city.xpAwarded ?? 0),
    };
    clearPracticeSession();
    return { session: finalSession, completed: true, city };
  }

  const next: PracticeSession = {
    ...current,
    currentIndex: current.currentIndex + 1,
  };
  return { session: savePracticeSession(next), completed: false, city: null };
}
