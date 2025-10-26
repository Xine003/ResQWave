// src/lib/api.ts
// Utility for making API requests to the backend using the VITE_API_URL env variable

export const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

// Global logout handler for 401/403 errors
let logoutCallback: (() => void) | null = null;

export function setGlobalLogoutCallback(callback: () => void) {
  logoutCallback = callback;
}

export async function apiFetch<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem('resqwave_token')
  
  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    credentials: 'include', // send cookies if needed
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...(options.headers || {}),
    },
  });
  
  // Handle authentication errors
  if (res.status === 401 || res.status === 403) {
    // Clear local storage
    localStorage.removeItem('resqwave_token');
    localStorage.removeItem('resqwave_user');
    sessionStorage.removeItem('tempToken');
    sessionStorage.removeItem('userType');
    
    // Call global logout callback if set (triggers navigation in AuthContext)
    if (logoutCallback) {
      logoutCallback();
    }
    
    const error = await res.text();
    throw new Error(error || 'Session expired. Please login again.');
  }
  
  if (!res.ok) {
    const error = await res.text();
    throw new Error(error || res.statusText);
  }
  
  return res.json();
}
