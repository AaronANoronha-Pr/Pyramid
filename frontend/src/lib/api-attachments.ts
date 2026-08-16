export type ApiAttachment = {
  id: string;
  filename: string;
  url: string;
  mimeType: string;
  size: number;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export async function uploadAttachment(taskId: string, file: File) {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch(`${API_URL}/tasks/${taskId}/comments/attachments`, {
    method: "POST",
    credentials: "include",
    body: formData,
  });
  if (!res.ok) {
    throw new Error(`Upload failed: ${res.status}`);
  }
  return res.json() as Promise<ApiAttachment>;
}

// `url` is already an absolute path like "/uploads/xyz" — uploads are served
// unprefixed (main.ts's static assets, not behind the /api global prefix),
// so strip the "/api" suffix API_URL carries for REST calls.
const ASSET_ORIGIN = API_URL.replace(/\/api\/?$/, "");

export function attachmentUrl(url: string) {
  return `${ASSET_ORIGIN}${url}`;
}
