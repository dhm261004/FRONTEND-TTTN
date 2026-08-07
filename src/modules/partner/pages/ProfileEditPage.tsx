import { useNavigate } from 'react-router-dom'
import { BreadcrumbLayout } from '@/modules/partner/components/BreadcrumbLayout'
import { PartnerProfileForm } from '@/modules/partner/components/PartnerProfileForm'
import { partnerProfileApi, type PartnerProfilePayload } from '@/modules/partner/api/partnerProfile.api'
import { usePartnerProfile } from '@/modules/partner/PartnerProfileContext'
import { useToast } from '@/shared/components/ui/ToastProvider'
import { Spinner } from '@/shared/components/ui/Spinner'

export function ProfileEditPage() {
  const navigate = useNavigate()
  const { profile, loading, setProfile } = usePartnerProfile()
  const { notify } = useToast()

  const handleSubmit = async (payload: PartnerProfilePayload) => {
    const updated = await partnerProfileApi.update(payload)
    setProfile(updated)
    notify('Đã lưu thay đổi hồ sơ.')
    navigate('/doi-tac/ho-so')
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
    <BreadcrumbLayout crumbs={[{ label: 'Tài khoản', to: '/tai-khoan' }, { label: 'Cập nhật hồ sơ nhà tài trợ' }]}>
      {loading || !profile ? (
        <Spinner />
      ) : (
        <div className="mx-auto max-w-3xl">
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
            submitLabel="Lưu và hoàn tất"
          />
        </div>
      )}
    </BreadcrumbLayout>
  )
}
