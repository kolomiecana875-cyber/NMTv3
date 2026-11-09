import { useCallback, useEffect, useMemo, useState } from "react";
import type { DailyCount, DailyState } from "@/types";
import {
  advanceDailySession,
  answerDailyQuestion,
  deriveDailySystem,
  loadDailyState,
  startDailySession,
  subscribeDailyState,
} from "@/lib/daily";

export function useDailySystem() {
  const [state, setState] = useState<DailyState>(() => loadDailyState());
  const [now, setNow] = useState(() => Date.now());

  const refresh = useCallback(() => {
    setState(loadDailyState());
    setNow(Date.now());
  }, []);

  useEffect(() => subscribeDailyState(refresh), [refresh]);

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const system = useMemo(() => deriveDailySystem(state, now), [state, now]);

  const start = useCallback(async (count: DailyCount) => {
    const next = await startDailySession(count);
    setState(next);
    setNow(Date.now());
    return next;
  }, []);

  const answer = useCallback((selectedIndex: number | null) => {
    const next = answerDailyQuestion(selectedIndex);
    setState(next);
    setNow(Date.now());
    return next;
  }, []);

  const advance = useCallback(async () => {
    const next = await advanceDailySession();
    setState(next);
    setNow(Date.now());
    return next;
  }, []);

  return {
    ...system,
    state,
    start,
    answer,
    advance,
    refresh,
  };
}

export type DailySystemApi = ReturnType<typeof useDailySystem>;
