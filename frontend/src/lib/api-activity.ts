const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export type ActivityAuthor = {
  id: string;
  name: string;
  avatarUrl: string | null;
};

export type ApiActivity = {
  id: string;
  kind: "change" | "update";
  field: string | null;
  message: string;
  author: ActivityAuthor;
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

export function listActivity(taskId: string) {
  return request<ApiActivity[]>(`/tasks/${taskId}/activity`);
}

export function postUpdate(taskId: string, message: string) {
  return request<ApiActivity>(`/tasks/${taskId}/activity`, {
    method: "POST",
    body: JSON.stringify({ message }),
  });
}
