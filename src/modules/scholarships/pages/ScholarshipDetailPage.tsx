import { useEffect, useState, type ReactNode } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { PublicHeader } from '@/modules/scholarships/components/PublicHeader'
import { SiteFooter } from '@/shared/components/layout/SiteFooter'
import { ScholarshipMiniCard } from '@/modules/scholarships/components/ScholarshipMiniCard'
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
import { vipApi } from '@/modules/vip/api/vip.api'
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
  const [savedIds, setSavedIds] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [candidateIsVip, setCandidateIsVip] = useState<boolean | null>(null)

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
      setSavedIds({})
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
      .then((list) => setSavedIds(Object.fromEntries(list.map((i) => [i.scholarship_id, i.id]))))
      .catch(() => setSavedIds({}))
  }, [id, isCandidate])

  // Chỉ gọi khi thật sự cần biết trạng thái VIP — học bổng độc quyền chặn nộp đơn với ứng viên chưa
  // nâng cấp, nên chỉ ứng viên xem học bổng is_vip_exclusive mới cần API này.
  useEffect(() => {
    if (!isCandidate || !scholarship?.is_vip_exclusive) {
      setCandidateIsVip(null)
      return
    }
    void vipApi
      .getStatus()
      .then((status) => setCandidateIsVip(status.candidate?.is_vip ?? false))
      .catch(() => setCandidateIsVip(false))
  }, [isCandidate, scholarship?.is_vip_exclusive])

  // Dùng chung cho cả cờ lưu của học bổng đang xem lẫn từng thẻ "Học bổng liên quan" bên dưới.
  const toggleSave = async (scholarshipId: string) => {
    if (!isCandidate) {
      navigate('/dang-nhap', { state: { from: `/hoc-bong/${scholarshipId}` } })
      return
    }
    const existingId = savedIds[scholarshipId]
    if (existingId) {
      setSavedIds((prev) => {
        const next = { ...prev }
        delete next[scholarshipId]
        return next
      })
      notify('Đã bỏ lưu học bổng.')
      try {
        await interactionsApi.remove(existingId)
      } catch (err) {
        setSavedIds((prev) => ({ ...prev, [scholarshipId]: existingId }))
        notify(err instanceof ApiError ? err.message : 'Không thể lưu học bổng. Vui lòng thử lại.', 'error')
      }
    } else {
      const placeholderId = `pending-${scholarshipId}`
      setSavedIds((prev) => ({ ...prev, [scholarshipId]: placeholderId }))
      notify('Đã lưu học bổng.')
      try {
        const interaction = await interactionsApi.create(scholarshipId, 'saved')
        setSavedIds((prev) => (prev[scholarshipId] === placeholderId ? { ...prev, [scholarshipId]: interaction.id } : prev))
      } catch (err) {
        setSavedIds((prev) => {
          if (prev[scholarshipId] !== placeholderId) return prev
          const next = { ...prev }
          delete next[scholarshipId]
          return next
        })
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

  // Học bổng độc quyền Skola VIP — chỉ khoá khi đã xác nhận ứng viên KHÔNG phải VIP (candidateIsVip
  // === false), không khoá khi còn đang tải (null) để tránh nháy nút "Ứng tuyển ngay" rồi đổi ngay
  // sau đó.
  const isLockedForCandidate = scholarship.is_vip_exclusive && isCandidate && candidateIsVip === false

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
            {/* Ảnh bìa của đối tác làm banner đầu trang, logo đè lên góc trái dưới ảnh bìa — cùng pattern
                đã dùng ở SponsorProfilePage.tsx để trang chi tiết học bổng và trang nhà tài trợ đồng bộ
                giao diện thay vì mỗi nơi một kiểu. */}
            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="flex h-32 items-center justify-center overflow-hidden bg-gradient-to-br from-brand-blue-400 to-brand-blue-600 sm:h-40">
                {partner?.cover_image_url && <img src={partner.cover_image_url} alt="" className="size-full object-cover" />}
              </div>
              <div className="p-6">
                <div className="flex items-start gap-4">
                  <div className="-mt-14 flex h-16 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-4 border-white bg-white shadow-sm sm:h-20 sm:w-28">
                    {partner?.logo_url ? (
                      <img src={partner.logo_url} alt="" className="size-full object-contain p-2" />
                    ) : (
                      <IconGraduationCap className="size-8 text-brand-blue-300" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1 pt-1">
                    <h1 className="text-xl font-black text-brand-ink sm:text-2xl">{scholarship.title}</h1>
                    {partner && (
                      <Link to={`/nha-tai-tro/${partner.id}`} className="text-sm font-medium text-brand-blue-600 hover:underline">
                        {partner.company_name}
                      </Link>
                    )}
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
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
                {/* 4 cột, cùng ScholarshipMiniCard đang dùng ở trang chủ, kèm cờ lưu - related luôn cùng
                    1 đối tác (fetch theo partner_profile_id) nên dùng chung state `partner` đã có sẵn. */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                  {related.map((r) => (
                    <ScholarshipMiniCard
                      key={r.id}
                      scholarship={r}
                      partner={partner ?? undefined}
                      saved={Boolean(savedIds[r.id])}
                      onToggleSave={() => void toggleSave(r.id)}
                    />
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
              {isLockedForCandidate ? (
                <div className="mb-4 rounded-xl border border-brand-yellow-300 bg-brand-yellow-400/10 p-3 text-sm text-brand-ink">
                  <p className="font-bold">✨ Học bổng độc quyền Skola VIP</p>
                  <p className="mt-1 text-brand-ink-soft">Nâng cấp Skola VIP để mở khoá nộp đơn cho học bổng này.</p>
                </div>
              ) : (
                <p className="mb-4 text-sm text-brand-ink-soft">
                  Sẵn sàng ứng tuyển? Hoàn thiện hồ sơ và nộp trước <span className="font-semibold text-brand-ink">{formatDate(scholarship.deadline)}</span>.
                </p>
              )}
              <div className="flex flex-col gap-2">
                {isLockedForCandidate ? (
                  <Link to="/skola-vip?tab=candidate">
                    <Button variant="yellow" className="w-full">Nâng cấp Skola VIP</Button>
                  </Link>
                ) : (
                  <Link to={`/hoc-bong/${scholarship.id}/ung-tuyen`}>
                    <Button className="w-full">Ứng tuyển ngay</Button>
                  </Link>
                )}
                <Button variant="secondary" className="w-full" onClick={() => void toggleSave(scholarship.id)}>
                  {savedIds[scholarship.id] ? 'Bỏ lưu học bổng' : 'Lưu học bổng'}
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
