import type { AuthFormModel } from '@/@types/auth/auth-form-model'
import type { AuthUserDataModel } from '@/@types/auth/auth-user-data-model'
import { authenticate, getLoggedUser, googleAuthenticate } from '@/http/services/auth.service'
import { http } from '@lyra/axios-config'
import { LoaderCircle } from 'lucide-react'
import React, { createContext, useContext, useState, useEffect } from 'react'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { queryClient } from '@lyra/react-query-config'


interface AuthState {
  isAuthenticated: boolean
  user: AuthUserDataModel | null
  login: (credentials: AuthFormModel) => Promise<void>;
  logout: () => void
  loginWithGoogle: (googleAccessToken: string) => Promise<void>
  updateUser: (userData: Partial<AuthUserDataModel>) => void
}

const AuthContext = createContext<AuthState | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation();
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
        setUser((prev) => {
          if (!prev) return userData
          return prev
        })
        setIsAuthenticated(true)
      })
      .catch(() => {
        // Clear cache FIRST on auth error to prevent stale data
        queryClient.clear()
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
      // Clear any existing cache BEFORE setting new user data to prevent data leakage
      queryClient.clear()

      const response = await authenticate(credentials);

      setUser(response);
      setIsAuthenticated(true);
      localStorage.setItem("auth-token", response.token);
      http.defaults.headers.Authorization = `Bearer ${response.token}`;
      toast.success(t('toasts.auth.authenticated'))
    } catch (error: any) {
      toast.error(t('toasts.auth.loginError'), error);
      throw error;
    }
  }

  const logout = () => {
    // Clear all React Query cache FIRST to prevent data leakage between users
    // This includes: messages, friends list, notifications, friend requests
    queryClient.clear()

    setUser(null)
    setIsAuthenticated(false)
    localStorage.removeItem('auth-token')
    delete http.defaults.headers.Authorization
  }

  const loginWithGoogle = async (email: string) => {
    try {
      // Clear any existing cache BEFORE setting new user data to prevent data leakage
      queryClient.clear()

      const res = await googleAuthenticate(email);
      const response = res;

      setUser(response);
      setIsAuthenticated(true);
      localStorage.setItem("auth-token", response.token);
      http.defaults.headers.Authorization = `Bearer ${response.token}`;
      toast.success(t('toasts.auth.googleAuthenticated'));
    } catch (error: any) {
      toast.error(t('toasts.auth.googleLoginError'));
      throw error;
    }
  };

  const updateUser = (userData: Partial<AuthUserDataModel>) => {
    setUser((prev) => {
      if (!prev) return prev

      const cleanedData = Object.fromEntries(
        Object.entries(userData).filter(([, value]) => value !== undefined)
      )

      return {
        ...prev,
        ...cleanedData,
      }
    })
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, loginWithGoogle, updateUser }}>
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