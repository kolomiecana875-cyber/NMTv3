import { useCallback, useEffect, useState } from "react";
import type { CityActionResult, DailyCount, PracticeSession, Subject } from "@/types";
import {
  advancePracticeSession,
  answerPracticeSession,
  clearPracticeSession,
  loadPracticeSession,
  startPracticeSession,
  subscribePracticeSession,
} from "@/lib/practice";

export interface PracticeApi {
  session: PracticeSession | null;
  start: (subject: Subject, count: DailyCount) => PracticeSession;
  answer: (selectedIndex: number) => PracticeSession | null;
  advance: () => ReturnType<typeof advancePracticeSession> | null;
  reset: () => void;
}

export function usePractice(onCityResult: (result: CityActionResult) => void): PracticeApi {
  const [session, setSession] = useState<PracticeSession | null>(() => loadPracticeSession());

  useEffect(() => subscribePracticeSession(() => setSession(loadPracticeSession())), []);

  const start = useCallback((subject: Subject, count: DailyCount) => {
    const next = startPracticeSession(subject, count);
    setSession(next);
    return next;
  }, []);

  const answer = useCallback(
    (selectedIndex: number) => {
      if (!session) return null;
      const result = answerPracticeSession(session, selectedIndex);
      setSession(result.session);
      if (result.city) onCityResult(result.city);
      return result.session;
    },
    [session, onCityResult]
  );

  const advance = useCallback(() => {
    if (!session) return null;
    const result = advancePracticeSession(session);
    setSession(result.session);
    if (result.city) onCityResult(result.city);
    return result;
  }, [session, onCityResult]);

  const reset = useCallback(() => {
    clearPracticeSession();
    setSession(null);
  }, []);

  return { session, start, answer, advance, reset };
}
