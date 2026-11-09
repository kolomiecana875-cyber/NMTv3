import type {
  AchievementDef,
  BuildingDef,
  BuildingType,
  MissionDef,
  Subject,
} from "@/types";

/* ------------------------------------------------------------------ */
/*  Економіка                                                          */
/* ------------------------------------------------------------------ */

/**
 * Усі значення економіки зібрані в одному місці — їх легко змінити,
 * не торкаючись логіки нарахування.
 */
export const CITY_ECONOMY = {
  /** Стартовий баланс нового міста. */
  startingCoins: 150,
  /** +10 монет за кожну правильну відповідь. */
  coinsPerCorrect: 10,
  /** +50 монет за пройдений повний тест (10 завдань). */
  coinsPerFullTest: 50,
  /** +100 монет за кожні 7 днів серії. */
  coinsPerStreak7: 100,
  /** +30 монет за виконану щоденну місію. */
  coinsPerDailyTask: 30,
  /** Досвід міста за правильну відповідь. */
  xpPerCorrect: 2,
  /** Досвід міста за повний тест. */
  xpPerFullTest: 20,
  /** Досвід міста за завершене щоденне повторення. */
  xpPerDailyReview: 10,
  /** Частка вартості, яку повертають за знесену будівлю. */
  sellRefundRate: 0.5,
  /** Повний тест — це набір із 10 завдань. */
  fullTestCount: 10,
  /** Мінімальна кількість завдань, щоб тренування предмета зарахувалось місії. */
  subjectTestMinCount: 5,
} as const;

export const CITY_SUBJECTS: Subject[] = ["ukrainian", "math", "history", "english"];

/* ------------------------------------------------------------------ */
/*  Рівні міста                                                        */
/* ------------------------------------------------------------------ */

export const CITY_MAX_LEVEL = 10;

/** Поріг XP для кожного рівня (індекс = рівень - 1). */
export const LEVEL_THRESHOLDS = [0, 220, 620, 1200, 2000, 3000, 4300, 5900, 7800, 10000];

export function cityLevelForXp(xp: number): number {
  let level = 1;
  for (let index = 0; index < LEVEL_THRESHOLDS.length; index += 1) {
    if (xp >= LEVEL_THRESHOLDS[index]) level = index + 1;
  }
  return Math.min(CITY_MAX_LEVEL, level);
}

export interface CityLevelProgress {
  level: number;
  maxLevel: number;
  currentLevelXp: number;
  nextLevelXp: number | null;
  xpIntoLevel: number;
  xpForLevel: number;
  percent: number;
}

export function cityLevelProgress(xp: number): CityLevelProgress {
  const level = cityLevelForXp(xp);
  const currentLevelXp = LEVEL_THRESHOLDS[level - 1] ?? 0;
  const nextLevelXp = level >= CITY_MAX_LEVEL ? null : LEVEL_THRESHOLDS[level] ?? null;
  const xpIntoLevel = Math.max(0, xp - currentLevelXp);
  const xpForLevel = nextLevelXp === null ? 0 : Math.max(1, nextLevelXp - currentLevelXp);
  const percent = nextLevelXp === null ? 100 : Math.min(100, Math.round((xpIntoLevel / xpForLevel) * 100));
  return { level, maxLevel: CITY_MAX_LEVEL, currentLevelXp, nextLevelXp, xpIntoLevel, xpForLevel, percent };
}

/* ------------------------------------------------------------------ */
/*  Будівлі                                                            */
/* ------------------------------------------------------------------ */

