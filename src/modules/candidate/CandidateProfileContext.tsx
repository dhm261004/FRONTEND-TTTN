import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import { candidateProfileApi } from '@/modules/candidate/api/candidateProfile.api'
import type { CandidateProfile } from '@/modules/candidate/types'
import { useAuth } from '@/modules/auth/AuthContext'

interface CandidateProfileContextValue {
  profile: CandidateProfile | null
  loading: boolean
  refresh: () => Promise<void>
  setProfile: (profile: CandidateProfile) => void
}

const CandidateProfileContext = createContext<CandidateProfileContextValue | null>(null)

export function CandidateProfileProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth()
  const [profile, setProfileState] = useState<CandidateProfile | null>(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const data = await candidateProfileApi.getMe()
      setProfileState(data)
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
    <CandidateProfileContext.Provider value={{ profile, loading, refresh, setProfile: setProfileState }}>
      {children}
    </CandidateProfileContext.Provider>
  )
}

export function useCandidateProfile() {
  const ctx = useContext(CandidateProfileContext)
  if (!ctx) throw new Error('useCandidateProfile phải được dùng bên trong CandidateProfileProvider')
  return ctx
}
