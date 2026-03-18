import { useRef } from "react";
import { Sun, Moon, Monitor, Download, Upload, Trash2, RotateCcw } from "lucide-react";
import { useAppStore } from "../store";
import { exportData, importData } from "../store/storage";
import clsx from "clsx";

export function Settings() {
  const {
    settings,
    updateSettings,
    habits,
    logs,
    getAppData,
    importAppData,
    deleteHabit,
    updateHabit,
  } = useAppStore();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const archivedHabits = habits.filter((h) => h.archivedAt);

  const handleExport = () => {
    exportData(getAppData());
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const data = await importData(file);
      importAppData(data);
      alert("Data imported successfully!");
    } catch {
      alert("Failed to import: invalid file.");
    }
    e.target.value = "";
  };

  const handleUnarchive = (id: string) => {
    updateHabit(id, { archivedAt: undefined });
  };

  const handleClearAll = () => {
    if (
      confirm(
        "This will permanently delete ALL habits and logs. This cannot be undone. Are you sure?"
      )
    ) {
      importAppData({ habits: [], logs: [], settings: settings });
    }
  };

  return (
    <div className="max-w-lg mx-auto px-6 py-8">
      <div className="mb-8">
        <h1
          className="font-display text-3xl font-bold tracking-tight"
          style={{ color: "var(--text-primary)" }}
        >
          Settings
        </h1>
        <p className="text-sm mt-0.5" style={{ color: "var(--text-muted)" }}>
          Customize your experience
        </p>
      </div>

      {/* Theme */}
      <Section title="Appearance">
        <div className="flex gap-2">
          {(["light", "dark", "system"] as const).map((t) => {
            const icons = { light: Sun, dark: Moon, system: Monitor };
            const Icon = icons[t];
            return (
              <button
                key={t}
                onClick={() => updateSettings({ theme: t })}
                className={clsx(
                  "flex-1 flex flex-col items-center gap-1.5 py-3 rounded-xl border transition-all text-sm font-medium capitalize"
                )}
                style={{
                  background:
                    settings.theme === t ? "var(--accent-subtle)" : "var(--bg-secondary)",
                  borderColor: settings.theme === t ? "var(--accent)" : "var(--border)",
                  color:
                    settings.theme === t ? "var(--accent)" : "var(--text-secondary)",
                  borderWidth: settings.theme === t ? 1.5 : 1,
                }}
              >
                <Icon size={18} />
                {t}
              </button>
            );
          })}
        </div>
      </Section>

      {/* Data */}
      <Section title="Data Management">
        <div className="flex flex-col gap-2">
          <button
            className="flex items-center gap-3 px-4 py-3 rounded-xl border transition-all text-sm font-medium text-left"
            style={{
              background: "var(--bg-secondary)",
              borderColor: "var(--border)",
              color: "var(--text-primary)",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-hover)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "var(--bg-secondary)")}
            onClick={handleExport}
          >
            <Download size={16} style={{ color: "var(--accent)" }} />
            <div>
              <p>Export backup</p>
              <p className="text-xs font-normal" style={{ color: "var(--text-muted)" }}>
                Download all data as JSON
              </p>
            </div>
          </button>

          <button
            className="flex items-center gap-3 px-4 py-3 rounded-xl border transition-all text-sm font-medium text-left"
            style={{
              background: "var(--bg-secondary)",
              borderColor: "var(--border)",
              color: "var(--text-primary)",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-hover)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "var(--bg-secondary)")}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload size={16} style={{ color: "var(--accent)" }} />
            <div>
              <p>Import backup</p>
              <p className="text-xs font-normal" style={{ color: "var(--text-muted)" }}>
                Restore from a JSON backup file
              </p>
            </div>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            className="hidden"
            onChange={handleImport}
          />
        </div>

        {/* Storage info */}
        <div
          className="mt-3 px-4 py-3 rounded-xl text-sm"
          style={{ background: "var(--bg-secondary)" }}
        >
          <p className="font-mono text-xs" style={{ color: "var(--text-muted)" }}>
            📊 {habits.length} habits · {logs.length} log entries
          </p>
          <p className="font-mono text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
            💾 Stored locally on this device
          </p>
        </div>
      </Section>

      {/* Archived habits */}
      {archivedHabits.length > 0 && (
        <Section title={`Archived Habits (${archivedHabits.length})`}>
          <div className="flex flex-col gap-2">
            {archivedHabits.map((habit) => (
              <div
                key={habit.id}
                className="flex items-center gap-3 px-4 py-3 rounded-xl border"
                style={{
                  background: "var(--bg-secondary)",
                  borderColor: "var(--border)",
                }}
              >
                <span className="text-xl opacity-60">{habit.emoji}</span>
                <p
                  className="flex-1 text-sm"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {habit.name}
                </p>
                <button
                  className="btn-ghost p-1.5 text-xs flex items-center gap-1"
                  onClick={() => handleUnarchive(habit.id)}
                  title="Unarchive"
                >
                  <RotateCcw size={13} />
                </button>
                <button
                  className="btn-ghost p-1.5"
                  onClick={() => {
                    if (confirm(`Permanently delete "${habit.name}"?`)) {
                      deleteHabit(habit.id);
                    }
                  }}
                  title="Delete permanently"
                >
                  <Trash2 size={13} style={{ color: "#f43f5e" }} />
                </button>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Danger zone */}
      <Section title="Danger Zone">
        <button
          className="flex items-center gap-3 px-4 py-3 rounded-xl border border-rose-500/30 transition-all text-sm font-medium text-left w-full"
          style={{
            background: "rgba(244, 63, 94, 0.05)",
            color: "#f43f5e",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.background = "rgba(244, 63, 94, 0.1)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.background = "rgba(244, 63, 94, 0.05)")
          }
          onClick={handleClearAll}
        >
          <Trash2 size={16} />
          <div>
            <p>Clear all data</p>
            <p className="text-xs font-normal opacity-70">
              Permanently delete all habits and history
            </p>
          </div>
        </button>
      </Section>

      {/* About */}
      <div className="mt-8 text-center">
        <p className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>
          🔥 Streakr v1.0.0
        </p>
        <p className="text-xs font-mono mt-1" style={{ color: "var(--text-muted)" }}>
          Built with Tauri + React · Local-first, no account needed
        </p>
      </div>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-6">
      <h2
        className="text-xs font-mono uppercase tracking-widest mb-3"
        style={{ color: "var(--text-muted)" }}
      >
        {title}
      </h2>
      {children}
    </div>
  );
}
