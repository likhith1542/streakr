import { useState } from "react";
import { X, Check } from "lucide-react";
import { useAppStore, HABIT_COLORS } from "../store";
import { HabitColor, HabitFrequency } from "../types";
import clsx from "clsx";

const EMOJIS = [
  "🏃", "💪", "🧘", "📚", "✍️", "🎵", "🎨", "🧠",
  "💧", "🥗", "🛌", "🚴", "🏊", "🧹", "💼", "🌿",
  "☀️", "🌙", "🎯", "🔥", "⚡", "🌱", "🧘‍♀️", "🏋️",
  "🚶", "🍎", "😴", "🧗", "🎸", "🎮",
];

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const COLORS: HabitColor[] = ["orange", "rose", "violet", "cyan", "emerald", "amber", "sky", "pink"];

export function AddHabitModal() {
  const { addHabit, updateHabit, setShowAddHabit, setEditingHabit, editingHabit } = useAppStore();

  const isEditing = !!editingHabit;

  const [name, setName] = useState(editingHabit?.name || "");
  const [emoji, setEmoji] = useState(editingHabit?.emoji || "🔥");
  const [color, setColor] = useState<HabitColor>(editingHabit?.color || "orange");
  const [description, setDescription] = useState(editingHabit?.description || "");
  const [freqType, setFreqType] = useState<"daily" | "weekly" | "times_per_week">(
    editingHabit?.frequency.type || "daily"
  );
  const [weeklyDays, setWeeklyDays] = useState<number[]>(
    editingHabit?.frequency.type === "weekly" ? editingHabit.frequency.days : [1, 2, 3, 4, 5]
  );
  const [timesPerWeek, setTimesPerWeek] = useState(
    editingHabit?.frequency.type === "times_per_week" ? editingHabit.frequency.count : 3
  );
  const [reminderTime, setReminderTime] = useState(editingHabit?.reminderTime || "");

  const handleClose = () => {
    setShowAddHabit(false);
    setEditingHabit(null);
  };

  const handleSubmit = () => {
    if (!name.trim()) return;

    let frequency: HabitFrequency;
    if (freqType === "daily") frequency = { type: "daily" };
    else if (freqType === "weekly") frequency = { type: "weekly", days: weeklyDays };
    else frequency = { type: "times_per_week", count: timesPerWeek };

    const habitData = {
      name: name.trim(),
      emoji,
      color,
      frequency,
      description: description.trim(),
      reminderTime: reminderTime || undefined,
    };

    if (isEditing) {
      updateHabit(editingHabit.id, habitData);
    } else {
      addHabit(habitData);
    }

    handleClose();
  };

  const toggleDay = (day: number) => {
    setWeeklyDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center modal-overlay"
      style={{ background: "rgba(0,0,0,0.5)" }}
      onClick={handleClose}
    >
      <div
        className="modal-content w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl p-6 max-h-[90vh] overflow-y-auto"
        style={{ background: "var(--bg-card)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2
            className="font-display text-xl font-bold"
            style={{ color: "var(--text-primary)" }}
          >
            {isEditing ? "Edit Habit" : "New Habit"}
          </h2>
          <button className="btn-ghost p-2" onClick={handleClose}>
            <X size={18} />
          </button>
        </div>

        {/* Emoji picker */}
        <div className="mb-5">
          <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
            Icon
          </label>
          <div className="grid grid-cols-10 gap-1">
            {EMOJIS.map((e) => (
              <button
                key={e}
                onClick={() => setEmoji(e)}
                className={clsx(
                  "w-9 h-9 rounded-lg text-lg flex items-center justify-center transition-all",
                  emoji === e ? "scale-110 ring-2" : "hover:bg-opacity-50"
                )}
                style={{
                  background: emoji === e ? "var(--accent-subtle)" : "var(--bg-secondary)",
                  outline: emoji === e ? `2px solid var(--accent)` : undefined,
                }}
              >
                {e}
              </button>
            ))}
          </div>
        </div>

        {/* Name */}
        <div className="mb-5">
          <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
            Habit name
          </label>
          <input
            className="input-base"
            placeholder="e.g. Morning run, Read 30 min..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
            maxLength={50}
          />
        </div>

        {/* Description */}
        <div className="mb-5">
          <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
            Description <span style={{ color: "var(--text-muted)" }}>(optional)</span>
          </label>
          <input
            className="input-base"
            placeholder="Why does this matter to you?"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={100}
          />
        </div>

        {/* Color */}
        <div className="mb-5">
          <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
            Color
          </label>
          <div className="flex gap-2 flex-wrap">
            {COLORS.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className="w-8 h-8 rounded-full transition-all"
                style={{
                  background: HABIT_COLORS[c].light,
                  outline: color === c ? `3px solid var(--text-primary)` : "none",
                  outlineOffset: "2px",
                  transform: color === c ? "scale(1.2)" : "scale(1)",
                }}
              />
            ))}
          </div>
        </div>

        {/* Frequency */}
        <div className="mb-5">
          <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
            Frequency
          </label>
          <div className="flex gap-2 mb-3">
            {(["daily", "weekly", "times_per_week"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFreqType(f)}
                className={clsx("px-3 py-1.5 rounded-lg text-sm font-medium transition-all")}
                style={{
                  background: freqType === f ? "var(--accent)" : "var(--bg-secondary)",
                  color: freqType === f ? "white" : "var(--text-secondary)",
                }}
              >
                {f === "daily" ? "Daily" : f === "weekly" ? "Specific days" : "X per week"}
              </button>
            ))}
          </div>

          {freqType === "weekly" && (
            <div className="flex gap-1.5 flex-wrap">
              {DAY_LABELS.map((day, i) => (
                <button
                  key={day}
                  onClick={() => toggleDay(i)}
                  className="w-10 h-10 rounded-lg text-sm font-medium transition-all"
                  style={{
                    background: weeklyDays.includes(i) ? "var(--accent)" : "var(--bg-secondary)",
                    color: weeklyDays.includes(i) ? "white" : "var(--text-secondary)",
                  }}
                >
                  {day.slice(0, 1)}
                </button>
              ))}
            </div>
          )}

          {freqType === "times_per_week" && (
            <div className="flex items-center gap-3">
              <button
                className="w-9 h-9 rounded-lg font-bold text-lg btn-ghost"
                onClick={() => setTimesPerWeek(Math.max(1, timesPerWeek - 1))}
              >
                −
              </button>
              <span
                className="font-mono text-xl font-bold w-8 text-center"
                style={{ color: "var(--text-primary)" }}
              >
                {timesPerWeek}
              </span>
              <button
                className="w-9 h-9 rounded-lg font-bold text-lg btn-ghost"
                onClick={() => setTimesPerWeek(Math.min(7, timesPerWeek + 1))}
              >
                +
              </button>
              <span style={{ color: "var(--text-secondary)" }} className="text-sm">
                times per week
              </span>
            </div>
          )}
        </div>

        {/* Reminder */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
            Reminder <span style={{ color: "var(--text-muted)" }}>(optional)</span>
          </label>
          <input
            type="time"
            className="input-base w-auto"
            value={reminderTime}
            onChange={(e) => setReminderTime(e.target.value)}
          />
        </div>

        {/* Submit */}
        <button
          className="btn-primary w-full py-3 text-base flex items-center justify-center gap-2"
          onClick={handleSubmit}
          disabled={!name.trim()}
          style={{ opacity: name.trim() ? 1 : 0.5 }}
        >
          <Check size={18} />
          {isEditing ? "Save Changes" : "Create Habit"}
        </button>
      </div>
    </div>
  );
}
