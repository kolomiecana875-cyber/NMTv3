import type {
  BuildingType,
  CityActionResult,
  CityMessage,
  CityMessageKind,
  CityMissions,
  CityState,
  CityStats,
  DailyHistoryEntry,
  Difficulty,
  MissionProgress,
  PlacedBuilding,
  PracticeSession,
  Subject,
} from "@/types";
import {
  BUILDINGS,
  CITY_ACHIEVEMENTS,
  CITY_ECONOMY,
  CITY_MISSIONS,
  MISSION_MAP,
  PLOT_COUNT,
  buildingPopulation,
  buildingXp,
  cityLevelForXp,
  cityLevelProgress,
  getBuildingDef,
  totalInvested,
  upgradeCost,
} from "@/lib/cityConfig";
import { dayKey, effectiveStreak, loadDailyState } from "@/lib/daily";
import { getQuestionById } from "@/data/nmtQuestions";

const STORAGE_KEY = "nmt_city_v1";
const CHANNEL_NAME = "nmt-city";
const MAX_PROCESSED = 200;
const MAX_HARD_TOPICS = 8;

/* ------------------------------------------------------------------ */
/*  Базові значення                                                    */
/* ------------------------------------------------------------------ */

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function makeId(prefix: string, now: number): string {
  return `${prefix}-${now}-${Math.random().toString(36).slice(2, 9)}`;
}

function message(kind: CityMessageKind, text: string): CityMessage {
  return {
    id: makeId("msg", Date.now()),
    kind,
    text,
  };
}

export function defaultStats(): CityStats {
  return {
    coinsEarned: 0,
    coinsSpent: 0,
    totalAnswered: 0,
    totalCorrect: 0,
    answeredBySubject: {},
    correctBySubject: {},
    practiceSessions: 0,
    dailySessions: 0,
    correctRun: 0,
    maxCorrectRun: 0,
    correctRunDay: null,
    bestStreak: 0,
    perfectSessions: 0,
    hardTopics: [],
    practiceAwarded: {},
    testBonus: {},
    processedDaily: [],
    processedPractice: [],
    streakRewarded: [],
  };
}

function defaultMissions(now = Date.now()): CityMissions {
  return { day: dayKey(now), items: {} };
}

function defaultState(now = Date.now()): CityState {
  const iso = new Date(now).toISOString();
  return {
    version: 1,
    coins: CITY_ECONOMY.startingCoins,
    xp: 0,
    buildings: [],
    missions: defaultMissions(now),
    achievements: {},
    stats: defaultStats(),
    createdAt: iso,
    updatedAt: iso,
  };
}

/* ------------------------------------------------------------------ */
/*  Нормалізація та збереження                                          */
/* ------------------------------------------------------------------ */

function normalizeStats(raw: unknown): CityStats {
  const base = defaultStats();
  if (!isObject(raw)) return base;
  return {
    coinsEarned: Math.max(0, Number(raw.coinsEarned) || 0),
    coinsSpent: Math.max(0, Number(raw.coinsSpent) || 0),
    totalAnswered: Math.max(0, Number(raw.totalAnswered) || 0),
    totalCorrect: Math.max(0, Number(raw.totalCorrect) || 0),
    answeredBySubject: isObject(raw.answeredBySubject)
      ? (raw.answeredBySubject as Partial<Record<Subject, number>>)
      : {},
    correctBySubject: isObject(raw.correctBySubject)
      ? (raw.correctBySubject as Partial<Record<Subject, number>>)
      : {},
    practiceSessions: Math.max(0, Number(raw.practiceSessions) || 0),
    dailySessions: Math.max(0, Number(raw.dailySessions) || 0),
    correctRun: Math.max(0, Number(raw.correctRun) || 0),
    maxCorrectRun: Math.max(0, Number(raw.maxCorrectRun) || 0),
    correctRunDay: typeof raw.correctRunDay === "string" ? raw.correctRunDay : null,
    bestStreak: Math.max(0, Number(raw.bestStreak) || 0),
    perfectSessions: Math.max(0, Number(raw.perfectSessions) || 0),
    hardTopics: Array.isArray(raw.hardTopics)
      ? raw.hardTopics.filter((topic): topic is string => typeof topic === "string").slice(0, MAX_HARD_TOPICS)
      : [],
    practiceAwarded: isObject(raw.practiceAwarded)
      ? (raw.practiceAwarded as Record<string, string>)
      : {},
    testBonus: isObject(raw.testBonus)
      ? (raw.testBonus as Partial<Record<Subject, string>>)
      : {},
    processedDaily: Array.isArray(raw.processedDaily)
      ? raw.processedDaily.filter((id): id is string => typeof id === "string").slice(0, MAX_PROCESSED)
      : [],
    processedPractice: Array.isArray(raw.processedPractice)
      ? raw.processedPractice.filter((id): id is string => typeof id === "string").slice(0, MAX_PROCESSED)
      : [],
    streakRewarded: Array.isArray(raw.streakRewarded)
      ? raw.streakRewarded.filter((value): value is number => typeof value === "number")
      : [],
  };
}

