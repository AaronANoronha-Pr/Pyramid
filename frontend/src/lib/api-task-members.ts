import type { TaskMember } from "@/lib/api-tasks";

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

export function addMember(
  taskId: string,
  input: { memberName: string; memberInits: string },
) {
  return request<TaskMember>(`/tasks/${taskId}/members`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function removeMember(taskId: string, id: string) {
  return request<{ success: boolean }>(`/tasks/${taskId}/members/${id}`, {
    method: "DELETE",
  });
}
