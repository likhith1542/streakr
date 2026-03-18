import { create } from "zustand";
import { Habit, HabitLog, AppSettings, AppData, View, HabitColor } from "../types";
import { loadData, saveData } from "./storage";
import { TODAY } from "../hooks/useStreak";

interface AppStore {
  habits: Habit[];
  logs: HabitLog[];
  settings: AppSettings;
  currentView: View;
  isLoading: boolean;
  selectedHabitId: string | null;
  showAddHabit: boolean;
  editingHabit: Habit | null;

  // Actions
  init: () => Promise<void>;
  setView: (view: View) => void;
  setSelectedHabit: (id: string | null) => void;
  setShowAddHabit: (show: boolean) => void;
  setEditingHabit: (habit: Habit | null) => void;

  addHabit: (habit: Omit<Habit, "id" | "createdAt" | "order">) => void;
  updateHabit: (id: string, updates: Partial<Habit>) => void;
  deleteHabit: (id: string) => void;
  archiveHabit: (id: string) => void;
  reorderHabits: (habits: Habit[]) => void;

  toggleCompletion: (habitId: string, date?: string) => void;
  updateSettings: (settings: Partial<AppSettings>) => void;
  importAppData: (data: AppData) => void;
  getAppData: () => AppData;
}

const defaultSettings: AppSettings = {
  theme: "dark",
  firstLaunch: true,
  notificationsEnabled: false,
};

export const useAppStore = create<AppStore>((set, get) => ({
  habits: [],
  logs: [],
  settings: defaultSettings,
  currentView: "dashboard",
  isLoading: true,
  selectedHabitId: null,
  showAddHabit: false,
  editingHabit: null,

  init: async () => {
    const data = await loadData();
    if (data) {
      set({
        habits: data.habits || [],
        logs: data.logs || [],
        settings: { ...defaultSettings, ...data.settings },
        isLoading: false,
      });
    } else {
      set({ isLoading: false });
    }
  },

  setView: (view) => set({ currentView: view }),
  setSelectedHabit: (id) => set({ selectedHabitId: id }),
  setShowAddHabit: (show) => set({ showAddHabit: show }),
  setEditingHabit: (habit) => set({ editingHabit: habit }),

  addHabit: (habitData) => {
    const { habits } = get();
    const newHabit: Habit = {
      ...habitData,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      order: habits.length,
    };
    const updated = [...habits, newHabit];
    set({ habits: updated });
    saveData(get().getAppData());
  },

  updateHabit: (id, updates) => {
    const habits = get().habits.map((h) =>
      h.id === id ? { ...h, ...updates } : h
    );
    set({ habits });
    saveData(get().getAppData());
  },

  deleteHabit: (id) => {
    const habits = get().habits.filter((h) => h.id !== id);
    const logs = get().logs.filter((l) => l.habitId !== id);
    set({ habits, logs });
    saveData(get().getAppData());
  },

  archiveHabit: (id) => {
    const habits = get().habits.map((h) =>
      h.id === id ? { ...h, archivedAt: new Date().toISOString() } : h
    );
    set({ habits });
    saveData(get().getAppData());
  },

  reorderHabits: (habits) => {
    set({ habits });
    saveData(get().getAppData());
  },

  toggleCompletion: (habitId, date) => {
    const { logs } = get();
    const targetDate = date || TODAY();
    const existing = logs.find(
      (l) => l.habitId === habitId && l.date === targetDate
    );

    let updatedLogs: HabitLog[];
    if (existing) {
      updatedLogs = logs.filter(
        (l) => !(l.habitId === habitId && l.date === targetDate)
      );
    } else {
      updatedLogs = [
        ...logs,
        {
          habitId,
          date: targetDate,
          completedAt: new Date().toISOString(),
        },
      ];
    }

    set({ logs: updatedLogs });
    saveData(get().getAppData());
  },

  updateSettings: (updates) => {
    const settings = { ...get().settings, ...updates };
    set({ settings });
    saveData(get().getAppData());
  },

  importAppData: (data) => {
    set({
      habits: data.habits || [],
      logs: data.logs || [],
      settings: { ...defaultSettings, ...data.settings },
    });
    saveData(get().getAppData());
  },

  getAppData: (): AppData => {
    const { habits, logs, settings } = get();
    return { habits, logs, settings };
  },
}));

export const HABIT_COLORS: Record<HabitColor, { bg: string; text: string; ring: string; light: string; dark: string }> = {
  orange: { bg: "bg-orange-500", text: "text-orange-500", ring: "ring-orange-500", light: "#f97316", dark: "#fb923c" },
  rose: { bg: "bg-rose-500", text: "text-rose-500", ring: "ring-rose-500", light: "#f43f5e", dark: "#fb7185" },
  violet: { bg: "bg-violet-500", text: "text-violet-500", ring: "ring-violet-500", light: "#8b5cf6", dark: "#a78bfa" },
  cyan: { bg: "bg-cyan-500", text: "text-cyan-500", ring: "ring-cyan-500", light: "#06b6d4", dark: "#22d3ee" },
  emerald: { bg: "bg-emerald-500", text: "text-emerald-500", ring: "ring-emerald-500", light: "#10b981", dark: "#34d399" },
  amber: { bg: "bg-amber-500", text: "text-amber-500", ring: "ring-amber-500", light: "#f59e0b", dark: "#fbbf24" },
  sky: { bg: "bg-sky-500", text: "text-sky-500", ring: "ring-sky-500", light: "#0ea5e9", dark: "#38bdf8" },
  pink: { bg: "bg-pink-500", text: "text-pink-500", ring: "ring-pink-500", light: "#ec4899", dark: "#f472b6" },
};
