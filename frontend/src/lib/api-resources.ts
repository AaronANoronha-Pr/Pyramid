import type { TaskResource } from "@/lib/api-tasks";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

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

export function createResource(
  taskId: string,
  input: { label: string; url: string },
) {
  return request<TaskResource>(`/tasks/${taskId}/resources`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function updateResource(
  taskId: string,
  id: string,
  input: Partial<{ label: string; url: string }>,
) {
  return request<TaskResource>(`/tasks/${taskId}/resources/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export function deleteResource(taskId: string, id: string) {
  return request<{ success: boolean }>(`/tasks/${taskId}/resources/${id}`, {
    method: "DELETE",
  });
}
