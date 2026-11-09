import type { BuildingType } from "@/types";

interface Props {
  type: BuildingType;
  level: number;
}

/** Приблизна висота малюнка над центром ділянки — для бейджа рівня. */
export const BUILDING_VISUAL_HEIGHT: Record<BuildingType, number> = {
  house: 58,
  shop: 54,
  school: 58,
  library: 54,
  university: 76,
  park: 48,
  stadium: 42,
  road: 12,
  decoration: 42,
};

export function buildingVisualHeight(type: BuildingType, level: number): number {
  const base = BUILDING_VISUAL_HEIGHT[type];
  if (type === "road") return base;
  if (type === "park" || type === "stadium" || type === "decoration") {
    return base + (level - 1) * 3;
  }
  return base + (level - 1) * 10;
}

function House({ level }: { level: number }) {
  const bodyH = 26 + (level - 1) * 10;
  const bodyTop = -bodyH;
  const roofTop = bodyTop - 18;

  return (
    <g>
      <ellipse cx={0} cy={2} rx={26} ry={8} fill="#0f172a" opacity={0.12} />
      <ellipse cx={-18} cy={-2} rx={8} ry={4} fill="#4ade80" opacity={0.6} />
      <ellipse cx={18} cy={-1} rx={7} ry={3.5} fill="#4ade80" opacity={0.6} />

      <rect
        x={-18}
        y={bodyTop}
        width={36}
        height={bodyH}
        rx={3}
        fill="#fde68a"
        stroke="#d97706"
        strokeWidth={1.4}
      />
      <path
        d={`M-24 ${bodyTop} L0 ${roofTop} L24 ${bodyTop} Z`}
        fill="#ef4444"
        stroke="#b91c1c"
        strokeWidth={1.4}
        strokeLinejoin="round"
      />
      <path d={`M-24 ${bodyTop} L0 ${roofTop} L0 ${bodyTop} Z`} fill="#f87171" opacity={0.55} />
      <rect x={9} y={roofTop + 7} width={5} height={10} rx={1} fill="#b45309" />

      <rect x={-5} y={-15} width={10} height={15} rx={2} fill="#92400e" />
      <circle cx={3} cy={-7.5} r={1} fill="#fbbf24" />

      {Array.from({ length: level }).map((_, row) => (
        <g key={row}>
          <rect
            x={-13}
            y={bodyTop + 7 + row * 9}
            width={7}
            height={6}
            rx={1}
            fill="#7dd3fc"
            stroke="#1d4ed8"
            strokeWidth={0.8}
          />
          <rect
            x={6}
            y={bodyTop + 7 + row * 9}
            width={7}
            height={6}
            rx={1}
            fill="#7dd3fc"
            stroke="#1d4ed8"
            strokeWidth={0.8}
          />
        </g>
      ))}

      <circle cx={0} cy={roofTop + 12} r={3} fill="#fef3c7" stroke="#b91c1c" strokeWidth={0.8} />

      {level >= 2 && (
        <g className="city-tree">
          <rect x={24} y={-10} width={2.5} height={10} fill="#92400e" />
          <circle cx={25.2} cy={-14} r={6} fill="#22c55e" />
          <circle cx={22} cy={-10} r={4.5} fill="#16a34a" />
        </g>
      )}
    </g>
  );
}