function normalizeMissions(raw: unknown, now: number): CityMissions {
  const base = defaultMissions(now);
  if (!isObject(raw)) return base;
  const itemsRaw = isObject(raw.items) ? raw.items : {};
  const items: Record<string, MissionProgress> = {};
  for (const [id, value] of Object.entries(itemsRaw)) {
    if (!isObject(value)) continue;
    items[id] = {
      progress: Math.max(0, Number(value.progress) || 0),
      completedAt: typeof value.completedAt === "string" ? value.completedAt : null,
      claimedAt: typeof value.claimedAt === "string" ? value.claimedAt : null,
    };
  }
  return {
    day: typeof raw.day === "string" ? raw.day : base.day,
    items,
  };
}

function normalizeBuildings(raw: unknown): PlacedBuilding[] {
  if (!Array.isArray(raw)) return [];
  const usedPlots = new Set<number>();
  const usedIds = new Set<string>();
  const buildings: PlacedBuilding[] = [];

  for (const value of raw) {
    if (!isObject(value)) continue;
    const type = value.type as BuildingType;
    const def = getBuildingDef(type);
    if (!def) continue;
    const plot = Number(value.plot);
    if (!Number.isInteger(plot) || plot < 0 || plot >= PLOT_COUNT || usedPlots.has(plot)) continue;
    const level = Math.max(1, Math.min(def.maxLevel, Math.floor(Number(value.level) || 1)));
    let id = typeof value.id === "string" ? value.id : makeId("b", Date.now());
    if (usedIds.has(id)) id = makeId("b", Date.now());
    usedIds.add(id);
    usedPlots.add(plot);
    buildings.push({
      id,
      type,
      level,
      plot,
      builtAt: typeof value.builtAt === "string" ? value.builtAt : new Date().toISOString(),
    });
  }
  return buildings;
}

function normalizeState(raw: unknown, now = Date.now()): CityState {
  const base = defaultState(now);
  if (!isObject(raw)) return base;
  return {
    version: 1,
    coins: Math.max(0, Number(raw.coins) || 0),
    xp: Math.max(0, Number(raw.xp) || 0),
    buildings: normalizeBuildings(raw.buildings),
    missions: normalizeMissions(raw.missions, now),
    achievements: isObject(raw.achievements)
      ? (raw.achievements as Record<string, string>)
      : {},
    stats: normalizeStats(raw.stats),
    createdAt: typeof raw.createdAt === "string" ? raw.createdAt : base.createdAt,
    updatedAt: typeof raw.updatedAt === "string" ? raw.updatedAt : base.updatedAt,
  };
}

/**
 * Скидає щоденні місії та серію правильних відповідей,
 * коли настає новий день.
 */
function ensureToday(state: CityState, now: number): CityState {
  const today = dayKey(now);
  let next = state;

  if (next.missions.day !== today) {
    next = { ...next, missions: { day: today, items: {} } };
  }

  if (next.stats.correctRunDay !== today) {
    next = {
      ...next,
      stats: {
        ...next.stats,
        correctRun: 0,
        correctRunDay: today,
      },
    };
  }

  return next;
}