export const BUILDINGS: BuildingDef[] = [
  {
    type: "house",
    name: "Житловий будинок",
    shortName: "Будинок",
    description: "Перше житло для мешканців твого міста. Кожен рівень додає поверх і людей.",
    emoji: "🏠",
    baseCost: 120,
    population: 8,
    xp: 30,
    maxLevel: 3,
    unlockLevel: 1,
    accent: "#f59e0b",
  },
  {
    type: "park",
    name: "Міський парк",
    shortName: "Парк",
    description: "Зелене серце міста: дерева, ставок і місце для відпочинку.",
    emoji: "🌳",
    baseCost: 90,
    population: 0,
    xp: 20,
    maxLevel: 3,
    unlockLevel: 1,
    accent: "#22c55e",
  },
  {
    type: "road",
    name: "Дорога",
    shortName: "Дорога",
    description: "З'єднує райони міста. Дороги можна ставити будь-де на карті.",
    emoji: "🛣️",
    baseCost: 30,
    population: 0,
    xp: 5,
    maxLevel: 1,
    unlockLevel: 1,
    accent: "#64748b",
  },
  {
    type: "decoration",
    name: "Прикраса",
    shortName: "Фонтан",
    description: "Фонтан із квітами — маленька деталь, яка робить місто затишним.",
    emoji: "⛲",
    baseCost: 60,
    population: 0,
    xp: 8,
    maxLevel: 2,
    unlockLevel: 1,
    accent: "#38bdf8",
  },
  {
    type: "shop",
    name: "Магазин",
    shortName: "Магазин",
    description: "Крамниця з яскравим дашком. Дає місту трохи населення й доходу.",
    emoji: "🛍️",
    baseCost: 180,
    population: 4,
    xp: 45,
    maxLevel: 3,
    unlockLevel: 2,
    accent: "#ef4444",
  },
  {
    type: "library",
    name: "Бібліотека",
    shortName: "Бібліотека",
    description: "Тиша, колони й книги. Місце, де народжуються найкращі ідеї.",
    emoji: "📚",
    baseCost: 220,
    population: 3,
    xp: 55,
    maxLevel: 3,
    unlockLevel: 2,
    accent: "#8b5cf6",
  },
  {
    type: "school",
    name: "Школа",
    shortName: "Школа",
    description: "Світлі класи, дзвінок і прапор. Тут ростуть майбутні абітурієнти.",
    emoji: "🏫",
    baseCost: 280,
    population: 6,
    xp: 70,
    maxLevel: 3,
    unlockLevel: 3,
    accent: "#0ea5e9",
  },
  {
    type: "stadium",
    name: "Стадіон",
    shortName: "Стадіон",
    description: "Трибуни, поле й прожектори. Місто, яке вміє вболівати.",
    emoji: "🏟️",
    baseCost: 380,
    population: 10,
    xp: 90,
    maxLevel: 3,
    unlockLevel: 3,
    accent: "#f97316",
  },
  {
    type: "university",
    name: "Університет",
    shortName: "Університет",
    description: "Велична будівля з куполом. Символ освіченого міста.",
    emoji: "🎓",
    baseCost: 600,
    population: 18,
    xp: 140,
    maxLevel: 3,
    unlockLevel: 4,
    accent: "#6366f1",
  },
];

const BUILDING_MAP = new Map<BuildingType, BuildingDef>(BUILDINGS.map((def) => [def.type, def]));

export function getBuildingDef(type: BuildingType): BuildingDef | undefined {
  return BUILDING_MAP.get(type);
}

/** Населення будівлі з урахуванням рівня. */
export function buildingPopulation(def: BuildingDef, level: number): number {
  if (def.population <= 0) return 0;
  return Math.round(def.population * (1 + (Math.max(1, level) - 1) * 0.75));
}

/** XP за будівлю на конкретному рівні. */
export function buildingXp(def: BuildingDef, level: number): number {
  return Math.round(def.xp * (1 + (Math.max(1, level) - 1) * 0.6));
}

/** Вартість наступного покращення. */
export function upgradeCost(def: BuildingDef, currentLevel: number): number {
  return Math.round(def.baseCost * (0.75 + currentLevel * 0.45));
}

/** Скільки всього монет вкладено в будівлю (для продажу). */
export function totalInvested(def: BuildingDef, level: number): number {
  let total = def.baseCost;
  for (let current = 1; current < level; current += 1) {
    total += upgradeCost(def, current);
  }
  return total;
}

export const PLOT_COLS = 7;
export const PLOT_ROWS = 5;
export const PLOT_COUNT = PLOT_COLS * PLOT_ROWS;

/* ------------------------------------------------------------------ */
/*  Щоденні місії                                                      */
/* ------------------------------------------------------------------ */

