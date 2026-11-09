import type { ReactNode } from "react";
import {
  ArrowLeft,
  BarChart3,
  BookOpenCheck,
  CalendarDays,
  CheckCircle2,
  Flame,
  Star,
  Target,
  Trophy,
} from "lucide-react";
import type { DailyHistoryEntry, DailyProfile, TopicResult } from "@/types";
import type { DailySystemApi } from "@/hooks/useDailySystem";
import { SUBJECTS } from "@/data/subjects";
import { pluralDays, pluralSessions, pluralTasks } from "@/lib/daily";

interface Props {
  daily: DailySystemApi;
  onBack: () => void;
}

function aggregateWeakTopics(history: DailyHistoryEntry[]): TopicResult[] {
  const map = new Map<string, TopicResult>();
  for (const entry of history.slice(0, 30)) {
    for (const topic of entry.topics) {
      const key = `${topic.subject}::${topic.topic}`;
      const existing =
        map.get(key) ??
        ({
          subject: topic.subject,
          topic: topic.topic,
          total: 0,
          correct: 0,
        } satisfies TopicResult);
      existing.total += topic.total;
      existing.correct += topic.correct;
      map.set(key, existing);
    }
  }
  return Array.from(map.values())
    .filter((topic) => topic.total > 0 && topic.correct / topic.total < 0.7)
    .sort((a, b) => a.correct / a.total - b.correct / b.total)
    .slice(0, 6);
}

function formatDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat("uk-UA", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(iso));
  } catch {
    return iso.slice(0, 16).replace("T", " ");
  }
}

