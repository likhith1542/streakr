export type HabitFrequency =
  | { type: "daily" }
  | { type: "weekly"; days: number[] } // 0=Sun, 1=Mon, ..., 6=Sat
  | { type: "times_per_week"; count: number };

export type HabitColor =
  | "orange"
  | "rose"
  | "violet"
  | "cyan"
  | "emerald"
  | "amber"
  | "sky"
  | "pink";

export interface Habit {
  id: string;
  name: string;
  emoji: string;
  color: HabitColor;
  frequency: HabitFrequency;
  createdAt: string; // ISO date string
  archivedAt?: string;
  order: number;
  reminderTime?: string; // "HH:MM"
  description?: string;
}

export interface HabitLog {
  habitId: string;
  date: string; // "YYYY-MM-DD"
  completedAt: string; // ISO datetime
}

export interface AppData {
  habits: Habit[];
  logs: HabitLog[];
  settings: AppSettings;
}

export interface AppSettings {
  theme: "light" | "dark" | "system";
  firstLaunch: boolean;
  notificationsEnabled: boolean;
}

export type View = "dashboard" | "history" | "stats" | "settings";

export interface StreakInfo {
  current: number;
  longest: number;
  totalCompletions: number;
  completionRate: number; // 0-100
}
