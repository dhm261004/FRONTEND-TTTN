import { Navigate } from 'react-router-dom'
import { useAuth } from '@/modules/auth/AuthContext'
import { CandidateProfileProvider } from '@/modules/candidate/CandidateProfileContext'
import { CandidateAccountRoutes } from '@/modules/candidate/CandidateAccountRoutes'

export function AccountScope() {
  const { user } = useAuth()

  // Khu vực tài khoản đối tác đã gộp vào /doi-tac/ho-so (xem MANAGEMENT_NAV) — không còn
  // PartnerAccountRoutes/ACCOUNT_NAV riêng, /tai-khoan/* chỉ còn giữ lại để không vỡ link/bookmark cũ.
  if (user?.roles.includes('partner')) {
    return <Navigate to="/doi-tac/ho-so" replace />
  }

  if (user?.roles.includes('candidate')) {
    return (
      <CandidateProfileProvider>
        <CandidateAccountRoutes />
      </CandidateProfileProvider>
    )
  }

  return <Navigate to="/" replace />
}
