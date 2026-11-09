import type { OpenRouterConfig, Question, Subject } from "@/types";
import { pickMockQuestions, shuffleQuestionOptions } from "@/data/mockQuestions";
import { SUBJECTS } from "@/data/subjects";

const STORAGE_KEY = "nmt_openrouter_config";
const DEFAULT_MODEL = "nvidia/nemotron-3.5-super-vl:free";

export function loadConfig(): OpenRouterConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<OpenRouterConfig>;
      if (parsed && typeof parsed === "object") {
        return {
          apiKey: typeof parsed.apiKey === "string" ? parsed.apiKey : "",
          model: typeof parsed.model === "string" ? parsed.model : DEFAULT_MODEL,
        };
      }
    }
  } catch {
    // ignore malformed storage
  }
  return { apiKey: "", model: DEFAULT_MODEL };
}

export function saveConfig(config: OpenRouterConfig): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}

export function clearApiKey(): void {
  localStorage.removeItem(STORAGE_KEY);
}

const SYSTEM_PROMPT = `Ти — дружній AI-т'ютор для підготовки до НМТ (національного мультимедійного тесту).
Ти генеруєш українською мовою тестові питання з 4 варіантами відповідей (A, B, C, D).
Відповідай СТРОГО у форматі JSON-масиву з 3 об'єктів, без жодного тексту поза ним.
Кожен об'єкт має поля:
  "prompt": string (питання),
  "options": string[4] (ровно 4 варіанти),
  "correctIndex": number (0..3, індекс правильної відповіді),
  "explanation": string (дружнє пояснення простими словами, українською, без нудних підручникових штампів, 1-3 речення).
Не пиши markdown, не додавай коментарів, лише чистий JSON-масив.`;

interface RawAIQuestion {
  prompt?: unknown;
  options?: unknown;
  correctIndex?: unknown;
  explanation?: unknown;
}

function isRawQuestion(v: unknown): v is RawAIQuestion {
  return typeof v === "object" && v !== null;
}

function normalize(raw: RawAIQuestion, subject: Subject, topic: string, idx: number): Question | null {
  const prompt = typeof raw.prompt === "string" ? raw.prompt.trim() : "";
  const options = Array.isArray(raw.options) ? raw.options : [];
  const correctIndex =
    typeof raw.correctIndex === "number" && raw.correctIndex >= 0 && raw.correctIndex <= 3
      ? raw.correctIndex
      : null;
  const explanation = typeof raw.explanation === "string" ? raw.explanation.trim() : "";

  if (!prompt || options.length !== 4 || correctIndex === null || !explanation) {
    return null;
  }

  const cleanOptions = options
    .map((o) => (typeof o === "string" ? o.trim() : ""))
    .filter((o) => o.length > 0);
  if (cleanOptions.length !== 4) return null;

  return shuffleQuestionOptions({
    id: `ai-${subject}-${idx}`,
    subject,
    topic,
    prompt,
    options: cleanOptions,
    correctIndex,
    explanation,
  });
}

function extractJson(text: string): unknown[] | null {
  // Спробуємо знайти JSON-масив у відповіді (модель може обернути в текст).
  const start = text.indexOf("[");
  const end = text.lastIndexOf("]");
  if (start === -1 || end === -1 || end <= start) return null;
  try {
    const parsed = JSON.parse(text.slice(start, end + 1));
    if (Array.isArray(parsed)) return parsed as unknown[];
  } catch {
    // ignore
  }
  return null;
}

export async function fetchAIQuestions(
  subject: Subject,
  topic: string,
  config: OpenRouterConfig
): Promise<{ questions: Question[]; source: "ai" | "mock" }> {
  const subjectMeta = SUBJECTS.find((s) => s.id === subject);
  const subjectLabel = subjectMeta?.label ?? subject;

  if (!config.apiKey.trim()) {
    // Mock-fallback: ключ відсутній
    return { questions: pickMockQuestions(subject, topic), source: "mock" };
  }

  const userPrompt = `Предмет: ${subjectLabel}.
Тема: ${topic}.
Згенеруй 3 тестові питання рівня НМТ саме цієї теми. Українською мовою. Пояснення мають бути дружніми і зрозумілими школяреві.`;

  try {
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.apiKey.trim()}`,
      },
      body: JSON.stringify({
        model: config.model,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
        response_format: { type: "json_object" },
      }),
    });

    if (!res.ok) {
      // Mock-fallback: API збій
      return { questions: pickMockQuestions(subject, topic), source: "mock" };
    }

    const data = await res.json();
    const content: string = data?.choices?.[0]?.message?.content ?? "";
    const rawArr = extractJson(content);

    if (!rawArr || rawArr.length < 3) {
      return { questions: pickMockQuestions(subject, topic), source: "mock" };
    }

    const normalized: Question[] = [];
    for (let i = 0; i < rawArr.length && normalized.length < 3; i++) {
      if (!isRawQuestion(rawArr[i])) continue;
      const q = normalize(rawArr[i] as RawAIQuestion, subject, topic, i);
      if (q) normalized.push(q);
    }

    if (normalized.length < 3) {
      return { questions: pickMockQuestions(subject, topic), source: "mock" };
    }

    return { questions: normalized, source: "ai" };
  } catch {
    // Mock-fallback: мережева помилка
    return { questions: pickMockQuestions(subject, topic), source: "mock" };
  }
}
