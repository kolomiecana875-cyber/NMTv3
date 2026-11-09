import { useState, type ReactNode } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Award,
  BarChart3,
  BookOpen,
  Building2,
  CalendarDays,
  CheckCircle2,
  Coins,
  Flame,
  GraduationCap,
  Lock,
  Play,
  Sparkles,
  Target,
  TrendingUp,
  Trophy,
  Users,
} from "lucide-react";
import type { BuildingType, PracticeSession } from "@/types";
import type { CityApi } from "@/hooks/useCity";
import {
  BUILDINGS,
  CITY_ACHIEVEMENTS,
  CITY_ECONOMY,
  CITY_MISSIONS,
  CITY_SUBJECTS,
  buildingsUnlockedAt,
} from "@/lib/cityConfig";
import { SUBJECTS } from "@/data/subjects";
import { pluralBuildings, pluralCoins, pluralPeople } from "@/lib/cityPlural";
import { CityMap } from "@/components/city/CityMap";
import { BuildModal } from "@/components/city/BuildModal";
import { BuildingModal } from "@/components/city/BuildingModal";

interface Props {
  city: CityApi;
  activePractice: PracticeSession | null;
  onHome: () => void;
  onStartPractice: () => void;
  onResumePractice: () => void;
}

export function CityScreen({
  city,
  activePractice,
  onHome,
  onStartPractice,
  onResumePractice,
}: Props) {
  const { state, derived } = city;
  const [buildPlot, setBuildPlot] = useState<number | null>(null);
  const [activeBuildingId, setActiveBuildingId] = useState<string | null>(null);

  const activeBuilding = state.buildings.find((building) => building.id === activeBuildingId) ?? null;
  const nextUnlocks = buildingsUnlockedAt(derived.level + 1);

  function handleBuild(type: BuildingType, plot: number): boolean {
    const result = city.place(type, plot);
    return !result.messages.some((message) => message.kind === "error");
  }

  function handleUpgrade(id: string): boolean {
    const result = city.upgrade(id);
    return !result.messages.some((message) => message.kind === "error");
  }

  function handleDemolish(id: string): boolean {
    const result = city.demolish(id);
    return !result.messages.some((message) => message.kind === "error");
  }

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <button
          onClick={onHome}
          className="inline-flex items-center gap-2 rounded-xl bg-white/80 px-3.5 py-2 text-sm font-bold text-slate-700 shadow-sm ring-1 ring-slate-200/70 backdrop-blur transition hover:bg-white"
        >
          <ArrowLeft className="h-4 w-4" />
          На головну
        </button>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-extrabold text-amber-700 ring-1 ring-amber-200/80">
            <Coins className="h-3.5 w-3.5" />
            {state.coins} {pluralCoins(state.coins)}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-50 px-3 py-1.5 text-xs font-extrabold text-violet-700 ring-1 ring-violet-200/80">
            <Trophy className="h-3.5 w-3.5" />
            Рівень {derived.level}
          </span>
        </div>
      </div>

      {/* Hero */}
      <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-emerald-700 via-teal-700 to-cyan-700 p-5 text-white shadow-[0_24px_70px_-30px_rgba(6,78,59,0.65)] sm:p-7">
        <div className="pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full bg-emerald-300/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-16 h-64 w-64 rounded-full bg-cyan-300/20 blur-3xl" />

        <div className="relative flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-100/80">
              Навчайся · заробляй · будуй
            </p>
            <h1 className="mt-1 text-2xl font-black tracking-tight sm:text-3xl">
              Побудуй своє місто
            </h1>
            <p className="mt-1 max-w-lg text-sm text-emerald-50/80">
              Кожна правильна відповідь — це монети й досвід. Витрачай їх на будинки,
              школи, парки та цілий університет.
            </p>
          </div>

          <div className="rounded-2xl bg-white/12 px-4 py-3 text-center ring-1 ring-white/20 backdrop-blur">
            <div className="flex items-center justify-center gap-1.5">
              <Trophy className="h-4 w-4 text-amber-300" />
              <span className="text-2xl font-black">{derived.level}</span>
            </div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-100/70">
              Рівень міста
            </p>
          </div>
        </div>

        <div className="relative mt-5 rounded-2xl bg-white/10 p-3.5 ring-1 ring-white/15 backdrop-blur">
          <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2 text-[11px] font-bold text-emerald-50/85">
            <span className="inline-flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-amber-200" />
              {derived.nextLevelXp === null
                ? "Максимальний рівень"
                : `До рівня ${derived.level + 1}: ${Math.max(
                    0,
                    (derived.nextLevelXp ?? derived.xp) - derived.xp
                  )} XP`}
            </span>
            <span>
              {derived.xpIntoLevel}/{derived.xpForLevel} XP
            </span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-white/20">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-300 via-yellow-300 to-lime-300 transition-all duration-700"
              style={{ width: `${derived.percent}%` }}
            />
          </div>
        </div>

        <div className="relative mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          <HeroStat icon={<Coins className="h-4 w-4 text-amber-200" />} value={state.coins} label="Монети" />
          <HeroStat icon={<Users className="h-4 w-4 text-emerald-200" />} value={derived.population} label="Населення" />
          <HeroStat icon={<Building2 className="h-4 w-4 text-cyan-200" />} value={derived.buildingCount} label="Будівлі" />
          <HeroStat icon={<TrendingUp className="h-4 w-4 text-lime-200" />} value={state.xp} label="XP міста" />
        </div>

        <div className="relative mt-3 rounded-xl bg-white/10 px-3 py-2 text-[11px] font-semibold text-emerald-50/80 ring-1 ring-white/10">
          {nextUnlocks.length > 0 ? (
            <>
              🔓 На рівні {derived.level + 1} відкриється:{" "}
              <span className="font-bold text-white">
                {nextUnlocks.map((def) => def.name).join(", ")}
              </span>
            </>
          ) : (
            <>🏆 Усі будівлі вже відкрито — розвивай місто далі!</>
          )}
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <section className="rounded-[2rem] bg-white/85 p-4 shadow-sm ring-1 ring-slate-200/70 backdrop-blur sm:p-5">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-emerald-600" />
                  <h2 className="text-sm font-extrabold text-slate-800">Твоє місто</h2>
                </div>
                <p className="mt-0.5 text-[11px] text-slate-500">
                  {derived.buildingCount} з {derived.maxBuildings} ділянок зайнято ·{" "}
                  {derived.population} {pluralPeople(derived.population)}
                </p>
              </div>
              <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700 ring-1 ring-emerald-100">
                Натисни на ділянку
              </span>
            </div>

            <CityMap
              city={state}
              onPlotClick={(plot) => setBuildPlot(plot)}
              onBuildingClick={(building) => setActiveBuildingId(building.id)}
            />

            <div className="mt-3 flex flex-wrap gap-2 text-[10px] font-semibold text-slate-500">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-emerald-700 ring-1 ring-emerald-100">
                <span className="h-2 w-2 rounded-full bg-emerald-400" /> Вільна ділянка
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-slate-600 ring-1 ring-slate-200">
                <span className="h-2 w-2 rounded-full bg-slate-400" /> Зайнята ділянка
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-50 px-2.5 py-1 text-violet-700 ring-1 ring-violet-100">
                <span className="h-2 w-2 rounded-full bg-violet-400" /> Бейдж рівня будівлі
              </span>
            </div>
          </section>

          <section className="rounded-[2rem] bg-white/85 p-4 shadow-sm ring-1 ring-slate-200/70 backdrop-blur sm:p-5">
            <div className="mb-3 flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-cyan-600" />
              <h2 className="text-sm font-extrabold text-slate-800">Каталог будівель</h2>
            </div>
            <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
              {BUILDINGS.map((def) => {
                const count = state.buildings.filter((building) => building.type === def.type).length;
                const locked = def.unlockLevel > derived.level;
                return (
                  <div
                    key={def.type}
                    className={`rounded-2xl border p-3 transition ${
                      locked
                        ? "border-slate-200 bg-slate-50/70 opacity-75"
                        : "border-slate-200 bg-white hover:border-emerald-200 hover:bg-emerald-50/20"
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <span
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-lg"
                        style={{ backgroundColor: `${def.accent}22` }}
                      >
                        {def.emoji}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <p className="truncate text-xs font-extrabold text-slate-800">{def.name}</p>
                          {locked ? (
                            <Lock className="h-3 w-3 shrink-0 text-slate-400" />
                          ) : (
                            <span className="shrink-0 rounded-full bg-slate-100 px-1.5 py-0.5 text-[9px] font-bold text-slate-500">
                              ×{count}
                            </span>
                          )}
                        </div>
                        <p className="mt-0.5 text-[10px] font-semibold text-slate-400">
                          {locked ? `Рівень ${def.unlockLevel}` : `${def.baseCost} монет`}
                          {def.population > 0 && !locked ? ` · +${def.population} людей` : ""}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        <div className="space-y-4">
          {/* Practice CTA */}
          <section className="overflow-hidden rounded-[2rem] bg-gradient-to-br from-violet-600 via-fuchsia-600 to-cyan-500 p-5 text-white shadow-xl shadow-violet-600/15">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-amber-200" />
              <h2 className="text-sm font-extrabold">Заробляй на навчанні</h2>
            </div>
            {activePractice ? (
              <div className="mt-3">
                <p className="text-xs font-semibold text-white/80">
                  У тебе є незавершене тренування:{" "}
                  <span className="font-bold text-white">
                    {SUBJECTS.find((subject) => subject.id === activePractice.subject)?.label ??
                      "НМТ"}
                  </span>
                </p>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/20">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-amber-300 to-lime-300 transition-all duration-500"
                    style={{
                      width: `${(activePractice.answers.length / activePractice.questions.length) * 100}%`,
                    }}
                  />
                </div>
                <button
                  onClick={onResumePractice}
                  className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-violet-700 shadow-lg transition hover:bg-violet-50 active:scale-[0.99]"
                >
                  <Play className="h-4 w-4" />
                  Продовжити тренування
                </button>
              </div>
            ) : (
              <>
                <p className="mt-2 text-xs leading-relaxed text-white/80">
                  Обери предмет і кількість завдань. За кожну правильну відповідь —{" "}
                  <span className="font-bold text-amber-200">
                    +{CITY_ECONOMY.coinsPerCorrect} монет
                  </span>
                  , за повний тест — ще{" "}
                  <span className="font-bold text-amber-200">
                    +{CITY_ECONOMY.coinsPerFullTest}
                  </span>
                  .
                </p>
                <button
                  onClick={onStartPractice}
                  className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-violet-700 shadow-lg transition hover:bg-violet-50 active:scale-[0.99]"
                >
                  <Play className="h-4 w-4" />
                  Обрати тренування
                </button>
              </>
            )}
            <div className="mt-3 grid grid-cols-2 gap-2">
              <div className="rounded-xl bg-white/10 px-2.5 py-2 text-center ring-1 ring-white/15">
                <p className="text-sm font-black text-amber-200">+{CITY_ECONOMY.coinsPerCorrect}</p>
                <p className="text-[9px] font-bold uppercase tracking-wider text-white/60">
                  за відповідь
                </p>
              </div>
              <div className="rounded-xl bg-white/10 px-2.5 py-2 text-center ring-1 ring-white/15">
                <p className="text-sm font-black text-amber-200">+{CITY_ECONOMY.coinsPerFullTest}</p>
                <p className="text-[9px] font-bold uppercase tracking-wider text-white/60">
                  за повний тест
                </p>
              </div>
            </div>
          </section>

          {/* Missions */}
          <section className="rounded-[2rem] bg-white/85 p-4 shadow-sm ring-1 ring-slate-200/70 backdrop-blur sm:p-5">
            <div className="mb-3 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-rose-500" />
                <h2 className="text-sm font-extrabold text-slate-800">Щоденні місії</h2>
              </div>
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-500">
                <CalendarDays className="h-3 w-3" />
                Щодня
              </span>
            </div>

            <div className="space-y-2.5">
              {CITY_MISSIONS.map((mission) => {
                const item = state.missions.items[mission.id];
                const progress = item?.progress ?? 0;
                const done = progress >= mission.target;
                const percent = Math.min(100, Math.round((progress / mission.target) * 100));
                return (
                  <div
                    key={mission.id}
                    className={`rounded-2xl border p-3 transition ${
                      done
                        ? "border-emerald-200 bg-emerald-50/60"
                        : "border-slate-200 bg-white"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="flex items-center gap-1.5 text-xs font-extrabold text-slate-800">
                          {done && <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-500" />}
                          {mission.title}
                        </p>
                        <p className="mt-0.5 text-[10px] leading-snug text-slate-500">
                          {mission.description}
                        </p>
                      </div>
                      <span
                        className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-bold ${
                          done
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-amber-50 text-amber-700"
                        }`}
                      >
                        +{mission.rewardCoins} 🪙
                      </span>
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            done
                              ? "bg-gradient-to-r from-emerald-400 to-teal-400"
                              : "bg-gradient-to-r from-amber-400 to-orange-400"
                          }`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-bold text-slate-500">
                        {Math.min(progress, mission.target)}/{mission.target}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Achievements */}
        <section className="rounded-[2rem] bg-white/85 p-4 shadow-sm ring-1 ring-slate-200/70 backdrop-blur sm:p-5">
          <div className="mb-3 flex items-center gap-2">
            <Award className="h-4 w-4 text-amber-500" />
            <h2 className="text-sm font-extrabold text-slate-800">Досягнення</h2>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500">
              {Object.keys(state.achievements).length}/{CITY_ACHIEVEMENTS.length}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-2">
            {CITY_ACHIEVEMENTS.map((achievement) => {
              const unlockedAt = state.achievements[achievement.id];
              return (
                <div
                  key={achievement.id}
                  className={`rounded-2xl border p-3 transition ${
                    unlockedAt
                      ? "border-amber-200 bg-gradient-to-br from-amber-50 to-white"
                      : "border-slate-200 bg-slate-50/70"
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <span
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-lg ${
                        unlockedAt ? "bg-amber-100" : "bg-slate-200 grayscale"
                      }`}
                    >
                      {achievement.emoji}
                    </span>
                    <div className="min-w-0">
                      <p
                        className={`truncate text-[11px] font-extrabold ${
                          unlockedAt ? "text-slate-800" : "text-slate-500"
                        }`}
                      >
                        {achievement.title}
                      </p>
                      <p className="mt-0.5 text-[10px] leading-snug text-slate-400">
                        {achievement.description}
                      </p>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-[9px] font-bold">
                    <span className="text-amber-600">+{achievement.rewardCoins} 🪙</span>
                    {unlockedAt ? (
                      <span className="text-emerald-600">Отримано</span>
                    ) : (
                      <span className="text-slate-400">Закрито</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Stats */}
        <section className="rounded-[2rem] bg-white/85 p-4 shadow-sm ring-1 ring-slate-200/70 backdrop-blur sm:p-5">
          <div className="mb-3 flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-cyan-600" />
            <h2 className="text-sm font-extrabold text-slate-800">Статистика розвитку</h2>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <StatBox value={state.stats.coinsEarned} label="Зароблено" />
            <StatBox value={state.stats.coinsSpent} label="Витрачено" />
            <StatBox
              value={
                state.stats.totalAnswered > 0
                  ? `${Math.round((state.stats.totalCorrect / state.stats.totalAnswered) * 100)}%`
                  : "—"
              }
              label="Точність"
            />
            <StatBox value={state.stats.maxCorrectRun} label="Макс. серія" />
            <StatBox value={state.stats.totalCorrect} label="Правильних" />
            <StatBox value={state.stats.practiceSessions} label="Тренувань" />
            <StatBox value={state.stats.dailySessions} label="Повторень" />
            <StatBox value={state.stats.perfectSessions} label="Ідеальних" />
          </div>

          <div className="mt-4">
            <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Точність за предметами
            </p>
            <div className="space-y-2">
              {CITY_SUBJECTS.map((subjectId) => {
                const meta = SUBJECTS.find((subject) => subject.id === subjectId);
                const answered = state.stats.answeredBySubject[subjectId] ?? 0;
                const correct = state.stats.correctBySubject[subjectId] ?? 0;
                const percent = answered > 0 ? Math.round((correct / answered) * 100) : 0;
                return (
                  <div key={subjectId}>
                    <div className="mb-1 flex items-center justify-between text-[10px] font-bold">
                      <span className="text-slate-600">
                        {meta?.emoji ?? "📚"} {meta?.label ?? subjectId}
                      </span>
                      <span className="text-slate-400">
                        {answered > 0 ? `${correct}/${answered} · ${percent}%` : "ще немає"}
                      </span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${percent}%`,
                          backgroundColor: meta?.color ?? "#64748b",
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {state.stats.hardTopics.length > 0 && (
            <div className="mt-4">
              <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Складні теми
              </p>
              <div className="flex flex-wrap gap-1.5">
                {state.stats.hardTopics.map((topic) => (
                  <span
                    key={topic}
                    className="rounded-full bg-rose-50 px-2 py-1 text-[10px] font-bold text-rose-600 ring-1 ring-rose-100"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="mt-4 flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 text-[10px] font-semibold text-slate-500 ring-1 ring-slate-200/70">
            <Flame className="h-3.5 w-3.5 text-orange-500" />
            Найдовша серія: {state.stats.bestStreak} дн. · Монет зароблено за весь час:{" "}
            {state.stats.coinsEarned}
          </div>
        </section>
      </div>

      {buildPlot !== null && (
        <BuildModal
          plot={buildPlot}
          city={state}
          level={derived.level}
          onClose={() => setBuildPlot(null)}
          onBuild={handleBuild}
        />
      )}

      {activeBuilding && (
        <BuildingModal
          building={activeBuilding}
          city={state}
          onClose={() => setActiveBuildingId(null)}
          onUpgrade={handleUpgrade}
          onDemolish={handleDemolish}
        />
      )}
    </div>
  );
}

function HeroStat({
  icon,
  value,
  label,
}: {
  icon: ReactNode;
  value: string | number;
  label: string;
}) {
  return (
    <div className="rounded-xl bg-white/10 px-2.5 py-2 ring-1 ring-white/15">
      <div className="mb-0.5 flex items-center gap-1.5">
        {icon}
        <span className="text-base font-black leading-none">{value}</span>
      </div>
      <p className="text-[9px] font-bold uppercase tracking-wider text-emerald-100/70">{label}</p>
    </div>
  );
}

function StatBox({ value, label }: { value: string | number; label: string }) {
  return (
    <div className="rounded-xl bg-slate-50 p-2.5 text-center ring-1 ring-slate-200/70">
      <p className="text-base font-extrabold leading-none text-slate-900">{value}</p>
      <p className="mt-1 text-[9px] font-semibold text-slate-400">{label}</p>
    </div>
  );
}
