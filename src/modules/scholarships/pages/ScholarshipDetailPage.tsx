import { useEffect, useState, type ReactNode } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { PublicHeader } from '@/modules/scholarships/components/PublicHeader'
import { SiteFooter } from '@/shared/components/layout/SiteFooter'
import { ScholarshipCard } from '@/modules/scholarships/components/ScholarshipCard'
import { Button } from '@/shared/components/ui/Button'
import { Spinner } from '@/shared/components/ui/Spinner'
import { formatCurrencyVnd, formatDate } from '@/shared/lib/format'
import { scholarshipsApi } from '@/modules/scholarships/api/scholarships.api'
import { partnersApi } from '@/modules/scholarships/api/partners.api'
import { interactionsApi } from '@/modules/scholarships/api/interactions.api'
import { recommendationsApi } from '@/modules/scholarships/api/recommendations.api'
import { useAuth } from '@/modules/auth/AuthContext'
import { useToast } from '@/shared/components/ui/ToastProvider'
import { ApiError } from '@/shared/api/types'
import type { MatchResult, PartnerProfile, Scholarship } from '@/modules/scholarships/types'

export function ScholarshipDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { notify } = useToast()
  const isCandidate = user?.role === 'candidate'

  const [scholarship, setScholarship] = useState<Scholarship | null>(null)
  const [partner, setPartner] = useState<PartnerProfile | null>(null)
  const [related, setRelated] = useState<Scholarship[]>([])
  const [match, setMatch] = useState<MatchResult | null>(null)
  const [matchLoading, setMatchLoading] = useState(false)
  const [savedInteractionId, setSavedInteractionId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    void scholarshipsApi
      .get(id)
      .then(async (data) => {
        setScholarship(data)
        void scholarshipsApi.logView(id)

        if (data.partner_profile_id) {
          void partnersApi.getById(data.partner_profile_id).then(setPartner).catch(() => setPartner(null))
          void scholarshipsApi
            .list({ partner_profile_id: data.partner_profile_id, is_active: true, limit: 4 })
            .then((res) => setRelated(res.items.filter((item) => item.id !== id)))
            .catch(() => setRelated([]))
        }
      })
      .finally(() => setLoading(false))
  }, [id])

  useEffect(() => {
    if (!id || !isCandidate) {
      setMatch(null)
      setSavedInteractionId(null)
      return
    }
    // Gọi tuần tự: cả hai endpoint đều tự tạo CandidateProfile nếu ứng viên chưa có (lazy upsert ở
    // backend) — bắn song song 2 request "tạo nếu chưa có" cùng lúc từng gây lỗi 500 ngẫu nhiên.
    setMatchLoading(true)
    void recommendationsApi
      .getMatch(id)
      .then(setMatch)
      .catch(() => setMatch(null))
      .finally(() => setMatchLoading(false))
      .then(() => interactionsApi.listMine('saved'))
      .then((list) => setSavedInteractionId(list.find((i) => i.scholarship_id === id)?.id ?? null))
      .catch(() => setSavedInteractionId(null))
  }, [id, isCandidate])

  const toggleSave = async () => {
    if (!id) return
    if (!isCandidate) {
      navigate('/dang-nhap', { state: { from: `/hoc-bong/${id}` } })
      return
    }
    if (savedInteractionId) {
      const prevId = savedInteractionId
      setSavedInteractionId(null)
      notify('Đã bỏ lưu học bổng.')
      try {
        await interactionsApi.remove(prevId)
      } catch (err) {
        setSavedInteractionId(prevId)
        notify(err instanceof ApiError ? err.message : 'Không thể lưu học bổng. Vui lòng thử lại.', 'error')
      }
    } else {
      const placeholderId = `pending-${id}`
      setSavedInteractionId(placeholderId)
      notify('Đã lưu học bổng.')
      try {
        const interaction = await interactionsApi.create(id, 'saved')
        setSavedInteractionId((curr) => (curr === placeholderId ? interaction.id : curr))
      } catch (err) {
        setSavedInteractionId((curr) => (curr === placeholderId ? null : curr))
        notify(err instanceof ApiError ? err.message : 'Không thể lưu học bổng. Vui lòng thử lại.', 'error')
      }
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-app-bg">
        <Spinner />
      </div>
    )
  }

  if (!scholarship) {
    return (
      <div className="flex min-h-svh flex-col bg-app-bg">
        <PublicHeader active="hoc-bong" />
        <div className="flex-1 px-6 py-16 text-center text-brand-ink-soft">Không tìm thấy học bổng.</div>
        <SiteFooter />
      </div>
    )
  }

  return (
    <div className="flex min-h-svh flex-col bg-app-bg">
      <PublicHeader active="hoc-bong" />

      <div className="mx-auto w-full max-w-[1440px] flex-1 px-6 py-8">
        <p className="mb-4 text-sm text-brand-ink-soft">
          <Link to="/hoc-bong">Trang chủ</Link> <span className="mx-1">›</span> <Link to="/hoc-bong">Học bổng</Link>{' '}
          <span className="mx-1">›</span> {scholarship.title}
        </p>

        <div className="flex flex-col gap-6 lg:flex-row">
          <div className="min-w-0 flex-1 space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-wrap items-start gap-4">
                {scholarship.image_url && (
                  <img src={scholarship.image_url} alt="" className="size-20 rounded-xl object-cover" />
                )}
                <div className="min-w-0 flex-1">
                  <h1 className="text-xl font-bold text-brand-ink">{scholarship.title}</h1>
                  {partner && (
                    <Link to={`/nha-tai-tro/${partner.id}`} className="text-sm text-brand-blue-600 hover:underline">
                      {partner.company_name}
                    </Link>
                  )}
                  <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-sm text-brand-ink-soft">
                    {scholarship.location_province_city && <span>📍 {scholarship.location_province_city}</span>}
                    <span>💰 {formatCurrencyVnd(scholarship.total_budget)}</span>
                    <span>🎓 {scholarship.total_slots != null ? `${scholarship.total_slots} suất` : 'Không giới hạn suất'}</span>
                    <span>📅 Hạn nộp: {formatDate(scholarship.deadline)}</span>
                  </div>
                </div>
              </div>
            </div>

            <Section title="Tổng quan">
              <p className="whitespace-pre-line text-sm leading-relaxed text-brand-ink-soft">{scholarship.description}</p>
            </Section>

            <Section title="Điều kiện">
              <ul className="list-disc space-y-1.5 pl-5 text-sm text-brand-ink-soft">
                {scholarship.min_gpa != null && <li>GPA từ {scholarship.min_gpa.toFixed(2)} trở lên.</li>}
                {scholarship.majors.length > 0 && (
                  <li>Thuộc ngành: {scholarship.majors.map((m) => m.name).join(', ')}.</li>
                )}
                {!scholarship.is_no_essay && <li>Nộp kèm bài luận cá nhân.</li>}
                <li>Nộp hồ sơ trước hạn {formatDate(scholarship.deadline)}.</li>
              </ul>
            </Section>

            {scholarship.required_certificates.length > 0 && (
              <Section title="Hồ sơ bắt buộc">
                <ul className="list-disc space-y-1.5 pl-5 text-sm text-brand-ink-soft">
                  <li>CV</li>
                  {!scholarship.is_no_essay && <li>Bài luận cá nhân</li>}
                  {scholarship.required_certificates.map((c) => (
                    <li key={c.id}>Chứng chỉ {c.certificate_type}</li>
                  ))}
                </ul>
              </Section>
            )}

            {related.length > 0 && (
              <div>
                <h2 className="mb-3 text-lg font-bold text-brand-ink">Học bổng liên quan</h2>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {related.map((r) => (
                    <ScholarshipCard key={r.id} scholarship={r} />
                  ))}
                </div>
              </div>
            )}
          </div>

          <aside className="w-full shrink-0 space-y-4 lg:w-[320px]">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="mb-3 font-bold text-brand-ink">AI Match - SkolaVip</h2>
              {!isCandidate ? (
                <div className="space-y-3 text-sm text-brand-ink-soft">
                  <p>Đăng nhập bằng tài khoản sinh viên để xem độ phù hợp của bạn với học bổng này.</p>
                  <Link to="/dang-nhap" state={{ from: `/hoc-bong/${scholarship.id}` }}>
                    <Button variant="secondary" className="w-full">
                      Đăng nhập
                    </Button>
                  </Link>
                </div>
              ) : matchLoading ? (
                <Spinner />
              ) : match ? (
                <div className="space-y-3">
                  <div className="text-center">
                    <p className="text-3xl font-extrabold text-brand-blue-600">{match.score}%</p>
                    <p className="text-xs text-brand-ink-soft">Độ phù hợp</p>
                  </div>
                  <ul className="space-y-2">
                    {match.breakdown.map((b) => (
                      <li key={b.criterion} className="text-xs text-brand-ink-soft">
                        <span className="font-semibold text-brand-ink">{Math.round(b.score)}/{b.max_score}</span> — {b.reason}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p className="text-sm text-brand-ink-soft">Không thể tải điểm phù hợp lúc này.</p>
              )}
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <dl className="mb-4 space-y-3 text-sm">
                <div className="flex justify-between">
                  <dt className="text-brand-ink-soft">Thời hạn</dt>
                  <dd className="font-semibold text-brand-ink">{formatDate(scholarship.deadline)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-brand-ink-soft">Giá trị học bổng</dt>
                  <dd className="font-semibold text-brand-ink">
                    {scholarship.total_budget != null ? formatCurrencyVnd(scholarship.total_budget) : scholarship.value_type}
                  </dd>
                </div>
              </dl>
              <div className="flex flex-col gap-2">
                <Link to={`/hoc-bong/${scholarship.id}/ung-tuyen`}>
                  <Button className="w-full">Ứng tuyển ngay</Button>
                </Link>
                <Button variant="secondary" className="w-full" onClick={() => void toggleSave()}>
                  {savedInteractionId ? 'Bỏ lưu học bổng' : 'Lưu học bổng'}
                </Button>
              </div>
            </div>
          </aside>
        </div>
      </div>

      <SiteFooter />
    </div>
  )
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="mb-3 border-l-4 border-brand-blue-500 pl-3 text-lg font-bold text-brand-ink">{title}</h2>
      {children}
    </div>
  )
}
