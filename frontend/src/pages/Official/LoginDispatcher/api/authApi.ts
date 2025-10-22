import type {
    LoginRequest,
    UnifiedLoginResponse,
    UnifiedVerificationRequest,
    VerificationResponse
} from './types'
import { ApiException } from './types'

// Backend API base URL
const API_BASE_URL = 'http://localhost:5000'

// Generic API request handler
async function apiRequest<T>(
  url: string, 
  options: RequestInit = {}
): Promise<T> {
  try {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include',
      ...options,
    })

    const data = await response.json()

    if (!response.ok) {
      throw new ApiException(
        data.message || `HTTP Error ${response.status}`,
        response.status
      )
    }

    return data as T
  } catch (error) {
    if (error instanceof ApiException) {
      throw error
    }
    
    // Network or other errors
    throw new ApiException(
      error instanceof Error ? error.message : 'Network error occurred'
    )
  }
}

// Unified login - backend determines admin or dispatcher and sends 2FA code for both
export async function unifiedLogin(loginData: LoginRequest): Promise<UnifiedLoginResponse> {
  return apiRequest<UnifiedLoginResponse>('/login', {
    method: 'POST',
    body: JSON.stringify({
      emailOrNumber: loginData.ID,  // Can be admin name or dispatcher email/number
      password: loginData.password
    }),
  })
}

// Unified verification - handles both admin and dispatcher 2FA
export async function unifiedVerifyLogin(verificationData: UnifiedVerificationRequest): Promise<VerificationResponse> {
  return apiRequest<VerificationResponse>('/verify-login', {
    method: 'POST',
    body: JSON.stringify(verificationData),
  })
}

// Legacy dispatcher login (keeping for backward compatibility)
export async function loginDispatcher(loginData: LoginRequest): Promise<VerificationResponse> {
  return apiRequest<VerificationResponse>('/dispatcher/login', {
    method: 'POST',
    body: JSON.stringify({
      emailOrNumber: loginData.ID,
      password: loginData.password
    }),
  })
}



// Optional: Get current user info (if token is already stored)
export async function getCurrentUser(): Promise<VerificationResponse['user']> {
  const token = localStorage.getItem('resqwave_token')
  
  if (!token) {
    throw new ApiException('No authentication token found')
  }

  return apiRequest<VerificationResponse['user']>('/me', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
}

// Logout - clears stored authentication data
export function logout(): void {
  localStorage.removeItem('resqwave_token')
  localStorage.removeItem('resqwave_user')
  sessionStorage.removeItem('tempToken')
  sessionStorage.removeItem('userType')
}