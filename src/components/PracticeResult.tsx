import type { ReactNode } from "react";
import {
  ArrowRight,
  CheckCircle2,
  Coins,
  Home,
  Sparkles,
  Target,
  Trophy,
  XCircle,
} from "lucide-react";
import type { PracticeSession } from "@/types";
import { SUBJECTS } from "@/data/subjects";

interface Props {
  session: PracticeSession;
  onCity: () => void;
  onRepeat: () => void;
  onHome: () => void;
}

export function PracticeResult({ session, onCity, onRepeat, onHome }: Props) {
  const meta = SUBJECTS.find((subject) => subject.id === session.subject);
  const total = session.questions.length;
  const correct = session.answers.filter((answer) => answer.correct).length;
  const percent = total > 0 ? Math.round((correct / total) * 100) : 0;
  const perfect = total > 0 && correct === total;

  return (
    <div className="mx-auto max-w-3xl">
      <div className="overflow-hidden rounded-[2rem] bg-white shadow-[0_24px_80px_-30px_rgba(15,23,42,0.4)] ring-1 ring-slate-200/70">
        <div className="relative overflow-hidden bg-gradient-to-br from-violet-700 via-fuchsia-600 to-cyan-500 px-6 py-8 text-center text-white sm:px-10">
          <div className="pointer-events-none absolute -left-16 -top-20 h-52 w-52 rounded-full bg-white/15 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-24 -right-12 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
          <div className="relative">
            <div className="mx-auto mb-3 flex h-18 w-18 items-center justify-center rounded-full bg-white/15 p-4 ring-1 ring-white/30 backdrop-blur">
              <Trophy className="h-9 w-9 text-amber-200" />
            </div>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/70">
              {meta?.emoji} {meta?.label ?? "НМТ"} · тренування
            </p>
            <h1 className="mt-1 text-2xl font-black tracking-tight sm:text-3xl">
              {perfect ? "Ідеально!" : percent >= 60 ? "Гарна робота!" : "Головне — практика!"}
            </h1>
            <p className="mx-auto mt-2 max-w-md text-sm text-white/80">
              {perfect
                ? "Усі відповіді правильні. Місто отримало максимум монет за це тренування."
                : percent >= 60
                  ? "Ти на правильному шляху. Переглянь помилки й повтори слабкі теми."
                  : "Кожна спроба — крок уперед. Подивись пояснення й спробуй ще раз."}
            </p>

            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3.5 py-1.5 text-sm font-bold ring-1 ring-white/25 backdrop-blur">
                <CheckCircle2 className="h-4 w-4 text-emerald-200" />
                {correct}/{total} правильних
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3.5 py-1.5 text-sm font-bold ring-1 ring-white/25 backdrop-blur">
                <Coins className="h-4 w-4 text-amber-200" />
                +{session.coinsEarned} монет
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3.5 py-1.5 text-sm font-bold ring-1 ring-white/25 backdrop-blur">
                <Sparkles className="h-4 w-4 text-violet-200" />
                +{session.xpEarned} XP
              </span>
            </div>
          </div>
        </div>

        <div className="p-5 sm:p-7">
          <div className="grid grid-cols-3 gap-3">
            <ResultStat
              icon={<Target className="h-4 w-4 text-violet-500" />}
              value={`${percent}%`}
              label="Точність"
            />
            <ResultStat
              icon={<Coins className="h-4 w-4 text-amber-500" />}
              value={session.coinsEarned}
              label="Монет"
            />
            <ResultStat
              icon={<Sparkles className="h-4 w-4 text-cyan-500" />}
              value={session.xpEarned}
              label="XP міста"
            />
          </div>

          <div className="mt-5">
            <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Розбір відповідей
            </p>
            <div className="max-h-80 space-y-2 overflow-y-auto pr-1">
              {session.questions.map((question, index) => {
                const answer = session.answers.find((item) => item.questionId === question.id);
                const isCorrect = Boolean(answer?.correct);
                return (
                  <div
                    key={question.id}
                    className={`rounded-xl border p-3 ${
                      isCorrect
                        ? "border-emerald-200 bg-emerald-50/50"
                        : "border-rose-200 bg-rose-50/50"
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      {isCorrect ? (
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                      ) : (
                        <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-500" />
                      )}
                      <div className="min-w-0">
                        <p className="text-xs font-bold leading-snug text-slate-800">
                          {index + 1}. {question.prompt}
                        </p>
                        <p className="mt-0.5 text-[10px] font-semibold text-slate-400">
                          {question.topic}
                        </p>
                        {!isCorrect && (
                          <p className="mt-1 text-[11px] font-semibold text-emerald-700">
                            Правильно: {question.options[question.correctIndex]}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-5 flex flex-col gap-2.5 sm:flex-row">
            <button
              onClick={onCity}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-600/20 transition hover:brightness-105 active:scale-[0.99]"
            >
              До міста
              <ArrowRight className="h-4 w-4" />
            </button>
            <button
              onClick={onRepeat}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-violet-600/20 transition hover:brightness-105 active:scale-[0.99]"
            >
              Ще тренування
            </button>
            <button
              onClick={onHome}
              className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50 active:scale-[0.99]"
            >
              <Home className="h-4 w-4" />
              На головну
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ResultStat({
  icon,
  value,
  label,
}: {
  icon: ReactNode;
  value: string | number;
  label: string;
}) {
  return (
    <div className="rounded-2xl bg-slate-50 p-3.5 text-center ring-1 ring-slate-200/70">
      <div className="mb-1.5 flex justify-center">{icon}</div>
      <p className="text-xl font-extrabold leading-none text-slate-900">{value}</p>
      <p className="mt-1 text-[11px] font-semibold text-slate-500">{label}</p>
    </div>
  );
}
