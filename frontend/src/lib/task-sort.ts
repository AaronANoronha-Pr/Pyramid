import type { ApiTask, TaskPriority } from "./api-tasks";

export type SortKey = "priority" | "dueDate";

// Most urgent first — matches how priority reads everywhere else in the app.
const PRIORITY_RANK: Record<TaskPriority, number> = {
  urgent: 0,
  high: 1,
  medium: 2,
  low: 3,
  none: 4,
};

// dueDate is stored as "D MMM" with no year (see calendar-picker.tsx) — assume the current year.
function parseSortDate(value: string): number {
  if (!value.trim()) return Infinity;
  const parsed = new Date(`${value} ${new Date().getFullYear()}`);
  return Number.isNaN(parsed.getTime()) ? Infinity : parsed.getTime();
}

export function sortTasksBy(tasks: ApiTask[], key: SortKey): ApiTask[] {
  const sorted = [...tasks];
  if (key === "priority") {
    sorted.sort((a, b) => PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority]);
  } else {
    sorted.sort((a, b) => parseSortDate(a.dueDate) - parseSortDate(b.dueDate));
  }
  return sorted;
}
