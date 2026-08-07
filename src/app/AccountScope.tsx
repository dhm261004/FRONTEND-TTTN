import { Navigate } from 'react-router-dom'
import { useAuth } from '@/modules/auth/AuthContext'
import { PartnerProfileProvider } from '@/modules/partner/PartnerProfileContext'
import { PartnerAccountRoutes } from '@/modules/partner/PartnerAccountRoutes'
import { CandidateProfileProvider } from '@/modules/candidate/CandidateProfileContext'
import { CandidateAccountRoutes } from '@/modules/candidate/CandidateAccountRoutes'

export function AccountScope() {
  const { user } = useAuth()

  if (user?.role === 'partner') {
    return (
      <PartnerProfileProvider>
        <PartnerAccountRoutes />
      </PartnerProfileProvider>
    )
  }

  if (user?.role === 'candidate') {
    return (
      <CandidateProfileProvider>
        <CandidateAccountRoutes />
      </CandidateProfileProvider>
    )
  }

  return <Navigate to="/" replace />
}
