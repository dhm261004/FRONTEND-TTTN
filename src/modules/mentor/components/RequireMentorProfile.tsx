import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { Spinner } from '@/shared/components/ui/Spinner'
import { useMentorProfile } from '@/modules/mentor/MentorProfileContext'

const ONBOARDING_PATH = '/co-van/ho-so/tao'

export function RequireMentorProfile({ children }: { children: ReactNode }) {
  const { loading, hasNoProfile } = useMentorProfile()
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
