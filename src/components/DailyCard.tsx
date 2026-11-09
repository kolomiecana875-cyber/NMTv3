import { useState, type ReactNode } from "react";
import {
  ArrowRight,
  CalendarCheck2,
  CheckCircle2,
  Clock3,
  Flame,
  LockKeyhole,
  Sparkles,
  Star,
  Target,
  Trophy,
} from "lucide-react";
import type { DailyCount } from "@/types";
import type { DailySystemApi } from "@/hooks/useDailySystem";
import { pluralDays, pluralQuestions, pluralStars, topicsToReview } from "@/lib/daily";
import { Countdown } from "@/components/Countdown";

interface Props {
  daily: DailySystemApi;
  onStart: (count: DailyCount) => void;
  onContinue: () => void;
  onProfile: () => void;
}

const OPTIONS: Array<{
  count: DailyCount;
  title: string;
  hint: string;
  minutes: string;
  accent: string;
}> = [
  {
    count: 3,
    title: "Швидкий старт",
    hint: "Коротка розминка",
    minutes: "≈ 2 хв",
    accent: "from-cyan-500 to-sky-600",
  },
  {
    count: 5,
    title: "Оптимально",
    hint: "Баланс часу й користі",
    minutes: "≈ 4 хв",
    accent: "from-violet-500 to-fuchsia-600",
  },
  {
    count: 10,
    title: "Глибоке повторення",
    hint: "Максимум за день",
    minutes: "≈ 8 хв",
    accent: "from-amber-500 to-orange-600",
  },
];

