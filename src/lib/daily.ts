import type {
  DailyAnswer,
  DailyCount,
  DailyHistoryEntry,
  DailyProfile,
  DailySession,
  DailyState,
  DailySystem,
  Difficulty,
  Question,
  Subject,
  TopicResult,
} from "@/types";
import { QUESTION_BANK, QUESTIONS_BY_SUBJECT } from "@/data/nmtQuestions";
import { SUBJECTS } from "@/data/subjects";

const STORAGE_KEY = "nmt_daily_review_v2";
const CHANNEL_NAME = "nmt-daily-review";
const DAY_MS = 24 * 60 * 60 * 1000;
const FRESH_WINDOW_MS = 7 * DAY_MS;
const MAX_HISTORY = 120;

const SUBJECT_IDS: Subject[] = SUBJECTS.map((subject) => subject.id);
const DIFFICULTY_ORDER: Difficulty[] = ["easy", "medium", "hard"];

export class DailyLockedError extends Error {
  constructor(message = "Щоденне повторення вже недоступне. Спробуйте пізніше.") {
    super(message);
    this.name = "DailyLockedError";
  }
}

export function dayKey(value: number | Date = Date.now()): string {
  const date = value instanceof Date ? value : new Date(value);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

function shiftDayKey(value: number | Date, delta: number): string {
  const date = value instanceof Date ? new Date(value.getTime()) : new Date(value);
  date.setDate(date.getDate() + delta);
  return dayKey(date);
}

function defaultProfile(): DailyProfile {
  return {
    totalStars: 0,
    currentStreak: 0,
    longestStreak: 0,
    lastCompletedDay: null,
    lastCompletedAt: null,
    totalSessions: 0,
    totalAnswered: 0,
    totalCorrect: 0,
  };
}

function defaultState(): DailyState {
  return {
    version: 2,
    profile: defaultProfile(),
    session: null,
    history: [],
    usage: {},
    nextAvailableAt: null,
    lastCompletedSessionId: null,
  };
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function normalizeState(raw: unknown): DailyState {
  if (!isObject(raw)) return defaultState();
  const base = defaultState();
  const profile = isObject(raw.profile) ? raw.profile : {};

  const normalized: DailyState = {
    version: 2,
    profile: {
      totalStars: Number(profile.totalStars) || 0,
      currentStreak: Number(profile.currentStreak) || 0,
      longestStreak: Number(profile.longestStreak) || 0,
      lastCompletedDay: typeof profile.lastCompletedDay === "string" ? profile.lastCompletedDay : null,
      lastCompletedAt: typeof profile.lastCompletedAt === "string" ? profile.lastCompletedAt : null,
      totalSessions: Number(profile.totalSessions) || 0,
      totalAnswered: Number(profile.totalAnswered) || 0,
      totalCorrect: Number(profile.totalCorrect) || 0,
    },
    session: null,
    history: Array.isArray(raw.history) ? (raw.history as DailyHistoryEntry[]).slice(0, MAX_HISTORY) : [],
    usage: isObject(raw.usage) ? (raw.usage as Record<string, string>) : {},
    nextAvailableAt: typeof raw.nextAvailableAt === "string" ? raw.nextAvailableAt : null,
    lastCompletedSessionId:
      typeof raw.lastCompletedSessionId === "string" ? raw.lastCompletedSessionId : null,
  };

  if (isObject(raw.session)) {
    const session = raw.session as unknown as DailySession;
    if (
      typeof session.id === "string" &&
      Array.isArray(session.questions) &&
      session.questions.length > 0 &&
      (session.count === 3 || session.count === 5 || session.count === 10)
    ) {
      normalized.session = {
        ...session,
        answers: Array.isArray(session.answers) ? session.answers : [],
        currentIndex: Math.max(0, Math.min(Number(session.currentIndex) || 0, session.questions.length - 1)),
        completedAt: session.completedAt ?? null,
      };
    }
  }

  if (!normalized.profile.longestStreak) {
    normalized.profile.longestStreak = normalized.profile.currentStreak;
  }
  return normalized;
}

export function loadDailyState(): DailyState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    return reconcileState(normalizeState(JSON.parse(raw)), Date.now());
  } catch {
    return defaultState();
  }
}

/**
 * Прибирає прострочену незавершену сесію. Завершена сесія не може
 * «ожити» після перезавантаження — вона видаляється після нарахування зірок.
 */
