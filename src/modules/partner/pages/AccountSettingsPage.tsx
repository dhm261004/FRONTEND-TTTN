import { PartnerLayout } from '@/modules/partner/components/PartnerLayout'
import { ACCOUNT_NAV } from '@/modules/partner/components/nav'
import { UnsupportedNotice } from '@/shared/components/ui/UnsupportedNotice'
import { useAuth } from '@/modules/auth/AuthContext'

export function AccountSettingsPage() {
  const { user } = useAuth()

  return (
    <PartnerLayout nav={ACCOUNT_NAV}>
      <div className="mx-auto max-w-2xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="mb-4 text-lg font-bold text-brand-ink">Thông tin tài khoản</h1>

        <dl className="space-y-4">
          <div>
            <dt className="text-xs text-brand-ink-soft">Email đăng nhập</dt>
            <dd className="mt-0.5 font-medium text-brand-ink">{user?.email}</dd>
          </div>
          <div>
            <dt className="text-xs text-brand-ink-soft">Vai trò</dt>
            <dd className="mt-0.5 font-medium text-brand-ink">Nhà tài trợ</dd>
          </div>
          <div>
            <dt className="text-xs text-brand-ink-soft">Trạng thái email</dt>
            <dd className="mt-0.5 font-medium text-brand-ink">
              {user?.is_email_verified ? 'Đã xác thực' : 'Chưa xác thực'}
            </dd>
          </div>
        </dl>

        <div className="mt-6">
          <UnsupportedNotice>
            Số điện thoại và đổi email chưa được hệ thống hỗ trợ — bảng người dùng hiện chỉ lưu email, mật khẩu và
            vai trò. Xem mục "Mật khẩu và bảo mật" để đổi mật khẩu.
          </UnsupportedNotice>
        </div>
      </div>
    </PartnerLayout>
  )
}
