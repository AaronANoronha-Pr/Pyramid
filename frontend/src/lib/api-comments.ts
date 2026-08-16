import type { ApiAttachment } from "@/lib/api-attachments";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export type CommentAuthor = {
  id: string;
  name: string;
  avatarUrl: string | null;
};

export type ApiComment = {
  id: string;
  body: string;
  taskId: string;
  authorId: string;
  author: CommentAuthor;
  parentId: string | null;
  replies: ApiComment[];
  attachments: ApiAttachment[];
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

export function listComments(taskId: string) {
  return request<ApiComment[]>(`/tasks/${taskId}/comments`);
}

export function createComment(
  taskId: string,
  input: { body: string; parentId?: string; attachmentIds?: string[] },
) {
  return request<ApiComment>(`/tasks/${taskId}/comments`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function updateComment(taskId: string, id: string, body: string) {
  return request<ApiComment>(`/tasks/${taskId}/comments/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ body }),
  });
}

export function deleteComment(taskId: string, id: string) {
  return request<{ success: boolean }>(`/tasks/${taskId}/comments/${id}`, {
    method: "DELETE",
  });
}
