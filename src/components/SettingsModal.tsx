import { useState, useEffect, useRef } from "react";
import { X, KeyRound, Trash2, Eye, EyeOff, Sparkles } from "lucide-react";
import type { OpenRouterConfig } from "@/types";
import { saveConfig } from "@/lib/openrouter";

interface Props {
  open: boolean;
  config: OpenRouterConfig;
  onClose: () => void;
  onSave: (config: OpenRouterConfig) => void;
}

export function SettingsModal({ open, config, onClose, onSave }: Props) {
  const [apiKey, setApiKey] = useState(config.apiKey);
  const [model, setModel] = useState(config.model);
  const [show, setShow] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);

  // синхронізація з config при відкритті
  useEffect(() => {
    if (open) {
      setApiKey(config.apiKey);
      setModel(config.model);
      setShow(false);
    }
  }, [open, config]);

  // закриття по Escape + простий focus-trap
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key === "Tab" && dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    // фокус на перше поле
    const t = setTimeout(() => {
      const first = dialogRef.current?.querySelector<HTMLElement>("input");
      first?.focus();
    }, 0);
    return () => {
      document.removeEventListener("keydown", onKey);
      clearTimeout(t);
    };
  }, [open, onClose]);

  if (!open) return null;

  function handleSave() {
    const next: OpenRouterConfig = {
      apiKey: apiKey.trim(),
      model: model.trim() || "nvidia/nemotron-3.5-super-vl:free",
    };
    saveConfig(next);
    onSave(next);
    onClose();
  }

  function handleClear() {
    setApiKey("");
    const next: OpenRouterConfig = { apiKey: "", model };
    saveConfig(next);
    onSave(next);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-title"
        className="relative w-full max-w-md rounded-3xl bg-white shadow-2xl ring-1 ring-slate-200"
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div className="flex items-center gap-2">
            <KeyRound className="h-5 w-5 text-cyan-500" />
            <h2 id="settings-title" className="text-lg font-bold text-slate-800">Налаштування OpenRouter</h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Закрити"
            className="rounded-full p-1.5 text-slate-700 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-5 px-6 py-5">
          <div>
            <label htmlFor="openrouter-api-key" className="mb-1.5 block text-sm font-semibold text-slate-700">
              API-ключ OpenRouter
            </label>
            <div className="relative">
              <input
                id="openrouter-api-key"
                type={show ? "text" : "password"}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-or-v1-..."
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 pr-10 text-sm text-slate-800 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
              />
              <button
                type="button"
                onClick={() => setShow((s) => !s)}
                aria-label={show ? "Приховати ключ" : "Показати ключ"}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-700 hover:text-slate-700"
              >
                {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <p className="mt-1.5 text-xs text-slate-700">
              Зберігається лише у вашому браузері (localStorage). Без ключа працює
              локальний режим.
            </p>
          </div>

          <div>
            <label htmlFor="openrouter-model" className="mb-1.5 block text-sm font-semibold text-slate-700">
              Модель
            </label>
            <input
              id="openrouter-model"
              type="text"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              list="openrouter-models"
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
            />
            <datalist id="openrouter-models">
              <option value="nvidia/nemotron-3.5-super-vl:free" />
              <option value="xingchen-agi/xing4.0-29b-a4b:free" />
              <option value="dots-studio/dots-3-note-preview:free" />
              <option value="nvidia/nemotron-3.5-lightning:free" />
            </datalist>
          </div>

          <div className="flex items-center gap-3 rounded-2xl bg-amber-50 px-4 py-3">
            <Sparkles className="h-5 w-5 shrink-0 text-amber-800" />
            <p className="text-xs text-amber-800">
              Без ключа або при збій API додаток автоматично перемикається на
              вбудовані питання — робота не зупиняється.
            </p>
          </div>

          <div className="flex items-center justify-between gap-3 pt-1">
            <button
              onClick={handleClear}
              className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2.5 text-sm font-semibold text-rose-700 transition hover:bg-rose-50"
            >
              <Trash2 className="h-4 w-4" />
              Очистити ключ
            </button>
            <button
              onClick={handleSave}
              className="rounded-xl bg-gradient-to-r from-cyan-700 to-violet-700 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-cyan-500/25 transition hover:opacity-90"
            >
              Зберегти
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
