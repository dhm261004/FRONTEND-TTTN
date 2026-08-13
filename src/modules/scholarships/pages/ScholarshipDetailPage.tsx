import { useEffect, useState, type ReactNode } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { PublicHeader } from '@/modules/scholarships/components/PublicHeader'
import { SiteFooter } from '@/shared/components/layout/SiteFooter'
import { ScholarshipCard } from '@/modules/scholarships/components/ScholarshipCard'
import { Button } from '@/shared/components/ui/Button'
import { Spinner } from '@/shared/components/ui/Spinner'
import { Modal } from '@/shared/components/ui/Modal'
import { ScoreDonut } from '@/shared/components/ui/ScoreDonut'
import { formatCurrencyVnd, formatDate } from '@/shared/lib/format'
import { scholarshipsApi } from '@/modules/scholarships/api/scholarships.api'
import { partnersApi } from '@/modules/scholarships/api/partners.api'
import { interactionsApi } from '@/modules/scholarships/api/interactions.api'
import { recommendationsApi } from '@/modules/scholarships/api/recommendations.api'
import { CRITERION_LABELS, MATCH_LABELS, scholarshipLocationLabel } from '@/modules/scholarships/components/badges'
import { useAuth } from '@/modules/auth/AuthContext'
import { useToast } from '@/shared/components/ui/ToastProvider'
import { ApiError } from '@/shared/api/types'
import {
  IconAward,
  IconCalendarClock,
  IconCheckCircle,
  IconGraduationCap,
  IconMapPin,
  IconPencil,
  IconUsers,
  IconWallet,
} from '@/modules/mentor/components/icons'
import type { MatchResult, PartnerProfile, Scholarship } from '@/modules/scholarships/types'

