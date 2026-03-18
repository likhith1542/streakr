import { LayoutDashboard, CalendarDays, BarChart3, Settings, Plus } from "lucide-react";
import { useAppStore } from "../store";
import { View } from "../types";
import clsx from "clsx";

const NAV_ITEMS: { view: View; icon: typeof LayoutDashboard; label: string }[] = [
  { view: "dashboard", icon: LayoutDashboard, label: "Today" },
  { view: "history", icon: CalendarDays, label: "History" },
  { view: "stats", icon: BarChart3, label: "Stats" },
  { view: "settings", icon: Settings, label: "Settings" },
];

export function Sidebar() {
  const { currentView, setView, setShowAddHabit } = useAppStore();

  return (
    <aside
      className="flex flex-col h-screen w-[200px] border-r py-6 px-3 flex-shrink-0"
      style={{
        background: "var(--bg-card)",
        borderColor: "var(--border)",
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-3 mb-8">
        <span className="text-2xl streak-flame">🔥</span>
        <span
          className="font-display text-xl font-bold tracking-tight"
          style={{ color: "var(--text-primary)" }}
        >
          Streakr
        </span>
      </div>

      {/* Add Habit Button */}
      <button
        className="btn-primary flex items-center gap-2 mb-6 mx-0 justify-center py-2.5"
        onClick={() => setShowAddHabit(true)}
      >
        <Plus size={16} />
        New Habit
      </button>

      {/* Nav */}
      <nav className="flex flex-col gap-1">
        {NAV_ITEMS.map(({ view, icon: Icon, label }) => (
          <button
            key={view}
            className={clsx("nav-item flex-row justify-start gap-3 py-2.5 px-3 w-full text-left", {
              active: currentView === view,
            })}
            onClick={() => setView(view)}
          >
            <Icon size={18} />
            <span className="font-body text-sm font-medium">{label}</span>
          </button>
        ))}
      </nav>

      {/* Bottom */}
      <div className="mt-auto">
        <div
          className="px-3 py-2 rounded-xl text-xs"
          style={{
            background: "var(--accent-subtle)",
            color: "var(--text-muted)",
          }}
        >
          <p className="font-mono">All data local</p>
          <p className="font-mono">No account needed</p>
        </div>
      </div>
    </aside>
  );
}