export function DailyCard({ daily, onStart, onContinue, onProfile }: Props) {
  const [selected, setSelected] = useState<DailyCount>(5);
  const active = daily.activeSession;
  const locked = daily.isLocked && !active;
  const latest = daily.latestResult;
  const weakTopics = topicsToReview(latest).slice(0, 3);

  return (
    <section className="relative overflow-hidden rounded-[2rem] bg-white p-5 shadow-[0_24px_70px_-30px_rgba(15,23,42,0.35)] ring-1 ring-slate-200/70 sm:p-7">
      <div className="pointer-events-none absolute -right-20 -top-24 h-56 w-56 rounded-full bg-violet-200/50 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-16 h-56 w-56 rounded-full bg-cyan-200/50 blur-3xl" />

      <div className="relative">
        <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-cyan-500 shadow-lg shadow-violet-500/25">
              <CalendarCheck2 className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl font-extrabold tracking-tight text-slate-900">
                  Щоденне повторення
                </h2>
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-600">
                  1 раз на 24 год
                </span>
              </div>
              <p className="mt-0.5 text-sm text-slate-500">
                Обери 3, 5 або 10 завдань — і тримай серію щодня.
              </p>
            </div>
          </div>
        </div>

        <div className="mb-6 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
          <StatCard
            icon={<Star className="h-4 w-4 text-amber-500" />}
            value={daily.state.profile.totalStars}
            label="Усього зірок"
            tone="bg-amber-50"
          />
          <StatCard
            icon={<Flame className="h-4 w-4 text-orange-500" />}
            value={`${daily.displayStreak} ${pluralDays(daily.displayStreak)}`}
            label="Поточний вогник"
            tone="bg-orange-50"
          />
          <StatCard
            icon={<Trophy className="h-4 w-4 text-violet-500" />}
            value={`${daily.state.profile.longestStreak} ${pluralDays(daily.state.profile.longestStreak)}`}
            label="Рекорд серії"
            tone="bg-violet-50"
          />
          <StatCard
            icon={<CheckCircle2 className="h-4 w-4 text-emerald-500" />}
            value={daily.state.profile.totalSessions}
            label="Пройдено разів"
            tone="bg-emerald-50"
          />
        </div>

        {active && (
          <div className="rounded-2xl border border-violet-200 bg-violet-50/70 p-5">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-sm font-bold text-violet-900">У тебе є незавершене повторення</p>
                <p className="text-xs text-violet-700">
                  {active.answers.length} з {active.count} завдань уже пройдено
                </p>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-bold text-violet-700 ring-1 ring-violet-200">
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                {active.count} {pluralStars(active.count)}
              </span>
            </div>
            <div className="mb-4 h-2.5 overflow-hidden rounded-full bg-white ring-1 ring-violet-100">
              <div
                className="h-full rounded-full bg-gradient-to-r from-violet-600 to-cyan-500 transition-all duration-500"
                style={{ width: `${(active.answers.length / active.count) * 100}%` }}
              />
            </div>
            <button
              onClick={onContinue}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-violet-500/20 transition hover:brightness-105 active:scale-[0.99]"
            >
              Продовжити повторення
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}

        {locked && (
          <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="mb-1 flex items-center gap-2">
                  <LockKeyhole className="h-4 w-4 text-slate-500" />
                  <p className="text-sm font-bold text-slate-800">Сьогоднішнє повторення завершено</p>
                </div>
                <p className="text-xs text-slate-500">
                  Наступний набір відкриється рівно через 24 години.
                </p>
              </div>
              <div className="text-right">
                <p className="mb-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  До наступного старту
                </p>
                <Countdown target={daily.state.nextAvailableAt} />
              </div>
            </div>

            {latest && (
              <div className="mt-4 grid grid-cols-3 gap-2 rounded-xl bg-white p-3 ring-1 ring-slate-200/70">
                <div className="text-center">
                  <p className="text-lg font-extrabold text-slate-900">
                    {latest.correct}/{latest.count}
                  </p>
                  <p className="text-[11px] font-semibold text-slate-500">Правильних</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-extrabold text-amber-600">+{latest.stars} ⭐</p>
                  <p className="text-[11px] font-semibold text-slate-500">Зірок</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-extrabold text-orange-600">
                    🔥 {daily.displayStreak}
                  </p>
                  <p className="text-[11px] font-semibold text-slate-500">Серія</p>
                </div>
              </div>
            )}

            {weakTopics.length > 0 && (
              <div className="mt-3">
                <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Варто повторити
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {weakTopics.map((topic) => (
                    <span
                      key={`${topic.subject}-${topic.topic}`}
                      className="rounded-full bg-rose-50 px-2.5 py-1 text-[11px] font-semibold text-rose-700 ring-1 ring-rose-100"
                    >
                      {topic.topic}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={onProfile}
              className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-violet-700 transition hover:text-violet-900"
            >
              Переглянути профіль
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}

        {!active && !locked && (
          <div>
            <div className="mb-3 flex items-center gap-2">
              <Target className="h-4 w-4 text-violet-500" />
              <p className="text-sm font-bold text-slate-800">Скільки завдань на сьогодні?</p>
            </div>

            <div className="grid gap-2.5 sm:grid-cols-3">
              {OPTIONS.map((option) => {
                const isSelected = selected === option.count;
                return (
                  <button
                    key={option.count}
                    onClick={() => setSelected(option.count)}
                    className={`group relative overflow-hidden rounded-2xl border-2 p-4 text-left transition ${
                      isSelected
                        ? "border-transparent bg-slate-900 text-white shadow-xl shadow-slate-900/20"
                        : "border-slate-200 bg-white text-slate-800 hover:border-violet-300 hover:bg-violet-50/40"
                    }`}
                    aria-pressed={isSelected}
                  >
                    <div
                      className={`absolute -right-6 -top-8 h-20 w-20 rounded-full bg-gradient-to-br ${option.accent} opacity-20 blur-xl`}
                    />
                    <div className="relative flex items-start justify-between gap-2">
                      <div>
                        <p className="text-2xl font-black leading-none">{option.count}</p>
                        <p className="mt-1 text-xs font-bold">{option.title}</p>
                        <p className={`mt-0.5 text-[11px] ${isSelected ? "text-slate-300" : "text-slate-500"}`}>
                          {option.hint}
                        </p>
                      </div>
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-bold ${
                          isSelected ? "bg-white/15 text-amber-200" : "bg-amber-50 text-amber-700"
                        }`}
                      >
                        <Star className="h-3 w-3 fill-current" />
                        {option.count}
                      </span>
                    </div>
                    <div
                      className={`relative mt-3 flex items-center gap-1 text-[11px] font-semibold ${
                        isSelected ? "text-slate-300" : "text-slate-500"
                      }`}
                    >
                      <Clock3 className="h-3.5 w-3.5" />
                      {option.minutes}
                    </div>
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => onStart(selected)}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 via-fuchsia-600 to-cyan-500 px-6 py-3.5 text-base font-bold text-white shadow-xl shadow-violet-500/25 transition hover:brightness-105 active:scale-[0.99]"
            >
              <Sparkles className="h-5 w-5" />
              Почати повторення · {selected} {pluralQuestions(selected)}
              <ArrowRight className="h-5 w-5" />
            </button>

            <p className="mt-3 text-center text-[11px] text-slate-500">
              Після старту кількість завдань фіксується. За кожне пройдене завдання — 1 зірка,
              незалежно від правильності.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

function StatCard({
  icon,
  value,
  label,
  tone,
}: {
  icon: ReactNode;
  value: string | number;
  label: string;
  tone: string;
}) {
  return (
    <div className={`rounded-xl ${tone} p-3 ring-1 ring-white/60`}>
      <div className="mb-1 flex items-center gap-1.5">{icon}</div>
      <p className="text-lg font-extrabold leading-tight text-slate-900">{value}</p>
      <p className="text-[11px] font-semibold text-slate-500">{label}</p>
    </div>
  );
}
