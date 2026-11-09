import { useEffect, useState, type ReactNode } from "react";
import { ArrowUpCircle, Coins, Sparkles, Trash2, Users, X } from "lucide-react";
import type { CityState, PlacedBuilding } from "@/types";
import { CITY_ECONOMY, getBuildingDef, totalInvested, upgradeCost } from "@/lib/cityConfig";
import { BuildingArt } from "@/components/city/BuildingArt";

interface Props {
  building: PlacedBuilding;
  city: CityState;
  onClose: () => void;
  onUpgrade: (id: string) => boolean;
  onDemolish: (id: string) => boolean;
}

export function BuildingModal({ building, city, onClose, onUpgrade, onDemolish }: Props) {
  const def = getBuildingDef(building.type);
  const [confirmSell, setConfirmSell] = useState(false);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  if (!def) return null;

  const isMax = building.level >= def.maxLevel;
  const cost = isMax ? 0 : upgradeCost(def, building.level);
  const canUpgrade = !isMax && city.coins >= cost;
  const refund = Math.round(totalInvested(def, building.level) * CITY_ECONOMY.sellRefundRate);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/45 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={def.name}
    >
      <div
        className="city-fade-in max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-t-3xl bg-white p-5 shadow-2xl ring-1 ring-slate-200 sm:rounded-3xl sm:p-6"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-emerald-600">
              {def.emoji} {def.name}
            </p>
            <h2 className="mt-0.5 text-xl font-black tracking-tight text-slate-900">
              Рівень {building.level}
              <span className="text-sm font-bold text-slate-400"> / {def.maxLevel}</span>
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl bg-slate-100 p-2 text-slate-500 transition hover:bg-slate-200 hover:text-slate-700"
            aria-label="Закрити"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-sky-100 via-emerald-50 to-emerald-100 ring-1 ring-emerald-100">
          <svg viewBox="-80 -120 160 150" className="mx-auto h-44 w-full" aria-hidden="true">
            <ellipse cx="0" cy="0" rx="46" ry="16" fill="#86efac" opacity="0.7" />
            <ellipse cx="0" cy="0" rx="34" ry="11" fill="#4ade80" opacity="0.5" />
            <g className="city-float">
              <BuildingArt type={building.type} level={building.level} />
            </g>
          </svg>
          <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-bold text-emerald-700 ring-1 ring-emerald-100">
            Ділянка №{building.plot + 1}
          </span>
        </div>

        <p className="mt-3 text-xs leading-relaxed text-slate-500">{def.description}</p>

        <div className="mt-3 grid grid-cols-3 gap-2">
          <Stat
            icon={<Users className="h-4 w-4 text-emerald-500" />}
            value={
              def.population > 0
                ? `+${Math.round(def.population * (1 + (building.level - 1) * 0.75))}`
                : "—"
            }
            label="Населення"
          />
          <Stat
            icon={<Sparkles className="h-4 w-4 text-violet-500" />}
            value={`+${Math.round(def.xp * (1 + (building.level - 1) * 0.6))}`}
            label="XP міста"
          />
          <Stat
            icon={<Coins className="h-4 w-4 text-amber-500" />}
            value={city.coins}
            label="Баланс"
          />
        </div>

        {!isMax && (
          <div className="mt-4 rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200/70">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-extrabold text-slate-900">
                  Покращити до рівня {building.level + 1}
                </p>
                <p className="text-xs text-slate-500">
                  Більше населення, більше XP і виглядає краще.
                </p>
              </div>
              <p className="text-lg font-black text-amber-600">{cost} монет</p>
            </div>
            <button
              onClick={() => {
                if (!canUpgrade) return;
                const success = onUpgrade(building.id);
                if (success) onClose();
              }}
              disabled={!canUpgrade}
              className={`mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-bold text-white shadow-lg transition ${
                canUpgrade
                  ? "bg-gradient-to-r from-violet-600 to-cyan-500 shadow-violet-600/20 hover:brightness-105 active:scale-[0.99]"
                  : "cursor-not-allowed bg-slate-300 shadow-none"
              }`}
            >
              <ArrowUpCircle className="h-4 w-4" />
              {canUpgrade
                ? `Покращити · ${cost} монет`
                : `Не вистачає ${cost - city.coins} монет`}
            </button>
          </div>
        )}

        {isMax && (
          <div className="mt-4 rounded-2xl bg-emerald-50 p-4 text-center ring-1 ring-emerald-100">
            <p className="text-sm font-extrabold text-emerald-700">
              🏆 Максимальний рівень досягнуто
            </p>
            <p className="mt-1 text-xs text-emerald-600">
              Ця будівля вже виглядає як найкраща версія.
            </p>
          </div>
        )}

        <div className="mt-4 rounded-2xl border border-rose-100 bg-rose-50/60 p-3.5">
          {confirmSell ? (
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs font-bold text-rose-700">
                Точно продати? Повернеться {refund} монет.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setConfirmSell(false)}
                  className="rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-slate-600 ring-1 ring-slate-200"
                >
                  Ні
                </button>
                <button
                  onClick={() => {
                    const success = onDemolish(building.id);
                    if (success) onClose();
                  }}
                  className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-rose-700"
                >
                  Продати
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setConfirmSell(true)}
              className="inline-flex w-full items-center justify-center gap-2 text-xs font-bold text-rose-600 transition hover:text-rose-800"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Продати будівлю · +{refund} монет
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Stat({
  icon,
  value,
  label,
}: {
  icon: ReactNode;
  value: string | number;
  label: string;
}) {
  return (
    <div className="rounded-xl bg-white p-2.5 text-center ring-1 ring-slate-200/70">
      <div className="mb-0.5 flex justify-center">{icon}</div>
      <p className="text-sm font-extrabold leading-tight text-slate-900">{value}</p>
      <p className="text-[10px] font-semibold text-slate-400">{label}</p>
    </div>
  );
}
