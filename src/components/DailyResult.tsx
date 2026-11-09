import type { ReactNode } from "react";
import {
  ArrowRight,
  BookOpenCheck,
  CheckCircle2,
  Flame,
  Home,
  Sparkles,
  Star,
  Target,
  Trophy,
} from "lucide-react";
import type { DailyHistoryEntry, DailyProfile } from "@/types";
import { SUBJECTS } from "@/data/subjects";
import { pluralDays, pluralStars, topicsToReview } from "@/lib/daily";
import { Countdown } from "@/components/Countdown";

interface Props {
  entry: DailyHistoryEntry;
  profile: DailyProfile;
  displayStreak: number;
  nextAvailableAt: string | null;
  onHome: () => void;
  onProfile: () => void;
}

export function DailyResult({
  entry,
  profile,
  displayStreak,
  nextAvailableAt,
  onHome,
  onProfile,
}: Props) {
  const percent = entry.count > 0 ? Math.round((entry.correct / entry.count) * 100) : 0;
  const weakTopics = topicsToReview(entry);

  return (
    <div className="mx-auto max-w-3xl">
      <div className="overflow-hidden rounded-[2rem] bg-white shadow-[0_24px_80px_-30px_rgba(15,23,42,0.4)] ring-1 ring-slate-200/70">
        <div className="relative overflow-hidden bg-gradient-to-br from-violet-700 via-fuchsia-600 to-cyan-500 px-6 py-9 text-center text-white sm:px-10">
          <div className="pointer-events-none absolute -left-16 -top-20 h-52 w-52 rounded-full bg-white/15 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-24 -right-12 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
          <div className="relative">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-white/15 ring-1 ring-white/30 backdrop-blur">
              <Trophy className="h-10 w-10 text-amber-200" />
            </div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/70">
              Щоденне повторення
            </p>
            <h2 className="mt-1 text-2xl font-black tracking-tight sm:text-3xl">
              Завдання виконано!
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-white/80">
              {percent === 100
                ? "Ідеальний результат — усі відповіді правильні. Так тримати!"
                : percent >= 60
                  ? "Гарна робота. Кілька тем варто закріпити — і буде ще краще."
                  : "Головне — регулярність. Переглянь пояснення й повтори слабкі теми."}
            </p>

            <div className="mx-auto mt-5 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-bold ring-1 ring-white/25 backdrop-blur">
              <Star className="h-4 w-4 fill-amber-300 text-amber-300" />
              +{entry.stars} {pluralStars(entry.stars)} за проходження
            </div>
          </div>
        </div>

        <div className="p-5 sm:p-7">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <ResultStat
              icon={<CheckCircle2 className="h-4 w-4 text-emerald-500" />}
              value={`${entry.correct}/${entry.count}`}
              label="Правильних"
            />
            <ResultStat
              icon={<Target className="h-4 w-4 text-violet-500" />}
              value={`${percent}%`}
              label="Точність"
            />
            <ResultStat
              icon={<Star className="h-4 w-4 text-amber-500" />}
              value={profile.totalStars}
              label="Усього зірок"
            />
            <ResultStat
              icon={<Flame className="h-4 w-4 text-orange-500" />}
              value={`${displayStreak} ${pluralDays(displayStreak)}`}
              label="Вогник"
            />
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200/70">
              <div className="mb-2 flex items-center gap-2">
                <Flame className="h-4 w-4 text-orange-500" />
                <p className="text-sm font-bold text-slate-800">Твоя серія</p>
              </div>
              <p className="text-3xl font-black text-slate-900">
                🔥 {displayStreak}
              </p>
              <p className="mt-1 text-xs font-semibold text-slate-500">
                Поточна серія · рекорд {profile.longestStreak}{" "}
                {pluralDays(profile.longestStreak)}
              </p>
              <p className="mt-3 rounded-xl bg-white px-3 py-2 text-[11px] font-semibold text-slate-600 ring-1 ring-slate-200/70">
                Повертайся щодня, щоб не втратити вогник.
              </p>
            </div>

            <div className="rounded-2xl bg-amber-50/70 p-4 ring-1 ring-amber-100">
              <div className="mb-2 flex items-center gap-2">
                <BookOpenCheck className="h-4 w-4 text-amber-600" />
                <p className="text-sm font-bold text-slate-800">Теми для повторення</p>
              </div>
              {weakTopics.length === 0 ? (
                <div className="flex items-start gap-2 rounded-xl bg-white px-3 py-3 ring-1 ring-amber-100">
                  <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                  <p className="text-xs font-semibold text-emerald-700">
                    Усі теми цього набору — на висоті. Можна рухатися далі.
                  </p>
                </div>
              ) : (
                <ul className="space-y-2">
                  {weakTopics.map((topic) => {
                    const meta = SUBJECTS.find((item) => item.id === topic.subject);
                    return (
                      <li
                        key={`${topic.subject}-${topic.topic}`}
                        className="flex items-center gap-2 rounded-xl bg-white px-3 py-2 ring-1 ring-amber-100"
                      >
                        <span className="text-base">{meta?.emoji ?? "📚"}</span>
                        <span className="min-w-0 flex-1 truncate text-xs font-bold text-slate-700">
                          {topic.topic}
                        </span>
                        <span className="text-[11px] font-bold text-rose-600">
                          {topic.correct}/{topic.total}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>

          <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Наступне повторення
                </p>
                <p className="mt-0.5 text-sm font-semibold text-slate-700">
                  Відкриється через 24 години
                </p>
              </div>
              <Countdown target={nextAvailableAt} />
            </div>
          </div>

          <div className="mt-5 flex flex-col gap-2.5 sm:flex-row">
            <button
              onClick={onHome}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-slate-900/20 transition hover:bg-slate-800 active:scale-[0.99]"
            >
              <Home className="h-4 w-4" />
              На головну
            </button>
            <button
              onClick={onProfile}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border-2 border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50 active:scale-[0.99]"
            >
              Мій профіль
              <ArrowRight className="h-4 w-4" />
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
    <div className="rounded-2xl bg-slate-50 p-3.5 ring-1 ring-slate-200/70">
      <div className="mb-1.5">{icon}</div>
      <p className="text-xl font-extrabold leading-none text-slate-900">{value}</p>
      <p className="mt-1 text-[11px] font-semibold text-slate-500">{label}</p>
    </div>
  );
}
