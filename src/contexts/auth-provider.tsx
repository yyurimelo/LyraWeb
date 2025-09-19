import type { AuthFormModel } from '@/@types/auth/auth-form-model'
import type { AuthUserDataModel } from '@/@types/auth/auth-user-data-model'
import { authenticate, getLoggedUser, googleAuthenticate } from '@/http/services/auth.service'
import { http } from '@lyra/axios-config'
import { LoaderCircle } from 'lucide-react'
import React, { createContext, useContext, useState, useEffect } from 'react'
import { toast } from 'sonner'


interface AuthState {
  isAuthenticated: boolean
  user: AuthUserDataModel | null
  login: (credentials: AuthFormModel) => Promise<void>;
  logout: () => void
  loginWithGoogle: (googleAccessToken: string) => Promise<void>
}

const AuthContext = createContext<AuthState | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUserDataModel | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('auth-token')
    if (!token) {
      setIsLoading(false)
      return
    }

    http.defaults.headers.Authorization = `Bearer ${token}`

    getLoggedUser()
      .then((userData) => {
        setUser(userData)
        setIsAuthenticated(true)
      })
      .catch(() => {
        localStorage.removeItem('auth-token')
        setUser(null)
        setIsAuthenticated(false)
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [])

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center backdrop-blur-lg z-50">
        <LoaderCircle className="w-8 h-8 text-primary animate-spin" />
      </div>
    )
  }

  const login = async (credentials: AuthFormModel) => {
    try {
      const response = await authenticate(credentials);

      setUser(response);
      setIsAuthenticated(true);
      localStorage.setItem("auth-token", response.token);
      toast.success("Autenticado com sucesso!")
    } catch (error: any) {
      toast.error("Erro no login:", error);
      throw error;
    }
  }

  const logout = () => {
    setUser(null)
    setIsAuthenticated(false)
    localStorage.removeItem('auth-token')
  }

  const loginWithGoogle = async (email: string) => {
    try {
      const res = await googleAuthenticate(email);
      const response = res;

      setUser(response);
      setIsAuthenticated(true);
      localStorage.setItem("auth-token", response.token);
      toast.success("Autenticado com Google!");
    } catch (error: any) {
      toast.error("Erro no login com Google");
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, loginWithGoogle }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}