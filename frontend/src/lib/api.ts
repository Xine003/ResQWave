// src/lib/api.ts
// Utility for making API requests to the backend using the VITE_API_URL env variable


export const API_BASE_URL = import.meta.env.VITE_API_URL;

export async function apiFetch<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    credentials: 'include', // send cookies if needed
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });
  if (!res.ok) {
    const error = await res.text();
    throw new Error(error || res.statusText);
  }
  return res.json();
}
