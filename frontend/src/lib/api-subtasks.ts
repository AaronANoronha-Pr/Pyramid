import type { TaskPriority } from "@/lib/api-tasks";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export type ApiSubtask = {
  id: string;
  title: string;
  description: string;
  priority: TaskPriority;
  assigneeName: string;
  dueDate: string;
  order: number;
  taskId: string;
};

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

export function listSubtasks(taskId: string) {
  return request<ApiSubtask[]>(`/tasks/${taskId}/subtasks`);
}

export function createSubtask(
  taskId: string,
  input: {
    title: string;
    description?: string;
    priority?: TaskPriority;
    assigneeName?: string;
    dueDate?: string;
  },
) {
  return request<ApiSubtask>(`/tasks/${taskId}/subtasks`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function updateSubtask(
  taskId: string,
  id: string,
  input: Partial<Omit<ApiSubtask, "id" | "taskId" | "order">>,
) {
  return request<ApiSubtask>(`/tasks/${taskId}/subtasks/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export function deleteSubtask(taskId: string, id: string) {
  return request<{ success: boolean }>(`/tasks/${taskId}/subtasks/${id}`, {
    method: "DELETE",
  });
}
