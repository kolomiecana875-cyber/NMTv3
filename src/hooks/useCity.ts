import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type {
  BuildingType,
  CityActionResult,
  CityMessage,
  CityState,
  DailyHistoryEntry,
} from "@/types";
import {
  demolishBuilding,
  deriveCity,
  loadCityState,
  placeBuilding,
  recordDailySession,
  subscribeCityState,
  upgradeBuilding,
  type CityDerived,
} from "@/lib/city";

export interface CityApi {
  state: CityState;
  derived: CityDerived;
  messages: CityMessage[];
  refresh: () => void;
  place: (type: BuildingType, plot: number) => CityActionResult;
  upgrade: (id: string) => CityActionResult;
  demolish: (id: string) => CityActionResult;
  syncDaily: (entry: DailyHistoryEntry) => CityActionResult;
  applyResult: (result: CityActionResult) => CityActionResult;
  dismiss: (id: string) => void;
}

export function useCity(): CityApi {
  const [state, setState] = useState<CityState>(() => loadCityState());
  const [messages, setMessages] = useState<CityMessage[]>([]);
  const timers = useRef<number[]>([]);

  const refresh = useCallback(() => setState(loadCityState()), []);

  useEffect(() => subscribeCityState(refresh), [refresh]);

  useEffect(
    () => () => {
      timers.current.forEach((timer) => window.clearTimeout(timer));
    },
    []
  );

  const pushMessages = useCallback((list: CityMessage[]) => {
    if (list.length === 0) return;
    setMessages((previous) => [...previous, ...list].slice(-4));
    for (const item of list) {
      const timer = window.setTimeout(() => {
        setMessages((previous) => previous.filter((message) => message.id !== item.id));
      }, 4600);
      timers.current.push(timer);
    }
  }, []);

  const applyResult = useCallback(
    (result: CityActionResult) => {
      setState(result.state);
      pushMessages(result.messages);
      return result;
    },
    [pushMessages]
  );

  const place = useCallback(
    (type: BuildingType, plot: number) => applyResult(placeBuilding(type, plot)),
    [applyResult]
  );

  const upgrade = useCallback(
    (id: string) => applyResult(upgradeBuilding(id)),
    [applyResult]
  );

  const demolish = useCallback(
    (id: string) => applyResult(demolishBuilding(id)),
    [applyResult]
  );

  const syncDaily = useCallback(
    (entry: DailyHistoryEntry) => applyResult(recordDailySession(entry)),
    [applyResult]
  );

  const dismiss = useCallback((id: string) => {
    setMessages((previous) => previous.filter((message) => message.id !== id));
  }, []);

  const derived = useMemo(() => deriveCity(state), [state]);

  return {
    state,
    derived,
    messages,
    refresh,
    place,
    upgrade,
    demolish,
    syncDaily,
    applyResult,
    dismiss,
  };
}
