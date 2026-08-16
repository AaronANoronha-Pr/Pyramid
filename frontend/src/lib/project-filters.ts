import type { ApiProject } from "./api-projects";
import type { TaskPriority } from "./api-tasks";

export type ProjectFilterCategory = "priority" | "lead";

export type ProjectFilters = {
  priority: TaskPriority[];
  lead: string[];
};

export const EMPTY_PROJECT_FILTERS: ProjectFilters = {
  priority: [],
  lead: [],
};

export function countActiveProjectFilters(filters: ProjectFilters): number {
  return Object.values(filters).reduce((sum, values) => sum + values.length, 0);
}

export function matchesProjectFilters(
  project: ApiProject,
  filters: ProjectFilters,
): boolean {
  if (filters.priority.length && !filters.priority.includes(project.priority)) {
    return false;
  }

  if (filters.lead.length) {
    const lead = project.leadName.trim() || "Unassigned";
    if (!filters.lead.includes(lead)) return false;
  }

  return true;
}
