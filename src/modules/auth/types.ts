export type UserRole = 'candidate' | 'partner' | 'mentor' | 'admin'

export interface UserPublic {
  id: string
  email: string
  roles: UserRole[]
  is_email_verified: boolean
}

export interface AuthTokens {
  access_token: string
  refresh_token: string
  user: UserPublic
}

export interface RegisterPayload {
  email: string
  password: string
  role: Extract<UserRole, 'candidate' | 'partner' | 'mentor'>
}

export interface RegisterResponse {
  user_id: string
  status: string
  verification_code?: string
}

export interface LoginPayload {
  email: string
  password: string
}

export interface VerifyOtpPayload {
  email: string
  otp: string
}
