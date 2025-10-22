// API Types for Dispatcher/Admin Login
export interface LoginRequest {
  ID: string
  password: string
}

// Unified login response for both admin and dispatcher
export interface UnifiedLoginResponse {
  message: string
  tempToken: string
  userType: 'admin' | 'dispatcher'
}

// Unified verification request for both admin and dispatcher  
export interface UnifiedVerificationRequest {
  tempToken: string
  code: string
}

// Legacy types (keeping for compatibility)
export interface AdminLoginResponse {
  message: string
  token: string
}

export interface DispatcherLoginResponse {
  message: string
  tempToken: string
}

export interface DispatcherVerificationRequest {
  tempToken: string
  code: string
}

export interface VerificationResponse {
  message: string
  token: string
  user: {
    id: string
    role: 'admin' | 'dispatcher'
    email: string
    name?: string
  }
}

export interface ApiError {
  message: string
  status?: number
}

export class ApiException extends Error {
  status?: number
  
  constructor(
    message: string,
    status?: number
  ) {
    super(message)
    this.name = 'ApiException'
    this.status = status
  }
}