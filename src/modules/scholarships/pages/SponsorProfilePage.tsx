import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { PublicHeader } from '@/modules/scholarships/components/PublicHeader'
import { SiteFooter } from '@/shared/components/layout/SiteFooter'
import { ScholarshipCard } from '@/modules/scholarships/components/ScholarshipCard'
import { Spinner } from '@/shared/components/ui/Spinner'
import { EmptyState } from '@/shared/components/ui/EmptyState'
import { UnsupportedNotice } from '@/shared/components/ui/UnsupportedNotice'
import { partnersApi } from '@/modules/scholarships/api/partners.api'
import { scholarshipsApi } from '@/modules/scholarships/api/scholarships.api'
import type { PartnerProfile, Scholarship } from '@/modules/scholarships/types'

export function SponsorProfilePage() {
  const { id } = useParams<{ id: string }>()
  const [partner, setPartner] = useState<PartnerProfile | null>(null)
  const [scholarships, setScholarships] = useState<Scholarship[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    Promise.all([
      partnersApi.getById(id),
      scholarshipsApi.list({ partner_profile_id: id, is_active: true, limit: 20 }),
    ])
      .then(([partnerRes, scholarshipsRes]) => {
        setPartner(partnerRes)
        setScholarships(scholarshipsRes.items)
      })
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-app-bg">
        <Spinner />
      </div>
    )
  }

  if (!partner) {
    return (
      <div className="flex min-h-svh flex-col bg-app-bg">
        <PublicHeader />
        <div className="flex-1 px-6 py-16 text-center text-brand-ink-soft">Không tìm thấy nhà tài trợ.</div>
        <SiteFooter />
      </div>
    )
  }

  return (
    <div className="flex min-h-svh flex-col bg-app-bg">
      <PublicHeader />

      <div className="mx-auto w-full max-w-[1440px] flex-1 px-6 py-8">
        <p className="mb-4 text-sm text-brand-ink-soft">
          <Link to="/hoc-bong">Trang chủ</Link> <span className="mx-1">›</span> {partner.company_name}
        </p>

        <div className="flex flex-col gap-6 lg:flex-row">
          <div className="min-w-0 flex-1 space-y-6">
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="flex h-40 items-center justify-center overflow-hidden bg-gradient-to-br from-brand-blue-400 to-brand-blue-600">
                {partner.cover_image_url && <img src={partner.cover_image_url} alt="" className="size-full object-cover" />}
              </div>
              <div className="p-6">
                <div className="flex flex-wrap items-end gap-4">
                  <div className="-mt-14 flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border-4 border-white bg-slate-100 shadow">
                    {partner.logo_url && <img src={partner.logo_url} alt="" className="size-full object-cover" />}
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-brand-ink">{partner.company_name}</h1>
                    {partner.industry_sector && <p className="text-sm text-brand-ink-soft">{partner.industry_sector}</p>}
                    <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1">
                      {partner.website_url && (
                        <a href={partner.website_url} target="_blank" rel="noreferrer" className="text-sm text-brand-blue-600 hover:underline">
                          Website
                        </a>
                      )}
                      {partner.linkedin_url && (
                        <a href={partner.linkedin_url} target="_blank" rel="noreferrer" className="text-sm text-brand-blue-600 hover:underline">
                          LinkedIn
                        </a>
                      )}
                      {partner.facebook_url && (
                        <a href={partner.facebook_url} target="_blank" rel="noreferrer" className="text-sm text-brand-blue-600 hover:underline">
                          Facebook
                        </a>
                      )}
                    </div>
                  </div>
                </div>
                <div className="mt-4">
                  <UnsupportedNotice>
                    Tính năng theo dõi nhà tài trợ chưa được backend hỗ trợ.
                  </UnsupportedNotice>
                </div>
              </div>
            </div>

            {partner.description && (
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="mb-3 border-l-4 border-brand-blue-500 pl-3 text-lg font-bold text-brand-ink">
                  Giới thiệu công ty
                </h2>
                <p className="whitespace-pre-line text-sm leading-relaxed text-brand-ink-soft">{partner.description}</p>
              </div>
            )}

            <div>
              <h2 className="mb-3 text-lg font-bold text-brand-ink">Học bổng tài trợ</h2>
              {scholarships.length === 0 ? (
                <EmptyState title="Chưa có học bổng đang mở" />
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {scholarships.map((s) => (
                    <ScholarshipCard key={s.id} scholarship={s} />
                  ))}
                </div>
              )}
            </div>
          </div>

          <aside className="w-full shrink-0 space-y-4 lg:w-[280px]">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="mb-3 font-bold text-brand-ink">Thông tin chung</h2>
              <dl className="space-y-3 text-sm">
                {partner.industry_sector && (
                  <div>
                    <dt className="text-xs text-brand-ink-soft">Lĩnh vực hoạt động</dt>
                    <dd className="font-medium text-brand-ink">{partner.industry_sector}</dd>
                  </div>
                )}
                {partner.founding_year && (
                  <div>
                    <dt className="text-xs text-brand-ink-soft">Năm thành lập</dt>
                    <dd className="font-medium text-brand-ink">{partner.founding_year}</dd>
                  </div>
                )}
                {partner.company_size && (
                  <div>
                    <dt className="text-xs text-brand-ink-soft">Quy mô nhân sự</dt>
                    <dd className="font-medium text-brand-ink">{partner.company_size} nhân sự</dd>
                  </div>
                )}
                {(partner.headquarters_address || partner.province_city) && (
                  <div>
                    <dt className="text-xs text-brand-ink-soft">Trụ sở chính</dt>
                    <dd className="font-medium text-brand-ink">
                      {[partner.headquarters_address, partner.province_city].filter(Boolean).join(', ')}
                    </dd>
                  </div>
                )}
                <div>
                  <dt className="text-xs text-brand-ink-soft">Số học bổng đang mở</dt>
                  <dd className="font-medium text-brand-ink">{scholarships.length}</dd>
                </div>
              </dl>
            </div>
          </aside>
        </div>
      </div>

      <SiteFooter />
    </div>
  )
}
