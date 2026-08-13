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
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {services.map((service) => (
            <div
              key={service.id}
              className="grid min-w-0 grid-cols-5 gap-3 rounded-2xl bg-white p-5 shadow-sm"
            >
              {/* Cột trái: Nội dung gói (4/5 width) */}
              <div className="col-span-4 flex min-w-0 flex-col justify-between pr-1">
                <div>
                  <h3
                    className="truncate text-base font-bold text-brand-ink"
                    title={service.name}
                  >
                    {service.name}
                  </h3>

                  {service.description && (
                    <p
                      className="mt-1 line-clamp-2 text-sm text-brand-ink-soft"
                      title={service.description}
                    >
                      {service.description}
                    </p>
                  )}

                  <p className="mt-2 text-lg font-extrabold text-brand-blue-600">
                    {formatCurrencyVnd(service.price)}
                  </p>
                  <p className="text-xs font-medium text-brand-ink-soft">
                    {service.duration_minutes} phút/buổi · {service.total_sessions} buổi/gói
                  </p>

                  {service.benefits.length > 0 && (
                    <ul className="mt-2 space-y-1 text-sm text-brand-ink">
                      {service.benefits.slice(0, 3).map((b, i) => (
                        <li key={i} className="flex min-w-0 items-center gap-1.5">
                          <span className="size-1.5 shrink-0 rounded-full bg-brand-blue-500" />
                          <span className="truncate" title={b}>
                            {b}
                          </span>
                        </li>
                      ))}
                      {service.benefits.length > 3 && (
                        <p className="text-xs italic text-brand-ink-soft">
                          +{service.benefits.length - 3} quyền lợi khác...
                        </p>
                      )}
                    </ul>
                  )}
                </div>
              </div>

              {/* Cột phải: Trạng thái & Icon (1/5 width) */}
              <div className="col-span-1 flex min-w-0 flex-col items-center gap-2 border-l border-slate-100 pl-2">
                {/* Badge trạng thái cố định chiều rộng 80px (w-20) và căn giữa */}
                <div className="flex w-20 shrink-0 justify-center">
                  <Badge
                    tone={service.is_active ? 'green' : 'slate'}
                    className="w-full justify-center text-center"
                  >
                    {service.is_active ? 'Đang mở' : 'Đã ẩn'}
                  </Badge>
                </div>

                {/* Các nút Icon căn giữa theo Badge */}
                <div className="mt-1 flex items-center justify-center gap-1">
                  <Link to={`/co-van/dich-vu/${service.id}/sua`}>
                    <button
                      type="button"
                      className="flex size-8 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-brand-blue-600"
                      title="Chỉnh sửa"
                    >
                      <IconEdit className="size-4" />
                    </button>
                  </Link>
                  <button
                    type="button"
                    disabled={deletingId === service.id}
                    onClick={() => handleDelete(service)}
                    className="flex size-8 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                    title="Xoá"
                  >
                    {deletingId === service.id ? (
                      <Spinner className="size-4" />
                    ) : (
                      <IconTrash className="size-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </MentorLayout>
  )
}

function IconEdit({ className = 'size-4' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
  )
}

function IconTrash({ className = 'size-4' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  )
}