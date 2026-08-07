import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import { partnerProfileApi } from '@/modules/partner/api/partnerProfile.api'
import type { PartnerProfile } from '@/modules/partner/types'
import { ApiError } from '@/shared/api/types'
import { useAuth } from '@/modules/auth/AuthContext'

interface PartnerProfileContextValue {
  profile: PartnerProfile | null
  loading: boolean
  /** true khi đã xác nhận tài khoản này chưa tạo hồ sơ đối tác (404 từ API) */
  hasNoProfile: boolean
  refresh: () => Promise<void>
  setProfile: (profile: PartnerProfile) => void
}

const PartnerProfileContext = createContext<PartnerProfileContextValue | null>(null)

export function PartnerProfileProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth()
  const [profile, setProfileState] = useState<PartnerProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [hasNoProfile, setHasNoProfile] = useState(false)

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const data = await partnerProfileApi.getMe()
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
    <PartnerProfileContext.Provider
      value={{ profile, loading, hasNoProfile, refresh, setProfile: setProfileState }}
    >
      {children}
    </PartnerProfileContext.Provider>
  )
}

export function usePartnerProfile() {
  const ctx = useContext(PartnerProfileContext)
  if (!ctx) throw new Error('usePartnerProfile phải được dùng bên trong PartnerProfileProvider')
  return ctx
}
