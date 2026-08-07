import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import { authApi } from '@/modules/auth/api'
import { tokenStorage } from '@/shared/api/tokenStorage'
import type { LoginPayload, UserPublic } from '@/modules/auth/types'

interface AuthContextValue {
  user: UserPublic | null
  isAuthenticated: boolean
  login: (payload: LoginPayload) => Promise<UserPublic>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserPublic | null>(() => tokenStorage.getUser())

  const login = useCallback(async (payload: LoginPayload) => {
    const tokens = await authApi.login(payload)
    tokenStorage.setSession(tokens.access_token, tokens.refresh_token, tokens.user)
    setUser(tokens.user)
    return tokens.user
  }, [])

  const logout = useCallback(async () => {
    await authApi.logout()
    setUser(null)
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({ user, isAuthenticated: Boolean(user), login, logout }),
    [user, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth phải được dùng bên trong AuthProvider')
  return ctx
}
