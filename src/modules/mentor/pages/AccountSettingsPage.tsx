import { Link } from 'react-router-dom'
import { MentorLayout } from '@/modules/mentor/components/MentorLayout'
import { useAuth } from '@/modules/auth/AuthContext'
import type { UserRole } from '@/modules/auth/types'

const ROLE_LABELS: Record<UserRole, string> = {
  candidate: 'Sinh viên',
  partner: 'Nhà tài trợ',
  mentor: 'Mentor',
  admin: 'Quản trị viên',
}

export function AccountSettingsPage() {
  const { user } = useAuth()

  return (
    <MentorLayout>
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <h1 className="mb-4 text-lg font-bold text-brand-ink">Thông tin tài khoản</h1>
          <dl className="space-y-4">
            <div>
              <dt className="text-xs text-brand-ink-soft">Email đăng nhập</dt>
              <dd className="mt-0.5 font-medium text-brand-ink">{user?.email}</dd>
            </div>
            <div>
              <dt className="text-xs text-brand-ink-soft">Vai trò</dt>
              <dd className="mt-0.5 font-medium text-brand-ink">
                {user ? user.roles.map((role) => ROLE_LABELS[role]).join(', ') : '—'}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-brand-ink-soft">Trạng thái email</dt>
              <dd className="mt-0.5 font-medium text-brand-ink">{user?.is_email_verified ? 'Đã xác thực' : 'Chưa xác thực'}</dd>
            </div>
          </dl>
          <p className="mt-4 text-xs text-brand-ink-soft">
            Đổi email đăng nhập chưa được hệ thống hỗ trợ. Muốn đổi họ tên, ảnh đại diện hoặc chức danh, vào mục{' '}
            <Link to="/co-van/ho-so" className="font-medium text-brand-blue-600 hover:underline">
              Quản lý hồ sơ
            </Link>
            . Xem mục "Mật khẩu và bảo mật" để đổi mật khẩu.
          </p>
        </div>
      </div>
    </MentorLayout>
  )
}
