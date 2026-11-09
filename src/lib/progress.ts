import type { Attempt, Question } from "@/types";

const ATTEMPTS_KEY = "nmt_attempts";
const WRONG_KEY = "nmt_wrong_questions";
const MAX_ATTEMPTS = 200;
const MAX_WRONG = 60;

export function loadAttempts(): Attempt[] {
  try {
    const raw = localStorage.getItem(ATTEMPTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Attempt[]) : [];
  } catch {
    return [];
  }
}

export function saveAttempt(attempt: Attempt): void {
  try {
    const list = loadAttempts();
    list.unshift(attempt);
    localStorage.setItem(ATTEMPTS_KEY, JSON.stringify(list.slice(0, MAX_ATTEMPTS)));
  } catch {
    // ignore
  }
}

export function clearAttempts(): void {
  try {
    localStorage.removeItem(ATTEMPTS_KEY);
  } catch {
    // ignore
  }
}

export function loadWrongQuestions(): Question[] {
  try {
    const raw = localStorage.getItem(WRONG_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Question[]) : [];
  } catch {
    return [];
  }
}

export function saveWrongQuestions(qs: Question[]): void {
  try {
    const existing = loadWrongQuestions();
    const map = new Map(existing.map((q) => [q.id, q]));
    for (const q of qs) map.set(q.id, q);
    const merged = Array.from(map.values()).slice(0, MAX_WRONG);
    localStorage.setItem(WRONG_KEY, JSON.stringify(merged));
  } catch {
    // ignore
  }
}

export function clearWrongQuestions(): void {
  try {
    localStorage.removeItem(WRONG_KEY);
  } catch {
    // ignore
  }
}

export function computeStats(attempts: Attempt[]) {
  const total = attempts.length;
  const totalQuestions = attempts.reduce((a, t) => a + t.total, 0);
  const totalCorrect = attempts.reduce((a, t) => a + t.correctCount, 0);
  const totalScore = attempts.reduce((a, t) => a + t.score, 0);
  const avgPercent =
    totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;
  const bestScore = attempts.reduce((m, t) => Math.max(m, t.score), 0);

  // streak by day
  const days = new Set(attempts.map((a) => a.date.slice(0, 10)));
  let streak = 0;
  const today = new Date();
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    if (days.has(key)) streak++;
    else break;
  }

  // per subject
  const bySubject: Record<string, { attempts: number; correct: number; total: number; score: number }> = {};
  for (const a of attempts) {
    if (!bySubject[a.subject]) bySubject[a.subject] = { attempts: 0, correct: 0, total: 0, score: 0 };
    bySubject[a.subject].attempts++;
    bySubject[a.subject].correct += a.correctCount;
    bySubject[a.subject].total += a.total;
    bySubject[a.subject].score += a.score;
  }

  // weak topics (accuracy < 60%, at least 1 attempt)
  const topicMap: Record<string, { subject: string; topic: string; correct: number; total: number }> = {};
  for (const a of attempts) {
    const key = `${a.subject}::${a.topic ?? "—"}`;
    if (!topicMap[key]) topicMap[key] = { subject: a.subject, topic: a.topic ?? "—", correct: 0, total: 0 };
    topicMap[key].correct += a.correctCount;
    topicMap[key].total += a.total;
  }
  const weakTopics = Object.values(topicMap)
    .filter((t) => t.total > 0 && t.correct / t.total < 0.6)
    .sort((a, b) => a.correct / a.total - b.correct / b.total)
    .slice(0, 6);

  return {
    total,
    totalQuestions,
    totalCorrect,
    totalScore,
    avgPercent,
    bestScore,
    streak,
    bySubject,
    weakTopics,
  };
}