function reconcileState(state: DailyState, now: number): DailyState {
  let changed = false;
  const next = { ...state, profile: { ...state.profile }, usage: { ...state.usage } };

  if (next.session) {
    const started = Date.parse(next.session.startedAt);
    if (!Number.isFinite(started) || now - started >= DAY_MS) {
      next.session = null;
      changed = true;
    }
  }

  if (next.nextAvailableAt) {
    const available = Date.parse(next.nextAvailableAt);
    if (!Number.isFinite(available) || available <= now) {
      // Залишаємо значення, щоб таймер міг показати 00:00:00,
      // але воно більше не блокує новий старт.
    }
  }

  if (changed) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // ignore storage errors
    }
  }
  return next;
}

let channel: BroadcastChannel | null = null;

function getChannel(): BroadcastChannel | null {
  if (typeof window === "undefined" || typeof BroadcastChannel === "undefined") return null;
  if (!channel) {
    channel = new BroadcastChannel(CHANNEL_NAME);
  }
  return channel;
}

export function saveDailyState(state: DailyState): DailyState {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Якщо localStorage недоступний, стан усе одно повертаємо застосунку.
  }
  window.dispatchEvent(new CustomEvent("nmt-daily-update"));
  getChannel()?.postMessage({ type: "update", at: Date.now() });
  return state;
}

export function subscribeDailyState(listener: () => void): () => void {
  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) listener();
  };
  const onCustom = () => listener();
  window.addEventListener("storage", onStorage);
  window.addEventListener("nmt-daily-update", onCustom);

  const bc = getChannel();
  if (bc) bc.onmessage = () => listener();

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener("nmt-daily-update", onCustom);
    if (bc) bc.onmessage = null;
  };
}

export function effectiveStreak(profile: DailyProfile, now = Date.now()): number {
  if (!profile.lastCompletedDay) return 0;
  const today = dayKey(now);
  const yesterday = shiftDayKey(now, -1);
  if (profile.lastCompletedDay === today || profile.lastCompletedDay === yesterday) {
    return profile.currentStreak;
  }
  return 0;
}

export function deriveDailySystem(state: DailyState, now = Date.now()): DailySystem {
  const activeSession =
    state.session && !state.session.completedAt && now - Date.parse(state.session.startedAt) < DAY_MS
      ? state.session
      : null;

  const nextAt = state.nextAvailableAt ? Date.parse(state.nextAvailableAt) : NaN;
  const remainingMs = Number.isFinite(nextAt) ? Math.max(0, nextAt - now) : 0;
  const lockedByTimer = Number.isFinite(nextAt) && remainingMs > 0;
  const isLocked = Boolean(activeSession) || lockedByTimer;

  return {
    state,
    now,
    isLocked,
    remainingMs,
    canStart: !isLocked,
    displayStreak: effectiveStreak(state.profile, now),
    activeSession,
    latestResult: state.history[0] ?? null,
  };
}

