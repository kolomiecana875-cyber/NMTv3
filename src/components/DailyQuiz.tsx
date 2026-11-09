import {
  ArrowRight,
  CheckCircle2,
  Flame,
  Lightbulb,
  Sparkles,
  Star,
  XCircle,
} from "lucide-react";
import type { DailySession, Difficulty } from "@/types";
import { SUBJECTS } from "@/data/subjects";
import { pluralCorrect, pluralQuestions, pluralStars } from "@/lib/daily";

interface Props {
  session: DailySession;
  onAnswer: (index: number) => void;
  onNext: () => void;
}

const LETTERS = ["A", "B", "C", "D"];

const DIFFICULTY_LABEL: Record<Difficulty, string> = {
  easy: "Легке",
  medium: "Середнє",
  hard: "Складне",
};

const DIFFICULTY_STYLE: Record<Difficulty, string> = {
  easy: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  medium: "bg-amber-50 text-amber-700 ring-amber-100",
  hard: "bg-rose-50 text-rose-700 ring-rose-100",
};

export function DailyQuiz({ session, onAnswer, onNext }: Props) {
  const question = session.questions[session.currentIndex];
  const answer = question
    ? session.answers.find((item) => item.questionId === question.id)
    : undefined;
  const answered = Boolean(answer);
  const isLast = session.currentIndex + 1 >= session.questions.length;
  const subject = SUBJECTS.find((item) => item.id === question?.subject);
  const correctCount = session.answers.filter((item) => item.correct).length;
  const progress = ((session.currentIndex + (answered ? 1 : 0)) / session.questions.length) * 100;
  const difficulty = (question?.difficulty ?? "medium") as Difficulty;

  if (!question) {
    return (
      <div className="rounded-3xl bg-white p-8 text-center shadow-xl ring-1 ring-slate-200">
        <p className="text-slate-600">Не вдалося завантажити завдання.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-4 rounded-2xl bg-white/80 p-4 shadow-sm ring-1 ring-slate-200/70 backdrop-blur">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2 text-xs font-bold text-slate-600">
          <span>
            Завдання {session.currentIndex + 1} з {session.questions.length}
          </span>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1 text-emerald-700">
              <CheckCircle2 className="h-3.5 w-3.5" />
              {correctCount} {pluralCorrect(correctCount)}
            </span>
            <span className="inline-flex items-center gap-1 text-amber-600">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              {session.count} {pluralStars(session.count)} за проходження
            </span>
          </div>
        </div>
        <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-gradient-to-r from-violet-600 via-fuchsia-500 to-cyan-500 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl bg-white shadow-[0_20px_60px_-30px_rgba(15,23,42,0.35)] ring-1 ring-slate-200/70">
        <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-violet-50/40 px-5 py-4 sm:px-7">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold text-white"
              style={{ backgroundColor: subject?.color ?? "#475569" }}
            >
              <span>{subject?.emoji ?? "📚"}</span>
              {subject?.label ?? "НМТ"}
            </span>
            <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-bold text-slate-600 ring-1 ring-slate-200">
              {question.topic}
            </span>
            <span
              className={`rounded-full px-2.5 py-1 text-[11px] font-bold ring-1 ${DIFFICULTY_STYLE[difficulty]}`}
            >
              {DIFFICULTY_LABEL[difficulty]}
            </span>
            {question.taskType && (
              <span className="rounded-full bg-violet-50 px-2.5 py-1 text-[11px] font-bold text-violet-700 ring-1 ring-violet-100">
                {question.taskType}
              </span>
            )}
          </div>
        </div>

        <div className="p-5 sm:p-7">
          <h2 className="mb-5 text-lg font-extrabold leading-snug text-slate-900 sm:text-xl">
            {question.prompt}
          </h2>

          <div className="space-y-2.5">
            {question.options.map((option, index) => {
              const isCorrect = index === question.correctIndex;
              const isSelected = answer?.selectedIndex === index;
              let className =
                "border-slate-200 bg-white text-slate-800 hover:border-violet-300 hover:bg-violet-50/40";
              let badge = "bg-slate-100 text-slate-600";

              if (answered) {
                if (isCorrect) {
                  className = "border-emerald-400 bg-emerald-50 text-emerald-900";
                  badge = "bg-emerald-500 text-white";
                } else if (isSelected) {
                  className = "border-rose-400 bg-rose-50 text-rose-900";
                  badge = "bg-rose-500 text-white";
                } else {
                  className = "border-slate-200 bg-white text-slate-500";
                }
              }

              return (
                <button
                  key={`${question.id}-${index}`}
                  onClick={() => onAnswer(index)}
                  disabled={answered}
                  className={`flex w-full items-center gap-3 rounded-2xl border-2 px-4 py-3.5 text-left text-sm font-semibold transition ${className} ${
                    answered ? "cursor-default" : "active:scale-[0.995]"
                  }`}
                >
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-black ${badge}`}
                  >
                    {answered && isCorrect ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : answered && isSelected ? (
                      <XCircle className="h-5 w-5" />
                    ) : (
                      LETTERS[index]
                    )}
                  </span>
                  <span className="flex-1">{option}</span>
                </button>
              );
            })}
          </div>

          {answered && (
            <div className="mt-5 overflow-hidden rounded-2xl bg-gradient-to-br from-violet-50 via-white to-cyan-50 ring-1 ring-violet-100">
              <div className="flex items-start gap-3 p-4 sm:p-5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-cyan-500">
                  <Lightbulb className="h-5 w-5 text-white" />
                </div>
                <div className="min-w-0">
                  <p className="mb-1 text-sm font-extrabold text-slate-900">
                    {answer?.correct ? "Правильно! +1 зірка" : "Правильна відповідь — інша"}
                  </p>
                  <p className="text-sm leading-relaxed text-slate-700">{question.explanation}</p>
                  {!answer?.correct && (
                    <p className="mt-2 rounded-lg bg-white/80 px-3 py-2 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-100">
                      Правильно: {LETTERS[question.correctIndex]}. {question.options[question.correctIndex]}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2 border-t border-violet-100/80 bg-white/60 px-4 py-3 sm:px-5">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                  <Flame className="h-4 w-4 text-orange-500" />
                  Серія: {session.answers.filter((item) => item.correct).length} з{" "}
                  {session.answers.length}
                </div>
                <button
                  onClick={onNext}
                  className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-slate-900/20 transition hover:bg-slate-800 active:scale-[0.99]"
                >
                  {isLast ? "Завершити та отримати зірки" : "Наступне завдання"}
                  {isLast ? <Sparkles className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <p className="mt-4 text-center text-xs text-slate-500">
        {session.answers.length} з {session.questions.length} завдань пройдено ·{" "}
        {session.count} {pluralQuestions(session.count)} у наборі
      </p>
    </div>
  );
}