export function loadCityState(): CityState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    const normalized = ensureToday(normalizeState(JSON.parse(raw)), Date.now());
    return normalized;
  } catch {
    return defaultState();
  }
}

let channel: BroadcastChannel | null = null;

function getChannel(): BroadcastChannel | null {
  if (typeof window === "undefined" || typeof BroadcastChannel === "undefined") return null;
  if (!channel) channel = new BroadcastChannel(CHANNEL_NAME);
  return channel;
}

export function saveCityState(state: CityState): CityState {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Якщо localStorage недоступний, повертаємо стан застосунку.
  }
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("nmt-city-update"));
  }
  getChannel()?.postMessage({ type: "update", at: Date.now() });
  return state;
}

export function subscribeCityState(listener: () => void): () => void {
  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) listener();
  };
  const onCustom = () => listener();
  window.addEventListener("storage", onStorage);
  window.addEventListener("nmt-city-update", onCustom);

  const bc = getChannel();
  if (bc) bc.onmessage = () => listener();

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener("nmt-city-update", onCustom);
    if (bc) bc.onmessage = null;
  };
}

/* ------------------------------------------------------------------ */
/*  Похідні дані для інтерфейсу                                        */
/* ------------------------------------------------------------------ */

export interface CityDerived {
  level: number;
  maxLevel: number;
  xp: number;
  currentLevelXp: number;
  nextLevelXp: number | null;
  xpIntoLevel: number;
  xpForLevel: number;
  percent: number;
  population: number;
  buildingCount: number;
  maxBuildings: number;
  unlockedTypes: BuildingType[];
}

export function deriveCity(state: CityState): CityDerived {
  const progress = cityLevelProgress(state.xp);
  const population = state.buildings.reduce((sum, building) => {
    const def = getBuildingDef(building.type);
    return def ? sum + buildingPopulation(def, building.level) : sum;
  }, 0);

  return {
    level: progress.level,
    maxLevel: progress.maxLevel,
    xp: state.xp,
    currentLevelXp: progress.currentLevelXp,
    nextLevelXp: progress.nextLevelXp,
    xpIntoLevel: progress.xpIntoLevel,
    xpForLevel: progress.xpForLevel,
    percent: progress.percent,
    population,
    buildingCount: state.buildings.length,
    maxBuildings: PLOT_COUNT,
    unlockedTypes: BUILDINGS.filter((def) => def.unlockLevel <= progress.level).map((def) => def.type),
  };
}

export function isBuildingUnlocked(type: BuildingType, level: number): boolean {
  const def = getBuildingDef(type);
  return Boolean(def && def.unlockLevel <= level);
}

/* ------------------------------------------------------------------ */
/*  Місії                                                              */
/* ------------------------------------------------------------------ */

function bumpMission(
  state: CityState,
  missionId: string,
  amount: number,
  mode: "add" | "max" = "add"
): CityState {
  const def = MISSION_MAP.get(missionId);
  if (!def) return state;
  const current =
    state.missions.items[missionId] ??
    ({ progress: 0, completedAt: null, claimedAt: null } satisfies MissionProgress);
  if (current.claimedAt) return state;

  const rawProgress = mode === "max" ? Math.max(current.progress, amount) : current.progress + amount;
  const progress = Math.min(def.target, rawProgress);
  if (progress === current.progress) return state;

  return {
    ...state,
    missions: {
      ...state.missions,
      items: {
        ...state.missions.items,
        [missionId]: { ...current, progress },
      },
    },
  };
}

function completeMissions(state: CityState, now: number, messages: CityMessage[]): CityState {
  let next = state;
  for (const def of CITY_MISSIONS) {
    const item = next.missions.items[def.id];
    if (!item || item.progress < def.target || item.claimedAt) continue;

    const completedAt = item.completedAt ?? new Date(now).toISOString();
    const claimedAt = new Date(now).toISOString();
    next = {
      ...next,
      coins: next.coins + def.rewardCoins,
      xp: next.xp + def.rewardXp,
      stats: {
        ...next.stats,
        coinsEarned: next.stats.coinsEarned + def.rewardCoins,
      },
      missions: {
        ...next.missions,
        items: {
          ...next.missions.items,
          [def.id]: { ...item, completedAt, claimedAt },
        },
      },
    };
    messages.push(message("mission", `Місію «${def.title}» виконано · +${def.rewardCoins} монет`));
  }
  return next;
}

