import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { Spinner } from '@/shared/components/ui/Spinner'
import { usePartnerProfile } from '@/modules/partner/PartnerProfileContext'

const ONBOARDING_PATH = '/doi-tac/ho-so/tao'

export function RequirePartnerProfile({ children }: { children: ReactNode }) {
  const { loading, hasNoProfile } = usePartnerProfile()
  const location = useLocation()

  if (loading) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-app-bg">
        <Spinner />
      </div>
    )
  }

  if (hasNoProfile && location.pathname !== ONBOARDING_PATH) {
    return <Navigate to={ONBOARDING_PATH} replace />
  }

  return <>{children}</>
}
