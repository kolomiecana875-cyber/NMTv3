import { useEffect, useMemo, useState } from "react";
import { Coins, Hammer, Lock, Sparkles, Users, X } from "lucide-react";
import type { BuildingType, CityState } from "@/types";
import { BUILDINGS, getBuildingDef } from "@/lib/cityConfig";

interface Props {
  plot: number;
  city: CityState;
  level: number;
  onClose: () => void;
  onBuild: (type: BuildingType, plot: number) => boolean;
}

export function BuildModal({ plot, city, level, onClose, onBuild }: Props) {
  const ordered = useMemo(
    () => [...BUILDINGS].sort((a, b) => a.unlockLevel - b.unlockLevel || a.baseCost - b.baseCost),
    []
  );

  const firstAvailable =
    ordered.find((def) => def.unlockLevel <= level && def.baseCost <= city.coins)?.type ??
    ordered.find((def) => def.unlockLevel <= level)?.type ??
    ordered[0].type;

  const [selected, setSelected] = useState<BuildingType>(firstAvailable);
  const selectedDef = getBuildingDef(selected);
  const locked = Boolean(selectedDef && selectedDef.unlockLevel > level);
  const tooExpensive = Boolean(selectedDef && selectedDef.baseCost > city.coins);
  const canBuild = Boolean(selectedDef && !locked && !tooExpensive);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/45 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Будівництво"
    >
      <div
        className="city-fade-in max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-t-3xl bg-white p-5 shadow-2xl ring-1 ring-slate-200 sm:rounded-3xl sm:p-6"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-emerald-600">
              Ділянка №{plot + 1}
            </p>
            <h2 className="mt-0.5 text-xl font-black tracking-tight text-slate-900">
              Що тут збудуємо?
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Баланс: <span className="font-bold text-amber-600">{city.coins} монет</span> · рівень
              міста {level}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl bg-slate-100 p-2 text-slate-500 transition hover:bg-slate-200 hover:text-slate-700"
            aria-label="Закрити"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="grid gap-2.5 sm:grid-cols-2">
          {ordered.map((def) => {
            const isLocked = def.unlockLevel > level;
            const isSelected = selected === def.type;
            const affordable = def.baseCost <= city.coins;
            return (
              <button
                key={def.type}
                onClick={() => setSelected(def.type)}
                className={`relative overflow-hidden rounded-2xl border-2 p-3.5 text-left transition ${
                  isSelected
                    ? "border-emerald-500 bg-emerald-50/70 shadow-md shadow-emerald-500/10"
                    : "border-slate-200 bg-white hover:border-emerald-300 hover:bg-emerald-50/30"
                } ${isLocked ? "opacity-70" : ""}`}
                aria-pressed={isSelected}
              >
                <div className="flex items-start gap-3">
                  <span
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-2xl"
                    style={{ backgroundColor: `${def.accent}22` }}
                  >
                    {def.emoji}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-extrabold text-slate-900">{def.name}</p>
                      {isLocked && <Lock className="h-3.5 w-3.5 shrink-0 text-slate-400" />}
                    </div>
                    <p className="mt-0.5 line-clamp-2 text-[11px] leading-snug text-slate-500">
                      {def.description}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-bold">
                      <span className={affordable ? "text-amber-600" : "text-rose-500"}>
                        <Coins className="mr-0.5 inline h-3 w-3" />
                        {def.baseCost}
                      </span>
                      {def.population > 0 && (
                        <span className="text-slate-500">
                          <Users className="mr-0.5 inline h-3 w-3" />
                          +{def.population}
                        </span>
                      )}
                      <span className="text-violet-600">
                        <Sparkles className="mr-0.5 inline h-3 w-3" />+{def.xp} XP
                      </span>
                    </div>
                    {isLocked && (
                      <p className="mt-1.5 rounded-lg bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-500">
                        Відкриється на {def.unlockLevel} рівні міста
                      </p>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {selectedDef && (
          <div className="mt-4 rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200/70">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-extrabold text-slate-900">{selectedDef.name}</p>
                <p className="text-xs text-slate-500">
                  {selectedDef.maxLevel > 1
                    ? `Максимальний рівень: ${selectedDef.maxLevel}`
                    : "Одноразова споруда"}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Вартість
                </p>
                <p className="text-lg font-black text-amber-600">{selectedDef.baseCost} монет</p>
              </div>
            </div>
          </div>
        )}

        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <button
            onClick={onClose}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border-2 border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
          >
            Скасувати
          </button>
          <button
            onClick={() => {
              if (!canBuild) return;
              const success = onBuild(selected, plot);
              if (success) onClose();
            }}
            disabled={!canBuild}
            className={`inline-flex flex-1 items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-bold text-white shadow-lg transition ${
              canBuild
                ? "bg-gradient-to-r from-emerald-600 to-teal-600 shadow-emerald-600/20 hover:brightness-105 active:scale-[0.99]"
                : "cursor-not-allowed bg-slate-300 shadow-none"
            }`}
          >
            <Hammer className="h-4 w-4" />
            {locked
              ? `Потрібен ${selectedDef?.unlockLevel} рівень`
              : tooExpensive
                ? `Не вистачає ${(selectedDef?.baseCost ?? 0) - city.coins} монет`
                : `Побудувати · ${selectedDef?.baseCost} монет`}
          </button>
        </div>
      </div>
    </div>
  );
}
