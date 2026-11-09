import type { CityState, PlacedBuilding } from "@/types";
import { getBuildingDef, PLOT_COLS, PLOT_ROWS } from "@/lib/cityConfig";
import { BuildingArt, buildingVisualHeight } from "@/components/city/BuildingArt";

const TILE_W = 80;
const TILE_H = 40;
const ORIGIN_X = 400;
const ORIGIN_Y = 112;

interface Props {
  city: CityState;
  onPlotClick: (plot: number) => void;
  onBuildingClick: (building: PlacedBuilding) => void;
}

function plotCenter(plot: number): { x: number; y: number; col: number; row: number } {
  const col = plot % PLOT_COLS;
  const row = Math.floor(plot / PLOT_COLS);
  return {
    x: ORIGIN_X + (col - row) * (TILE_W / 2),
    y: ORIGIN_Y + (col + row) * (TILE_H / 2),
    col,
    row,
  };
}

function DecorativeTree({
  x,
  y,
  scale = 1,
  tone = "green",
}: {
  x: number;
  y: number;
  scale?: number;
  tone?: "green" | "dark";
}) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`} opacity={0.85}>
      <g className="city-tree">
        <rect x={-2} y={-14} width={4} height={14} fill="#92400e" />
        <circle cx={0} cy={-21} r={10} fill={tone === "dark" ? "#15803d" : "#22c55e"} />
        <circle cx={-7} cy={-14} r={7} fill={tone === "dark" ? "#166534" : "#16a34a"} />
        <circle cx={7} cy={-14} r={7} fill={tone === "dark" ? "#166534" : "#4ade80"} />
      </g>
    </g>
  );
}

export function CityMap({ city, onPlotClick, onBuildingClick }: Props) {
  const occupied = new Map<number, PlacedBuilding>();
  for (const building of city.buildings) occupied.set(building.plot, building);

  const plots = Array.from({ length: PLOT_COLS * PLOT_ROWS }, (_, index) => index).sort((a, b) => {
    const centerA = plotCenter(a);
    const centerB = plotCenter(b);
    return centerA.col + centerA.row - (centerB.col + centerB.row);
  });

  const buildings = [...city.buildings].sort((a, b) => {
    const centerA = plotCenter(a.plot);
    const centerB = plotCenter(b.plot);
    return centerA.col + centerA.row - (centerB.col + centerB.row);
  });

  return (
    <div className="overflow-hidden rounded-2xl bg-gradient-to-b from-sky-100 to-emerald-50 ring-1 ring-slate-200/70">
      <svg
        viewBox="0 0 800 430"
        className="h-auto w-full"
        role="img"
        aria-label="Інтерактивна карта міста"
      >
        <defs>
          <linearGradient id="city-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#e0f2fe" />
            <stop offset="55%" stopColor="#ecfeff" />
            <stop offset="100%" stopColor="#f0fdf4" />
          </linearGradient>
          <linearGradient id="city-grass" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#bbf7d0" />
            <stop offset="100%" stopColor="#86efac" />
          </linearGradient>
          <radialGradient id="city-sun" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fef9c3" />
            <stop offset="70%" stopColor="#fde68a" />
            <stop offset="100%" stopColor="#fbbf24" stopOpacity="0.25" />
          </radialGradient>
          <linearGradient id="city-water" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#7dd3fc" />
            <stop offset="100%" stopColor="#38bdf8" />
          </linearGradient>
          <filter id="city-soft-shadow" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="4" stdDeviation="5" floodColor="#14532d" floodOpacity="0.16" />
          </filter>
        </defs>

        {/* Небо та сонце */}
        <rect width="800" height="430" fill="url(#city-sky)" />
        <circle cx="692" cy="70" r="42" fill="url(#city-sun)" />
        <g className="city-float" opacity="0.9">
          <ellipse cx="120" cy="70" rx="34" ry="14" fill="#ffffff" opacity="0.75" />
          <ellipse cx="148" cy="62" rx="24" ry="12" fill="#ffffff" opacity="0.75" />
          <ellipse cx="96" cy="62" rx="20" ry="10" fill="#ffffff" opacity="0.65" />
        </g>
        <g className="city-float" opacity="0.7">
          <ellipse cx="620" cy="140" rx="28" ry="11" fill="#ffffff" opacity="0.7" />
          <ellipse cx="642" cy="134" rx="19" ry="9" fill="#ffffff" opacity="0.7" />
        </g>

        {/* Острів */}
        <ellipse cx="440" cy="220" rx="300" ry="168" fill="#65a30d" opacity="0.18" />
        <ellipse
          cx="440"
          cy="212"
          rx="282"
          ry="154"
          fill="url(#city-grass)"
          filter="url(#city-soft-shadow)"
        />
        <ellipse cx="440" cy="208" rx="258" ry="136" fill="#a7f3d0" opacity="0.45" />

        {/* Річка та озеро на краю */}
        <path
          d="M120 250 C190 235 230 265 300 250 C360 237 400 260 470 252"
          stroke="url(#city-water)"
          strokeWidth="16"
          strokeLinecap="round"
          fill="none"
          opacity="0.45"
          className="city-water"
        />

        {/* Декоративні дерева навколо карти */}
        <DecorativeTree x={196} y={300} scale={1.1} tone="dark" />
        <DecorativeTree x={222} y={330} scale={0.9} />
        <DecorativeTree x={660} y={296} scale={1.15} tone="dark" />
        <DecorativeTree x={638} y={330} scale={0.85} />
        <DecorativeTree x={250} y={96} scale={0.9} tone="dark" />
        <DecorativeTree x={620} y={82} scale={1} />
        <DecorativeTree x={168} y={196} scale={0.8} tone="dark" />
        <DecorativeTree x={706} y={190} scale={0.85} />
        <DecorativeTree x={320} y={382} scale={0.8} />
        <DecorativeTree x={548} y={386} scale={0.9} tone="dark" />

        {/* Квіти на галявині */}
        {[
          [300, 360],
          [330, 372],
          [470, 374],
          [500, 362],
          [560, 352],
          [220, 170],
          [650, 160],
        ].map(([x, y], index) => (
          <g key={`${x}-${y}`}>
            <circle cx={x} cy={y} r={2.2} fill={index % 2 ? "#f472b6" : "#fbbf24"} />
            <circle cx={x + 7} cy={y + 3} r={1.8} fill={index % 2 ? "#fbbf24" : "#fb7185"} />
          </g>
        ))}

        {/* Ділянки */}
        {plots.map((plot) => {
          const center = plotCenter(plot);
          const building = occupied.get(plot);
          return (
            <g
              key={plot}
              transform={`translate(${center.x} ${center.y})`}
              className="group cursor-pointer outline-none"
              onClick={() => (building ? onBuildingClick(building) : onPlotClick(plot))}
              role="button"
              tabIndex={0}
              onKeyDown={(event) => {
                if (event.key !== "Enter" && event.key !== " ") return;
                event.preventDefault();
                if (building) onBuildingClick(building);
                else onPlotClick(plot);
              }}
            >
              <title>
                {building
                  ? `${getBuildingDef(building.type)?.name ?? "Будівля"} · рівень ${building.level}`
                  : "Вільна ділянка. Натисни, щоб збудувати"}
              </title>
              <polygon
                points="0,-20 40,0 0,20 -40,0"
                fill={building ? "#94a3b8" : "#86efac"}
                fillOpacity={building ? 0.35 : 0.75}
                stroke={building ? "#64748b" : "#22c55e"}
                strokeOpacity={building ? 0.45 : 0.55}
                strokeWidth={1.2}
                className="transition-all duration-200 group-hover:brightness-105"
              />
              <polygon
                points="0,-15 30,0 0,15 -30,0"
                fill="none"
                stroke="#ffffff"
                strokeOpacity={building ? 0.18 : 0.45}
                strokeWidth={1}
                strokeDasharray={building ? undefined : "4 4"}
              />
              {!building && (
                <g className="pointer-events-none opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                  <circle cx={0} cy={0} r={11} fill="#ffffff" opacity={0.9} />
                  <path
                    d="M-5 0 L5 0 M0 -5 L0 5"
                    stroke="#16a34a"
                    strokeWidth={2}
                    strokeLinecap="round"
                  />
                </g>
              )}
            </g>
          );
        })}

        {/* Будівлі — від дальніх до ближніх */}
        {buildings.map((building) => {
          const center = plotCenter(building.plot);
          const def = getBuildingDef(building.type);
          const height = buildingVisualHeight(building.type, building.level);
          return (
            <g
              key={`${building.id}-${building.level}`}
              transform={`translate(${center.x} ${center.y})`}
              className="cursor-pointer outline-none"
              onClick={() => onBuildingClick(building)}
              role="button"
              tabIndex={0}
              onKeyDown={(event) => {
                if (event.key !== "Enter" && event.key !== " ") return;
                event.preventDefault();
                onBuildingClick(building);
              }}
            >
              <title>
                {def?.name ?? "Будівля"} · рівень {building.level}
              </title>
              <g className="city-building">
                <BuildingArt type={building.type} level={building.level} />
              </g>

              <rect
                x={-32}
                y={-height - 8}
                width={64}
                height={height + 16}
                fill="transparent"
              />

              {building.type !== "road" && (
                <g transform={`translate(0 ${-height - 4})`} className="pointer-events-none">
                  <rect
                    x={-14}
                    y={-7}
                    width={28}
                    height={13}
                    rx={6.5}
                    fill="#0f172a"
                    opacity={0.8}
                  />
                  <text
                    x={0}
                    y={2.6}
                    textAnchor="middle"
                    fontSize={7.5}
                    fontWeight={800}
                    fill="#ffffff"
                  >
                    Lv {building.level}
                  </text>
                </g>
              )}
            </g>
          );
        })}

        {/* Легенда-підказка */}
        <g transform="translate(28 396)" opacity={0.8}>
          <rect x={0} y={-14} width={210} height={22} rx={11} fill="#ffffff" opacity={0.78} />
          <circle cx={12} cy={-3} r={4} fill="#22c55e" />
          <text x={22} y={0.5} fontSize={9} fontWeight={700} fill="#166534">
            Натисни на ділянку, щоб будувати
          </text>
        </g>
      </svg>
    </div>
  );
}
