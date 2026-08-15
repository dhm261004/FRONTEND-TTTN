import { BrowserRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom'
import { AuthProvider, useAuth } from '@/modules/auth/AuthContext'
import { getPostLoginRedirect } from '@/modules/auth/redirect'
import { LoginPage } from '@/modules/auth/pages/LoginPage'
import { RegisterPage } from '@/modules/auth/pages/RegisterPage'
import { VerifyOtpPage } from '@/modules/auth/pages/VerifyOtpPage'
import { ForgotPasswordPage } from '@/modules/auth/pages/ForgotPasswordPage'
import { ResetPasswordPage } from '@/modules/auth/pages/ResetPasswordPage'
import { ProtectedRoute } from '@/app/ProtectedRoute'
import { AccountScope } from '@/app/AccountScope'
import { PartnerProfileProvider } from '@/modules/partner/PartnerProfileContext'
import { DashboardPage } from '@/modules/partner/pages/DashboardPage'
import { ScholarshipListPage as PartnerScholarshipListPage } from '@/modules/partner/pages/ScholarshipListPage'
import { ScholarshipFormPage } from '@/modules/partner/pages/ScholarshipFormPage'
import { CandidatesPage } from '@/modules/partner/pages/CandidatesPage'
import { ProfileEditPage } from '@/modules/partner/pages/ProfileEditPage'
import { SecurityPage as PartnerSecurityPage } from '@/modules/partner/pages/SecurityPage'
import { TransactionHistoryPage as PartnerTransactionHistoryPage } from '@/modules/partner/pages/TransactionHistoryPage'
import { CreatePartnerProfilePage } from '@/modules/partner/pages/CreatePartnerProfilePage'
import { UnsupportedFeaturePage } from '@/modules/partner/pages/UnsupportedFeaturePage'
import { MANAGEMENT_NAV } from '@/modules/partner/components/nav'
import { MentorProfileProvider } from '@/modules/mentor/MentorProfileContext'
import { CreateMentorProfilePage } from '@/modules/mentor/pages/CreateMentorProfilePage'
import { AccountSettingsPage as MentorAccountSettingsPage } from '@/modules/mentor/pages/AccountSettingsPage'
import { SecurityPage as MentorSecurityPage } from '@/modules/mentor/pages/SecurityPage'
import { ProfileEditPage as MentorProfileEditPage } from '@/modules/mentor/pages/ProfileEditPage'
import { ServicesPage as MentorServicesPage } from '@/modules/mentor/pages/ServicesPage'
import { ServiceFormPage as MentorServiceFormPage } from '@/modules/mentor/pages/ServiceFormPage'
import { IncomePage as MentorIncomePage } from '@/modules/mentor/pages/IncomePage'
import { ReviewsPage as MentorReviewsPage } from '@/modules/mentor/pages/ReviewsPage'
import { TransactionHistoryPage as MentorTransactionHistoryPage } from '@/modules/mentor/pages/TransactionHistoryPage'
import { SchedulePage as MentorSchedulePage } from '@/modules/mentor/pages/SchedulePage'
import { StudentsPage as MentorStudentsPage } from '@/modules/mentor/pages/StudentsPage'
import { StudentProfilePage as MentorStudentProfilePage } from '@/modules/mentor/pages/StudentProfilePage'
import { ScholarshipListPage } from '@/modules/scholarships/pages/ScholarshipListPage'
import { ScholarshipDetailPage } from '@/modules/scholarships/pages/ScholarshipDetailPage'
import { SponsorProfilePage } from '@/modules/scholarships/pages/SponsorProfilePage'
import { ApplicationPage } from '@/modules/scholarships/pages/ApplicationPage'
import { MentorListPage } from '@/modules/mentors/pages/MentorListPage'
import { MentorDetailPage } from '@/modules/mentors/pages/MentorDetailPage'
import { MentorServiceCheckoutPage } from '@/modules/mentors/pages/MentorServiceCheckoutPage'
import { HomePage } from '@/modules/home/pages/HomePage'
import { VipLandingPage } from '@/modules/vip/pages/VipLandingPage'
import { VipCheckoutPage } from '@/modules/vip/pages/VipCheckoutPage'
import { CartPage } from '@/modules/mentors/cart/CartPage'
import { CartProvider } from '@/modules/mentors/cart/CartContext'
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

function MentorScope() {
  return (
    <ProtectedRoute roles={['mentor']}>
      <MentorProfileProvider>
        <Outlet />
      </MentorProfileProvider>
    </ProtectedRoute>
  )
}

function RootRedirect() {
  const { isAuthenticated, user } = useAuth()
  if (isAuthenticated && user) {
    const redirectTo = getPostLoginRedirect(user)
    if (redirectTo !== '/') return <Navigate to={redirectTo} replace />
  }
  return <HomePage />
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
      <Route path="/skola-vip" element={<VipLandingPage />} />
      <Route
        path="/skola-vip/thanh-toan/:subject"
        element={
          <ProtectedRoute>
            <VipCheckoutPage />
          </ProtectedRoute>
        }
      />
      <Route path="/mentor" element={<MentorListPage />} />
      <Route path="/mentor/:id" element={<MentorDetailPage />} />
      <Route
        path="/mentor/:mentorId/goi/:serviceId/dat-mua"
        element={
          <ProtectedRoute roles={['candidate']}>
            <MentorServiceCheckoutPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/gio-hang"
        element={
          <ProtectedRoute roles={['candidate']}>
            <CartPage />
          </ProtectedRoute>
        }
      />

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

        <Route path="/doi-tac/ho-so" element={<ProfileEditPage />} />
        <Route path="/doi-tac/ho-so/sua" element={<Navigate to="/doi-tac/ho-so" replace />} />
        <Route path="/doi-tac/giao-dich" element={<PartnerTransactionHistoryPage />} />
        <Route path="/doi-tac/bao-mat" element={<PartnerSecurityPage />} />
      </Route>

      <Route element={<MentorScope />}>
        <Route path="/co-van/ho-so/tao" element={<CreateMentorProfilePage />} />

        <Route path="/co-van" element={<MentorAccountSettingsPage />} />
        <Route path="/co-van/bao-mat" element={<MentorSecurityPage />} />
        <Route path="/co-van/thu-nhap" element={<MentorIncomePage />} />
        <Route path="/co-van/dich-vu" element={<MentorServicesPage />} />
        <Route path="/co-van/dich-vu/moi" element={<MentorServiceFormPage />} />
        <Route path="/co-van/dich-vu/:id/sua" element={<MentorServiceFormPage />} />
        <Route path="/co-van/sinh-vien" element={<MentorStudentsPage />} />
        <Route path="/co-van/sinh-vien/:candidateProfileId" element={<MentorStudentProfilePage />} />
        <Route path="/co-van/ho-so" element={<MentorProfileEditPage />} />
        <Route path="/co-van/giao-dich" element={<MentorTransactionHistoryPage />} />
        <Route path="/co-van/danh-gia" element={<MentorReviewsPage />} />
        <Route path="/co-van/lich" element={<MentorSchedulePage />} />
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
          <CartProvider>
            <AppRoutes />
          </CartProvider>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  )
}

export default App
