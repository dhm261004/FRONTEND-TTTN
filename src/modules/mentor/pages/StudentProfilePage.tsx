import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { MentorLayout } from '@/modules/mentor/components/MentorLayout'
import { mentorStudentsApi } from '@/modules/mentor/api/mentorStudents.api'
import { Spinner } from '@/shared/components/ui/Spinner'
import { EmptyState } from '@/shared/components/ui/EmptyState'
import { Button } from '@/shared/components/ui/Button'
import { SessionStatusBadge } from '@/modules/mentor/components/SessionStatusBadge'
import { StarRating } from '@/modules/mentors/components/StarRating'
import { ApiError } from '@/shared/api/types'
import { formatCurrencyVnd, formatDate } from '@/shared/lib/format'
import type { StudentProfile } from '@/modules/mentor/types'

// Cùng bộ giá trị với DEGREE_OPTIONS ở candidate/pages/ProfilePage.tsx — Scholarship.degree dùng
// đúng các code này, không tách thành constant dùng chung vì chỉ 4 dòng.
const DEGREE_LABELS: Record<string, string> = {
  undergraduate: 'Đại học',
  postgraduate: 'Sau đại học',
  vocational: 'Cao đẳng / Nghề',
  other: 'Khác',
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
}

function formatTimeRange(startIso: string, endIso: string) {
  return `${formatDate(startIso)} · ${formatTime(startIso)} - ${formatTime(endIso)}`
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-brand-ink-soft">{label}</p>
      <p className="font-medium text-brand-ink">{value}</p>
    </div>
  )
}

