import { format, parseISO, subDays, eachDayOfInterval, startOfWeek } from "date-fns";
import { HABIT_COLORS } from "../store";
import { HabitColor } from "../types";
import { useState } from "react";

interface HeatmapProps {
  data: { date: string; count: number }[];
  color: HabitColor;
  weeks?: number;
}

export function Heatmap({ data, color, weeks = 26 }: HeatmapProps) {
  const [tooltip, setTooltip] = useState<{ date: string; done: boolean; x: number; y: number } | null>(null);
  const colorConfig = HABIT_COLORS[color];

  const end = new Date();
  const start = subDays(end, weeks * 7 - 1);

  // Pad start to Sunday
  const paddedStart = startOfWeek(start);
  const allDays = eachDayOfInterval({ start: paddedStart, end });

  const dataMap = new Map(data.map((d) => [d.date, d.count]));

  // Group into weeks (columns)
  const columns: { date: Date; inRange: boolean }[][] = [];
  for (let i = 0; i < allDays.length; i += 7) {
    columns.push(
      allDays.slice(i, i + 7).map((d) => ({
        date: d,
        inRange: d >= start && d <= end,
      }))
    );
  }

  const DAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];
  const MONTH_LABELS: { label: string; col: number }[] = [];
  let lastMonth = -1;
  columns.forEach((col, ci) => {
    const month = col[0].date.getMonth();
    if (month !== lastMonth) {
      MONTH_LABELS.push({ label: format(col[0].date, "MMM"), col: ci });
      lastMonth = month;
    }
  });

  const CELL = 12;
  const GAP = 3;

  return (
    <div className="relative overflow-x-auto">
      <div style={{ display: "flex", gap: GAP, position: "relative" }}>
        {/* Day labels */}
        <div style={{ display: "flex", flexDirection: "column", gap: GAP, paddingTop: 18 }}>
          {DAY_LABELS.map((d, i) => (
            <div
              key={i}
              style={{
                height: CELL,
                width: 10,
                fontSize: 9,
                color: "var(--text-muted)",
                fontFamily: "JetBrains Mono",
                lineHeight: `${CELL}px`,
                visibility: i % 2 === 0 ? "visible" : "hidden",
              }}
            >
              {d}
            </div>
          ))}
        </div>

        {/* Grid */}
        <div>
          {/* Month labels */}
          <div style={{ display: "flex", gap: GAP, marginBottom: 4, height: 14 }}>
            {columns.map((_, ci) => {
              const ml = MONTH_LABELS.find((m) => m.col === ci);
              return (
                <div
                  key={ci}
                  style={{
                    width: CELL,
                    fontSize: 9,
                    color: ml ? "var(--text-muted)" : "transparent",
                    fontFamily: "JetBrains Mono",
                    whiteSpace: "nowrap",
                    overflow: "visible",
                  }}
                >
                  {ml?.label || ""}
                </div>
              );
            })}
          </div>

          {/* Cells */}
          <div style={{ display: "flex", gap: GAP }}>
            {columns.map((col, ci) => (
              <div key={ci} style={{ display: "flex", flexDirection: "column", gap: GAP }}>
                {col.map(({ date, inRange }, ri) => {
                  const dateStr = format(date, "yyyy-MM-dd");
                  const done = inRange && (dataMap.get(dateStr) || 0) > 0;
                  const future = date > new Date();

                  return (
                    <div
                      key={ri}
                      className="heatmap-cell"
                      style={{
                        width: CELL,
                        height: CELL,
                        borderRadius: 3,
                        background: !inRange || future
                          ? "transparent"
                          : done
                          ? colorConfig.light
                          : "var(--border)",
                        cursor: inRange && !future ? "pointer" : "default",
                        opacity: future ? 0.3 : 1,
                      }}
                      onMouseEnter={(e) => {
                        if (!inRange || future) return;
                        const rect = e.currentTarget.getBoundingClientRect();
                        setTooltip({ date: dateStr, done, x: rect.left, y: rect.top });
                      }}
                      onMouseLeave={() => setTooltip(null)}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="fixed z-50 px-2 py-1 rounded-lg text-xs font-mono pointer-events-none"
          style={{
            left: tooltip.x,
            top: tooltip.y - 30,
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
            color: "var(--text-primary)",
            boxShadow: "var(--shadow-md)",
            whiteSpace: "nowrap",
          }}
        >
          {format(parseISO(tooltip.date), "MMM d, yyyy")} — {tooltip.done ? "✓ Done" : "✗ Missed"}
        </div>
      )}
    </div>
  );
}
