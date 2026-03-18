import { useMemo } from "react";
import { format } from "date-fns";
import { Plus, AlertTriangle, Trophy, Archive } from "lucide-react";
import { useAppStore } from "../store";
import { HabitCard } from "../components/HabitCard";
import { ProgressRing } from "../components/ProgressRing";
import {
  calculateStreak,
  getTodayCompletionRate,
  isScheduledForDate,
  isCompletedOnDate,
  TODAY,
  getMilestone,
} from "../hooks/useStreak";

export function Dashboard() {
  const { habits, logs, setShowAddHabit, setView } = useAppStore();

  const today = TODAY();
  const activeHabits = habits.filter((h) => !h.archivedAt);
  const todayHabits = activeHabits.filter((h) => isScheduledForDate(h, today));
  const restDayHabits = activeHabits.filter((h) => !isScheduledForDate(h, today));

  const completionRate = getTodayCompletionRate(habits, logs);

  const completedToday = todayHabits.filter((h) =>
    isCompletedOnDate(h.id, today, logs)
  ).length;

  const atRisk = todayHabits.filter((h) => {
    const streak = calculateStreak(h, logs);
    return streak.current >= 3 && !isCompletedOnDate(h.id, today, logs);
  });

  const milestones = useMemo(() => {
    return activeHabits
      .map((h) => {
        const s = calculateStreak(h, logs);
        const m = getMilestone(s.current);
        return m ? { habit: h, message: m, streak: s.current } : null;
      })
      .filter(Boolean);
  }, [habits, logs]);

  const archivedCount = habits.filter((h) => h.archivedAt).length;

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1
            className="font-display text-3xl font-bold tracking-tight"
            style={{ color: "var(--text-primary)" }}
          >
            {format(new Date(), "EEEE")}
          </h1>
          <p style={{ color: "var(--text-muted)" }} className="text-sm mt-0.5 font-body">
            {format(new Date(), "MMMM d, yyyy")}
          </p>
        </div>

        <button
          className="btn-primary flex items-center gap-2"
          onClick={() => setShowAddHabit(true)}
        >
          <Plus size={16} />
          New Habit
        </button>
      </div>

      {/* Stats row */}
      {activeHabits.length > 0 && (
        <div className="flex items-center gap-6 mb-8 animate-fade-in">
          <ProgressRing
            percent={completionRate}
            size={110}
            strokeWidth={9}
            label={`${completionRate}%`}
            sublabel="today"
          />
          <div className="flex-1 grid grid-cols-2 gap-3">
            <StatCard
              label="Done today"
              value={`${completedToday}/${todayHabits.length}`}
              icon="✅"
            />
            <StatCard
              label="Active habits"
              value={String(activeHabits.length)}
              icon="📋"
            />
            <StatCard
              label="Best streak"
              value={`${Math.max(0, ...activeHabits.map((h) => calculateStreak(h, logs).longest))}d`}
              icon="🏆"
            />
            <StatCard
              label="Total logs"
              value={String(logs.length)}
              icon="📊"
            />
          </div>
        </div>
      )}

      {/* Milestone banners */}
      {milestones.map((m) => (
        <div
          key={m!.habit.id}
          className="card px-4 py-3 mb-3 flex items-center gap-3 animate-slide-up"
          style={{ borderColor: "var(--accent)", borderWidth: 1.5 }}
        >
          <Trophy size={18} style={{ color: "var(--accent)" }} />
          <div>
            <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
              {m!.habit.emoji} {m!.habit.name} — {m!.message}
            </p>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              Keep it up!
            </p>
          </div>
        </div>
      ))}

      {/* At-risk warnings */}
      {atRisk.length > 0 && (
        <div
          className="card px-4 py-3 mb-4 flex items-start gap-3"
          style={{ borderColor: "#f59e0b", borderWidth: 1.5 }}
        >
          <AlertTriangle size={18} style={{ color: "#f59e0b", marginTop: 2 }} />
          <div>
            <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
              Streaks at risk
            </p>
            <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
              {atRisk.map((h) => `${h.emoji} ${h.name}`).join(", ")}
            </p>
          </div>
        </div>
      )}

      {/* Habit list */}
      {activeHabits.length === 0 ? (
        <EmptyState onAdd={() => setShowAddHabit(true)} />
      ) : (
        <>
          {todayHabits.length > 0 && (
            <section className="mb-6">
              <h2 className="text-xs font-mono uppercase tracking-widest mb-3" style={{ color: "var(--text-muted)" }}>
                Today's Habits
              </h2>
              <div className="flex flex-col gap-2">
                {todayHabits.map((habit, i) => (
                  <HabitCard key={habit.id} habit={habit} animationDelay={i * 50} />
                ))}
              </div>
            </section>
          )}

          {restDayHabits.length > 0 && (
            <section className="mb-6">
              <h2 className="text-xs font-mono uppercase tracking-widest mb-3" style={{ color: "var(--text-muted)" }}>
                Rest Day
              </h2>
              <div className="flex flex-col gap-2">
                {restDayHabits.map((habit, i) => (
                  <HabitCard key={habit.id} habit={habit} animationDelay={i * 50} />
                ))}
              </div>
            </section>
          )}

          {archivedCount > 0 && (
            <button
              className="flex items-center gap-2 text-xs font-mono mt-2"
              style={{ color: "var(--text-muted)" }}
              onClick={() => setView("settings")}
            >
              <Archive size={12} />
              {archivedCount} archived habit{archivedCount > 1 ? "s" : ""}
            </button>
          )}
        </>
      )}
    </div>
  );
}

function StatCard({ label, value, icon }: { label: string; value: string; icon: string }) {
  return (
    <div className="card px-3 py-2.5">
      <div className="flex items-center gap-1.5 mb-0.5">
        <span className="text-sm">{icon}</span>
        <span className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>
          {label}
        </span>
      </div>
      <p className="font-display text-xl font-bold" style={{ color: "var(--text-primary)" }}>
        {value}
      </p>
    </div>
  );
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="text-5xl mb-4 streak-flame">🔥</div>
      <h3 className="font-display text-xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>
        No habits yet
      </h3>
      <p className="text-sm mb-6 max-w-xs" style={{ color: "var(--text-muted)" }}>
        Start building your streak by adding your first habit.
      </p>
      <button className="btn-primary flex items-center gap-2" onClick={onAdd}>
        <Plus size={16} />
        Add a habit
      </button>
    </div>
  );
}
