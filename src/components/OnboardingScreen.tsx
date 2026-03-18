import { Flame, Plus, Target, TrendingUp } from "lucide-react";
import { useAppStore } from "../store";
import { AddHabitModal } from "./AddHabitModal";

export function OnboardingScreen() {
  const { updateSettings, setShowAddHabit, showAddHabit } = useAppStore();

  const handleGetStarted = () => {
    updateSettings({ firstLaunch: false });
    setShowAddHabit(true);
  };

  return (
    <div
      className="flex items-center justify-center h-screen w-screen"
      style={{ background: "var(--bg-primary)" }}
    >
      <div className="max-w-md w-full px-6 text-center animate-fade-in">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <span className="text-5xl streak-flame">🔥</span>
        </div>

        <h1
          className="font-display text-5xl font-bold mb-3 tracking-tight"
          style={{ color: "var(--text-primary)" }}
        >
          Streakr
        </h1>
        <p
          className="text-lg mb-10"
          style={{ color: "var(--text-secondary)" }}
        >
          Build habits that stick. Track your streaks, celebrate your wins.
        </p>

        {/* Feature highlights */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          {[
            { icon: Target, label: "Set Goals" },
            { icon: Flame, label: "Streaks" },
            { icon: TrendingUp, label: "Progress" },
          ].map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="card p-4 flex flex-col items-center gap-2"
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: "var(--accent-subtle)" }}
              >
                <Icon size={20} style={{ color: "var(--accent)" }} />
              </div>
              <span
                className="text-sm font-medium"
                style={{ color: "var(--text-secondary)" }}
              >
                {label}
              </span>
            </div>
          ))}
        </div>

        <button
          className="btn-primary w-full py-3 text-base flex items-center justify-center gap-2"
          onClick={handleGetStarted}
        >
          <Plus size={18} />
          Add your first habit
        </button>

        <p className="mt-4 text-xs" style={{ color: "var(--text-muted)" }}>
          All data is stored locally on your device
        </p>
      </div>

      {showAddHabit && <AddHabitModal />}
    </div>
  );
}
