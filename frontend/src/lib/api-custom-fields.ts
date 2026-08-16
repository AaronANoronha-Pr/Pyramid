import type { ApiCustomField } from "@/lib/api-tasks";

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

export function createCustomField(
  taskId: string,
  input: { name: string; value: string },
) {
  return request<ApiCustomField>(`/tasks/${taskId}/custom-fields`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function updateCustomField(
  taskId: string,
  id: string,
  input: Partial<{ name: string; value: string }>,
) {
  return request<ApiCustomField>(`/tasks/${taskId}/custom-fields/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export function deleteCustomField(taskId: string, id: string) {
  return request<{ success: boolean }>(
    `/tasks/${taskId}/custom-fields/${id}`,
    { method: "DELETE" },
  );
}
