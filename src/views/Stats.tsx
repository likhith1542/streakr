import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
} from "recharts";
import { useAppStore, HABIT_COLORS } from "../store";
import { calculateStreak, isCompletedOnDate } from "../hooks/useStreak";
import { format, subDays, eachDayOfInterval } from "date-fns";

export function Stats() {
  const { habits, logs } = useAppStore();
  const activeHabits = habits.filter((h) => !h.archivedAt);

  // Last 14 days completion data
  const last14 = useMemo(() => {
    const days = eachDayOfInterval({
      start: subDays(new Date(), 13),
      end: new Date(),
    });
    return days.map((day) => {
      const dateStr = format(day, "yyyy-MM-dd");
      const completed = activeHabits.filter((h) =>
        isCompletedOnDate(h.id, dateStr, logs)
      ).length;
      return {
        date: format(day, "MMM d"),
        completed,
        total: activeHabits.length,
        pct: activeHabits.length > 0 ? Math.round((completed / activeHabits.length) * 100) : 0,
      };
    });
  }, [habits, logs]);

  // Per-habit streak data sorted by current streak
  const habitStats = useMemo(() => {
    return activeHabits
      .map((h) => {
        const s = calculateStreak(h, logs);
        return {
          habit: h,
          ...s,
          colorConfig: HABIT_COLORS[h.color],
        };
      })
      .sort((a, b) => b.current - a.current);
  }, [habits, logs]);

  // Overall stats
  const totalLogs = logs.length;
  const perfectDays = useMemo(() => {
    if (activeHabits.length === 0) return 0;
    const last30 = eachDayOfInterval({
      start: subDays(new Date(), 29),
      end: new Date(),
    });
    return last30.filter((day) => {
      const dateStr = format(day, "yyyy-MM-dd");
      return activeHabits.every((h) => isCompletedOnDate(h.id, dateStr, logs));
    }).length;
  }, [habits, logs]);

  const mostConsistent = habitStats[0];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div
        className="px-3 py-2 rounded-xl text-xs font-mono shadow-lg border"
        style={{
          background: "var(--bg-card)",
          borderColor: "var(--border)",
          color: "var(--text-primary)",
        }}
      >
        <p className="font-bold mb-1">{label}</p>
        {payload.map((p: any) => (
          <p key={p.name} style={{ color: p.color }}>
            {p.name}: {p.value}{p.name === "Rate %" ? "%" : ""}
          </p>
        ))}
      </div>
    );
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h1
          className="font-display text-3xl font-bold tracking-tight"
          style={{ color: "var(--text-primary)" }}
        >
          Statistics
        </h1>
        <p className="text-sm mt-0.5" style={{ color: "var(--text-muted)" }}>
          Your habit performance at a glance
        </p>
      </div>

      {activeHabits.length === 0 ? (
        <p className="text-center py-16" style={{ color: "var(--text-muted)" }}>
          Add some habits to see stats here.
        </p>
      ) : (
        <>
          {/* Overview cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
            {[
              { label: "Total logs", value: totalLogs, icon: "📝" },
              { label: "Active habits", value: activeHabits.length, icon: "🎯" },
              { label: "Perfect days (30d)", value: perfectDays, icon: "⭐" },
              {
                label: "Best habit",
                value: mostConsistent ? `${mostConsistent.habit.emoji}` : "–",
                sublabel: mostConsistent?.habit.name,
                icon: null,
              },
            ].map(({ label, value, icon, sublabel }) => (
              <div key={label} className="card p-4">
                {icon && <div className="text-2xl mb-1">{icon}</div>}
                <p
                  className="font-display text-2xl font-bold"
                  style={{ color: "var(--text-primary)" }}
                >
                  {value}
                </p>
                {sublabel && (
                  <p className="text-xs truncate" style={{ color: "var(--accent)" }}>
                    {sublabel}
                  </p>
                )}
                <p className="text-xs mt-0.5 font-mono" style={{ color: "var(--text-muted)" }}>
                  {label}
                </p>
              </div>
            ))}
          </div>

          {/* 14-day bar chart */}
          <div className="card p-5 mb-5">
            <h2
              className="font-display text-base font-semibold mb-4"
              style={{ color: "var(--text-primary)" }}
            >
              Completions — Last 14 Days
            </h2>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={last14} barSize={14}>
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10, fill: "var(--text-muted)", fontFamily: "JetBrains Mono" }}
                  axisLine={false}
                  tickLine={false}
                  interval={2}
                />
                <YAxis hide />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="completed"
                  name="Done"
                  fill="var(--accent)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* 14-day rate line chart */}
          <div className="card p-5 mb-5">
            <h2
              className="font-display text-base font-semibold mb-4"
              style={{ color: "var(--text-primary)" }}
            >
              Completion Rate % — Last 14 Days
            </h2>
            <ResponsiveContainer width="100%" height={140}>
              <LineChart data={last14}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--border)"
                  vertical={false}
                />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10, fill: "var(--text-muted)", fontFamily: "JetBrains Mono" }}
                  axisLine={false}
                  tickLine={false}
                  interval={2}
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fontSize: 10, fill: "var(--text-muted)", fontFamily: "JetBrains Mono" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `${v}%`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="pct"
                  name="Rate %"
                  stroke="var(--accent)"
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{ r: 5, fill: "var(--accent)" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Per-habit leaderboard */}
          <div className="card p-5">
            <h2
              className="font-display text-base font-semibold mb-4"
              style={{ color: "var(--text-primary)" }}
            >
              Habit Leaderboard
            </h2>
            <div className="flex flex-col gap-3">
              {habitStats.map(({ habit, current, longest, completionRate, colorConfig }, i) => (
                <div key={habit.id} className="flex items-center gap-3">
                  <span
                    className="font-mono text-sm w-5 text-right flex-shrink-0"
                    style={{ color: i === 0 ? "#f59e0b" : "var(--text-muted)" }}
                  >
                    {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}.`}
                  </span>
                  <span className="text-lg flex-shrink-0">{habit.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-sm font-semibold truncate"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {habit.name}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <div
                        className="flex-1 h-1.5 rounded-full overflow-hidden"
                        style={{ background: "var(--border)" }}
                      >
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${completionRate}%`,
                            background: colorConfig.light,
                          }}
                        />
                      </div>
                      <span
                        className="text-xs font-mono flex-shrink-0"
                        style={{ color: "var(--text-muted)" }}
                      >
                        {completionRate}%
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end flex-shrink-0">
                    <span className="text-sm font-mono font-bold" style={{ color: colorConfig.light }}>
                      🔥 {current}
                    </span>
                    <span className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>
                      best {longest}d
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
