import {
  format,
  subDays,
  parseISO,
  isToday,
  isYesterday,
  eachDayOfInterval,
  getDay,
  differenceInDays,
  startOfWeek,
  endOfWeek,
} from "date-fns";
import { Habit, HabitLog, StreakInfo } from "../types";

export const TODAY = () => format(new Date(), "yyyy-MM-dd");

export function isScheduledForDate(habit: Habit, dateStr: string): boolean {
  const date = parseISO(dateStr);
  const freq = habit.frequency;

  if (freq.type === "daily") return true;

  if (freq.type === "weekly") {
    const dayOfWeek = getDay(date); // 0=Sun
    return freq.days.includes(dayOfWeek);
  }

  if (freq.type === "times_per_week") {
    // For times_per_week, every day is "potentially schedulable"
    return true;
  }

  return true;
}

export function isCompletedOnDate(
  habitId: string,
  dateStr: string,
  logs: HabitLog[]
): boolean {
  return logs.some((l) => l.habitId === habitId && l.date === dateStr);
}

export function calculateStreak(habit: Habit, logs: HabitLog[]): StreakInfo {
  const habitLogs = logs.filter((l) => l.habitId === habit.id);
  const completedDates = new Set(habitLogs.map((l) => l.date));

  const createdDate = parseISO(habit.createdAt);
  const today = new Date();

  // Build list of days from creation to today
  const allDays = eachDayOfInterval({ start: createdDate, end: today })
    .map((d) => format(d, "yyyy-MM-dd"))
    .filter((d) => isScheduledForDate(habit, d));

  if (allDays.length === 0) return { current: 0, longest: 0, totalCompletions: 0, completionRate: 0 };

  // For times_per_week: count by week
  if (habit.frequency.type === "times_per_week") {
    return calculateTimesPerWeekStreak(habit, logs, allDays, completedDates);
  }

  // Current streak: count backwards from today
  let current = 0;
  const todayStr = TODAY();

  // Walk backwards
  let checkDate = new Date();
  if (!completedDates.has(todayStr)) {
    checkDate = subDays(checkDate, 1);
  }

  for (let i = 0; i < allDays.length; i++) {
    const dateStr = format(checkDate, "yyyy-MM-dd");
    if (!isScheduledForDate(habit, dateStr)) {
      checkDate = subDays(checkDate, 1);
      continue;
    }
    if (completedDates.has(dateStr)) {
      current++;
      checkDate = subDays(checkDate, 1);
    } else {
      break;
    }
    if (differenceInDays(parseISO(habit.createdAt), checkDate) > 0) break;
  }

  // Longest streak
  let longest = 0;
  let running = 0;
  for (const day of allDays) {
    if (completedDates.has(day)) {
      running++;
      longest = Math.max(longest, running);
    } else {
      running = 0;
    }
  }

  const scheduledDays = allDays.filter((d) => {
    const parsed = parseISO(d);
    return parsed <= today;
  });

  const completionRate =
    scheduledDays.length > 0
      ? Math.round((completedDates.size / scheduledDays.length) * 100)
      : 0;

  return {
    current,
    longest,
    totalCompletions: completedDates.size,
    completionRate: Math.min(completionRate, 100),
  };
}

function calculateTimesPerWeekStreak(
  habit: Habit,
  _logs: HabitLog[],
  _allDays: string[],
  completedDates: Set<string>
): StreakInfo {
  if (habit.frequency.type !== "times_per_week") {
    return { current: 0, longest: 0, totalCompletions: 0, completionRate: 0 };
  }

  const target = habit.frequency.count;
  const totalCompletions = completedDates.size;

  // Build weekly buckets
  const today = new Date();
  const createdDate = parseISO(habit.createdAt);
  let current = 0;
  let longest = 0;
  let running = 0;

  let weekStart = startOfWeek(createdDate);
  while (weekStart <= today) {
    const weekEnd = endOfWeek(weekStart);
    const daysInWeek = eachDayOfInterval({
      start: weekStart,
      end: weekEnd <= today ? weekEnd : today,
    });
    const completionsThisWeek = daysInWeek.filter((d) =>
      completedDates.has(format(d, "yyyy-MM-dd"))
    ).length;

    if (completionsThisWeek >= target) {
      running++;
      longest = Math.max(longest, running);
      if (
        format(weekStart, "yyyy-MM-dd") <=
        format(startOfWeek(today), "yyyy-MM-dd")
      ) {
        current = running;
      }
    } else {
      if (weekEnd < today) {
        running = 0;
        current = 0;
      }
    }
    weekStart = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000);
  }

  return {
    current,
    longest,
    totalCompletions,
    completionRate: Math.min(
      Math.round((totalCompletions / Math.max(1, target)) * 100),
      100
    ),
  };
}

export function getHeatmapData(
  habitId: string,
  logs: HabitLog[],
  months: number = 6
): { date: string; count: number }[] {
  const end = new Date();
  const start = subDays(end, months * 30);
  const days = eachDayOfInterval({ start, end });
  const completedDates = new Set(
    logs.filter((l) => l.habitId === habitId).map((l) => l.date)
  );

  return days.map((d) => ({
    date: format(d, "yyyy-MM-dd"),
    count: completedDates.has(format(d, "yyyy-MM-dd")) ? 1 : 0,
  }));
}

export function getTodayCompletionRate(
  habits: Habit[],
  logs: HabitLog[]
): number {
  const today = TODAY();
  const activeHabits = habits.filter(
    (h) => !h.archivedAt && isScheduledForDate(h, today)
  );
  if (activeHabits.length === 0) return 0;
  const completed = activeHabits.filter((h) =>
    isCompletedOnDate(h.id, today, logs)
  ).length;
  return Math.round((completed / activeHabits.length) * 100);
}

export function formatStreak(n: number): string {
  if (n === 0) return "Start today";
  if (n === 1) return "1 day";
  return `${n} days`;
}

export function getMilestone(streak: number): string | null {
  const milestones = [3, 7, 14, 21, 30, 60, 100, 200, 365];
  if (milestones.includes(streak)) return `🎉 ${streak} day milestone!`;
  return null;
}

export { isToday, isYesterday, format, parseISO };
