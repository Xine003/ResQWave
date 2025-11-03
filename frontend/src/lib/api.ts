// src/lib/api.ts
// Utility for making API requests to the backend using the VITE_BACKEND_URL env variable


export const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

// Global logout handler for 401/403 errors
let logoutCallback: (() => void) | null = null;

export function setGlobalLogoutCallback(callback: () => void) {
  logoutCallback = callback;
}

export async function apiFetch<T = unknown>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  // Prefer focalToken if present, else fallback to resqwave_token
  const token = localStorage.getItem('focalToken') || localStorage.getItem('resqwave_token');

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
    // Check if this is a focal route - don't trigger official logout for focal auth errors
    const isFocalRoute = window.location.pathname.startsWith('/focal') ||
      window.location.pathname.startsWith('/login-focal') ||
      window.location.pathname.startsWith('/verification-signin-focal') ||
      window.location.pathname.startsWith('/forgot-password-focal') ||
      window.location.pathname.startsWith('/register')

    if (isFocalRoute) {
      // For focal routes, only clear focal tokens
      localStorage.removeItem('focalToken');
      localStorage.removeItem('focalId');
      sessionStorage.removeItem('focalTempToken');
    } else {
      // For official routes, clear official tokens and trigger logout
      localStorage.removeItem('resqwave_token');
      localStorage.removeItem('resqwave_user');
      sessionStorage.removeItem('tempToken');
      sessionStorage.removeItem('userType');

      // Call global logout callback if set (triggers navigation in AuthContext)
      if (logoutCallback) {
        logoutCallback();
      }
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