export function ProfilePanel({ daily, onBack }: Props) {
  const { profile, history } = daily.state;
  const accuracy =
    profile.totalAnswered > 0 ? Math.round((profile.totalCorrect / profile.totalAnswered) * 100) : 0;
  const weakTopics = aggregateWeakTopics(history);

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-4 flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 rounded-xl bg-white/80 px-3.5 py-2 text-sm font-bold text-slate-700 shadow-sm ring-1 ring-slate-200/70 backdrop-blur transition hover:bg-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Назад
        </button>
        <span className="rounded-full bg-white/80 px-3 py-1.5 text-xs font-bold text-slate-500 ring-1 ring-slate-200/70">
          Особистий профіль
        </span>
      </div>

      <section className="overflow-hidden rounded-[2rem] bg-white shadow-[0_24px_70px_-30px_rgba(15,23,42,0.35)] ring-1 ring-slate-200/70">
        <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-violet-900 to-cyan-800 px-6 py-7 text-white sm:px-8">
          <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-cyan-400/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-10 h-52 w-52 rounded-full bg-fuchsia-400/20 blur-3xl" />
          <div className="relative flex flex-wrap items-center justify-between gap-5">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 text-3xl ring-1 ring-white/20 backdrop-blur">
                🎓
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/60">
                  Мій прогрес
                </p>
                <h2 className="mt-0.5 text-2xl font-black tracking-tight">Майбутній абітурієнт</h2>
                <p className="mt-1 text-sm text-white/70">
                  {profile.totalSessions > 0
                    ? `${profile.totalSessions} ${pluralSessions(profile.totalSessions)} · точність ${accuracy}%`
                    : "Почни перше щоденне повторення — і тут з'явиться статистика."}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="rounded-2xl bg-white/10 px-4 py-3 text-center ring-1 ring-white/20 backdrop-blur">
                <div className="flex items-center justify-center gap-1.5">
                  <Star className="h-4 w-4 fill-amber-300 text-amber-300" />
                  <span className="text-2xl font-black">{profile.totalStars}</span>
                </div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-white/60">Зірок</p>
              </div>
              <div className="rounded-2xl bg-white/10 px-4 py-3 text-center ring-1 ring-white/20 backdrop-blur">
                <div className="flex items-center justify-center gap-1.5">
                  <Flame className="h-4 w-4 text-orange-300" />
                  <span className="text-2xl font-black">{daily.displayStreak}</span>
                </div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-white/60">Серія</p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-5 sm:p-7">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <ProfileStat
              icon={<Trophy className="h-4 w-4 text-violet-500" />}
              value={`${profile.longestStreak} ${pluralDays(profile.longestStreak)}`}
              label="Рекорд серії"
            />
            <ProfileStat
              icon={<CalendarDays className="h-4 w-4 text-cyan-500" />}
              value={profile.totalSessions}
              label="Пройдено разів"
            />
            <ProfileStat
              icon={<CheckCircle2 className="h-4 w-4 text-emerald-500" />}
              value={`${profile.totalCorrect}/${profile.totalAnswered}`}
              label="Правильних"
            />
            <ProfileStat
              icon={<BarChart3 className="h-4 w-4 text-amber-500" />}
              value={`${accuracy}%`}
              label="Точність"
            />
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-5">
            <div className="lg:col-span-2">
              <div className="mb-2 flex items-center gap-2">
                <Target className="h-4 w-4 text-rose-500" />
                <h3 className="text-sm font-extrabold text-slate-800">Що підтягнути</h3>
              </div>
              {weakTopics.length === 0 ? (
                <div className="rounded-2xl bg-emerald-50 p-4 ring-1 ring-emerald-100">
                  <p className="text-xs font-semibold text-emerald-700">
                    {profile.totalSessions === 0
                      ? "Після першого повторення тут з'являться теми, які варто закріпити."
                      : "Слабких тем поки не видно. Продовжуй у тому ж темпі!"}
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {weakTopics.map((topic) => {
                    const meta = SUBJECTS.find((item) => item.id === topic.subject);
                    const percent = Math.round((topic.correct / topic.total) * 100);
                    return (
                      <div
                        key={`${topic.subject}-${topic.topic}`}
                        className="rounded-2xl bg-white p-3 ring-1 ring-slate-200/70"
                      >
                        <div className="mb-1.5 flex items-center gap-2">
                          <span className="text-base">{meta?.emoji ?? "📚"}</span>
                          <span className="min-w-0 flex-1 truncate text-xs font-bold text-slate-700">
                            {topic.topic}
                          </span>
                          <span className="text-[11px] font-bold text-rose-600">{percent}%</span>
                        </div>
                        <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-rose-400 to-orange-400"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="lg:col-span-3">
              <div className="mb-2 flex items-center gap-2">
                <BookOpenCheck className="h-4 w-4 text-violet-500" />
                <h3 className="text-sm font-extrabold text-slate-800">Історія повторень</h3>
              </div>
              {history.length === 0 ? (
                <div className="rounded-2xl border-2 border-dashed border-slate-200 p-6 text-center">
                  <p className="text-sm font-semibold text-slate-500">Історія поки порожня.</p>
                  <p className="mt-1 text-xs text-slate-400">
                    Завершене щоденне повторення з'явиться тут.
                  </p>
                </div>
              ) : (
                <div className="max-h-[26rem] space-y-2 overflow-y-auto pr-1">
                  {history.map((entry) => {
                    const percent = Math.round((entry.correct / entry.count) * 100);
                    return (
                      <div
                        key={entry.id}
                        className="rounded-2xl border border-slate-200 bg-white p-3.5 transition hover:border-violet-200 hover:bg-violet-50/30"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-50 text-sm font-black text-violet-700">
                              {entry.count}
                            </span>
                            <div>
                              <p className="text-xs font-bold text-slate-800">
                                {entry.count} {pluralTasks(entry.count)} · {entry.correct} з {entry.count} правильних · {percent}%
                              </p>
                              <p className="text-[11px] font-semibold text-slate-400">
                                {formatDate(entry.completedAt)}
                              </p>
                            </div>
                          </div>
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-700">
                            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                            +{entry.stars}
                          </span>
                        </div>
                        <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className={`h-full rounded-full ${
                              percent >= 80
                                ? "bg-emerald-500"
                                : percent >= 50
                                  ? "bg-amber-500"
                                  : "bg-rose-500"
                            }`}
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function ProfileStat({
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
      <p className="text-lg font-extrabold leading-none text-slate-900">{value}</p>
      <p className="mt-1 text-[11px] font-semibold text-slate-500">{label}</p>
    </div>
  );
}
