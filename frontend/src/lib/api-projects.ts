import type { TaskPriority } from "@/lib/api-tasks";
import type { ActivityAuthor } from "@/lib/api-activity";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export type ApiProject = {
  id: string;
  name: string;
  description: string;
  priority: TaskPriority;
  leadName: string;
  dueDate: string;
  order: number;
};

export type ApiProjectActivity = {
  id: string;
  kind: "change" | "update" | "task";
  field: string | null;
  message: string;
  author: ActivityAuthor;
  task: { id: string; title: string } | null;
  taskTitle: string;
  createdAt: string;
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

export function listProjects() {
  return request<ApiProject[]>("/projects");
}

export function getProject(id: string) {
  return request<ApiProject>(`/projects/${id}`);
}

export function listProjectActivity(id: string) {
  return request<ApiProjectActivity[]>(`/projects/${id}/activity`);
}

export function createProject(input: {
  name: string;
  description?: string;
  priority?: TaskPriority;
  leadName?: string;
  dueDate?: string;
}) {
  return request<ApiProject>("/projects", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function updateProject(
  id: string,
  input: Partial<Omit<ApiProject, "id">>,
) {
  return request<ApiProject>(`/projects/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export function deleteProject(id: string) {
  return request<{ success: boolean }>(`/projects/${id}`, {
    method: "DELETE",
  });
}