/* ------------------------------------------------------------------ */
/*  Досягнення                                                         */
/* ------------------------------------------------------------------ */

function achievementUnlocked(id: string, state: CityState, now: number): boolean {
  const daily = loadDailyState();
  const streak = Math.max(state.stats.bestStreak, effectiveStreak(daily.profile, now));
  const level = cityLevelForXp(state.xp);

  switch (id) {
    case "first_building":
      return state.buildings.length >= 1;
    case "five_buildings":
      return state.buildings.length >= 5;
    case "twelve_buildings":
      return state.buildings.length >= 12;
    case "first_upgrade":
      return state.buildings.some((building) => building.level >= 2);
    case "city_level_3":
      return level >= 3;
    case "city_level_5":
      return level >= 5;
    case "correct_50":
      return state.stats.totalCorrect >= 50;
    case "correct_200":
      return state.stats.totalCorrect >= 200;
    case "perfect_test":
      return state.stats.perfectSessions >= 1;
    case "streak_7":
      return streak >= 7;
    default:
      return false;
  }
}

function checkAchievements(state: CityState, now: number, messages: CityMessage[]): CityState {
  let next = state;
  for (const def of CITY_ACHIEVEMENTS) {
    if (next.achievements[def.id]) continue;
    if (!achievementUnlocked(def.id, next, now)) continue;

    next = {
      ...next,
      achievements: {
        ...next.achievements,
        [def.id]: new Date(now).toISOString(),
      },
      coins: next.coins + def.rewardCoins,
      xp: next.xp + def.rewardXp,
      stats: {
        ...next.stats,
        coinsEarned: next.stats.coinsEarned + def.rewardCoins,
      },
    };
    messages.push(message("achievement", `Досягнення «${def.title}» · +${def.rewardCoins} монет`));
  }
  return next;
}

/* ------------------------------------------------------------------ */
/*  Будівництво                                                        */
/* ------------------------------------------------------------------ */

function errorResult(state: CityState, text: string): CityActionResult {
  return { state, messages: [message("error", text)] };
}

export function placeBuilding(
  type: BuildingType,
  plot: number,
  now = Date.now()
): CityActionResult {
  const state = ensureToday(loadCityState(), now);
  const def = getBuildingDef(type);
  if (!def) return errorResult(state, "Невідомий тип будівлі.");

  const level = cityLevelForXp(state.xp);
  if (def.unlockLevel > level) {
    return errorResult(state, `«${def.name}» відкриється на ${def.unlockLevel} рівні міста.`);
  }
  if (!Number.isInteger(plot) || plot < 0 || plot >= PLOT_COUNT) {
    return errorResult(state, "Ця ділянка недоступна.");
  }
  if (state.buildings.some((building) => building.plot === plot)) {
    return errorResult(state, "Ця ділянка вже зайнята.");
  }
  if (state.coins < def.baseCost) {
    return errorResult(state, `Не вистачає ${def.baseCost - state.coins} монет на «${def.name}».`);
  }

  const building: PlacedBuilding = {
    id: makeId("b", now),
    type,
    level: 1,
    plot,
    builtAt: new Date(now).toISOString(),
  };

  const messages: CityMessage[] = [
    message("coins", `−${def.baseCost} монет · «${def.name}» збудовано`),
  ];

  let next: CityState = {
    ...state,
    coins: state.coins - def.baseCost,
    xp: state.xp + def.xp,
    buildings: [...state.buildings, building],
    stats: {
      ...state.stats,
      coinsSpent: state.stats.coinsSpent + def.baseCost,
    },
    updatedAt: new Date(now).toISOString(),
  };

  next = checkAchievements(next, now, messages);
  saveCityState(next);
  return { state: next, messages };
}