function Shop({ level }: { level: number }) {
  const bodyH = 26 + (level - 1) * 8;
  const bodyTop = -bodyH;

  return (
    <g>
      <ellipse cx={0} cy={2} rx={28} ry={8} fill="#0f172a" opacity={0.12} />
      <rect
        x={-22}
        y={bodyTop}
        width={44}
        height={bodyH}
        rx={3}
        fill="#fecdd3"
        stroke="#e11d48"
        strokeWidth={1.4}
      />

      <rect x={-25} y={bodyTop - 7} width={50} height={8} rx={2} fill="#e11d48" />
      {Array.from({ length: 6 }).map((_, index) => (
        <rect
          key={index}
          x={-25 + index * 8.4}
          y={bodyTop - 7}
          width={4.2}
          height={8}
          fill="#fff1f2"
        />
      ))}

      <rect x={-15} y={bodyTop - 17} width={30} height={8} rx={2} fill="#0ea5e9" />
      <text
        x={0}
        y={bodyTop - 10.5}
        textAnchor="middle"
        fontSize={6}
        fontWeight={800}
        fill="#ffffff"
      >
        SHOP
      </text>

      <rect x={-13} y={-15} width={11} height={15} rx={1.5} fill="#7c2d12" />
      <rect
        x={2}
        y={-15}
        width={12}
        height={10}
        rx={1.5}
        fill="#7dd3fc"
        stroke="#0369a1"
        strokeWidth={0.8}
      />

      {level >= 2 && (
        <g>
          <rect
            x={-12}
            y={bodyTop + 5}
            width={9}
            height={7}
            rx={1}
            fill="#7dd3fc"
            stroke="#0369a1"
            strokeWidth={0.8}
          />
          <rect
            x={3}
            y={bodyTop + 5}
            width={9}
            height={7}
            rx={1}
            fill="#7dd3fc"
            stroke="#0369a1"
            strokeWidth={0.8}
          />
        </g>
      )}
      {level >= 3 && <rect x={-26} y={-3} width={52} height={3} rx={1} fill="#fb7185" />}
    </g>
  );
}

function School({ level }: { level: number }) {
  const width = 56 + (level - 1) * 10;
  const bodyH = 28 + (level - 1) * 6;
  const bodyTop = -bodyH;
  const windowXs = [-width * 0.3, -width * 0.12, width * 0.12, width * 0.3];

  return (
    <g>
      <ellipse cx={0} cy={2} rx={width / 2 + 4} ry={9} fill="#0f172a" opacity={0.12} />
      <rect
        x={-width / 2}
        y={bodyTop}
        width={width}
        height={bodyH}
        rx={3}
        fill="#fef3c7"
        stroke="#d97706"
        strokeWidth={1.4}
      />
      <path
        d={`M${-width / 2 - 4} ${bodyTop} L0 ${bodyTop - 16} L${width / 2 + 4} ${bodyTop} Z`}
        fill="#0ea5e9"
        stroke="#0369a1"
        strokeWidth={1.4}
        strokeLinejoin="round"
      />

      <rect x={-6} y={-18} width={12} height={18} rx={2} fill="#1d4ed8" />
      <rect x={-4} y={-16} width={8} height={7} rx={1} fill="#93c5fd" />

      {windowXs.map((x) => (
        <rect
          key={x}
          x={x - 3.5}
          y={bodyTop + 8}
          width={7}
          height={7}
          rx={1}
          fill="#7dd3fc"
          stroke="#1d4ed8"
          strokeWidth={0.8}
        />
      ))}

      <circle cx={0} cy={bodyTop - 8} r={4} fill="#ffffff" stroke="#0f172a" strokeWidth={1} />
      <path d="M0 -10.5 L0 -8 L1.8 -7" stroke="#0f172a" strokeWidth={0.8} fill="none" />

      <line
        x1={width / 2 + 2}
        y1={bodyTop}
        x2={width / 2 + 2}
        y2={bodyTop - 26}
        stroke="#475569"
        strokeWidth={1.5}
      />
      <g className="city-flag">
        <path
          d={`M${width / 2 + 2} ${bodyTop - 26} L${width / 2 + 16} ${bodyTop - 22} L${width / 2 + 2} ${bodyTop - 18} Z`}
          fill="#ef4444"
        />
      </g>

      {level >= 2 && (
        <g>
          <rect
            x={-width / 2 - 10}
            y={-16}
            width={10}
            height={16}
            fill="#fde68a"
            stroke="#d97706"
            strokeWidth={1.2}
          />
          <rect
            x={width / 2}
            y={-16}
            width={10}
            height={16}
            fill="#fde68a"
            stroke="#d97706"
            strokeWidth={1.2}
          />
        </g>
      )}
    </g>
  );
}

