import { useEffect, useMemo, useState } from "react";

/**
 * Декоративний фон із корел (корола).
 * Птахи розкладаються по невидимій сітці: кожен сидить у своїй клітинці,
 * тому вони не накладаються один на одного.
 * Шар не приймає кліків і лежить під усім інтерфейсом.
 */

const PARROT_COUNT = 42;
const MAX_ROTATION = 28;

interface Parrot {
  /** центр по горизонталі, % */
  left: number;
  /** центр по вертикалі, % */
  top: number;
  width: number;
  height: number;
  rotate: number;
  opacity: number;
  flip: boolean;
}

/** Детермінований генератор, щоб птахи не «стрибали» при кожному рендері. */
function mulberry32(seed: number): () => number {
  let value = seed;
  return () => {
    value |= 0;
    value = (value + 0x6d2b79f5) | 0;
    let t = Math.imul(value ^ (value >>> 15), 1 | value);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function buildParrots(width: number, height: number): Parrot[] {
  const random = mulberry32(20261107);
  const count = PARROT_COUNT;

  // Підбираємо кількість колонок/рядків під пропорції екрана.
  const aspect = width / Math.max(1, height);
  let cols = Math.max(4, Math.round(Math.sqrt(count * aspect)));
  let rows = Math.ceil(count / cols);
  while (cols * rows < count) cols += 1;

  const cellW = width / cols;
  const cellH = height / rows;
  const padding = 0.86;

  // Перемішуємо клітинки й беремо стільки, скільки потрібно птахів.
  const cells = Array.from({ length: cols * rows }, (_, index) => index);
  for (let i = cells.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [cells[i], cells[j]] = [cells[j], cells[i]];
  }

  return cells.slice(0, count).map((cell) => {
    const col = cell % cols;
    const row = Math.floor(cell / cols);

    const rotate = random() * MAX_ROTATION * 2 - MAX_ROTATION;
    const rad = (Math.abs(rotate) * Math.PI) / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);

    // Бажаний розмір птаха, але не більший за клітинку.
    let birdW = Math.min(cellW * 0.62, cellH * 0.5, 120);
    let birdH = birdW * 1.4;

    // Зменшуємо так, щоб повернутий прямокутник гарантовано вліз у клітинку.
    const bboxW = birdW * cos + birdH * sin;
    const bboxH = birdW * sin + birdH * cos;
    const scale = Math.min(1, (cellW * padding) / bboxW, (cellH * padding) / bboxH);
    birdW *= scale;
    birdH *= scale;

    // Невеликий «розкид» усередині клітинки — і жодного перекриття.
    const freeX = Math.max(0, (cellW - cellW * padding) / 2);
    const freeY = Math.max(0, (cellH - cellH * padding) / 2);
    const centerX = col * cellW + cellW / 2 + (random() * 2 - 1) * freeX;
    const centerY = row * cellH + cellH / 2 + (random() * 2 - 1) * freeY;

    return {
      left: (centerX / width) * 100,
      top: (centerY / height) * 100,
      width: birdW,
      height: birdH,
      rotate,
      opacity: 0.18 + random() * 0.16,
      flip: random() > 0.5,
    };
  });
}

function useViewportSize() {
  const [size, setSize] = useState(() => ({
    width: typeof window === "undefined" ? 1280 : window.innerWidth,
    height: typeof window === "undefined" ? 800 : window.innerHeight,
  }));

  useEffect(() => {
    const onResize = () => setSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return size;
}

function Corella({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 140"
      className={className}
      role="presentation"
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* хвіст */}
      <path d="M52 92 C60 108 68 124 74 136 C70 137 66 136 63 133 C56 120 50 108 46 98 Z" fill="#6f7887" />
      <path d="M56 94 C64 110 71 124 77 135 C74 136 71 135 68 132 C61 119 55 107 51 98 Z" fill="#9aa3b2" />

      {/* тіло */}
      <ellipse cx="48" cy="84" rx="23" ry="31" fill="#9aa3b2" transform="rotate(-6 48 84)" />
      {/* живіт */}
      <ellipse cx="43" cy="90" rx="14" ry="20" fill="#d5dbe4" transform="rotate(-6 43 90)" />
      {/* крило */}
      <path d="M57 66 C70 73 74 90 67 106 C63 97 58 88 52 80 Z" fill="#6f7887" />
      <path d="M58 76 C66 82 69 92 66 101" stroke="#cfd6df" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.7" />

      {/* голова */}
      <circle cx="45" cy="42" r="21" fill="#f5c542" />
      {/* чубчик */}
      <path d="M40 24 C37 12 41 5 46 2 C44 11 46 18 49 24 Z" fill="#f7d154" />
      <path d="M47 23 C49 11 54 6 58 4 C54 12 53 18 53 25 Z" fill="#f5c542" />
      <path d="M35 26 C31 16 33 9 37 5 C36 14 38 21 41 26 Z" fill="#f7d154" />

      {/* щічка */}
      <circle cx="35" cy="50" r="7.5" fill="#f97316" />
      {/* око */}
      <circle cx="33" cy="39" r="3.2" fill="#1f2937" />
      <circle cx="32" cy="38" r="1.1" fill="#ffffff" />
      {/* дзьоб */}
      <path d="M24 43 C17 45 16 52 23 55 C26 53 27 48 26 45 Z" fill="#d7dbe2" />
      <path d="M24 52 C20 52 18 54 19 56" stroke="#b9c0cb" strokeWidth="1.4" strokeLinecap="round" fill="none" />

      {/* лапки */}
      <path d="M42 111 L40 120 M40 120 L35 123 M40 120 L44 124" stroke="#6f7887" strokeWidth="3" strokeLinecap="round" fill="none" />
      <path d="M53 111 L55 120 M55 120 L50 123 M55 120 L60 124" stroke="#6f7887" strokeWidth="3" strokeLinecap="round" fill="none" />
    </svg>
  );
}

export function ParrotBackground() {
  const { width, height } = useViewportSize();
  const parrots = useMemo(() => buildParrots(width, height), [width, height]);

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 select-none">
      {parrots.map((parrot, index) => (
        <div
          key={index}
          className="absolute"
          style={{
            left: `${parrot.left}%`,
            top: `${parrot.top}%`,
            width: parrot.width,
            height: parrot.height,
            transform: `translate(-50%, -50%) rotate(${parrot.rotate}deg)${parrot.flip ? " scaleX(-1)" : ""}`,
            opacity: parrot.opacity,
          }}
        >
          <Corella className="h-full w-full" />
        </div>
      ))}
    </div>
  );
}
