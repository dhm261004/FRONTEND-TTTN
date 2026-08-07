import { Route, Routes } from 'react-router-dom'
import { AccountSettingsPage } from '@/modules/candidate/pages/AccountSettingsPage'
import { SecurityPage } from '@/modules/candidate/pages/SecurityPage'
import { ProfilePage } from '@/modules/candidate/pages/ProfilePage'
import { AppliedScholarshipsPage } from '@/modules/candidate/pages/AppliedScholarshipsPage'
import { SavedScholarshipsPage } from '@/modules/candidate/pages/SavedScholarshipsPage'
import { UnsupportedFeaturePage } from '@/modules/candidate/components/UnsupportedFeaturePage'

export function CandidateAccountRoutes() {
  return (
    <Routes>
      <Route index element={<AccountSettingsPage />} />
      <Route path="ho-so" element={<ProfilePage />} />
      <Route path="bao-mat" element={<SecurityPage />} />
      <Route path="ung-tuyen" element={<AppliedScholarshipsPage />} />
      <Route path="da-luu" element={<SavedScholarshipsPage />} />
      <Route
        path="giao-dich"
        element={
          <UnsupportedFeaturePage
            title="Quản lý giao dịch"
            description="Backend hiện chưa có hệ thống thanh toán/giao dịch. Tính năng này sẽ được bổ sung khi có module billing."
          />
        }
      />
      <Route
        path="goi-y"
        element={
          <UnsupportedFeaturePage
            title="Cài đặt gợi ý học bổng"
            description="Backend hiện chưa có bảng lưu tuỳ chọn cấu hình gợi ý học bổng của người dùng."
          />
        }
      />
      <Route
        path="thong-bao-hoc-bong"
        element={
          <UnsupportedFeaturePage
            title="Thông báo học bổng"
            description="Backend hiện chưa có hệ thống thông báo (module notifications còn là stub)."
          />
        }
      />
      <Route
        path="thong-bao-email"
        element={
          <UnsupportedFeaturePage
            title="Thông báo qua email"
            description="Backend hiện chưa có bảng lưu tuỳ chọn thông báo qua email của người dùng."
          />
        }
      />
    </Routes>
  )
}
