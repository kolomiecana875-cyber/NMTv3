import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Clock3,
  Coins,
  GraduationCap,
  Play,
  Sparkles,
  Target,
} from "lucide-react";
import type { DailyCount, PracticeSession, Subject } from "@/types";
import type { CityApi } from "@/hooks/useCity";
import { CITY_ECONOMY, CITY_MISSIONS, CITY_SUBJECTS } from "@/lib/cityConfig";
import { SUBJECTS } from "@/data/subjects";
import { pluralQuestions } from "@/lib/daily";

interface Props {
  city: CityApi;
  activePractice: PracticeSession | null;
  onStart: (subject: Subject, count: DailyCount) => void;
  onResume: () => void;
  onBack: () => void;
}

const COUNT_OPTIONS: Array<{ count: DailyCount; title: string; hint: string }> = [
  { count: 3, title: "Розминка", hint: "≈ 2 хвилини" },
  { count: 5, title: "Тренування", hint: "≈ 4 хвилини" },
  { count: 10, title: "Повний тест", hint: "≈ 8 хвилин" },
];

export function PracticeSetup({ city, activePractice, onStart, onResume, onBack }: Props) {
  const [subject, setSubject] = useState<Subject>("math");
  const [count, setCount] = useState<DailyCount>(5);

  const potentialCoins =
    count * CITY_ECONOMY.coinsPerCorrect +
    (count === CITY_ECONOMY.fullTestCount ? CITY_ECONOMY.coinsPerFullTest : 0);

  const relevantMissions = CITY_MISSIONS.filter(
    (mission) =>
      (mission.kind === "answer_subject" && mission.subject === subject) ||
      (mission.kind === "complete_subject" && mission.subject === subject)
  );

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 rounded-xl bg-white/80 px-3.5 py-2 text-sm font-bold text-slate-700 shadow-sm ring-1 ring-slate-200/70 backdrop-blur transition hover:bg-white"
        >
          <ArrowLeft className="h-4 w-4" />
          До міста
        </button>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-extrabold text-amber-700 ring-1 ring-amber-200/80">
          <Coins className="h-3.5 w-3.5" />
          {city.state.coins} монет
        </span>
      </div>

      <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-violet-700 via-fuchsia-600 to-cyan-500 p-5 text-white shadow-[0_24px_70px_-30px_rgba(76,29,149,0.65)] sm:p-7">
        <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-white/15 blur-3xl" />
        <div className="relative">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white/80 ring-1 ring-white/20">
            <Sparkles className="h-3 w-3" />
            Навчальна практика
          </span>
          <h1 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">
            Тренуйся й заробляй монети
          </h1>
          <p className="mt-1 max-w-xl text-sm text-white/80">
            Обери предмет НМТ і кількість завдань. Монети нараховуються лише за
            правильні відповіді — жодних порожніх кліків.
          </p>
          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
            <div className="rounded-xl bg-white/10 px-3 py-2 ring-1 ring-white/15">
              <p className="text-lg font-black text-amber-200">+{CITY_ECONOMY.coinsPerCorrect}</p>
              <p className="text-[10px] font-bold uppercase tracking-wider text-white/60">
                за правильну
              </p>
            </div>
            <div className="rounded-xl bg-white/10 px-3 py-2 ring-1 ring-white/15">
              <p className="text-lg font-black text-amber-200">+{CITY_ECONOMY.coinsPerFullTest}</p>
              <p className="text-[10px] font-bold uppercase tracking-wider text-white/60">
                за повний тест
              </p>
            </div>
            <div className="rounded-xl bg-white/10 px-3 py-2 ring-1 ring-white/15">
              <p className="text-lg font-black text-amber-200">+{CITY_ECONOMY.coinsPerDailyTask}</p>
              <p className="text-[10px] font-bold uppercase tracking-wider text-white/60">
                за місію
              </p>
            </div>
          </div>
        </div>
      </section>

      {activePractice && (
        <section className="rounded-2xl border border-amber-200 bg-amber-50/80 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-extrabold text-amber-900">
                Незавершене тренування:{" "}
                {SUBJECTS.find((item) => item.id === activePractice.subject)?.label ?? "НМТ"}
              </p>
              <p className="text-xs font-semibold text-amber-700">
                {activePractice.answers.length} з {activePractice.questions.length} завдань
                пройдено · {activePractice.coinsEarned} монет уже зароблено
              </p>
            </div>
            <button
              onClick={onResume}
              className="inline-flex items-center gap-2 rounded-xl bg-amber-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-amber-600/20 transition hover:bg-amber-700 active:scale-[0.99]"
            >
              <Play className="h-4 w-4" />
              Продовжити
            </button>
          </div>
        </section>
      )}

      <section className="rounded-[2rem] bg-white/85 p-5 shadow-sm ring-1 ring-slate-200/70 backdrop-blur sm:p-6">
        <div className="mb-3 flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-violet-500" />
          <h2 className="text-sm font-extrabold text-slate-800">Обери предмет</h2>
        </div>
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
          {CITY_SUBJECTS.map((subjectId) => {
            const meta = SUBJECTS.find((item) => item.id === subjectId);
            if (!meta) return null;
            const selected = subject === subjectId;
            return (
              <button
                key={subjectId}
                onClick={() => setSubject(subjectId)}
                className={`relative overflow-hidden rounded-2xl border-2 p-3 text-left transition ${
                  selected
                    ? "border-transparent bg-slate-900 text-white shadow-xl shadow-slate-900/20"
                    : "border-slate-200 bg-white text-slate-800 hover:border-violet-300 hover:bg-violet-50/40"
                }`}
                aria-pressed={selected}
              >
                <span className="text-2xl">{meta.emoji}</span>
                <p className="mt-1.5 text-xs font-extrabold leading-tight">{meta.label}</p>
                <p
                  className={`mt-0.5 text-[10px] font-semibold ${
                    selected ? "text-slate-300" : "text-slate-400"
                  }`}
                >
                  {meta.topics.length} тем
                </p>
              </button>
            );
          })}
        </div>

        <div className="mb-3 mt-5 flex items-center gap-2">
          <Target className="h-4 w-4 text-cyan-500" />
          <h2 className="text-sm font-extrabold text-slate-800">Скільки завдань?</h2>
        </div>
        <div className="grid gap-2.5 sm:grid-cols-3">
          {COUNT_OPTIONS.map((option) => {
            const selected = count === option.count;
            const coins =
              option.count * CITY_ECONOMY.coinsPerCorrect +
              (option.count === CITY_ECONOMY.fullTestCount ? CITY_ECONOMY.coinsPerFullTest : 0);
            return (
              <button
                key={option.count}
                onClick={() => setCount(option.count)}
                className={`relative overflow-hidden rounded-2xl border-2 p-3.5 text-left transition ${
                  selected
                    ? "border-transparent bg-slate-900 text-white shadow-xl shadow-slate-900/20"
                    : "border-slate-200 bg-white text-slate-800 hover:border-cyan-300 hover:bg-cyan-50/40"
                }`}
                aria-pressed={selected}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-xl font-black leading-none">{option.count}</p>
                    <p className="mt-1 text-xs font-bold">{option.title}</p>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-bold ${
                      selected ? "bg-white/15 text-amber-200" : "bg-amber-50 text-amber-700"
                    }`}
                  >
                    <Coins className="h-3 w-3" />
                    {coins}
                  </span>
                </div>
                <div
                  className={`mt-2 flex items-center gap-1 text-[10px] font-semibold ${
                    selected ? "text-slate-300" : "text-slate-500"
                  }`}
                >
                  <Clock3 className="h-3 w-3" />
                  {option.hint}
                </div>
              </button>
            );
          })}
        </div>

        {relevantMissions.length > 0 && (
          <div className="mt-4 rounded-2xl bg-emerald-50/70 p-3 ring-1 ring-emerald-100">
            <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">
              Це тренування допоможе з місіями
            </p>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {relevantMissions.map((mission) => (
                <span
                  key={mission.id}
                  className="rounded-full bg-white px-2.5 py-1 text-[10px] font-bold text-emerald-700 ring-1 ring-emerald-100"
                >
                  {mission.title}
                </span>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={() => onStart(subject, count)}
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 via-fuchsia-600 to-cyan-500 px-6 py-3.5 text-base font-bold text-white shadow-xl shadow-violet-500/25 transition hover:brightness-105 active:scale-[0.99]"
        >
          <Play className="h-5 w-5" />
          Почати тренування · {count} {pluralQuestions(count)}
          <ArrowRight className="h-5 w-5" />
        </button>

        <div className="mt-3 flex items-start gap-2 rounded-xl bg-slate-50 px-3 py-2.5 text-[11px] font-semibold text-slate-500 ring-1 ring-slate-200/70">
          <GraduationCap className="mt-0.5 h-3.5 w-3.5 shrink-0 text-violet-500" />
          <p>
            Максимум за це тренування — <span className="font-bold text-amber-600">{potentialCoins} монет</span>.
            Одне й те саме питання дає монети лише один раз на день, тому
            повторювати заради нагороди не вийде.
          </p>
        </div>
      </section>
    </div>
  );
}