export function ScholarshipDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { notify } = useToast()
  const isCandidate = Boolean(user?.roles.includes('candidate'))

  const [scholarship, setScholarship] = useState<Scholarship | null>(null)
  const [partner, setPartner] = useState<PartnerProfile | null>(null)
  const [related, setRelated] = useState<Scholarship[]>([])
  const [match, setMatch] = useState<MatchResult | null>(null)
  const [matchLoading, setMatchLoading] = useState(false)
  const [matchModalOpen, setMatchModalOpen] = useState(false)
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
            {/* Ảnh đại diện học bổng nằm ngay trong box giới thiệu (không phải banner rời bên ngoài) —
                logo đối tác (nếu có) nổi lên góc dưới trái ảnh, cùng kiểu overlap đã dùng ở trang mentor. */}
            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="relative h-48 bg-slate-100 sm:h-64">
                {scholarship.image_url ? (
                  <img src={scholarship.image_url} alt="" className="size-full object-cover" />
                ) : (
                  <div className="flex size-full items-center justify-center bg-linear-to-br from-brand-blue-500 via-brand-blue-400 to-brand-cocoa-500">
                    <IconGraduationCap className="size-14 text-white/80" />
                  </div>
                )}
                {partner?.logo_url && (
                  <div className="absolute bottom-4 left-5 size-16 overflow-hidden rounded-2xl border-4 border-white bg-white shadow-lg">
                    <img src={partner.logo_url} alt="" className="size-full object-contain" />
                  </div>
                )}
              </div>

              <div className="p-6">
                <h1 className="text-xl font-black text-brand-ink sm:text-2xl">{scholarship.title}</h1>
                {partner && (
                  <Link to={`/nha-tai-tro/${partner.id}`} className="text-sm font-medium text-brand-blue-600 hover:underline">
                    {partner.company_name}
                  </Link>
                )}
                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <FactChip tone="blue" icon={<IconWallet className="size-4.5" />} label="Giá trị" value={formatCurrencyVnd(scholarship.total_budget)} />
                  <FactChip
                    tone="green"
                    icon={<IconUsers className="size-4.5" />}
                    label="Số suất"
                    value={scholarship.total_slots != null ? `${scholarship.total_slots} suất` : 'Không giới hạn'}
                  />
                  <FactChip tone="amber" icon={<IconCalendarClock className="size-4.5" />} label="Hạn nộp" value={formatDate(scholarship.deadline)} />
                  <FactChip
                    tone="violet"
                    icon={<IconMapPin className="size-4.5" />}
                    label="Khu vực"
                    value={scholarshipLocationLabel(scholarship)}
                  />
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="mb-3 text-lg font-bold text-brand-ink">Tổng quan</h2>
              <p className="whitespace-pre-line text-sm leading-relaxed text-brand-ink-soft">{scholarship.description}</p>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-bold text-brand-ink">Điều kiện</h2>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <RequirementTile
                  icon={<IconAward className="size-5" />}
                  title="GPA tối thiểu"
                  description={scholarship.min_gpa != null ? `Từ ${scholarship.min_gpa.toFixed(2)} trở lên` : 'Không yêu cầu'}
                />
                <RequirementTile
                  icon={<IconPencil className="size-5" />}
                  title="Bài luận cá nhân"
                  description={scholarship.is_no_essay ? 'Không yêu cầu' : 'Bắt buộc nộp kèm'}
                />
                <RequirementTile
                  icon={<IconGraduationCap className="size-5" />}
                  title="Ngành xét tuyển"
                  description={scholarship.majors.length > 0 ? scholarship.majors.map((m) => m.name).join(', ') : 'Tất cả ngành'}
                />
                <RequirementTile
                  icon={<IconCalendarClock className="size-5" />}
                  title="Thời gian nộp hồ sơ"
                  description={`${scholarship.start_date ? `${formatDate(scholarship.start_date)} - ` : 'Trước '}${formatDate(scholarship.deadline)}`}
                />
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-bold text-brand-ink">Hồ sơ bắt buộc</h2>
              <div className="flex flex-wrap gap-2">
                <DocumentChip icon={<IconCheckCircle className="size-3.5" />} label="CV" />
                {!scholarship.is_no_essay && <DocumentChip icon={<IconPencil className="size-3.5" />} label="Bài luận cá nhân" />}
                {scholarship.required_certificates.map((c) => (
                  <DocumentChip key={c.id} icon={<IconAward className="size-3.5" />} label={`Chứng chỉ ${c.certificate_type}`} />
                ))}
              </div>
            </div>

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
                <div className="flex flex-col items-center gap-2">
                  <ScoreDonut score={match.score} onClick={() => setMatchModalOpen(true)} />
                  <p className="text-sm font-semibold text-brand-ink">{MATCH_LABELS[match.label]}</p>
                  <button
                    type="button"
                    onClick={() => setMatchModalOpen(true)}
                    className="text-xs font-semibold text-brand-blue-600 hover:underline"
                  >
                    Xem chi tiết 4 tiêu chí →
                  </button>
                </div>
              ) : (
                <p className="text-sm text-brand-ink-soft">Không thể tải điểm phù hợp lúc này.</p>
              )}
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="mb-4 text-sm text-brand-ink-soft">
                Sẵn sàng ứng tuyển? Hoàn thiện hồ sơ và nộp trước <span className="font-semibold text-brand-ink">{formatDate(scholarship.deadline)}</span>.
              </p>
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

      {match && (
        <Modal open={matchModalOpen} onClose={() => setMatchModalOpen(false)} title="Chi tiết độ phù hợp AI Match">
          <div className="space-y-4">
            <div className="flex flex-col items-center gap-1 border-b border-slate-100 pb-4">
              <ScoreDonut score={match.score} size={96} />
              <p className="text-sm font-semibold text-brand-ink">{MATCH_LABELS[match.label]}</p>
            </div>
            <ul className="space-y-4">
              {match.breakdown.map((b) => (
                <li key={b.criterion} className="text-sm text-brand-ink-soft">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-brand-ink">{CRITERION_LABELS[b.criterion] ?? b.criterion}</span>
                    {b.applicable ? (
                      <span className="shrink-0 font-semibold text-brand-blue-600">
                        {Math.round(b.score)}/{b.max_score}
                      </span>
                    ) : (
                      <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-brand-ink-soft">
                        Chưa áp dụng
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-xs">{b.reason}</p>
                </li>
              ))}
            </ul>
            <p className="text-[11px] text-brand-ink-soft">
              Điểm tổng chỉ tính trên các tiêu chí đã đủ dữ liệu để chấm — tiêu chí "Chưa áp dụng" không bị trừ điểm.
            </p>
          </div>
        </Modal>
      )}
    </div>
  )
}

const FACT_CHIP_TONES = {
  blue: 'bg-brand-blue-50 text-brand-blue-600',
  green: 'bg-emerald-50 text-emerald-600',
  amber: 'bg-amber-50 text-amber-600',
  violet: 'bg-violet-50 text-violet-600',
} as const

function FactChip({
  icon,
  label,
  value,
  tone,
}: {
  icon: ReactNode
  label: string
  value: string
  tone: keyof typeof FACT_CHIP_TONES
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50/60 px-3.5 py-3">
      <span className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${FACT_CHIP_TONES[tone]}`}>{icon}</span>
      <div className="min-w-0">
        <p className="text-[11px] font-medium text-brand-ink-soft">{label}</p>
        <p className="truncate text-sm font-bold text-brand-ink">{value}</p>
      </div>
    </div>
  )
}

function RequirementTile({ icon, title, description }: { icon: ReactNode; title: string; description: string }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-white text-brand-blue-500 shadow-sm">{icon}</span>
      <div className="min-w-0">
        <p className="text-sm font-bold text-brand-ink">{title}</p>
        <p className="mt-0.5 text-xs leading-relaxed text-brand-ink-soft">{description}</p>
      </div>
    </div>
  )
}

function DocumentChip({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-blue-100 bg-brand-blue-50 px-3 py-1.5 text-xs font-medium text-brand-blue-700">
      {icon}
      {label}
    </span>
  )
}
