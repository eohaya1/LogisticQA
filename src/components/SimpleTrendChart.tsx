export interface TrendPoint {
  weekNumber: number;
  actualValue: number | null;
  targetValue: number | null;
}

interface SimpleTrendChartProps {
  title: string;
  unitLabel: string;
  points: TrendPoint[];
  direction?: "higher-is-better" | "lower-is-better";
}

export function SimpleTrendChart({
  title,
  unitLabel,
  points,
}: SimpleTrendChartProps) {
  const numericValues = points.flatMap((p) => {
    const vals: number[] = [];
    if (p.actualValue !== null) vals.push(p.actualValue);
    if (p.targetValue !== null) vals.push(p.targetValue);
    return vals;
  });

  if (numericValues.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-600">
        Set a goal or log a result for <span className="font-semibold">{title}</span> to see your week-to-week trend line.
      </div>
    );
  }

  const rawMin = Math.min(...numericValues);
  const rawMax = Math.max(...numericValues);
  const padding = rawMax === rawMin ? Math.max(Math.abs(rawMax) * 0.1, 1) : (rawMax - rawMin) * 0.15;
  const minVal = rawMin - padding;
  const maxVal = rawMax + padding;
  const span = maxVal - minVal || 1;

  const width = 640;
  const height = 210;
  const padLeft = 48;
  const padRight = 20;
  const padTop = 20;
  const padBottom = 34;
  const plotWidth = width - padLeft - padRight;
  const plotHeight = height - padTop - padBottom;

  const xForWeek = (week: number) => {
    const minW = points[0]?.weekNumber ?? 1;
    const maxW = points[points.length - 1]?.weekNumber ?? 12;
    const weekSpan = Math.max(maxW - minW, 1);
    return padLeft + ((week - minW) / weekSpan) * plotWidth;
  };

  const yForValue = (val: number) => {
    const ratio = (val - minVal) / span;
    return padTop + plotHeight - ratio * plotHeight;
  };

  const targetCoords = points
    .filter((p): p is TrendPoint & { targetValue: number } => p.targetValue !== null)
    .map((p) => ({ x: xForWeek(p.weekNumber), y: yForValue(p.targetValue), val: p.targetValue }));

  const actualCoords = points
    .filter((p): p is TrendPoint & { actualValue: number } => p.actualValue !== null)
    .map((p) => ({ x: xForWeek(p.weekNumber), y: yForValue(p.actualValue), val: p.actualValue, week: p.weekNumber }));

  const toPath = (coords: { x: number; y: number }[]) =>
    coords.map((c, idx) => `${idx === 0 ? "M" : "L"} ${c.x.toFixed(1)} ${c.y.toFixed(1)}`).join(" ");

  const midVal = (minVal + maxVal) / 2;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <h4 className="text-sm font-semibold text-slate-900">
          {title} ({unitLabel})
        </h4>
        <div className="flex items-center gap-4 text-xs text-slate-600">
          {targetCoords.length > 0 && (
            <span className="inline-flex items-center gap-1.5">
              <span aria-hidden className="inline-block h-0.5 w-4 border-t-2 border-dashed border-slate-400" />
              Weekly Target
            </span>
          )}
          {actualCoords.length > 0 && (
            <span className="inline-flex items-center gap-1.5">
              <span aria-hidden className="inline-block h-2.5 w-2.5 rounded-full bg-amber-600" />
              Logged Result
            </span>
          )}
        </div>
      </div>

      <svg
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label={`${title} week-to-week chart`}
        className="w-full h-auto overflow-visible"
      >
        {[rawMax, midVal, rawMin].map((tickVal, idx) => {
          const y = yForValue(tickVal);
          return (
            <g key={idx}>
              <line
                x1={padLeft}
                y1={y}
                x2={width - padRight}
                y2={y}
                stroke="#e2e8f0"
                strokeWidth="1"
              />
              <text
                x={padLeft - 8}
                y={y + 4}
                textAnchor="end"
                className="fill-slate-500 text-[10px] tabular-nums"
              >
                {Number.isInteger(tickVal) ? tickVal : tickVal.toFixed(2)}
              </text>
            </g>
          );
        })}

        {points.map((p) => (
          <text
            key={p.weekNumber}
            x={xForWeek(p.weekNumber)}
            y={height - 10}
            textAnchor="middle"
            className="fill-slate-500 text-[10px] tabular-nums"
          >
            W{p.weekNumber}
          </text>
        ))}

        {targetCoords.length >= 2 && (
          <path
            d={toPath(targetCoords)}
            fill="none"
            stroke="#94a3b8"
            strokeWidth="2"
            strokeDasharray="5 5"
          />
        )}

        {actualCoords.length >= 2 && (
          <path
            d={toPath(actualCoords)}
            fill="none"
            stroke="#d97706"
            strokeWidth="2.5"
          />
        )}

        {actualCoords.map((pt) => (
          <g key={pt.week}>
            <circle cx={pt.x} cy={pt.y} r="4.5" fill="#d97706" stroke="#ffffff" strokeWidth="1.5" />
            <text
              x={pt.x}
              y={pt.y - 9}
              textAnchor="middle"
              className="fill-slate-800 text-[10px] font-semibold tabular-nums"
            >
              {pt.val}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
