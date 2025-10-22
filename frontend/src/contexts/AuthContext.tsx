import type { ReactNode } from 'react'
import { createContext, useContext, useEffect, useState } from 'react'

export interface User {
  id: string
  role: 'admin' | 'dispatcher'
  name: string
}

interface AuthContextType {
  user: User | null
  login: (id: string, password: string) => Promise<boolean>
  logout: () => void
  isAdmin: () => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Simplified mock users - only what we need
const MOCK_USERS = {
  "COMGROUP-01": {
    id: "COMGROUP-01",
    password: "password123",
    role: "dispatcher" as const,
    name: "Dispatcher User"
  },
  "COMGROUP-02": {
    id: "COMGROUP-02", 
    password: "password123",
    role: "admin" as const,
    name: "Admin User"
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)

  // Check for stored auth on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('resqwave_user')
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch {
        localStorage.removeItem('resqwave_user')
      }
    }
  }, [])

  const login = async (id: string, password: string): Promise<boolean> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const mockUser = MOCK_USERS[id as keyof typeof MOCK_USERS]
    
    if (mockUser && mockUser.password === password) {
      const userData: User = {
        id: mockUser.id,
        role: mockUser.role,
        name: mockUser.name
      }
      
      setUser(userData)
      localStorage.setItem('resqwave_user', JSON.stringify(userData))
      return true
    }
    
    return false
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('resqwave_user')
  }

  const isAdmin = (): boolean => {
    return user?.role === 'admin'
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isAdmin }}>
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