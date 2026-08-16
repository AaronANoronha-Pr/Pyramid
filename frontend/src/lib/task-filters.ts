import type { ApiTask, TaskPriority, TaskStatus } from "./api-tasks";

export type DueDatePreset = "overdue" | "today" | "thisWeek" | "noDate";

export const DUE_DATE_PRESETS: { id: DueDatePreset; label: string }[] = [
  { id: "overdue", label: "Overdue" },
  { id: "today", label: "Due Today" },
  { id: "thisWeek", label: "Due This Week" },
  { id: "noDate", label: "No Date" },
];

export type FilterCategory =
  | "status"
  | "priority"
  | "members"
  | "dueDate"
  | "teams"
  | "labels"
  | "reporter"
  | "project";

// Sentinel used inside filters.project to mean "no project assigned".
export const NO_PROJECT = "__none__";

export type TaskFilters = {
  status: TaskStatus[];
  priority: TaskPriority[];
  members: string[];
  dueDate: DueDatePreset[];
  teams: string[];
  labels: string[];
  reporter: string[];
  project: string[];
};

export const EMPTY_FILTERS: TaskFilters = {
  status: [],
  priority: [],
  members: [],
  dueDate: [],
  teams: [],
  labels: [],
  reporter: [],
  project: [],
};

export function countActiveFilters(filters: TaskFilters): number {
  return Object.values(filters).reduce((sum, values) => sum + values.length, 0);
}

function splitList(value: string): string[] {
  return value ? value.split(",").map((v) => v.trim()).filter(Boolean) : [];
}

// dueDate is stored as "D MMM" with no year (see calendar-picker.tsx) — assume the current year for comparison.
function parseDueDate(dueDate: string): Date | null {
  if (!dueDate.trim()) return null;
  const parsed = new Date(`${dueDate} ${new Date().getFullYear()}`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function matchesDueDatePreset(dueDate: string, preset: DueDatePreset): boolean {
  if (preset === "noDate") return !dueDate.trim();
  const date = parseDueDate(dueDate);
  if (!date) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);
  const diffDays = Math.round((date.getTime() - today.getTime()) / 86_400_000);
  if (preset === "overdue") return diffDays < 0;
  if (preset === "today") return diffDays === 0;
  if (preset === "thisWeek") return diffDays >= 0 && diffDays <= 7;
  return false;
}

export function matchesFilters(task: ApiTask, filters: TaskFilters): boolean {
  if (filters.status.length && !filters.status.includes(task.status)) return false;
  if (filters.priority.length && !filters.priority.includes(task.priority)) return false;

  if (filters.members.length) {
    const assignee = task.assigneeName.trim() || "Unassigned";
    if (!filters.members.includes(assignee)) return false;
  }

  if (
    filters.dueDate.length &&
    !filters.dueDate.some((preset) => matchesDueDatePreset(task.dueDate, preset))
  ) {
    return false;
  }

  if (filters.teams.length) {
    const teams = splitList(task.teams);
    if (!teams.some((t) => filters.teams.includes(t))) return false;
  }

  if (filters.labels.length) {
    const labels = splitList(task.tags);
    if (!labels.some((l) => filters.labels.includes(l))) return false;
  }

  if (filters.reporter.length) {
    const reporter = task.reporter.trim() || "Unassigned";
    if (!filters.reporter.includes(reporter)) return false;
  }

  if (filters.project.length) {
    const project = task.projectId ?? NO_PROJECT;
    if (!filters.project.includes(project)) return false;
  }

  return true;
}
