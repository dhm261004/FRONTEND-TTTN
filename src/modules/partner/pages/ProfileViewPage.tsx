import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { BreadcrumbLayout } from '@/modules/partner/components/BreadcrumbLayout'
import { Button } from '@/shared/components/ui/Button'
import { Spinner } from '@/shared/components/ui/Spinner'
import { EmptyState } from '@/shared/components/ui/EmptyState'
import { ScholarshipStatusBadge } from '@/modules/partner/components/ScholarshipStatusBadge'
import { usePartnerProfile } from '@/modules/partner/PartnerProfileContext'
import { useAuth } from '@/modules/auth/AuthContext'
import { scholarshipsApi } from '@/modules/partner/api/scholarships.api'
import type { Scholarship } from '@/modules/partner/types'
import { formatCurrencyVnd, formatDate } from '@/shared/lib/format'

export function ProfileViewPage() {
  const { profile, loading } = usePartnerProfile()
  const { user } = useAuth()
  const [scholarships, setScholarships] = useState<Scholarship[]>([])
  const [loadingScholarships, setLoadingScholarships] = useState(true)

  useEffect(() => {
    if (!profile) return
    setLoadingScholarships(true)
    scholarshipsApi
      .list({ partner_profile_id: profile.id, limit: 20 })
      .then((res) => setScholarships(res.items))
      .finally(() => setLoadingScholarships(false))
  }, [profile])

  if (loading || !profile) return null

  return (
    <BreadcrumbLayout crumbs={[{ label: 'Tài khoản', to: '/tai-khoan' }, { label: 'Hồ sơ nhà tài trợ' }]}>
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex h-32 items-center justify-center overflow-hidden bg-gradient-to-br from-brand-blue-400 to-brand-blue-600">
              {profile.cover_image_url && <img src={profile.cover_image_url} alt="" className="size-full object-cover" />}
            </div>
            <div className="p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div className="flex items-end gap-4">
                  <div className="-mt-12 size-20 shrink-0 overflow-hidden rounded-xl border-4 border-white bg-slate-200 shadow">
                    {profile.logo_url && <img src={profile.logo_url} alt="" className="size-full object-cover" />}
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-brand-ink">{profile.company_name}</h1>
                    {profile.website_url && (
                      <a
                        href={profile.website_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm text-brand-blue-600"
                      >
                        {profile.website_url}
                      </a>
                    )}
                  </div>
                </div>
                <Link to="/doi-tac/ho-so/sua">
                  <Button variant="secondary" size="sm">
                    Chỉnh sửa hồ sơ
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-3 text-lg font-bold text-brand-ink">Giới thiệu công ty</h2>
            <p className="whitespace-pre-line text-sm leading-relaxed text-brand-ink-soft">
              {profile.description || 'Chưa có mô tả. Hãy cập nhật hồ sơ để giới thiệu về công ty của bạn.'}
            </p>
          </div>

          <div>
            <h2 className="mb-3 text-lg font-bold text-brand-ink">Học bổng tài trợ</h2>
            {loadingScholarships ? (
              <Spinner />
            ) : scholarships.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-white">
                <EmptyState
                  title="Chưa có học bổng nào"
                  description="Đăng học bổng đầu tiên để bắt đầu tiếp cận ứng viên."
                  action={
                    <Link to="/doi-tac/hoc-bong/moi">
                      <Button size="sm">Đăng tải học bổng mới</Button>
                    </Link>
                  }
                />
              </div>
            ) : (
              <div className="space-y-4">
                {scholarships.map((s) => (
                  <div key={s.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="mb-1 flex items-center justify-between">
                      <ScholarshipStatusBadge scholarship={s} />
                      <Link to={`/doi-tac/hoc-bong/${s.id}/sua`}>
                        <button type="button" aria-label="Chỉnh sửa" className="text-brand-ink-soft hover:text-brand-ink">
                          ✎
                        </button>
                      </Link>
                    </div>
                    <h3 className="text-base font-bold text-brand-ink">{s.title}</h3>
                    <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-brand-ink-soft">
                      <span>
                        {s.value_type === 'percentage' && s.funding_percentage
                          ? `${s.funding_percentage}% học phí`
                          : formatCurrencyVnd(s.funding_percentage)}
                      </span>
                      <span>Hạn nộp: {formatDate(s.deadline)}</span>
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      {s.location_province_city && (
                        <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs text-slate-500">
                          {s.location_province_city}
                        </span>
                      )}
                      <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs text-slate-500">{s.degree}</span>
                      <Link to={`/doi-tac/hoc-bong/${s.id}/sua`} className="ml-auto">
                        <Button size="sm">Quản lý</Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-bold text-brand-ink">Thông tin chung</h2>
            <dl className="space-y-4 text-sm">
              <InfoRow label="Email" value={user?.email} />
              <InfoRow label="Lĩnh vực hoạt động" value={profile.industry_sector} />
              <InfoRow label="Năm thành lập" value={profile.founding_year != null ? String(profile.founding_year) : null} />
              <InfoRow label="Quy mô nhân sự" value={profile.company_size ? `${profile.company_size} nhân sự` : null} />
              <InfoRow
                label="Trụ sở chính"
                value={[profile.headquarters_address, profile.province_city].filter(Boolean).join(', ') || null}
              />
              <InfoRow label="Trạng thái duyệt" value={approvalLabel(profile.approval_status)} />
            </dl>
          </div>

          <div className="rounded-2xl bg-gradient-to-br from-brand-blue-500 to-brand-blue-700 p-6 text-white shadow-sm">
            <p className="text-lg font-semibold leading-snug">
              Mỗi đối tác đồng hành là một cánh cửa mở ra cơ hội mới.
            </p>
          </div>
        </div>
      </div>
    </BreadcrumbLayout>
  )
}

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <dt className="text-xs text-brand-ink-soft">{label}</dt>
      <dd className="mt-0.5 font-medium text-brand-ink">{value || '—'}</dd>
    </div>
  )
}

function approvalLabel(status: string) {
  if (status === 'approved') return 'Đã duyệt'
  if (status === 'rejected') return 'Bị từ chối'
  return 'Đang chờ duyệt'
}
