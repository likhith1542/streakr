import { useState } from "react";
import { MoreVertical, Edit2, Archive, Trash2 } from "lucide-react";
import { useAppStore, HABIT_COLORS } from "../store";
import { Habit } from "../types";
import { calculateStreak, isCompletedOnDate, TODAY, isScheduledForDate } from "../hooks/useStreak";
import clsx from "clsx";

interface HabitCardProps {
  habit: Habit;
  animationDelay?: number;
}

export function HabitCard({ habit, animationDelay = 0 }: HabitCardProps) {
  const { logs, toggleCompletion, setEditingHabit, archiveHabit, deleteHabit } = useAppStore();
  const [showMenu, setShowMenu] = useState(false);
  const [justCompleted, setJustCompleted] = useState(false);

  const today = TODAY();
  const isCompleted = isCompletedOnDate(habit.id, today, logs);
  const isScheduled = isScheduledForDate(habit, today);
  const streak = calculateStreak(habit, logs);
  const colorConfig = HABIT_COLORS[habit.color];

  const handleToggle = () => {
    if (!isScheduled) return;
    toggleCompletion(habit.id);
    if (!isCompleted) {
      setJustCompleted(true);
      setTimeout(() => setJustCompleted(false), 600);
    }
  };

  return (
    <div
      className="card p-4 flex items-center gap-4 group animate-slide-up hover:shadow-md transition-all duration-200"
      style={{
        animationDelay: `${animationDelay}ms`,
        animationFillMode: "both",
        opacity: !isScheduled ? 0.45 : 1,
      }}
    >
      {/* Check button */}
      <button
        onClick={handleToggle}
        className={clsx("habit-check", { done: isCompleted })}
        style={
          isCompleted
            ? { background: colorConfig.light, borderColor: "transparent" }
            : { borderColor: colorConfig.light }
        }
        disabled={!isScheduled}
        title={!isScheduled ? "Not scheduled today" : undefined}
      >
        {isCompleted ? (
          <span
            className={clsx("text-white text-lg", { "animate-streak-pop": justCompleted })}
          >
            ✓
          </span>
        ) : (
          <span className="text-xl">{habit.emoji}</span>
        )}
      </button>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span
            className="font-body font-semibold text-sm truncate"
            style={{
              color: isCompleted ? "var(--text-muted)" : "var(--text-primary)",
              textDecoration: isCompleted ? "line-through" : "none",
            }}
          >
            {habit.name}
          </span>
          {!isScheduled && (
            <span
              className="text-xs px-1.5 py-0.5 rounded font-mono"
              style={{ background: "var(--bg-secondary)", color: "var(--text-muted)" }}
            >
              rest day
            </span>
          )}
        </div>

        {habit.description && (
          <p className="text-xs truncate mt-0.5" style={{ color: "var(--text-muted)" }}>
            {habit.description}
          </p>
        )}

        {/* Frequency label */}
        <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
          {habit.frequency.type === "daily"
            ? "Every day"
            : habit.frequency.type === "weekly"
            ? `${habit.frequency.days.length}×/week`
            : `${habit.frequency.count}×/week`}
        </p>
      </div>

      {/* Streak */}
      <div className="flex flex-col items-end gap-1 flex-shrink-0">
        {streak.current > 0 && (
          <div className="flex items-center gap-1">
            <span className="streak-flame text-base">🔥</span>
            <span
              className="font-mono font-bold text-sm"
              style={{ color: colorConfig.light }}
            >
              {streak.current}
            </span>
          </div>
        )}
        {streak.current === 0 && isScheduled && !isCompleted && (
          <span className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>
            Start!
          </span>
        )}
        <div
          className="w-16 h-1 rounded-full overflow-hidden"
          style={{ background: "var(--border)" }}
        >
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${streak.completionRate}%`,
              background: colorConfig.light,
            }}
          />
        </div>
        <span className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>
          {streak.completionRate}%
        </span>
      </div>

      {/* Menu */}
      <div className="relative opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          className="btn-ghost p-1.5 rounded-lg"
          onClick={() => setShowMenu(!showMenu)}
        >
          <MoreVertical size={15} />
        </button>

        {showMenu && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setShowMenu(false)}
            />
            <div
              className="absolute right-0 top-8 z-20 w-36 rounded-xl shadow-lg border overflow-hidden"
              style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}
            >
              <button
                className="w-full text-left px-3 py-2.5 text-sm flex items-center gap-2 hover:bg-opacity-50 transition-colors"
                style={{ color: "var(--text-secondary)" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-hover)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                onClick={() => {
                  setEditingHabit(habit);
                  setShowMenu(false);
                }}
              >
                <Edit2 size={14} /> Edit
              </button>
              <button
                className="w-full text-left px-3 py-2.5 text-sm flex items-center gap-2 transition-colors"
                style={{ color: "var(--text-secondary)" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-hover)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                onClick={() => {
                  archiveHabit(habit.id);
                  setShowMenu(false);
                }}
              >
                <Archive size={14} /> Archive
              </button>
              <button
                className="w-full text-left px-3 py-2.5 text-sm flex items-center gap-2 transition-colors"
                style={{ color: "#f43f5e" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-hover)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                onClick={() => {
                  if (confirm(`Delete "${habit.name}"? This cannot be undone.`)) {
                    deleteHabit(habit.id);
                  }
                  setShowMenu(false);
                }}
              >
                <Trash2 size={14} /> Delete
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