export function getDailySystem(): DailySystem {
  return deriveDailySystem(loadDailyState(), Date.now());
}

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function lastUsedAt(state: DailyState, questionId: string): number {
  const value = state.usage[questionId];
  if (!value) return 0;
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

/**
 * Обирає рівно `count` унікальних питань. Спочатку задіює предмети,
 * які давно не траплялися, свіжі питання й теми, яких ще немає в наборі.
 * Коли банк вичерпано, повертається до найдавніше використаних питань.
 */
export function selectDailyQuestions(
  count: DailyCount,
  state: DailyState,
  now = Date.now()
): Question[] {
  const selected: Question[] = [];
  const selectedIds = new Set<string>();
  const subjectQueue = shuffle([...SUBJECT_IDS]);
  let queueIndex = 0;
  let safety = 0;

  const desiredDifficulty = (index: number): Difficulty =>
    DIFFICULTY_ORDER[index % DIFFICULTY_ORDER.length];

  while (selected.length < count && safety < 1000) {
    safety += 1;
    const subject = subjectQueue[queueIndex % subjectQueue.length];
    queueIndex += 1;

    const candidates = (QUESTIONS_BY_SUBJECT[subject] ?? []).filter(
      (question) => !selectedIds.has(question.id)
    );
    if (candidates.length === 0) continue;

    const targetDifficulty = desiredDifficulty(selected.length);
    const ranked = candidates
      .map((question) => {
        const used = lastUsedAt(state, question.id);
        const freshness = used === 0 ? 0 : now - used > FRESH_WINDOW_MS ? 1 : 2;
        const topicRepeated = selected.some(
          (item) => item.subject === question.subject && item.topic === question.topic
        )
          ? 1
          : 0;
        const difficultyMismatch = (question.difficulty ?? "medium") === targetDifficulty ? 0 : 1;
        return {
          question,
          freshness,
          topicRepeated,
          difficultyMismatch,
          used,
          random: Math.random(),
        };
      })
      .sort((a, b) => {
        if (a.freshness !== b.freshness) return a.freshness - b.freshness;
        if (a.topicRepeated !== b.topicRepeated) return a.topicRepeated - b.topicRepeated;
        if (a.difficultyMismatch !== b.difficultyMismatch) return a.difficultyMismatch - b.difficultyMismatch;
        if (a.used !== b.used) return a.used - b.used;
        return a.random - b.random;
      });

    selected.push(ranked[0].question);
    selectedIds.add(ranked[0].question.id);
  }

  // Страховка: якщо з якоїсь причини не вистачило унікальних питань.
  if (selected.length < count) {
    const rest = QUESTION_BANK.filter((question) => !selectedIds.has(question.id)).sort(
      (a, b) => lastUsedAt(state, a.id) - lastUsedAt(state, b.id)
    );
    for (const question of rest) {
      if (selected.length >= count) break;
      selected.push(question);
      selectedIds.add(question.id);
    }
  }

  // Чергуємо складність: легке → середнє → складне → ...
  const buckets: Record<Difficulty, Question[]> = {
    easy: shuffle(selected.filter((question) => (question.difficulty ?? "medium") === "easy")),
    medium: shuffle(selected.filter((question) => (question.difficulty ?? "medium") === "medium")),
    hard: shuffle(selected.filter((question) => (question.difficulty ?? "medium") === "hard")),
  };
  const ordered: Question[] = [];
  let cursor = 0;
  while (ordered.length < selected.length && cursor < selected.length * 3 + 3) {
    cursor += 1;
    for (const difficulty of DIFFICULTY_ORDER) {
      const next = buckets[difficulty].shift();
      if (next) ordered.push(next);
      if (ordered.length >= selected.length) break;
    }
  }
  return ordered.slice(0, count);
}

function makeSessionId(now: number): string {
  return `daily-${now}-${Math.random().toString(36).slice(2, 9)}`;
}

type LockManagerLike = {
  request<T>(name: string, callback: () => Promise<T> | T): Promise<T>;
};

/**
 * Серіалізує зміну стану між вкладками. Якщо Web Locks API недоступний,
 * операція виконується напряму (localStorage усе одно синхронний).
 */
async function withStateLock<T>(task: () => T | Promise<T>): Promise<T> {
  const locks = typeof navigator !== "undefined"
    ? (navigator as Navigator & { locks?: LockManagerLike }).locks
    : undefined;
  if (locks?.request) {
    return locks.request("nmt-daily-state", async () => task());
  }
  return task();
}

export async function startDailySession(count: DailyCount, now = Date.now()): Promise<DailyState> {
  return withStateLock(() => {
    const current = reconcileState(loadDailyState(), now);
    const system = deriveDailySystem(current, now);
    if (system.isLocked) throw new DailyLockedError();

    const questions = selectDailyQuestions(count, current, now);
    if (questions.length !== count) {
      throw new Error("Не вдалося підібрати потрібну кількість завдань.");
    }

    const usage = { ...current.usage };
    const startedAt = new Date(now).toISOString();
    for (const question of questions) usage[question.id] = startedAt;

    const session: DailySession = {
      id: makeSessionId(now),
      count,
      startedAt,
      questions,
      currentIndex: 0,
      answers: [],
      completedAt: null,
    };

    return saveDailyState({
      ...current,
      session,
      usage,
      nextAvailableAt: null,
    });
  });
}

export function answerDailyQuestion(
  selectedIndex: number | null,
  now = Date.now()
): DailyState {
  const state = reconcileState(loadDailyState(), now);
  const session = state.session;
  if (!session || session.completedAt) return state;

  const question = session.questions[session.currentIndex];
  if (!question) return state;
  if (session.answers.some((answer) => answer.questionId === question.id)) return state;

  const answer: DailyAnswer = {
    questionId: question.id,
    selectedIndex,
    correct: selectedIndex === question.correctIndex,
  };

  return saveDailyState({
    ...state,
    session: {
      ...session,
      answers: [...session.answers, answer],
    },
  });
}

export async function advanceDailySession(now = Date.now()): Promise<DailyState> {
  const state = reconcileState(loadDailyState(), now);
  const session = state.session;
  if (!session || session.completedAt) return state;

  const question = session.questions[session.currentIndex];
  const answered = question
    ? session.answers.some((answer) => answer.questionId === question.id)
    : false;
  if (!answered) return state;

  if (session.currentIndex + 1 >= session.questions.length) {
    return finalizeDailySession(now);
  }

  return saveDailyState({
    ...state,
    session: {
      ...session,
      currentIndex: session.currentIndex + 1,
    },
  });
}

function aggregateTopics(
  session: DailySession,
  answers: DailyAnswer[]
): TopicResult[] {
  const map = new Map<string, TopicResult>();
  for (const answer of answers) {
    const question = session.questions.find((item) => item.id === answer.questionId);
    if (!question) continue;
    const key = `${question.subject}::${question.topic}`;
    const existing =
      map.get(key) ??
      ({
        subject: question.subject,
        topic: question.topic,
        total: 0,
        correct: 0,
      } satisfies TopicResult);
    existing.total += 1;
    if (answer.correct) existing.correct += 1;
    map.set(key, existing);
  }
  return Array.from(map.values());
}

function nextStreak(profile: DailyProfile, now: number): number {
  const today = dayKey(now);
  const yesterday = shiftDayKey(now, -1);
  if (!profile.lastCompletedDay) return 1;
  if (profile.lastCompletedDay === today) return Math.max(1, profile.currentStreak);
  if (profile.lastCompletedDay === yesterday) return profile.currentStreak + 1;
  return 1;
}

export async function finalizeDailySession(now = Date.now()): Promise<DailyState> {
  return withStateLock(() => {
    const state = reconcileState(loadDailyState(), now);
    const session = state.session;
    if (!session || session.completedAt) return state;

    // Захист від подвійного нарахування в іншій вкладці.
    if (state.lastCompletedSessionId === session.id) {
      return saveDailyState({ ...state, session: null });
    }

    if (session.answers.length !== session.questions.length) {
      return state;
    }

    const correct = session.answers.filter((answer) => answer.correct).length;
    const stars = session.count;
    const streak = nextStreak(state.profile, now);
    const completedAt = new Date(now).toISOString();
    const topics = aggregateTopics(session, session.answers);

    const historyEntry: DailyHistoryEntry = {
      id: session.id,
      completedAt,
      count: session.count,
      correct,
      stars,
      topics,
      answers: session.answers.map((answer) => {
        const question = session.questions.find((item) => item.id === answer.questionId);
        return {
          ...answer,
          subject: question?.subject ?? "history",
          topic: question?.topic ?? "—",
        };
      }),
    };

    const profile: DailyProfile = {
      ...state.profile,
      totalStars: state.profile.totalStars + stars,
      currentStreak: streak,
      longestStreak: Math.max(state.profile.longestStreak, streak),
      lastCompletedDay: dayKey(now),
      lastCompletedAt: completedAt,
      totalSessions: state.profile.totalSessions + 1,
      totalAnswered: state.profile.totalAnswered + session.count,
      totalCorrect: state.profile.totalCorrect + correct,
    };

    return saveDailyState({
      ...state,
      profile,
      session: null,
      history: [historyEntry, ...state.history].slice(0, MAX_HISTORY),
      nextAvailableAt: new Date(now + DAY_MS).toISOString(),
      lastCompletedSessionId: session.id,
    });
  });
}

export function formatCountdown(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;
  return [hours, minutes, seconds].map((value) => String(value).padStart(2, "0")).join(":");
}

export function topicsToReview(entry: DailyHistoryEntry | null): TopicResult[] {
  if (!entry) return [];
  return entry.topics
    .filter((topic) => topic.correct < topic.total)
    .sort((a, b) => a.correct / a.total - b.correct / b.total)
    .slice(0, 6);
}

export function pluralDays(value: number): string {
  const mod10 = value % 10;
  const mod100 = value % 100;
  if (mod10 === 1 && mod100 !== 11) return "день";
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return "дні";
  return "днів";
}

export function pluralQuestions(value: number): string {
  const mod10 = value % 10;
  const mod100 = value % 100;
  if (mod10 === 1 && mod100 !== 11) return "запитання";
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return "запитання";
  return "запитань";
}

export function pluralStars(value: number): string {
  const mod10 = value % 10;
  const mod100 = value % 100;
  if (mod10 === 1 && mod100 !== 11) return "зірка";
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return "зірки";
  return "зірок";
}

export function pluralCorrect(value: number): string {
  const mod10 = value % 10;
  const mod100 = value % 100;
  if (mod10 === 1 && mod100 !== 11) return "правильна";
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return "правильні";
  return "правильних";
}

export function pluralTasks(value: number): string {
  const mod10 = value % 10;
  const mod100 = value % 100;
  if (mod10 === 1 && mod100 !== 11) return "завдання";
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return "завдання";
  return "завдань";
}

export function pluralSessions(value: number): string {
  const mod10 = value % 10;
  const mod100 = value % 100;
  if (mod10 === 1 && mod100 !== 11) return "щоденне повторення";
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return "щоденні повторення";
  return "щоденних повторень";
}