export const CITY_MISSIONS: MissionDef[] = [
  {
    id: "math_10",
    title: "Математичний марафон",
    description: "Дай відповіді на 10 завдань з математики",
    target: 10,
    rewardCoins: CITY_ECONOMY.coinsPerDailyTask,
    rewardXp: 40,
    kind: "answer_subject",
    subject: "math",
  },
  {
    id: "history_test",
    title: "Іспит з історії",
    description: "Пройди тренування з історії України на 5+ завдань",
    target: 1,
    rewardCoins: CITY_ECONOMY.coinsPerDailyTask,
    rewardXp: 50,
    kind: "complete_subject",
    subject: "history",
  },
  {
    id: "correct_5",
    title: "Серія з п'яти",
    description: "Дай 5 правильних відповідей поспіль",
    target: 5,
    rewardCoins: CITY_ECONOMY.coinsPerDailyTask,
    rewardXp: 40,
    kind: "correct_run",
  },
  {
    id: "hard_topic",
    title: "Складна тема",
    description: "Правильно розв'яжи 3 складні завдання",
    target: 3,
    rewardCoins: CITY_ECONOMY.coinsPerDailyTask,
    rewardXp: 45,
    kind: "hard_topic",
  },
  {
    id: "english_training",
    title: "English training",
    description: "Пройди тренування з англійської на 5+ завдань",
    target: 1,
    rewardCoins: CITY_ECONOMY.coinsPerDailyTask,
    rewardXp: 50,
    kind: "complete_subject",
    subject: "english",
  },
];

export const MISSION_MAP = new Map<string, MissionDef>(CITY_MISSIONS.map((mission) => [mission.id, mission]));

/* ------------------------------------------------------------------ */
/*  Досягнення                                                         */
/* ------------------------------------------------------------------ */

export const CITY_ACHIEVEMENTS: AchievementDef[] = [
  {
    id: "first_building",
    title: "Перший камінь",
    description: "Побудуй першу будівлю",
    emoji: "🏠",
    rewardCoins: 20,
    rewardXp: 15,
  },
  {
    id: "five_buildings",
    title: "Молоде містечко",
    description: "Побудуй 5 будівель",
    emoji: "🏘️",
    rewardCoins: 40,
    rewardXp: 30,
  },
  {
    id: "twelve_buildings",
    title: "Розбудова",
    description: "Побудуй 12 будівель",
    emoji: "🏙️",
    rewardCoins: 80,
    rewardXp: 60,
  },
  {
    id: "first_upgrade",
    title: "Оновлення",
    description: "Покращ будь-яку будівлю",
    emoji: "⬆️",
    rewardCoins: 25,
    rewardXp: 20,
  },
  {
    id: "city_level_3",
    title: "Місто росте",
    description: "Досягни 3 рівня міста",
    emoji: "🌟",
    rewardCoins: 50,
    rewardXp: 0,
  },
  {
    id: "city_level_5",
    title: "Мегаполіс",
    description: "Досягни 5 рівня міста",
    emoji: "🌆",
    rewardCoins: 120,
    rewardXp: 0,
  },
  {
    id: "correct_50",
    title: "Півсотні",
    description: "Дай 50 правильних відповідей",
    emoji: "✅",
    rewardCoins: 40,
    rewardXp: 30,
  },
  {
    id: "correct_200",
    title: "Двісті",
    description: "Дай 200 правильних відповідей",
    emoji: "💯",
    rewardCoins: 120,
    rewardXp: 80,
  },
  {
    id: "perfect_test",
    title: "Без помилок",
    description: "Пройди тренування на 100%",
    emoji: "🎯",
    rewardCoins: 50,
    rewardXp: 40,
  },
  {
    id: "streak_7",
    title: "Тиждень поспіль",
    description: "7 днів щоденного повторення",
    emoji: "🔥",
    rewardCoins: 100,
    rewardXp: 0,
  },
];

export const ACHIEVEMENT_MAP = new Map<string, AchievementDef>(
  CITY_ACHIEVEMENTS.map((achievement) => [achievement.id, achievement])
);

/** Будівлі, які відкриються на вказаному рівні. */
export function buildingsUnlockedAt(level: number): BuildingDef[] {
  return BUILDINGS.filter((def) => def.unlockLevel === level);
}
