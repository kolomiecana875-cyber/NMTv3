import type { Question } from "@/types";

export const ENGLISH_QUESTIONS: Question[] = [
  {
    id: "e1",
    subject: "english",
    topic: "Граматика",
    prompt: "Choose the correct option: She ___ to school every day.",
    options: ["goes", "go", "going", "gone"],
    correctIndex: 0,
    explanation:
      "У Present Simple з підметом third person singular (she) до дієслова додаємо -s: she goes.",
    difficulty: "easy",
    taskType: "Grammar",
  },
  {
    id: "e2",
    subject: "english",
    topic: "Граматика",
    prompt: "Choose the correct option: I ___ my homework yesterday.",
    options: ["did", "do", "done", "doing"],
    correctIndex: 0,
    explanation:
      "З обставиною часу yesterday використовуємо Past Simple. Для дієслова do форма минулого часу — did.",
    difficulty: "easy",
    taskType: "Grammar",
  },
  {
    id: "e3",
    subject: "english",
    topic: "Граматика",
    prompt: "Choose the correct option: They ___ TV now.",
    options: ["are watching", "watch", "watched", "watches"],
    correctIndex: 0,
    explanation:
      "Дія відбувається зараз (now), тому потрібен Present Continuous: they are watching TV.",
    difficulty: "medium",
    taskType: "Grammar",
  },
  {
    id: "e4",
    subject: "english",
    topic: "Граматика",
    prompt: "Choose the correct option: If it ___ tomorrow, we will stay at home.",
    options: ["rains", "will rain", "rained", "raining"],
    correctIndex: 0,
    explanation:
      "У First Conditional після if використовуємо Present Simple, а в головній частині — will + інфінітив.",
    difficulty: "medium",
    taskType: "Grammar",
  },
  {
    id: "e5",
    subject: "english",
    topic: "Граматика",
    prompt: "Choose the correct option: This book is ___ than that one.",
    options: ["more interesting", "interesting", "most interesting", "interestinger"],
    correctIndex: 0,
    explanation:
      "Для довгих прикметників (interesting) вищий ступінь утворюємо за допомогою more: more interesting than.",
    difficulty: "medium",
    taskType: "Grammar",
  },
  {
    id: "e6",
    subject: "english",
    topic: "Граматика",
    prompt: "Choose the correct option: He has lived here ___ 2010.",
    options: ["since", "for", "from", "at"],
    correctIndex: 0,
    explanation:
      "Since уживаємо з конкретним моментом у минулому (2010), а for — з проміжком часу (for ten years).",
    difficulty: "medium",
    taskType: "Grammar",
  },
  {
    id: "e7",
    subject: "english",
    topic: "Словник",
    prompt: "Choose the synonym for «happy».",
    options: ["glad", "sad", "angry", "tired"],
    correctIndex: 0,
    explanation:
      "Glad означає «радий», тобто є синонімом до happy. Sad — сумний, angry — сердитий, tired — втомлений.",
    difficulty: "easy",
    taskType: "Vocabulary",
  },
  {
    id: "e8",
    subject: "english",
    topic: "Словник",
    prompt: "Choose the antonym for «expensive».",
    options: ["cheap", "costly", "rich", "price"],
    correctIndex: 0,
    explanation:
      "Expensive означає «дорогий», а його антонім — cheap («дешевий»). Costly — синонім до expensive.",
    difficulty: "easy",
    taskType: "Vocabulary",
  },
  {
    id: "e9",
    subject: "english",
    topic: "Словник",
    prompt: "Choose the correct word: We need to ___ a decision.",
    options: ["make", "do", "take", "get"],
    correctIndex: 0,
    explanation:
      "Сталий вираз — make a decision («ухвалити рішення»). З decision уживаємо дієслово make.",
    difficulty: "medium",
    taskType: "Collocations",
  },
  {
    id: "e10",
    subject: "english",
    topic: "Читання",
    prompt:
      "Read: «Tom gets up at 7 a.m. He has breakfast and goes to school by bus. Lessons start at 8:30.» How does Tom get to school?",
    options: ["By bus", "By car", "On foot", "By train"],
    correctIndex: 0,
    explanation:
      "У тексті прямо сказано: «He ... goes to school by bus». Отже, Том їздить до школи автобусом.",
    difficulty: "easy",
    taskType: "Reading",
  },
  {
    id: "e11",
    subject: "english",
    topic: "Читання",
    prompt:
      "Read: «Anna likes reading books about animals. Her favourite subject is biology.» What is Anna's favourite subject?",
    options: ["Biology", "Maths", "History", "Art"],
    correctIndex: 0,
    explanation:
      "У тексті сказано: «Her favourite subject is biology». Тому правильна відповідь — Biology.",
    difficulty: "easy",
    taskType: "Reading",
  },
  {
    id: "e12",
    subject: "english",
    topic: "Граматика",
    prompt: "Choose the correct option: There ___ some milk in the fridge.",
    options: ["is", "are", "have", "be"],
    correctIndex: 0,
    explanation:
      "Milk — незлічуваний іменник, тому вживаємо однину: There is some milk in the fridge.",
    difficulty: "medium",
    taskType: "Grammar",
  },
];
