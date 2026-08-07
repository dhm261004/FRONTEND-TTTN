import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { API_BASE_URL } from '@/shared/config/env'
import { tokenStorage } from '@/shared/api/tokenStorage'
import { ApiError, type ApiErrorBody } from '@/shared/api/types'
import type { AuthTokens } from '@/modules/auth/types'

declare module 'axios' {
  export interface InternalAxiosRequestConfig {
    _retry?: boolean
  }
}

export const http = axios.create({
  baseURL: API_BASE_URL,
})

http.interceptors.request.use((config) => {
  const token = tokenStorage.getAccessToken()
  if (token) {
    config.headers.set('Authorization', `Bearer ${token}`)
  }
  return config
})

let refreshPromise: Promise<string | null> | null = null

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = tokenStorage.getRefreshToken()
  if (!refreshToken) return null

  if (!refreshPromise) {
    refreshPromise = axios
      .post<AuthTokens>(`${API_BASE_URL}/auth/token/refresh`, { refresh_token: refreshToken })
      .then((res) => {
        tokenStorage.setSession(res.data.access_token, res.data.refresh_token, res.data.user)
        return res.data.access_token
      })
      .catch(() => {
        tokenStorage.clear()
        return null
      })
      .finally(() => {
        refreshPromise = null
      })
  }
  return refreshPromise
}

http.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiErrorBody>) => {
    const config = error.config as InternalAxiosRequestConfig | undefined
    const isAuthEndpoint = config?.url?.includes('/auth/login') || config?.url?.includes('/auth/token/refresh')

    if (error.response?.status === 401 && config && !config._retry && !isAuthEndpoint) {
      config._retry = true
      const newToken = await refreshAccessToken()
      if (newToken) {
        config.headers.set('Authorization', `Bearer ${newToken}`)
        return http(config)
      }
      tokenStorage.clear()
      if (!window.location.pathname.startsWith('/dang-nhap')) {
        window.location.assign('/dang-nhap')
      }
    }

    if (error.response?.data && typeof error.response.data === 'object' && 'code' in error.response.data) {
      throw new ApiError(error.response.status, error.response.data)
    }
    throw error
  },
)
