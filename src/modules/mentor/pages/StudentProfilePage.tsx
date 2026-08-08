import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { MentorLayout } from '@/modules/mentor/components/MentorLayout'
import { mentorStudentsApi } from '@/modules/mentor/api/mentorStudents.api'
import { Spinner } from '@/shared/components/ui/Spinner'
import { EmptyState } from '@/shared/components/ui/EmptyState'
import { Button } from '@/shared/components/ui/Button'
import { ApiError } from '@/shared/api/types'
import { formatDate } from '@/shared/lib/format'
import type { StudentProfile } from '@/modules/mentor/types'

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
          <h2 className="mb-4 font-bold text-brand-ink">Hoàn cảnh</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <InfoItem label="Hoàn cảnh tài chính" value={profile.financial_need_level || '—'} />
            <InfoItem label="Thế hệ đầu tiên học đại học" value={profile.is_first_generation ? 'Có' : 'Không'} />
          </div>
        </div>

        {(profile.extracurriculars || profile.awards) && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 font-bold text-brand-ink">Hoạt động &amp; thành tích</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {profile.extracurriculars && (
                <div>
                  <p className="mb-1 text-xs text-brand-ink-soft">Hoạt động ngoại khoá</p>
                  <p className="text-sm text-brand-ink">{profile.extracurriculars}</p>
                </div>
              )}
              {profile.awards && (
                <div>
                  <p className="mb-1 text-xs text-brand-ink-soft">Giải thưởng, thành tích</p>
                  <p className="text-sm text-brand-ink">{profile.awards}</p>
                </div>
              )}
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
