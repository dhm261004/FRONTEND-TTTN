import { useState } from 'react'
import { Link } from 'react-router-dom'
import { MentorLayout } from '@/modules/mentor/components/MentorLayout'
import { useMentorProfile } from '@/modules/mentor/MentorProfileContext'
import { mentorServicesApi } from '@/modules/mentor/api/mentorServices.api'
import { Button } from '@/shared/components/ui/Button'
import { Badge } from '@/shared/components/ui/Badge'
import { EmptyState } from '@/shared/components/ui/EmptyState'
import { Spinner } from '@/shared/components/ui/Spinner'
import { useToast } from '@/shared/components/ui/ToastProvider'
import { ApiError } from '@/shared/api/types'
import { formatCurrencyVnd } from '@/shared/lib/format'
import { IconPlusCircle } from '@/modules/mentor/components/icons'
import type { MentorService } from '@/modules/mentor/types'

export function ServicesPage() {
  const { profile, loading, refresh } = useMentorProfile()
  const { notify } = useToast()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const services = profile?.services ?? []

  const handleDelete = async (service: MentorService) => {
    setDeletingId(service.id)
    try {
      await mentorServicesApi.delete(service.id)
      notify('Đã xoá gói dịch vụ.')
      await refresh()
    } catch (err) {
      if (err instanceof ApiError && err.code === 'SERVICE_HAS_PURCHASES') {
        notify('Gói này đã có học viên mua, không thể xoá — hãy ngừng bán (chỉnh sửa và tắt "Đang mở bán") thay vì xoá.', 'error')
      } else {
        notify(err instanceof ApiError ? err.message : 'Không thể xoá gói dịch vụ.', 'error')
      }
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <MentorLayout>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-brand-ink">Quản lý gói dịch vụ</h1>
        <Link to="/co-van/dich-vu/moi">
          <Button icon={<IconPlusCircle className="size-4" />}>Tạo gói mới</Button>
        </Link>
      </div>

      {loading ? (
        <Spinner />
      ) : services.length === 0 ? (
        <EmptyState
          title="Chưa có gói dịch vụ nào"
          description="Tạo gói cố vấn đầu tiên để học viên có thể mua và đặt lịch với bạn."
          action={
            <Link to="/co-van/dich-vu/moi">
              <Button size="sm">Tạo gói mới</Button>
            </Link>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <div
              key={service.id}
              className="flex flex-col rounded-2xl bg-white p-5 shadow-sm"
            >
              <div className="mb-2 flex items-start justify-between gap-2">
                <h3 className="font-bold text-brand-ink">{service.name}</h3>
                <Badge tone={service.is_active ? 'green' : 'slate'}>{service.is_active ? 'Đang mở bán' : 'Đã ẩn'}</Badge>
              </div>
              {service.description && <p className="mb-3 text-sm text-brand-ink-soft">{service.description}</p>}
              <p className="text-xl font-extrabold text-brand-blue-600">{formatCurrencyVnd(service.price)}</p>
              <p className="text-xs font-medium text-brand-ink-soft">
                {service.duration_minutes} phút/buổi · {service.total_sessions} buổi/gói
              </p>
              {service.benefits.length > 0 && (
                <ul className="mt-3 space-y-1.5 text-sm text-brand-ink">
                  {service.benefits.map((b, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-brand-blue-500" />
                      {b}
                    </li>
                  ))}
                </ul>
              )}
              <div className="mt-4 flex gap-2 border-t border-slate-100 pt-4">
                <Link to={`/co-van/dich-vu/${service.id}/sua`} className="flex-1">
                  <Button size="sm" variant="secondary" className="w-full">
                    Chỉnh sửa
                  </Button>
                </Link>
                <Button size="sm" variant="danger" loading={deletingId === service.id} onClick={() => handleDelete(service)}>
                  Xoá
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </MentorLayout>
  )
}