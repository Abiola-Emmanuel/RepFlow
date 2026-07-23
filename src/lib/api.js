import "dotenv/config";

/**
 * Thin client for the Express API scaffold.
 * Wire this into the frontend when migrating routes off Next.js handlers.
 */
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export async function apiFetch(path, { accessToken, ...options } = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  const contentType = response.headers.get("content-type") || "";
  const body = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const message =
      typeof body === "object" && body?.error ? body.error : `API error ${response.status}`;
    throw new Error(message);
  }

  return body;
}

export function getApiBaseUrl() {
  return API_BASE;
}
