import { useEffect, useState } from "react";
import { formatCountdown } from "@/lib/daily";

interface Props {
  target: string | null;
  compact?: boolean;
}

function segments(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  return {
    hours: String(Math.floor(total / 3600)).padStart(2, "0"),
    minutes: String(Math.floor((total % 3600) / 60)).padStart(2, "0"),
    seconds: String(total % 60).padStart(2, "0"),
  };
}

export function Countdown({ target, compact = false }: Props) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const timestamp = target ? Date.parse(target) : NaN;
  const remaining = Number.isFinite(timestamp) ? Math.max(0, timestamp - now) : 0;

  if (!target || !Number.isFinite(timestamp)) {
    return <span className="font-semibold text-emerald-700">Доступно зараз</span>;
  }

  if (remaining <= 0) {
    return <span className="font-semibold text-emerald-700">Доступно зараз</span>;
  }

  if (compact) {
    return (
      <span className="font-mono text-sm font-bold tabular-nums text-slate-800">
        {formatCountdown(remaining)}
      </span>
    );
  }

  const { hours, minutes, seconds } = segments(remaining);
  return (
    <div className="flex items-center gap-2" aria-label={`До наступного повторення ${formatCountdown(remaining)}`}>
      {[
        { value: hours, label: "год" },
        { value: minutes, label: "хв" },
        { value: seconds, label: "сек" },
      ].map((part) => (
        <div
          key={part.label}
          className="flex min-w-[3.4rem] flex-col items-center rounded-xl bg-white/80 px-2.5 py-1.5 ring-1 ring-slate-200/80"
        >
          <span className="font-mono text-xl font-extrabold tabular-nums text-slate-800">
            {part.value}
          </span>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
            {part.label}
          </span>
        </div>
      ))}
    </div>
  );
}