function Library({ level }: { level: number }) {
  const bodyH = 30 + (level - 1) * 6;
  const bodyTop = -bodyH;

  return (
    <g>
      <ellipse cx={0} cy={2} rx={30} ry={9} fill="#0f172a" opacity={0.12} />
      <rect x={-28} y={-5} width={56} height={5} rx={1} fill="#c4b5fd" />
      <rect x={-24} y={-8} width={48} height={4} rx={1} fill="#ddd6fe" />

      <rect
        x={-22}
        y={bodyTop}
        width={44}
        height={bodyH - 8}
        fill="#ede9fe"
        stroke="#7c3aed"
        strokeWidth={1.4}
      />
      {[-16, -8, 0, 8, 16].map((x) => (
        <rect
          key={x}
          x={x - 2}
          y={bodyTop + 5}
          width={4}
          height={bodyH - 18}
          rx={1}
          fill="#c4b5fd"
          stroke="#7c3aed"
          strokeWidth={0.8}
        />
      ))}

      <path
        d={`M-26 ${bodyTop} L0 ${bodyTop - 14} L26 ${bodyTop} Z`}
        fill="#7c3aed"
        stroke="#5b21b6"
        strokeWidth={1.2}
        strokeLinejoin="round"
      />
      <circle cx={0} cy={bodyTop - 6} r={3} fill="#fbbf24" />

      <rect x={-5} y={-16} width={10} height={10} rx={1} fill="#5b21b6" />
      <rect x={-10} y={bodyTop + 10} width={20} height={6} rx={1} fill="#fbbf24" opacity={0.9} />

      {level >= 2 && <rect x={-30} y={-14} width={60} height={3} rx={1} fill="#a78bfa" />}
      {level >= 3 && (
        <g>
          <rect x={-18} y={bodyTop - 18} width={3} height={5} fill="#fbbf24" />
          <rect x={15} y={bodyTop - 18} width={3} height={5} fill="#fbbf24" />
        </g>
      )}
    </g>
  );
}

function University({ level }: { level: number }) {
  const bodyH = 36 + (level - 1) * 8;
  const bodyTop = -bodyH;
  const width = 64;

  return (
    <g>
      <ellipse cx={0} cy={2} rx={36} ry={10} fill="#0f172a" opacity={0.12} />
      <rect
        x={-width / 2}
        y={bodyTop}
        width={width}
        height={bodyH}
        rx={2}
        fill="#ddd6fe"
        stroke="#4f46e5"
        strokeWidth={1.4}
      />

      <path
        d={`M-20 ${bodyTop} Q0 ${bodyTop - 30} 20 ${bodyTop} Z`}
        fill="#6366f1"
        stroke="#4338ca"
        strokeWidth={1.2}
      />
      <circle cx={0} cy={bodyTop - 28} r={4} fill="#fbbf24" stroke="#b45309" strokeWidth={0.8} />
      <line
        x1={0}
        y1={bodyTop - 32}
        x2={0}
        y2={bodyTop - 38}
        stroke="#b45309"
        strokeWidth={1.2}
      />

      {[-1, 1].map((side) => {
        const towerX = side === -1 ? -width / 2 - 10 : width / 2;
        return (
          <g key={side}>
            <rect
              x={towerX}
              y={bodyTop - 10}
              width={10}
              height={bodyH + 10}
              fill="#c7d2fe"
              stroke="#4338ca"
              strokeWidth={1.2}
            />
            <path
              d={`M${towerX - 2} ${bodyTop - 10} L${towerX + 5} ${bodyTop - 24} L${towerX + 12} ${bodyTop - 10} Z`}
              fill="#4f46e5"
            />
          </g>
        );
      })}

      <rect x={-7} y={-20} width={14} height={20} rx={2} fill="#4338ca" />
      <circle cx={0} cy={-10} r={3} fill="#fbbf24" opacity={0.8} />

      {[-22, -12, 12, 22].map((x) => (
        <rect
          key={x}
          x={x - 2.5}
          y={bodyTop + 8}
          width={5}
          height={8}
          rx={1}
          fill="#a5b4fc"
          stroke="#4338ca"
          strokeWidth={0.7}
        />
      ))}

      {level >= 2 && (
        <rect x={-width / 2 - 6} y={-6} width={width + 12} height={4} rx={1} fill="#a5b4fc" />
      )}
      {level >= 3 && (
        <g className="city-flag">
          <line
            x1={0}
            y1={bodyTop - 38}
            x2={0}
            y2={bodyTop - 52}
            stroke="#475569"
            strokeWidth={1.5}
          />
          <path
            d={`M0 ${bodyTop - 52} L14 ${bodyTop - 48} L0 ${bodyTop - 44} Z`}
            fill="#fbbf24"
          />
        </g>
      )}
    </g>
  );
}

