import { http } from '@/shared/api/http'
import { tokenStorage } from '@/shared/api/tokenStorage'
import type {
  AuthTokens,
  LoginPayload,
  RegisterPayload,
  RegisterResponse,
  VerifyOtpPayload,
} from '@/modules/auth/types'

export const authApi = {
  register: (payload: RegisterPayload) => http.post<RegisterResponse>('/auth/register', payload).then((r) => r.data),

  verifyOtp: (payload: VerifyOtpPayload) =>
    http.post<{ verified: boolean }>('/auth/verify-otp', payload).then((r) => r.data),

  resendOtp: (email: string) =>
    http.post<{ status: string; verification_code?: string }>('/auth/resend-otp', { email }).then((r) => r.data),

  login: (payload: LoginPayload) => http.post<AuthTokens>('/auth/login', payload).then((r) => r.data),

  logout: async () => {
    const refreshToken = tokenStorage.getRefreshToken()
    try {
      if (refreshToken) {
        await http.delete('/auth/sessions', { data: { refresh_token: refreshToken } })
      }
    } finally {
      tokenStorage.clear()
    }
  },

  forgotPassword: (email: string) =>
    http.post<{ status: string }>('/auth/password/forgot', { email }).then((r) => r.data),

  resetPassword: (payload: { email: string; otp: string; new_password: string }) =>
    http.post<void>('/auth/password/reset', payload).then((r) => r.data),
}
