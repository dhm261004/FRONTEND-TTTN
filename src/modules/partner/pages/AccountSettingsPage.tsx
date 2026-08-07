import { PartnerLayout } from '@/modules/partner/components/PartnerLayout'
import { ACCOUNT_NAV } from '@/modules/partner/components/nav'
import { UnsupportedNotice } from '@/shared/components/ui/UnsupportedNotice'
import { useAuth } from '@/modules/auth/AuthContext'

export function AccountSettingsPage() {
  const { user } = useAuth()

  return (
    <PartnerLayout nav={ACCOUNT_NAV}>
      <div className="mx-auto max-w-2xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-6 flex items-center gap-4">
          <div className="size-16 shrink-0 rounded-full bg-slate-200" />
          <div>
            <p className="font-semibold text-brand-ink">Ảnh đại diện tài khoản</p>
            <p className="text-xs text-brand-ink-soft">Chưa được backend hỗ trợ lưu trữ.</p>
          </div>
        </div>

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
            Họ và tên, số điện thoại và đổi email chưa được hệ thống hỗ trợ — bảng người dùng hiện chỉ lưu email,
            mật khẩu và vai trò. Xem mục "Mật khẩu và bảo mật" để đổi mật khẩu.
          </UnsupportedNotice>
        </div>
      </div>
    </PartnerLayout>
  )
}
