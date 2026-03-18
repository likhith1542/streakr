import { useState } from "react";
import { useAppStore, HABIT_COLORS } from "../store";
import { Heatmap } from "../components/Heatmap";
import { calculateStreak, getHeatmapData, isCompletedOnDate, TODAY } from "../hooks/useStreak";
import { format, eachDayOfInterval } from "date-fns";
import { ChevronDown, ChevronUp } from "lucide-react";

export function History() {
  const { habits, logs, toggleCompletion } = useAppStore();
  const [expandedHabit, setExpandedHabit] = useState<string | null>(null);

  const activeHabits = habits.filter((h) => !h.archivedAt);
  const archivedHabits = habits.filter((h) => h.archivedAt);

  // Monthly calendar for selected habit
  const today = new Date();
  const monthDays = eachDayOfInterval({
    start: new Date(today.getFullYear(), today.getMonth(), 1),
    end: new Date(today.getFullYear(), today.getMonth() + 1, 0),
  });

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h1
          className="font-display text-3xl font-bold tracking-tight"
          style={{ color: "var(--text-primary)" }}
        >
          History
        </h1>
        <p className="text-sm mt-0.5" style={{ color: "var(--text-muted)" }}>
          Your habit journey over time
        </p>
      </div>

      {activeHabits.length === 0 ? (
        <p className="text-center py-16" style={{ color: "var(--text-muted)" }}>
          No habits to show yet.
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {activeHabits.map((habit) => {
            const streak = calculateStreak(habit, logs);
            const heatmapData = getHeatmapData(habit.id, logs, 6);
            const isExpanded = expandedHabit === habit.id;
            const colorConfig = HABIT_COLORS[habit.color];

            return (
              <div key={habit.id} className="card overflow-hidden animate-fade-in">
                {/* Header */}
                <button
                  className="w-full flex items-center gap-3 p-4 text-left"
                  onClick={() =>
                    setExpandedHabit(isExpanded ? null : habit.id)
                  }
                >
                  <span className="text-2xl">{habit.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p
                      className="font-semibold text-sm"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {habit.name}
                    </p>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="text-xs font-mono" style={{ color: colorConfig.light }}>
                        🔥 {streak.current} streak
                      </span>
                      <span className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>
                        Best: {streak.longest}d
                      </span>
                      <span className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>
                        {streak.completionRate}% rate
                      </span>
                    </div>
                  </div>
                  {isExpanded ? (
                    <ChevronUp size={16} style={{ color: "var(--text-muted)" }} />
                  ) : (
                    <ChevronDown size={16} style={{ color: "var(--text-muted)" }} />
                  )}
                </button>

                {/* Expanded heatmap */}
                {isExpanded && (
                  <div
                    className="border-t px-4 pb-4 animate-slide-up"
                    style={{ borderColor: "var(--border)" }}
                  >
                    {/* Heatmap */}
                    <div className="mt-4 mb-4 overflow-x-auto">
                      <p
                        className="text-xs font-mono uppercase tracking-widest mb-3"
                        style={{ color: "var(--text-muted)" }}
                      >
                        Last 6 months
                      </p>
                      <Heatmap data={heatmapData} color={habit.color} weeks={26} />
                    </div>

                    {/* Monthly calendar */}
                    <div className="mt-4">
                      <p
                        className="text-xs font-mono uppercase tracking-widest mb-3"
                        style={{ color: "var(--text-muted)" }}
                      >
                        {format(today, "MMMM yyyy")} — click to toggle
                      </p>
                      <MonthCalendar
                        habitId={habit.id}
                        color={colorConfig.light}
                        days={monthDays}
                        logs={logs}
                        onToggle={(date) => toggleCompletion(habit.id, date)}
                      />
                    </div>

                    {/* Stats row */}
                    <div className="grid grid-cols-4 gap-2 mt-4">
                      {[
                        { label: "Current", value: `${streak.current}d` },
                        { label: "Longest", value: `${streak.longest}d` },
                        { label: "Total", value: `${streak.totalCompletions}` },
                        { label: "Rate", value: `${streak.completionRate}%` },
                      ].map(({ label, value }) => (
                        <div
                          key={label}
                          className="rounded-xl p-2.5 text-center"
                          style={{ background: "var(--bg-secondary)" }}
                        >
                          <p
                            className="font-display text-lg font-bold"
                            style={{ color: colorConfig.light }}
                          >
                            {value}
                          </p>
                          <p
                            className="text-xs font-mono"
                            style={{ color: "var(--text-muted)" }}
                          >
                            {label}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Archived */}
      {archivedHabits.length > 0 && (
        <div className="mt-8">
          <h2
            className="text-xs font-mono uppercase tracking-widest mb-3"
            style={{ color: "var(--text-muted)" }}
          >
            Archived Habits
          </h2>
          <div className="flex flex-col gap-2">
            {archivedHabits.map((habit) => {
              const streak = calculateStreak(habit, logs);
              return (
                <div
                  key={habit.id}
                  className="card p-3 flex items-center gap-3 opacity-60"
                >
                  <span className="text-xl">{habit.emoji}</span>
                  <div className="flex-1">
                    <p
                      className="text-sm font-medium"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {habit.name}
                    </p>
                    <p className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>
                      Best streak: {streak.longest}d · {streak.totalCompletions} completions
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function MonthCalendar({
  habitId,
  color,
  days,
  logs,
  onToggle,
}: {
  habitId: string;
  color: string;
  days: Date[];
  logs: any[];
  onToggle: (date: string) => void;
}) {
  const today = TODAY();
  const firstDayOfWeek = days[0].getDay(); // 0=Sun

  return (
    <div>
      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
          <div
            key={d}
            className="text-center text-xs font-mono"
            style={{ color: "var(--text-muted)" }}
          >
            {d}
          </div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Pad first row */}
        {Array.from({ length: firstDayOfWeek }).map((_, i) => (
          <div key={`pad-${i}`} />
        ))}

        {days.map((day) => {
          const dateStr = format(day, "yyyy-MM-dd");
          const done = isCompletedOnDate(habitId, dateStr, logs);
          const isFuture = day > new Date();
          const isToday = dateStr === today;

          return (
            <button
              key={dateStr}
              disabled={isFuture}
              onClick={() => onToggle(dateStr)}
              className="aspect-square rounded-lg flex items-center justify-center text-xs font-mono transition-all hover:scale-110 active:scale-95"
              style={{
                background: done ? color : isToday ? "var(--accent-subtle)" : "var(--bg-secondary)",
                color: done ? "white" : isToday ? "var(--accent)" : "var(--text-secondary)",
                opacity: isFuture ? 0.3 : 1,
                outline: isToday ? `2px solid var(--accent)` : "none",
                outlineOffset: 1,
                cursor: isFuture ? "default" : "pointer",
                fontWeight: isToday ? 700 : 400,
              }}
            >
              {day.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}
