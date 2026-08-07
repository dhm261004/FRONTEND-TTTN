import { BrowserRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom'
import { AuthProvider, useAuth } from '@/modules/auth/AuthContext'
import { LoginPage } from '@/modules/auth/pages/LoginPage'
import { RegisterPage } from '@/modules/auth/pages/RegisterPage'
import { VerifyOtpPage } from '@/modules/auth/pages/VerifyOtpPage'
import { ForgotPasswordPage } from '@/modules/auth/pages/ForgotPasswordPage'
import { ResetPasswordPage } from '@/modules/auth/pages/ResetPasswordPage'
import { ProtectedRoute } from '@/app/ProtectedRoute'
import { AccountScope } from '@/app/AccountScope'
import { PartnerProfileProvider } from '@/modules/partner/PartnerProfileContext'
import { RequirePartnerProfile } from '@/modules/partner/components/RequirePartnerProfile'
import { DashboardPage } from '@/modules/partner/pages/DashboardPage'
import { ScholarshipListPage as PartnerScholarshipListPage } from '@/modules/partner/pages/ScholarshipListPage'
import { ScholarshipFormPage } from '@/modules/partner/pages/ScholarshipFormPage'
import { CandidatesPage } from '@/modules/partner/pages/CandidatesPage'
import { ProfileViewPage } from '@/modules/partner/pages/ProfileViewPage'
import { ProfileEditPage } from '@/modules/partner/pages/ProfileEditPage'
import { CreatePartnerProfilePage } from '@/modules/partner/pages/CreatePartnerProfilePage'
import { UnsupportedFeaturePage } from '@/modules/partner/pages/UnsupportedFeaturePage'
import { MANAGEMENT_NAV } from '@/modules/partner/components/nav'
import { ScholarshipListPage } from '@/modules/scholarships/pages/ScholarshipListPage'
import { ScholarshipDetailPage } from '@/modules/scholarships/pages/ScholarshipDetailPage'
import { SponsorProfilePage } from '@/modules/scholarships/pages/SponsorProfilePage'
import { ApplicationPage } from '@/modules/scholarships/pages/ApplicationPage'
import { MentorComingSoonPage } from '@/modules/scholarships/pages/MentorComingSoonPage'
import { ToastProvider } from '@/shared/components/ui/ToastProvider'

function PartnerScope() {
  return (
    <ProtectedRoute roles={['partner']}>
      <PartnerProfileProvider>
        <Outlet />
      </PartnerProfileProvider>
    </ProtectedRoute>
  )
}

function RootRedirect() {
  const { isAuthenticated, user } = useAuth()
  if (isAuthenticated && user?.role === 'partner') return <Navigate to="/doi-tac" replace />
  return <ScholarshipListPage />
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />

      <Route path="/dang-nhap" element={<LoginPage />} />
      <Route path="/dang-ky" element={<RegisterPage />} />
      <Route path="/xac-thuc-otp" element={<VerifyOtpPage />} />
      <Route path="/quen-mat-khau" element={<ForgotPasswordPage />} />
      <Route path="/dat-lai-mat-khau" element={<ResetPasswordPage />} />

      <Route path="/hoc-bong" element={<ScholarshipListPage />} />
      <Route path="/hoc-bong/:id" element={<ScholarshipDetailPage />} />
      <Route
        path="/hoc-bong/:id/ung-tuyen"
        element={
          <ProtectedRoute roles={['candidate']}>
            <ApplicationPage />
          </ProtectedRoute>
        }
      />
      <Route path="/nha-tai-tro/:id" element={<SponsorProfilePage />} />
      <Route path="/mentor" element={<MentorComingSoonPage />} />

      <Route
        path="/tai-khoan/*"
        element={
          <ProtectedRoute>
            <AccountScope />
          </ProtectedRoute>
        }
      />

      <Route element={<PartnerScope />}>
        <Route path="/doi-tac/ho-so/tao" element={<CreatePartnerProfilePage />} />

        <Route path="/doi-tac" element={<DashboardPage />} />
        <Route path="/doi-tac/hoc-bong" element={<PartnerScholarshipListPage />} />
        <Route path="/doi-tac/hoc-bong/moi" element={<ScholarshipFormPage />} />
        <Route path="/doi-tac/hoc-bong/:id/sua" element={<ScholarshipFormPage />} />
        <Route path="/doi-tac/ho-so-ung-vien" element={<CandidatesPage />} />
        <Route
          path="/doi-tac/ngan-sach"
          element={
            <UnsupportedFeaturePage
              nav={MANAGEMENT_NAV}
              title="Quản lý ngân sách"
              description="Backend hiện chưa có model lưu trữ ngân sách theo chương trình học bổng. Tính năng này sẽ được bổ sung khi schema tương ứng sẵn sàng."
            />
          }
        />

        <Route
          path="/doi-tac/ho-so"
          element={
            <RequirePartnerProfile>
              <ProfileViewPage />
            </RequirePartnerProfile>
          }
        />
        <Route
          path="/doi-tac/ho-so/sua"
          element={
            <RequirePartnerProfile>
              <ProfileEditPage />
            </RequirePartnerProfile>
          }
        />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  )
}

export default App
