import type { LoginRequest, UnifiedVerificationRequest } from '@/pages/Official/LoginDispatcher/api'
import { ApiException, logout as apiLogout, unifiedLogin, unifiedVerifyLogin } from '@/pages/Official/LoginDispatcher/api'
import type { ReactNode } from 'react'
import { createContext, useContext, useEffect, useState } from 'react'

export interface User {
  id: string
  role: 'admin' | 'dispatcher'
  name: string
  email: string
}

interface AuthContextType {
  user: User | null
  login: (id: string, password: string) => Promise<boolean>
  verifyLogin: (verificationCode: string) => Promise<boolean>
  logout: () => void
  isAdmin: () => boolean
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Check for stored auth on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('resqwave_user')
    const storedToken = localStorage.getItem('resqwave_token')
    
    if (storedUser && storedToken) {
      try {
        setUser(JSON.parse(storedUser))
      } catch {
        localStorage.removeItem('resqwave_user')
        localStorage.removeItem('resqwave_token')
      }
    }
  }, [])

  // Step 1: Unified login (both admin and dispatcher with 2FA)
  const login = async (id: string, password: string): Promise<boolean> => {
    setIsLoading(true)
    try {
      const loginData: LoginRequest = { ID: id, password }
      const response = await unifiedLogin(loginData)
      
      // Both admin and dispatcher need 2FA verification
      sessionStorage.setItem('tempToken', response.tempToken)
      sessionStorage.setItem('userType', response.userType)
      
      setIsLoading(false)
      return true
    } catch (error) {
      setIsLoading(false)
      if (error instanceof ApiException) {
        throw new Error(error.message)
      }
      throw new Error('Login failed. Please try again.')
    }
  }

  // Step 2: Unified verification (both admin and dispatcher)
  const verifyLogin = async (verificationCode: string): Promise<boolean> => {
    setIsLoading(true)
    try {
      const tempToken = sessionStorage.getItem('tempToken')
      
      if (!tempToken) {
        throw new Error('Session expired. Please login again.')
      }

      const verificationData: UnifiedVerificationRequest = { 
        tempToken, 
        code: verificationCode 
      }
      
      const response = await unifiedVerifyLogin(verificationData)
      
      // Store token and user data
      localStorage.setItem('resqwave_token', response.token)
      
      const userData: User = {
        id: response.user.id,
        role: response.user.role,
        name: response.user.name || response.user.id,
        email: response.user.email
      }
      
      setUser(userData)
      localStorage.setItem('resqwave_user', JSON.stringify(userData))
      
      // Clear temporary data
      sessionStorage.removeItem('tempToken')
      sessionStorage.removeItem('userType')
      
      setIsLoading(false)
      return true
    } catch (error) {
      setIsLoading(false)
      if (error instanceof ApiException) {
        throw new Error(error.message)
      }
      throw new Error('Verification failed. Please try again.')
    }
  }

  const logout = () => {
    setUser(null)
    apiLogout() // This clears localStorage and sessionStorage
  }

  const isAdmin = (): boolean => {
    return user?.role === 'admin'
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      verifyLogin,
      logout, 
      isAdmin, 
      isLoading 
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}