export function upgradeBuilding(id: string, now = Date.now()): CityActionResult {
  const state = ensureToday(loadCityState(), now);
  const building = state.buildings.find((item) => item.id === id);
  if (!building) return errorResult(state, "Будівлю не знайдено.");
  const def = getBuildingDef(building.type);
  if (!def) return errorResult(state, "Невідомий тип будівлі.");
  if (building.level >= def.maxLevel) {
    return errorResult(state, `«${def.name}» уже на максимальному рівні.`);
  }

  const cost = upgradeCost(def, building.level);
  if (state.coins < cost) {
    return errorResult(state, `Не вистачає ${cost - state.coins} монет на покращення.`);
  }

  const newLevel = building.level + 1;
  const xpGain = Math.max(1, Math.round(def.xp * 0.6));
  const messages: CityMessage[] = [
    message("coins", `−${cost} монет · «${def.shortName}» тепер ${newLevel} рівня`),
  ];

  let next: CityState = {
    ...state,
    coins: state.coins - cost,
    xp: state.xp + xpGain,
    buildings: state.buildings.map((item) =>
      item.id === id ? { ...item, level: newLevel } : item
    ),
    stats: {
      ...state.stats,
      coinsSpent: state.stats.coinsSpent + cost,
    },
    updatedAt: new Date(now).toISOString(),
  };

  next = checkAchievements(next, now, messages);
  saveCityState(next);
  return { state: next, messages };
}

export function demolishBuilding(id: string, now = Date.now()): CityActionResult {
  const state = ensureToday(loadCityState(), now);
  const building = state.buildings.find((item) => item.id === id);
  if (!building) return errorResult(state, "Будівлю не знайдено.");
  const def = getBuildingDef(building.type);
  if (!def) return errorResult(state, "Невідомий тип будівлі.");

  const refund = Math.round(totalInvested(def, building.level) * CITY_ECONOMY.sellRefundRate);
  const next: CityState = {
    ...state,
    coins: state.coins + refund,
    buildings: state.buildings.filter((item) => item.id !== id),
    updatedAt: new Date(now).toISOString(),
  };

  saveCityState(next);
  return {
    state: next,
    messages: [message("info", `«${def.shortName}» продано · +${refund} монет`)],
  };
}

/* ------------------------------------------------------------------ */
/*  Навчальні результати                                               */
/* ------------------------------------------------------------------ */

export interface PracticeAnswerInput {
  questionId: string;
  subject: Subject;
  topic: string;
  difficulty?: Difficulty;
  correct: boolean;
}

/**
 * Нараховує монети за правильну відповідь у тренуванні.
 * Одне й те саме питання дає монети лише один раз на день —
 * це захищає економіку від повторного «фарму» тих самих завдань.
 */
export function recordPracticeAnswer(
  input: PracticeAnswerInput,
  now = Date.now()
): CityActionResult {
  const state = ensureToday(loadCityState(), now);
  const today = dayKey(now);
  const firstToday = state.stats.practiceAwarded[input.questionId] !== today;

  const messages: CityMessage[] = [];
  let coinsAwarded = 0;
  let xpAwarded = 0;

  if (input.correct && firstToday) {
    coinsAwarded = CITY_ECONOMY.coinsPerCorrect;
    xpAwarded = CITY_ECONOMY.xpPerCorrect;
    messages.push(message("coins", `Правильно! +${coinsAwarded} монет`));
  }

  const stats: CityStats = {
    ...state.stats,
    totalAnswered: state.stats.totalAnswered + 1,
    totalCorrect: state.stats.totalCorrect + (input.correct ? 1 : 0),
    answeredBySubject: {
      ...state.stats.answeredBySubject,
      [input.subject]: (state.stats.answeredBySubject[input.subject] ?? 0) + 1,
    },
    correctBySubject: input.correct
      ? {
          ...state.stats.correctBySubject,
          [input.subject]: (state.stats.correctBySubject[input.subject] ?? 0) + 1,
        }
      : state.stats.correctBySubject,
    correctRun: input.correct ? state.stats.correctRun + 1 : 0,
    maxCorrectRun: input.correct
      ? Math.max(state.stats.maxCorrectRun, state.stats.correctRun + 1)
      : state.stats.maxCorrectRun,
    correctRunDay: today,
    practiceAwarded: firstToday
      ? { ...state.stats.practiceAwarded, [input.questionId]: today }
      : state.stats.practiceAwarded,
    hardTopics:
      !input.correct && input.difficulty === "hard"
        ? Array.from(new Set([input.topic, ...state.stats.hardTopics])).slice(0, MAX_HARD_TOPICS)
        : state.stats.hardTopics,
  };

  let next: CityState = {
    ...state,
    coins: state.coins + coinsAwarded,
    xp: state.xp + xpAwarded,
    stats: {
      ...stats,
      coinsEarned: state.stats.coinsEarned + coinsAwarded,
    },
    updatedAt: new Date(now).toISOString(),
  };

  // Прогрес щоденних місій.
  next = bumpMission(next, "math_10", input.subject === "math" ? 1 : 0);
  next = bumpMission(next, "correct_5", stats.correctRun, "max");
  if (input.correct && input.difficulty === "hard") {
    next = bumpMission(next, "hard_topic", 1);
  }

  next = completeMissions(next, now, messages);
  next = checkAchievements(next, now, messages);
  saveCityState(next);

  return { state: next, messages, coinsAwarded, xpAwarded };
}

