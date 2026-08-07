import { useNavigate } from 'react-router-dom'
import { BreadcrumbLayout } from '@/modules/partner/components/BreadcrumbLayout'
import { PartnerProfileForm } from '@/modules/partner/components/PartnerProfileForm'
import { partnerProfileApi, type PartnerProfilePayload } from '@/modules/partner/api/partnerProfile.api'
import { usePartnerProfile } from '@/modules/partner/PartnerProfileContext'
import { useToast } from '@/shared/components/ui/ToastProvider'

export function CreatePartnerProfilePage() {
  const navigate = useNavigate()
  const { setProfile } = usePartnerProfile()
  const { notify } = useToast()

  const handleSubmit = async (payload: PartnerProfilePayload) => {
    const profile = await partnerProfileApi.create(payload)
    setProfile(profile)
    notify('Đã tạo hồ sơ nhà tài trợ. Hồ sơ đang chờ Skola duyệt.')
    navigate('/doi-tac', { replace: true })
  }

  return (
    <BreadcrumbLayout crumbs={[{ label: 'Tài khoản' }, { label: 'Tạo hồ sơ nhà tài trợ' }]}>
      <div className="mx-auto max-w-3xl">
        <p className="mb-4 text-sm text-brand-ink-soft">
          Vui lòng hoàn tất hồ sơ nhà tài trợ trước khi đăng học bổng. Hồ sơ sẽ cần được Skola duyệt trước khi bạn có
          thể đăng học bổng mới.
        </p>
        <PartnerProfileForm onSubmit={handleSubmit} submitLabel="Tạo hồ sơ" />
      </div>
    </BreadcrumbLayout>
  )
}
