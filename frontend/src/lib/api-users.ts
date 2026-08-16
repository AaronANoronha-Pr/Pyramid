import type { CurrentUser } from "@/hooks/use-current-user";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export function updateProfile(
  input: Partial<Pick<CurrentUser, "name" | "title" | "username" | "email">>,
) {
  return fetch(`${API_URL}/users/me`, {
    method: "PATCH",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  }).then(async (res) => {
    if (!res.ok) {
      const body = await res.json().catch(() => null);
      throw new Error(body?.message ?? `Request failed: ${res.status}`);
    }
    return res.json() as Promise<CurrentUser>;
  });
}

export function uploadAvatar(file: File) {
  const formData = new FormData();
  formData.append("file", file);
  return fetch(`${API_URL}/users/me/avatar`, {
    method: "POST",
    credentials: "include",
    body: formData,
  }).then((res) => {
    if (!res.ok) throw new Error(`Upload failed: ${res.status}`);
    return res.json() as Promise<CurrentUser>;
  });
}