function Tree({ x, y, scale = 1 }: { x: number; y: number; scale?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <g className="city-tree">
        <rect x={-1.5} y={-10} width={3} height={10} fill="#92400e" />
        <circle cx={0} cy={-15} r={7} fill="#22c55e" />
        <circle cx={-5} cy={-10} r={5} fill="#16a34a" />
        <circle cx={5} cy={-10} r={5} fill="#4ade80" />
      </g>
    </g>
  );
}

function Park({ level }: { level: number }) {
  return (
    <g>
      <ellipse cx={0} cy={2} rx={30} ry={10} fill="#4ade80" opacity={0.45} />
      <ellipse cx={0} cy={-1} rx={26} ry={8} fill="#86efac" />
      <ellipse cx={8} cy={-2} rx={11} ry={4.5} fill="#38bdf8" className="city-water" />
      <ellipse cx={8} cy={-2} rx={7} ry={2.5} fill="#7dd3fc" opacity={0.8} />

      <Tree x={-14} y={-4} />
      <Tree x={12} y={-8} scale={0.8} />
      {level >= 2 && <Tree x={-2} y={-12} scale={0.65} />}

      <rect x={-22} y={-6} width={10} height={2.5} rx={1} fill="#b45309" />
      <rect x={-20} y={-3.5} width={1.5} height={4} fill="#78350f" />
      <rect x={-13.5} y={-3.5} width={1.5} height={4} fill="#78350f" />

      {level >= 2 && (
        <g>
          {[
            [-24, -1],
            [-19, 1],
            [20, -1],
            [25, 1],
            [2, 2],
          ].map(([x, y], index) => (
            <circle
              key={index}
              cx={x}
              cy={y}
              r={1.6}
              fill={index % 2 ? "#f472b6" : "#fbbf24"}
            />
          ))}
        </g>
      )}
      {level >= 3 && <ellipse cx={-8} cy={-2} rx={4} ry={2} fill="#fbbf24" opacity={0.7} />}
    </g>
  );
}

