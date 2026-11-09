import { useEffect, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  Building2,
  CalendarDays,
  Coins,
  Flame,
  GraduationCap,
  Library,
  Map,
  Sparkles,
  Star,
  Trophy,
  UserRound,
  Users,
} from "lucide-react";
import type { DailyCount, DailyHistoryEntry, PracticeSession, Subject } from "@/types";
import { useDailySystem } from "@/hooks/useDailySystem";
import { useCity } from "@/hooks/useCity";
import { usePractice } from "@/hooks/usePractice";
import { DailyCard } from "@/components/DailyCard";
import { DailyQuiz } from "@/components/DailyQuiz";
import { DailyResult } from "@/components/DailyResult";
import { ProfilePanel } from "@/components/ProfilePanel";
import { ParrotBackground } from "@/components/ParrotBackground";
import { CityScreen } from "@/components/city/CityScreen";
import { PracticeSetup } from "@/components/PracticeSetup";
import { PracticeResult } from "@/components/PracticeResult";
import { CityToasts } from "@/components/CityToasts";
import { QUESTION_BANK } from "@/data/nmtQuestions";
import { SUBJECTS } from "@/data/subjects";
import { DailyLockedError, pluralDays, pluralStars, pluralTasks, topicsToReview } from "@/lib/daily";
import { CITY_ECONOMY } from "@/lib/cityConfig";

type Screen =
  | "home"
  | "daily"
  | "result"
  | "profile"
  | "city"
  | "practice-setup"
  | "practice"
  | "practice-result";

