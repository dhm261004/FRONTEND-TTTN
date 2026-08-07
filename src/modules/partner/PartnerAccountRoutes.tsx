import { Route, Routes } from 'react-router-dom'
import { AccountSettingsPage } from '@/modules/partner/pages/AccountSettingsPage'
import { SecurityPage } from '@/modules/partner/pages/SecurityPage'
import { UnsupportedFeaturePage } from '@/modules/partner/pages/UnsupportedFeaturePage'
import { ACCOUNT_NAV } from '@/modules/partner/components/nav'

export function PartnerAccountRoutes() {
  return (
    <Routes>
      <Route index element={<AccountSettingsPage />} />
      <Route path="bao-mat" element={<SecurityPage />} />
      <Route
        path="giao-dich"
        element={
          <UnsupportedFeaturePage
            nav={ACCOUNT_NAV}
            title="Quản lý giao dịch"
            description="Backend hiện chưa có hệ thống thanh toán/giao dịch. Tính năng này sẽ được bổ sung khi có module billing."
          />
        }
      />
      <Route
        path="thong-bao"
        element={
          <UnsupportedFeaturePage
            nav={ACCOUNT_NAV}
            title="Thông báo qua email"
            description="Backend hiện chưa có bảng lưu tuỳ chọn thông báo qua email của người dùng."
          />
        }
      />
    </Routes>
  )
}