function Stadium({ level }: { level: number }) {
  return (
    <g>
      <ellipse cx={0} cy={2} rx={32} ry={12} fill="#0f172a" opacity={0.12} />
      <ellipse cx={0} cy={-1} rx={31} ry={11} fill="#cbd5e1" stroke="#94a3b8" strokeWidth={1} />
      <ellipse cx={0} cy={-2} rx={24} ry={8.5} fill="#f97316" />
      <ellipse cx={0} cy={-2} rx={18} ry={6} fill="#22c55e" />
      <path d="M-18 -2 L18 -2" stroke="#f8fafc" strokeWidth={1} opacity={0.9} />
      <circle cx={0} cy={-2} r={2.5} stroke="#f8fafc" strokeWidth={0.8} fill="none" opacity={0.9} />

      <path d="M-31 -1 Q-30 -10 -18 -9" stroke="#e2e8f0" strokeWidth={3} fill="none" />
      <path d="M31 -1 Q30 -10 18 -9" stroke="#e2e8f0" strokeWidth={3} fill="none" />

      <g className="city-float">
        <line x1={-26} y1={-8} x2={-26} y2={-24} stroke="#64748b" strokeWidth={1.4} />
        <rect
          x={-30}
          y={-28}
          width={8}
          height={5}
          rx={1}
          fill="#fef08a"
          stroke="#ca8a04"
          strokeWidth={0.7}
        />
        <line x1={26} y1={-8} x2={26} y2={-24} stroke="#64748b" strokeWidth={1.4} />
        <rect
          x={22}
          y={-28}
          width={8}
          height={5}
          rx={1}
          fill="#fef08a"
          stroke="#ca8a04"
          strokeWidth={0.7}
        />
      </g>

      {level >= 2 && (
        <g>
          <ellipse cx={0} cy={-9} rx={12} ry={3} fill="#e2e8f0" opacity={0.7} />
          <path d="M-12 -9 Q0 -16 12 -9" stroke="#94a3b8" strokeWidth={1.2} fill="none" />
        </g>
      )}
      {level >= 3 && (
        <g>
          <rect x={-3} y={-20} width={6} height={4} rx={1} fill="#ef4444" />
          <line x1={0} y1={-20} x2={0} y2={-26} stroke="#475569" strokeWidth={1} />
        </g>
      )}
    </g>
  );
}

function Road() {
  return (
    <g>
      <polygon points="0,-18 38,0 0,18 -38,0" fill="#94a3b8" />
      <polygon points="0,-14 30,0 0,14 -30,0" fill="#64748b" opacity={0.4} />
      <path
        d="M-20 0 L20 0"
        stroke="#f8fafc"
        strokeWidth={3}
        strokeDasharray="6 6"
        strokeLinecap="round"
      />
      <path
        d="M0 -10 L0 10"
        stroke="#f8fafc"
        strokeWidth={3}
        strokeDasharray="6 6"
        strokeLinecap="round"
      />
    </g>
  );
}

function Decoration({ level }: { level: number }) {
  return (
    <g>
      <ellipse cx={0} cy={2} rx={18} ry={7} fill="#0f172a" opacity={0.1} />
      <ellipse cx={0} cy={-1} rx={16} ry={6} fill="#cbd5e1" stroke="#94a3b8" strokeWidth={0.8} />
      <ellipse cx={0} cy={-2} rx={12} ry={4} fill="#38bdf8" className="city-water" />

      <rect x={-1.5} y={-14} width={3} height={12} fill="#cbd5e1" />
      <circle cx={0} cy={-17} r={3.5} fill="#fbbf24" stroke="#b45309" strokeWidth={0.7} />
      <path d="M-4 -20 Q0 -26 4 -20" stroke="#7dd3fc" strokeWidth={1.2} fill="none" opacity={0.8} />

      {level >= 2 && (
        <g>
          {[
            [-12, -2],
            [12, -2],
            [-8, 1],
            [9, 1],
          ].map(([x, y], index) => (
            <g key={index}>
              <line x1={x} y1={y} x2={x} y2={y - 5} stroke="#22c55e" strokeWidth={1} />
              <circle cx={x} cy={y - 6} r={1.8} fill={index % 2 ? "#f472b6" : "#fbbf24"} />
            </g>
          ))}
        </g>
      )}
    </g>
  );
}

export function BuildingArt({ type, level }: Props) {
  const safeLevel = Math.max(1, Math.min(3, level));
  switch (type) {
    case "house":
      return <House level={safeLevel} />;
    case "shop":
      return <Shop level={safeLevel} />;
    case "school":
      return <School level={safeLevel} />;
    case "library":
      return <Library level={safeLevel} />;
    case "university":
      return <University level={safeLevel} />;
    case "park":
      return <Park level={safeLevel} />;
    case "stadium":
      return <Stadium level={safeLevel} />;
    case "road":
      return <Road />;
    case "decoration":
      return <Decoration level={safeLevel} />;
    default:
      return null;
  }
}
