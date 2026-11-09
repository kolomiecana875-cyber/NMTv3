import type { Question, Subject } from "@/types";
import { HISTORY_QUESTIONS } from "@/data/bank/history";
import { UKRAINIAN_QUESTIONS } from "@/data/bank/ukrainian";
import { MATH_QUESTIONS } from "@/data/bank/math";
import { PHYSICS_QUESTIONS } from "@/data/bank/physics";
import { CHEMISTRY_QUESTIONS } from "@/data/bank/chemistry";
import { BIOLOGY_QUESTIONS } from "@/data/bank/biology";
import { ENGLISH_QUESTIONS } from "@/data/bank/english";
import { GEOGRAPHY_QUESTIONS } from "@/data/bank/geography";

/**
 * Кураторська база завдань, укладена за темами шкільної програми,
 * з яких складають завдання НМТ. Кожне завдання має 4 варіанти,
 * одну правильну відповідь і коротке пояснення.
 */
export const QUESTION_BANK: Question[] = [
  ...HISTORY_QUESTIONS,
  ...UKRAINIAN_QUESTIONS,
  ...MATH_QUESTIONS,
  ...PHYSICS_QUESTIONS,
  ...CHEMISTRY_QUESTIONS,
  ...BIOLOGY_QUESTIONS,
  ...ENGLISH_QUESTIONS,
  ...GEOGRAPHY_QUESTIONS,
];

export const QUESTIONS_BY_SUBJECT: Record<Subject, Question[]> = QUESTION_BANK.reduce(
  (acc, question) => {
    (acc[question.subject] ??= []).push(question);
    return acc;
  },
  {} as Record<Subject, Question[]>
);

export function getQuestionById(id: string): Question | undefined {
  return QUESTION_BANK.find((question) => question.id === id);
}