export function StudentProfilePage() {
  const { candidateProfileId } = useParams<{ candidateProfileId: string }>()
  const [profile, setProfile] = useState<StudentProfile | null>(null)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!candidateProfileId) return
    setProfile(null)
    setNotFound(false)
    mentorStudentsApi
      .getProfile(candidateProfileId)
      .then(setProfile)
      .catch((err) => {
        if (err instanceof ApiError && err.status === 404) setNotFound(true)
      })
  }, [candidateProfileId])

  if (notFound) {
    return (
      <MentorLayout>
        <EmptyState
          title="Không thể xem hồ sơ này"
          description="Học viên này chưa mua gói dịch vụ nào của bạn, hoặc hồ sơ không tồn tại."
          action={
            <Link to="/co-van/sinh-vien">
              <Button size="sm">Quay lại danh sách</Button>
            </Link>
          }
        />
      </MentorLayout>
    )
  }

  if (!profile) {
    return (
      <MentorLayout>
        <Spinner />
      </MentorLayout>
    )
  }

  return (
    <MentorLayout>
      <Link to="/co-van/sinh-vien" className="mb-4 inline-block text-sm text-brand-blue-600 hover:underline">
        ‹ Quay lại danh sách sinh viên
      </Link>

      <div className="space-y-6">
        <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="size-16 shrink-0 overflow-hidden rounded-full bg-slate-200">
            {profile.avatar_url && <img src={profile.avatar_url} alt="" className="size-full object-cover" />}
          </div>
          <div>
            <h1 className="text-xl font-bold text-brand-ink">{profile.full_name || 'Học viên'}</h1>
            <p className="text-sm text-brand-ink-soft">{profile.email}</p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 font-bold text-brand-ink">Gói dịch vụ đã mua ({profile.purchases.length})</h2>
          {profile.purchases.length === 0 ? (
            <p className="text-sm text-brand-ink-soft">Chưa có gói nào.</p>
          ) : (
            <div className="space-y-3">
              {profile.purchases.map((p) => (
                <div key={p.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <div>
                    <p className="text-sm font-semibold text-brand-ink">{p.service_name}</p>
                    <p className="text-xs text-brand-ink-soft">
                      Mua ngày {formatDate(p.purchased_at)} · {formatCurrencyVnd(p.price)}
                    </p>
                  </div>
                  <span className="rounded-full bg-brand-blue-50 px-3 py-1 text-xs font-medium text-brand-blue-600">
                    Còn {p.remaining_sessions}/{p.total_sessions} buổi
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 font-bold text-brand-ink">Lịch sử buổi hẹn ({profile.sessions.length})</h2>
          {profile.sessions.length === 0 ? (
            <p className="text-sm text-brand-ink-soft">Chưa có buổi hẹn nào.</p>
          ) : (
            <div className="space-y-3">
              {profile.sessions.map((s) => (
                <div key={s.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <div>
                    <p className="text-sm font-semibold text-brand-ink">{s.topic}</p>
                    <p className="text-xs text-brand-ink-soft">{formatTimeRange(s.start_time, s.end_time)}</p>
                  </div>
                  <SessionStatusBadge status={s.status} />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 font-bold text-brand-ink">Thông tin cá nhân</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <InfoItem label="Số điện thoại" value={profile.phone || '—'} />
            <InfoItem label="Ngày sinh" value={formatDate(profile.date_of_birth)} />
            <InfoItem
              label="Địa chỉ"
              value={[profile.ward, profile.province_city].filter(Boolean).join(', ') || '—'}
            />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 font-bold text-brand-ink">Học vấn &amp; ngành mục tiêu</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <InfoItem label="Trường đang học" value={profile.current_school || '—'} />
            <InfoItem label="Bậc học hiện tại" value={profile.current_degree_level ? DEGREE_LABELS[profile.current_degree_level] || profile.current_degree_level : '—'} />
            <InfoItem label="GPA" value={profile.gpa != null ? String(profile.gpa) : '—'} />
          </div>
          {profile.target_majors.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {profile.target_majors.map((m) => (
                <span key={m} className="rounded-full bg-brand-blue-50 px-3 py-1 text-xs font-medium text-brand-blue-600">
                  {m}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 font-bold text-brand-ink">CV &amp; Phân tích AI</h2>
          {profile.cv_url ? (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <a href={profile.cv_url} target="_blank" rel="noreferrer" className="text-sm font-medium text-brand-blue-600 hover:underline">
                  Xem CV
                </a>
                {profile.cv_analyzed_at && (
                  <span className="text-xs text-brand-ink-soft">Đã phân tích lúc {new Date(profile.cv_analyzed_at).toLocaleString('vi-VN')}</span>
                )}
              </div>
              {profile.impact_leadership_score != null && (
                <div>
                  <p className="mb-1 text-xs text-brand-ink-soft">Điểm tác động &amp; lãnh đạo (AI đánh giá từ CV, hoạt động, giải thưởng)</p>
                  <div className="flex items-center gap-2">
                    <StarRating rating={profile.impact_leadership_score} />
                    <span className="text-sm font-semibold text-brand-ink">{profile.impact_leadership_score}/5</span>
                  </div>
                  {profile.impact_leadership_reason && (
                    <p className="mt-2 text-sm text-brand-ink-soft">{profile.impact_leadership_reason}</p>
                  )}
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-brand-ink-soft">Học viên chưa tải CV lên.</p>
          )}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 font-bold text-brand-ink">Hoàn cảnh</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <InfoItem label="Hoàn cảnh tài chính" value={profile.financial_need_level || '—'} />
          </div>
        </div>

        {profile.activities.length > 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 font-bold text-brand-ink">Hoạt động ngoại khoá</h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {profile.activities.map((a) => (
                <div key={a.id} className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <p className="text-sm font-semibold text-brand-ink">{a.title}</p>
                  {a.description && <p className="text-xs text-brand-ink-soft">{a.description}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {profile.awards.length > 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 font-bold text-brand-ink">Giải thưởng, thành tích</h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {profile.awards.map((a) => (
                <div key={a.id} className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <p className="text-sm font-semibold text-brand-ink">{a.title}</p>
                  {a.description && <p className="text-xs text-brand-ink-soft">{a.description}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 font-bold text-brand-ink">Chứng chỉ ({profile.certificates.length})</h2>
          {profile.certificates.length === 0 ? (
            <p className="text-sm text-brand-ink-soft">Học viên chưa khai chứng chỉ nào.</p>
          ) : (
            <div className="space-y-3">
              {profile.certificates.map((c) => (
                <div key={c.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <div>
                    <p className="text-sm font-semibold text-brand-ink">
                      {c.certificate_type} — {c.certificate_score}
                    </p>
                    {c.issued_at && <p className="text-xs text-brand-ink-soft">Cấp ngày {formatDate(c.issued_at)}</p>}
                  </div>
                  {c.attachment_url ? (
                    <a href={c.attachment_url} target="_blank" rel="noreferrer" className="text-xs font-medium text-brand-blue-600 hover:underline">
                      Xem minh chứng
                    </a>
                  ) : (
                    <span className="text-xs text-brand-ink-soft">Chưa có minh chứng</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </MentorLayout>
  )
}
