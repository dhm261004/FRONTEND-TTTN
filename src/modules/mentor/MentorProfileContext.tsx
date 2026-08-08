import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import { mentorProfileApi } from '@/modules/mentor/api/mentorProfile.api'
import type { MentorProfileDetailed } from '@/modules/mentor/types'
import { ApiError } from '@/shared/api/types'
import { useAuth } from '@/modules/auth/AuthContext'

interface MentorProfileContextValue {
  profile: MentorProfileDetailed | null
  loading: boolean
  /** true khi đã xác nhận tài khoản này chưa tạo hồ sơ mentor (404 từ API) */
  hasNoProfile: boolean
  refresh: () => Promise<void>
  setProfile: (profile: MentorProfileDetailed) => void
}

const MentorProfileContext = createContext<MentorProfileContextValue | null>(null)

export function MentorProfileProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth()
  const [profile, setProfileState] = useState<MentorProfileDetailed | null>(null)
  const [loading, setLoading] = useState(true)
  const [hasNoProfile, setHasNoProfile] = useState(false)

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const data = await mentorProfileApi.getMe()
      setProfileState(data)
      setHasNoProfile(false)
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) {
        setProfileState(null)
        setHasNoProfile(true)
      } else {
        throw err
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (isAuthenticated) {
      void refresh()
    } else {
      setLoading(false)
    }
  }, [isAuthenticated, refresh])

  return (
    <MentorProfileContext.Provider value={{ profile, loading, hasNoProfile, refresh, setProfile: setProfileState }}>
      {children}
    </MentorProfileContext.Provider>
  )
}

export function useMentorProfile() {
  const ctx = useContext(MentorProfileContext)
  if (!ctx) throw new Error('useMentorProfile phải được dùng bên trong MentorProfileProvider')
  return ctx
}