export default function App() {
  const daily = useDailySystem();
  const city = useCity();
  const practice = usePractice(city.applyResult);

  const [screen, setScreen] = useState<Screen>("home");
  const [resultEntry, setResultEntry] = useState<DailyHistoryEntry | null>(null);
  const [practiceResult, setPracticeResult] = useState<PracticeSession | null>(null);
  const [error, setError] = useState("");

  const activePractice = practice.session && !practice.session.completedAt ? practice.session : null;

  // Синхронізуємо завершене щоденне повторення з містом навіть після перезавантаження.
  useEffect(() => {
    const entry = daily.state.history[0];
    if (entry && entry.id === daily.state.lastCompletedSessionId) {
      city.syncDaily(entry);
    }
  }, [daily.state.lastCompletedSessionId, daily.state.history, city.syncDaily]);

  async function handleStart(count: DailyCount) {
    setError("");
    try {
      await daily.start(count);
      setResultEntry(null);
      setScreen("daily");
    } catch (caught) {
      if (caught instanceof DailyLockedError) {
        setError("Сьогоднішнє повторення вже почато. Повернися до нього або зачекай 24 години.");
      } else {
        setError("Не вдалося почати повторення. Спробуй ще раз.");
      }
      daily.refresh();
    }
  }

  function handleContinue() {
    if (daily.activeSession) {
      setScreen("daily");
    }
  }

  function handleAnswer(index: number) {
    daily.answer(index);
  }

  async function handleNext() {
    const next = await daily.advance();
    if (!next.session) {
      const entry = next.history[0] ?? null;
      if (entry) city.syncDaily(entry);
      setResultEntry(entry);
      setScreen(entry ? "result" : "home");
    }
  }

  function goHome() {
    setScreen("home");
    setResultEntry(null);
    setPracticeResult(null);
  }

  function goCity() {
    setScreen("city");
    setResultEntry(null);
  }

  function handleStartPractice(subject: Subject, count: DailyCount) {
    setError("");
    try {
      practice.start(subject, count);
      setPracticeResult(null);
      setScreen("practice");
    } catch {
      setError("Не вдалося підібрати завдання для тренування. Спробуй інший предмет.");
    }
  }

  function handlePracticeAnswer(index: number) {
    practice.answer(index);
  }

  function handlePracticeNext() {
    const result = practice.advance();
    if (result?.completed && result.session) {
      setPracticeResult(result.session);
      setScreen("practice-result");
    }
  }

  function handlePracticeRepeat() {
    if (practiceResult) {
      handleStartPractice(practiceResult.subject, practiceResult.count);
    }
  }

  function handleResumePractice() {
    if (activePractice) setScreen("practice");
    else setScreen("practice-setup");
  }

  const showHome =
    screen === "home" ||
    (screen === "daily" && !daily.activeSession) ||
    (screen === "result" && !resultEntry);
  const showDaily = screen === "daily" && Boolean(daily.activeSession);
  const showResult = screen === "result" && Boolean(resultEntry);
  const isCityScreen =
    screen === "city" ||
    screen === "practice-setup" ||
    screen === "practice" ||
    screen === "practice-result";

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-rose-200/30 blur-3xl" />
        <div className="absolute right-[-6rem] top-1/4 h-80 w-80 rounded-full bg-amber-100/40 blur-3xl" />
        <div className="absolute bottom-[-8rem] left-1/3 h-72 w-72 rounded-full bg-red-100/40 blur-3xl" />
        <ParrotBackground />
      </div>

      <header className="sticky top-0 z-30 border-b border-white/70 bg-white/75 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-2 px-3 py-2.5 sm:gap-3 sm:px-6 sm:py-3">
          <button
            onClick={goHome}
            className="flex items-center gap-2.5 rounded-xl text-left transition hover:opacity-80"
            aria-label="На головну"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-cyan-500 shadow-lg shadow-violet-500/25">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
            <div className="hidden leading-tight sm:block">
              <p className="text-sm font-black tracking-tight text-slate-900">NMT Daily</p>
              <p className="text-[11px] font-semibold text-slate-500">Щоденне повторення</p>
            </div>
          </button>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1.5 shadow-sm ring-1 ring-amber-200/80 sm:px-3">
              <Coins className="h-4 w-4 text-amber-500" />
              <span className="text-sm font-extrabold text-amber-700">{city.state.coins}</span>
            </div>
            <div className="hidden items-center gap-1.5 rounded-full bg-white px-3 py-1.5 shadow-sm ring-1 ring-slate-200/80 sm:inline-flex">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              <span className="text-sm font-extrabold text-slate-800">
                {daily.state.profile.totalStars}
              </span>
            </div>
            <div className="hidden items-center gap-1.5 rounded-full bg-white px-3 py-1.5 shadow-sm ring-1 ring-slate-200/80 sm:inline-flex">
              <Flame className="h-4 w-4 text-orange-500" />
              <span className="text-sm font-extrabold text-slate-800">{daily.displayStreak}</span>
            </div>
            <button
              onClick={goCity}
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs font-bold shadow-sm transition sm:px-3 ${
                isCityScreen
                  ? "bg-emerald-700 text-white hover:bg-emerald-800"
                  : "bg-emerald-600 text-white hover:bg-emerald-700"
              }`}
              aria-label="Моє місто"
            >
              <Map className="h-4 w-4" />
              <span className="hidden md:inline">Місто</span>
              <span className="rounded-full bg-white/20 px-1.5 py-0.5 text-[10px] font-black">
                {city.derived.level}
              </span>
            </button>
            <button
              onClick={() => setScreen("profile")}
              className="inline-flex items-center gap-1.5 rounded-full bg-slate-900 px-2.5 py-1.5 text-xs font-bold text-white shadow-sm transition hover:bg-slate-800 sm:px-3"
              aria-label="Мій профіль"
            >
              <UserRound className="h-4 w-4" />
              <span className="hidden sm:inline">Профіль</span>
            </button>
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-5xl px-4 pb-16 pt-6 sm:px-6 sm:pt-8">
        {error && (
          <div className="mb-4 flex items-start gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
            <span className="mt-0.5">⚠️</span>
            <div className="flex-1">{error}</div>
            <button
              onClick={() => setError("")}
              className="text-xs font-bold text-rose-500 hover:text-rose-700"
            >
              Закрити
            </button>
          </div>
        )}

        {showDaily && daily.activeSession && (
          <DailyQuiz
            session={daily.activeSession}
            onAnswer={handleAnswer}
            onNext={handleNext}
          />
        )}

        {showResult && resultEntry && (
          <DailyResult
            entry={resultEntry}
            profile={daily.state.profile}
            displayStreak={daily.displayStreak}
            nextAvailableAt={daily.state.nextAvailableAt}
            onHome={goHome}
            onProfile={() => setScreen("profile")}
          />
        )}

        {screen === "profile" && <ProfilePanel daily={daily} onBack={goHome} />}

        {screen === "city" && (
          <CityScreen
            city={city}
            activePractice={activePractice}
            onHome={goHome}
            onStartPractice={() => setScreen("practice-setup")}
            onResumePractice={handleResumePractice}
          />
        )}

        {screen === "practice-setup" && (
          <PracticeSetup
            city={city}
            activePractice={activePractice}
            onStart={handleStartPractice}
            onResume={handleResumePractice}
            onBack={goCity}
          />
        )}

        {screen === "practice" && practice.session && (
          <DailyQuiz
            session={practice.session}
            mode="practice"
            coins={practice.session.coinsEarned}
            onAnswer={handlePracticeAnswer}
            onNext={handlePracticeNext}
          />
        )}

        {screen === "practice" && !practice.session && (
          <PracticeSetup
            city={city}
            activePractice={activePractice}
            onStart={handleStartPractice}
            onResume={handleResumePractice}
            onBack={goCity}
          />
        )}

        {screen === "practice-result" && practiceResult && (
          <PracticeResult
            session={practiceResult}
            onCity={goCity}
            onRepeat={handlePracticeRepeat}
            onHome={goHome}
          />
        )}

        {showHome && (
          <div className="space-y-6">
            <section className="pt-2 text-center sm:pt-5">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/80 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-violet-700 shadow-sm ring-1 ring-violet-100 backdrop-blur">
                <Sparkles className="h-3.5 w-3.5" />
                Система щоденного повторення
              </span>
              <h1 className="mx-auto mt-4 max-w-2xl text-3xl font-black leading-[1.1] tracking-tight text-slate-900 sm:text-4xl">
                Тримай знання гострими{" "}
                <span className="bg-gradient-to-r from-violet-600 via-fuchsia-600 to-cyan-500 bg-clip-text text-transparent">
                  щодня
                </span>
              </h1>
              <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-slate-600 sm:text-base">
                Одне коротке повторення на день: обери 3, 5 або 10 завдань з усієї
                програми НМТ. Кожне пройдене завдання — зірка, а щоденна серія
                підтримує вогник.
              </p>
            </section>

            <DailyCard
              daily={daily}
              onStart={handleStart}
              onContinue={handleContinue}
              onProfile={() => setScreen("profile")}
            />

            {/* Місто */}
            <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-emerald-700 via-teal-700 to-cyan-700 p-5 text-white shadow-[0_24px_70px_-30px_rgba(6,78,59,0.65)] sm:p-6">
              <div className="pointer-events-none absolute -right-16 -top-24 h-56 w-56 rounded-full bg-emerald-300/20 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-24 -left-12 h-56 w-56 rounded-full bg-cyan-300/20 blur-3xl" />
              <div className="relative flex flex-wrap items-center justify-between gap-5">
                <div className="max-w-xl">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-50/90 ring-1 ring-white/20">
                    <Building2 className="h-3 w-3" />
                    Нова гра
                  </span>
                  <h2 className="mt-2 text-2xl font-black tracking-tight">Побудуй своє місто</h2>
                  <p className="mt-1 text-sm leading-relaxed text-emerald-50/80">
                    Навчайся, заробляй монети й перетвори порожню ділянку на місто з
                    будинками, школами, парками та університетом.
                  </p>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-bold ring-1 ring-white/15">
                      <Coins className="h-3.5 w-3.5 text-amber-200" />
                      {city.state.coins} монет
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-bold ring-1 ring-white/15">
                      <Trophy className="h-3.5 w-3.5 text-amber-200" />
                      {city.derived.level} рівень
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-bold ring-1 ring-white/15">
                      <Users className="h-3.5 w-3.5 text-emerald-200" />
                      {city.derived.population} людей
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-bold ring-1 ring-white/15">
                      <Building2 className="h-3.5 w-3.5 text-cyan-200" />
                      {city.derived.buildingCount} будівель
                    </span>
                  </div>

                  <button
                    onClick={goCity}
                    className="mt-4 inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-emerald-700 shadow-lg transition hover:bg-emerald-50 active:scale-[0.99]"
                  >
                    <Map className="h-4 w-4" />
                    Побудувати місто
                    <ArrowRight className="h-4 w-4" />
                  </button>

                  <p className="mt-2 text-[11px] font-semibold text-emerald-100/70">
                    +{CITY_ECONOMY.coinsPerCorrect} монет за правильну відповідь · +
                    {CITY_ECONOMY.coinsPerFullTest} за повний тест
                  </p>
                </div>

                <div className="hidden shrink-0 text-[5.5rem] leading-none drop-shadow-lg sm:block">
                  🏙️
                </div>
              </div>
            </section>

            {daily.state.history.length > 0 && (
              <section className="rounded-[2rem] bg-white/80 p-5 shadow-sm ring-1 ring-slate-200/70 backdrop-blur sm:p-6">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-violet-500" />
                    <h2 className="text-sm font-extrabold text-slate-800">Останні повторення</h2>
                  </div>
                  <button
                    onClick={() => setScreen("profile")}
                    className="inline-flex items-center gap-1 text-xs font-bold text-violet-700 transition hover:text-violet-900"
                  >
                    Уся історія
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div className="grid gap-2 sm:grid-cols-3">
                  {daily.state.history.slice(0, 3).map((entry) => {
                    const percent = Math.round((entry.correct / entry.count) * 100);
                    const weak = topicsToReview(entry)[0];
                    return (
                      <div
                        key={entry.id}
                        className="rounded-2xl border border-slate-200 bg-white p-3.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-500">
                            {entry.count} {pluralTasks(entry.count)}
                          </span>
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600">
                            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                            +{entry.stars}
                          </span>
                        </div>
                        <p className="mt-1.5 text-xl font-black text-slate-900">{percent}%</p>
                        <p className="text-[11px] font-semibold text-slate-400">
                          {entry.correct}/{entry.count} правильних
                        </p>
                        {weak && (
                          <p className="mt-2 truncate rounded-lg bg-rose-50 px-2 py-1 text-[10px] font-bold text-rose-600">
                            Повторити: {weak.topic}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            <section className="grid gap-4 lg:grid-cols-5">
              <div className="rounded-[2rem] bg-white/80 p-5 shadow-sm ring-1 ring-slate-200/70 backdrop-blur lg:col-span-3 sm:p-6">
                <div className="mb-3 flex items-center gap-2">
                  <Library className="h-4 w-4 text-cyan-600" />
                  <h2 className="text-sm font-extrabold text-slate-800">Навчальна програма</h2>
                </div>
                <p className="text-xs leading-relaxed text-slate-500">
                  {QUESTION_BANK.length} кураторських завдань з 8 предметів НМТ. Кожен
                  набір змішує предмети, теми й рівні складності, а вже використані
                  завдання не повертаються найближчим часом.
                </p>
                <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {SUBJECTS.map((subject) => (
                    <div
                      key={subject.id}
                      className="flex items-center gap-2 rounded-xl bg-slate-50 px-2.5 py-2 ring-1 ring-slate-200/60"
                    >
                      <span className="text-base">{subject.emoji}</span>
                      <span className="min-w-0 truncate text-[11px] font-bold text-slate-700">
                        {subject.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[2rem] bg-gradient-to-br from-slate-900 to-violet-900 p-5 text-white shadow-xl shadow-violet-900/10 sm:p-6 lg:col-span-2">
                <div className="mb-3 flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-cyan-300" />
                  <h2 className="text-sm font-extrabold">Як це працює</h2>
                </div>
                <ol className="space-y-3 text-xs text-white/80">
                  <li className="flex gap-2.5">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/15 text-[10px] font-black text-white">
                      1
                    </span>
                    Обери 3, 5 або 10 завдань — рівно стільки, скільки хочеш сьогодні.
                  </li>
                  <li className="flex gap-2.5">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/15 text-[10px] font-black text-white">
                      2
                    </span>
                    Пройди набір до кінця: кожне завдання дає 1 зірку.
                  </li>
                  <li className="flex gap-2.5">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/15 text-[10px] font-black text-white">
                      3
                    </span>
                    Повертайся щодня, щоб збільшувати вогник. Наступний набір — через
                    24 години.
                  </li>
                </ol>
                <div className="mt-4 rounded-xl bg-white/10 px-3 py-2.5 text-[11px] font-semibold text-white/70 ring-1 ring-white/15">
                  🔥 {daily.displayStreak} {pluralDays(daily.displayStreak)} поспіль ·{" "}
                  {daily.state.profile.totalStars} {pluralStars(daily.state.profile.totalStars)} у
                  профілі
                </div>
              </div>
            </section>

            <p className="pb-2 text-center text-[11px] text-slate-400">
              Завдання укладено за темами шкільної програми НМТ. Після кожної
              відповіді — правильний варіант і коротке пояснення.
            </p>
          </div>
        )}
      </main>

      <CityToasts messages={city.messages} onDismiss={city.dismiss} />
    </div>
  );
}
