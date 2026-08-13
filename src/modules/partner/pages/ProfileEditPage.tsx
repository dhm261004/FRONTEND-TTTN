import { PartnerLayout } from '@/modules/partner/components/PartnerLayout'
import { MANAGEMENT_NAV } from '@/modules/partner/components/nav'
import { PartnerProfileForm } from '@/modules/partner/components/PartnerProfileForm'
import { partnerProfileApi, type PartnerProfilePayload } from '@/modules/partner/api/partnerProfile.api'
import { usePartnerProfile } from '@/modules/partner/PartnerProfileContext'
import { useAuth } from '@/modules/auth/AuthContext'
import { useToast } from '@/shared/components/ui/ToastProvider'
import { Spinner } from '@/shared/components/ui/Spinner'
import type { UserRole } from '@/modules/auth/types'

const ROLE_LABELS: Record<UserRole, string> = {
  candidate: 'Sinh viên',
  partner: 'Nhà tài trợ',
  mentor: 'Mentor',
  admin: 'Quản trị viên',
}

export function ProfileEditPage() {
  const { profile, loading, setProfile } = usePartnerProfile()
  const { user } = useAuth()
  const { notify } = useToast()

  const handleSubmit = async (payload: PartnerProfilePayload) => {
    const updated = await partnerProfileApi.update(payload)
    setProfile(updated)
    notify('Đã lưu thay đổi hồ sơ.')
  }

  const handleLogoSelected = async (file: File) => {
    const updated = await partnerProfileApi.uploadLogo(file)
    setProfile(updated)
    notify('Đã cập nhật logo.')
  }

  const handleCoverImageSelected = async (file: File) => {
    const updated = await partnerProfileApi.uploadCoverImage(file)
    setProfile(updated)
    notify('Đã cập nhật ảnh bìa.')
  }

  return (
    <PartnerLayout nav={MANAGEMENT_NAV}>
      {loading || !profile ? (
        <Spinner />
      ) : (
        <div className="space-y-6">
          <div>
            <h1 className="text-lg font-bold text-brand-ink">Hồ sơ công ty</h1>
            <p className="mb-4 text-sm text-brand-ink-soft">
              Tên công ty, logo, ảnh bìa và các thông tin giới thiệu hiển thị công khai ở trang nhà tài trợ.
            </p>
            <PartnerProfileForm
              initialValues={{
                company_name: profile.company_name,
                industry_sector: profile.industry_sector ?? '',
                website_url: profile.website_url ?? '',
                description: profile.description ?? '',
                founding_year: profile.founding_year != null ? String(profile.founding_year) : '',
                company_size: profile.company_size ?? '',
                headquarters_address: profile.headquarters_address ?? '',
                province_city: profile.province_city ?? '',
                linkedin_url: profile.linkedin_url ?? '',
                facebook_url: profile.facebook_url ?? '',
              }}
              logoUrl={profile.logo_url}
              coverImageUrl={profile.cover_image_url}
              onSubmit={handleSubmit}
              onLogoSelected={handleLogoSelected}
              onCoverImageSelected={handleCoverImageSelected}
              submitLabel="Lưu thay đổi"
            />
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <h2 className="mb-4 font-bold text-brand-ink">Thông tin đăng nhập</h2>
            <dl className="space-y-4">
              <div>
                <dt className="text-xs text-brand-ink-soft">Email đăng nhập</dt>
                <dd className="mt-0.5 font-medium text-brand-ink">{user?.email}</dd>
              </div>
              <div>
                <dt className="text-xs text-brand-ink-soft">Vai trò</dt>
                <dd className="mt-0.5 font-medium text-brand-ink">
                  {user ? user.roles.map(role => ROLE_LABELS[role]).join(', ') : '—'}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-brand-ink-soft">Trạng thái email</dt>
                <dd className="mt-0.5 font-medium text-brand-ink">
                  {user?.is_email_verified ? 'Đã xác thực' : 'Chưa xác thực'}
                </dd>
              </div>
            </dl>
            <p className="mt-4 text-xs text-brand-ink-soft">
              Đổi email đăng nhập chưa được hệ thống hỗ trợ. Xem mục "Bảo mật" để đổi mật khẩu.
            </p>
          </div>
        </div>
      )}
    </PartnerLayout>
  )
}