/**
 * Завершення тренування: бонус за повний тест (10 завдань) один раз
 * на предмет на день, статистика та місії «пройди тест».
 */
export function recordPracticeCompletion(
  session: PracticeSession,
  now = Date.now()
): CityActionResult {
  const state = ensureToday(loadCityState(), now);
  if (state.stats.processedPractice.includes(session.id)) {
    return { state, messages: [] };
  }

  const today = dayKey(now);
  const messages: CityMessage[] = [];
  let coinsAwarded = 0;
  let xpAwarded = 0;

  const fullTest = session.count === CITY_ECONOMY.fullTestCount;
  const bonusAlreadyGiven = state.stats.testBonus[session.subject] === today;

  if (fullTest && !bonusAlreadyGiven) {
    coinsAwarded += CITY_ECONOMY.coinsPerFullTest;
    xpAwarded += CITY_ECONOMY.xpPerFullTest;
    messages.push(message("coins", `Повний тест пройдено · +${CITY_ECONOMY.coinsPerFullTest} монет`));
  }

  const allCorrect =
    session.answers.length === session.questions.length &&
    session.questions.length >= CITY_ECONOMY.subjectTestMinCount &&
    session.answers.every((answer) => answer.correct);

  let stats: CityStats = {
    ...state.stats,
    practiceSessions: state.stats.practiceSessions + 1,
    perfectSessions: state.stats.perfectSessions + (allCorrect ? 1 : 0),
    testBonus:
      fullTest && !bonusAlreadyGiven
        ? { ...state.stats.testBonus, [session.subject]: today }
        : state.stats.testBonus,
    processedPractice: [session.id, ...state.stats.processedPractice].slice(0, MAX_PROCESSED),
  };

  let next: CityState = {
    ...state,
    coins: state.coins + coinsAwarded,
    xp: state.xp + xpAwarded,
    stats: {
      ...stats,
      coinsEarned: state.stats.coinsEarned + coinsAwarded,
    },
    updatedAt: new Date(now).toISOString(),
  };

  if (session.count >= CITY_ECONOMY.subjectTestMinCount) {
    for (const def of CITY_MISSIONS) {
      if (def.kind === "complete_subject" && def.subject === session.subject) {
        next = bumpMission(next, def.id, 1);
      }
    }
  }

  next = completeMissions(next, now, messages);
  next = checkAchievements(next, now, messages);
  saveCityState(next);

  return { state: next, messages, coinsAwarded, xpAwarded };
}

/**
 * Синхронізує завершене щоденне повторення з містом.
 * Нарахування ідемпотентне за id сесії — повторний виклик нічого не додає.
 */
