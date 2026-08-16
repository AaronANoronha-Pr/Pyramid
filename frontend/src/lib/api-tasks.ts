const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export type TaskColumn = "todo" | "doing" | "completed" | "onhold";
export type TaskPriority = "none" | "urgent" | "high" | "medium" | "low";

// Detail-panel "Status" field — independent of the board column above.
export type TaskStatus =
  | "todo"
  | "inprogress"
  | "backlog"
  | "onhold"
  | "qatesting"
  | "uattesting"
  | "done";

export type TaskMember = {
  id: string;
  memberName: string;
  memberInits: string;
};

export type TaskResource = {
  id: string;
  label: string;
  url: string;
  order: number;
};

export type ApiCustomField = {
  id: string;
  name: string;
  value: string;
  order: number;
};

export type ApiTask = {
  id: string;
  title: string;
  description: string;
  assigneeName: string;
  dueDate: string;
  startDate: string;
  tags: string;
  teams: string;
  column: TaskColumn;
  status: TaskStatus;
  priority: TaskPriority;
  reporter: string;
  locked: boolean;
  order: number;
  projectId: string | null;
  members?: TaskMember[];
  resources?: TaskResource[];
  customFields?: ApiCustomField[];
};

export const COLUMN_DEFS: { id: TaskColumn; title: string }[] = [
  { id: "todo", title: "To Do" },
  { id: "doing", title: "Doing" },
  { id: "completed", title: "Completed" },
  { id: "onhold", title: "On Hold" },
];

export const STATUS_DEFS: { id: TaskStatus; title: string }[] = [
  { id: "todo", title: "To Do" },
  { id: "inprogress", title: "In Progress" },
  { id: "backlog", title: "Backlog" },
  { id: "onhold", title: "On Hold" },
  { id: "qatesting", title: "QA Testing" },
  { id: "uattesting", title: "UAT Testing" },
  { id: "done", title: "Done" },
];

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) {
    throw new Error(`Request failed: ${res.status}`);
  }
  return res.json();
}

export function listTasks() {
  return request<ApiTask[]>("/tasks");
}

export function getTask(id: string) {
  return request<ApiTask>(`/tasks/${id}`);
}

export function createTask(input: {
  title: string;
  column: TaskColumn;
  status?: TaskStatus;
  description?: string;
  assigneeName?: string;
  dueDate?: string;
  startDate?: string;
  tags?: string;
  teams?: string;
  priority?: TaskPriority;
  reporter?: string;
  projectId?: string;
}) {
  return request<ApiTask>("/tasks", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function deleteTask(id: string) {
  return request<{ success: boolean }>(`/tasks/${id}`, { method: "DELETE" });
}

export function updateTask(
  id: string,
  input: Partial<Omit<ApiTask, "id">>,
) {
  return request<ApiTask>(`/tasks/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

