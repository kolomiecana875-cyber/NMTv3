import { AlertTriangle, CheckCircle2, Coins, Info, Target, Trophy, X } from "lucide-react";
import type { CityMessage, CityMessageKind } from "@/types";

interface Props {
  messages: CityMessage[];
  onDismiss: (id: string) => void;
}

const TONE: Record<CityMessageKind, string> = {
  coins: "bg-amber-50 text-amber-900 ring-amber-200",
  mission: "bg-emerald-50 text-emerald-900 ring-emerald-200",
  achievement: "bg-violet-50 text-violet-900 ring-violet-200",
  error: "bg-rose-50 text-rose-900 ring-rose-200",
  info: "bg-slate-50 text-slate-800 ring-slate-200",
};

function MessageIcon({ kind }: { kind: CityMessageKind }) {
  switch (kind) {
    case "coins":
      return <Coins className="h-4 w-4 shrink-0 text-amber-600" />;
    case "mission":
      return <Target className="h-4 w-4 shrink-0 text-emerald-600" />;
    case "achievement":
      return <Trophy className="h-4 w-4 shrink-0 text-violet-600" />;
    case "error":
      return <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600" />;
    default:
      return <Info className="h-4 w-4 shrink-0 text-slate-500" />;
  }
}

export function CityToasts({ messages, onDismiss }: Props) {
  if (messages.length === 0) return null;

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-50 flex w-[calc(100%-2rem)] max-w-sm flex-col gap-2">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`toast-in pointer-events-auto flex items-start gap-2.5 rounded-2xl px-3.5 py-3 text-xs font-bold shadow-xl ring-1 ${TONE[message.kind]}`}
          role="status"
        >
          <MessageIcon kind={message.kind} />
          <p className="flex-1 leading-snug">{message.text}</p>
          <button
            onClick={() => onDismiss(message.id)}
            className="rounded-lg p-0.5 opacity-60 transition hover:opacity-100"
            aria-label="Закрити повідомлення"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}