export function recordDailySession(
  entry: DailyHistoryEntry,
  now = Date.now()
): CityActionResult {
  const state = ensureToday(loadCityState(), now);
  if (state.stats.processedDaily.includes(entry.id)) {
    return { state, messages: [] };
  }

  const messages: CityMessage[] = [];
  let coinsAwarded = entry.correct * CITY_ECONOMY.coinsPerCorrect;
  let xpAwarded = entry.correct * CITY_ECONOMY.xpPerCorrect + CITY_ECONOMY.xpPerDailyReview;

  if (coinsAwarded > 0) {
    messages.push(message("coins", `Щоденне повторення · +${coinsAwarded} монет`));
  }

  if (entry.count === CITY_ECONOMY.fullTestCount) {
    coinsAwarded += CITY_ECONOMY.coinsPerFullTest;
    xpAwarded += CITY_ECONOMY.xpPerFullTest;
    messages.push(message("coins", `Повний тест · +${CITY_ECONOMY.coinsPerFullTest} монет`));
  }

  let stats: CityStats = {
    ...state.stats,
    dailySessions: state.stats.dailySessions + 1,
    processedDaily: [entry.id, ...state.stats.processedDaily].slice(0, MAX_PROCESSED),
  };

  // Перебираємо відповіді в тому ж порядку, щоб коректно порахувати серію.
  for (const answer of entry.answers) {
    const question = getQuestionById(answer.questionId);
    const difficulty = question?.difficulty;
    stats = {
      ...stats,
      totalAnswered: stats.totalAnswered + 1,
      totalCorrect: stats.totalCorrect + (answer.correct ? 1 : 0),
      answeredBySubject: {
        ...stats.answeredBySubject,
        [answer.subject]: (stats.answeredBySubject[answer.subject] ?? 0) + 1,
      },
      correctBySubject: answer.correct
        ? {
            ...stats.correctBySubject,
            [answer.subject]: (stats.correctBySubject[answer.subject] ?? 0) + 1,
          }
        : stats.correctBySubject,
      correctRun: answer.correct ? stats.correctRun + 1 : 0,
      maxCorrectRun: answer.correct
        ? Math.max(stats.maxCorrectRun, stats.correctRun + 1)
        : stats.maxCorrectRun,
      hardTopics:
        !answer.correct && difficulty === "hard"
          ? Array.from(new Set([answer.topic, ...stats.hardTopics])).slice(0, MAX_HARD_TOPICS)
          : stats.hardTopics,
    };
  }

  // Бонус за 7 днів серії (7, 14, 21 ...).
  const dailyState = loadDailyState();
  const streak = effectiveStreak(dailyState.profile, now);
  stats = { ...stats, bestStreak: Math.max(stats.bestStreak, streak) };

  const milestone = Math.floor(streak / 7) * 7;
  if (milestone >= 7 && !stats.streakRewarded.includes(milestone)) {
    coinsAwarded += CITY_ECONOMY.coinsPerStreak7;
    stats = {
      ...stats,
      streakRewarded: [...stats.streakRewarded, milestone],
    };
    messages.push(
      message("achievement", `Серія ${milestone} днів · +${CITY_ECONOMY.coinsPerStreak7} монет`)
    );
  }

  let next: CityState = {
    ...state,
    coins: state.coins + coinsAwarded,
    xp: state.xp + xpAwarded,
    stats: {
      ...stats,
      coinsEarned: state.stats.coinsEarned + coinsAwarded,
    },
    updatedAt: new Date(now).toISOString(),
  };

  // Місії, які можна виконати під час змішаного повторення.
  for (const answer of entry.answers) {
    if (answer.subject === "math") next = bumpMission(next, "math_10", 1);
    if (answer.correct) {
      const question = getQuestionById(answer.questionId);
      if (question?.difficulty === "hard") next = bumpMission(next, "hard_topic", 1);
    }
  }
  next = bumpMission(next, "correct_5", stats.maxCorrectRun, "max");

  next = completeMissions(next, now, messages);
  next = checkAchievements(next, now, messages);
  saveCityState(next);

  return { state: next, messages, coinsAwarded, xpAwarded };
}

/** Скидання міста — використовується лише в налаштуваннях/тестах. */
export function resetCity(now = Date.now()): CityState {
  const state = defaultState(now);
  saveCityState(state);
  return state;
}
