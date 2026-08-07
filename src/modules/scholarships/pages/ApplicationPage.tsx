import { useEffect, useRef, useState, type RefObject } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { PublicHeader } from '@/modules/scholarships/components/PublicHeader'
import { SiteFooter } from '@/shared/components/layout/SiteFooter'
import { ApplicationStatusBadge } from '@/modules/scholarships/components/badges'
import { Button } from '@/shared/components/ui/Button'
import { Spinner } from '@/shared/components/ui/Spinner'
import { Input } from '@/shared/components/ui/Input'
import { formatDate } from '@/shared/lib/format'
import { scholarshipsApi } from '@/modules/scholarships/api/scholarships.api'
import { applicationsApi } from '@/modules/scholarships/api/applications.api'
import { candidateProfileApi } from '@/modules/candidate/api/candidateProfile.api'
import { useToast } from '@/shared/components/ui/ToastProvider'
import { ApiError } from '@/shared/api/types'
import type { Application, Scholarship } from '@/modules/scholarships/types'
import type { CandidateCertificate, CandidateProfile } from '@/modules/candidate/types'

type CertInput = { score: string; file: File | null }

export function ApplicationPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { notify } = useToast()

  const [scholarship, setScholarship] = useState<Scholarship | null>(null)
  const [profile, setProfile] = useState<CandidateProfile | null>(null)
  const [profileCertificates, setProfileCertificates] = useState<CandidateCertificate[]>([])
  const [existing, setExisting] = useState<Application | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [canceling, setCanceling] = useState(false)
  const [cvFile, setCvFile] = useState<File | null>(null)
  const [essayFile, setEssayFile] = useState<File | null>(null)
  const [certInputs, setCertInputs] = useState<Record<string, CertInput>>({})
  const cvInputRef = useRef<HTMLInputElement>(null)
  const essayInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    // scholarshipsApi.get và candidateProfileApi.getMe() chạy song song (không đụng nhau); applicationsApi
    // và listCertificates chỉ gọi SAU khi profile chắc chắn đã tồn tại (getMe() tự upsert) để tránh 2 lazy
    // upsert CandidateProfile đua nhau — cùng lý do đã áp dụng ở các trang candidate khác.
    Promise.all([scholarshipsApi.get(id), candidateProfileApi.getMe()])
      .then(([scholarshipRes, profileRes]) =>
        Promise.all([applicationsApi.listMine(), candidateProfileApi.listCertificates()]).then(([applications, certs]) => {
          setScholarship(scholarshipRes)
          setProfile(profileRes)
          setProfileCertificates(certs)
          setExisting(applications.find((a) => a.scholarship_id === id) ?? null)
        }),
      )
      .finally(() => setLoading(false))
  }, [id])

  const handleSubmit = async () => {
    if (!id) return
    setSubmitting(true)
    try {
      const application = await applicationsApi.create(id)
      if (cvFile) await applicationsApi.uploadCv(application.id, cvFile)
      if (essayFile && !scholarship?.is_no_essay) await applicationsApi.uploadEssay(application.id, essayFile)
      for (const [certificateType, input] of Object.entries(certInputs)) {
        if (!input.score.trim()) continue
        const certificate = await applicationsApi.upsertCertificate(application.id, certificateType, input.score.trim())
        if (input.file) await applicationsApi.uploadCertificateAttachment(application.id, certificate.id, input.file)
      }
      const final = await applicationsApi.get(application.id)
      setExisting(final)
      notify('Ứng tuyển thành công! Bạn có thể theo dõi trạng thái trong "Học bổng đã ứng tuyển".')
      navigate('/tai-khoan/ung-tuyen')
    } catch (err) {
      notify(err instanceof ApiError ? err.message : 'Không thể gửi hồ sơ ứng tuyển. Vui lòng thử lại.', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const handleReplaceFiles = async () => {
    if (!existing) return
    setSubmitting(true)
    try {
      if (cvFile) await applicationsApi.uploadCv(existing.id, cvFile)
      if (essayFile && !scholarship?.is_no_essay) await applicationsApi.uploadEssay(existing.id, essayFile)
      for (const [certificateType, input] of Object.entries(certInputs)) {
        if (!input.score.trim()) continue
        const certificate = await applicationsApi.upsertCertificate(existing.id, certificateType, input.score.trim())
        if (input.file) await applicationsApi.uploadCertificateAttachment(existing.id, certificate.id, input.file)
      }
      const final = await applicationsApi.get(existing.id)
      setExisting(final)
      setCvFile(null)
      setEssayFile(null)
      setCertInputs({})
      notify('Đã cập nhật hồ sơ nộp.')
    } catch (err) {
      notify(err instanceof ApiError ? err.message : 'Không thể cập nhật hồ sơ. Vui lòng thử lại.', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const handleCancel = async () => {
    if (!existing) return
    if (!window.confirm('Huỷ đơn ứng tuyển này? Bạn có thể ứng tuyển lại sau nếu muốn.')) return
    setCanceling(true)
    try {
      await applicationsApi.cancel(existing.id)
      setExisting(null)
      setCvFile(null)
      setEssayFile(null)
      setCertInputs({})
      notify('Đã huỷ đơn ứng tuyển.')
    } catch (err) {
      notify(err instanceof ApiError ? err.message : 'Không thể huỷ đơn. Vui lòng thử lại.', 'error')
    } finally {
      setCanceling(false)
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

  const checklist = buildChecklist(scholarship, profile)
  const deadlinePassed = new Date(scholarship.deadline).getTime() <= Date.now()
  const editable = existing ? existing.status === 'pending' && !deadlinePassed : true

  return (
    <div className="flex min-h-svh flex-col bg-app-bg">
      <PublicHeader active="hoc-bong" />

      <div className="mx-auto w-full max-w-3xl flex-1 px-6 py-8">
        <p className="mb-4 text-sm text-brand-ink-soft">
          <Link to={`/hoc-bong/${scholarship.id}`}>{scholarship.title}</Link> <span className="mx-1">›</span> Ứng tuyển
        </p>

        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <h1 className="text-xl font-bold text-brand-ink">Ứng tuyển: {scholarship.title}</h1>
          <p className="mt-1 text-sm text-brand-ink-soft">Hạn nộp: {formatDate(scholarship.deadline)}</p>

          {existing ? (
            <div className="mt-6 space-y-6">
              <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                <span className="text-sm text-brand-ink">Trạng thái hồ sơ của bạn:</span>
                <ApplicationStatusBadge status={existing.status} />
              </div>

              {!editable && (
                <p className="text-xs text-amber-600">
                  {existing.status !== 'pending'
                    ? 'Đơn đã được xét duyệt, không thể chỉnh sửa hoặc huỷ.'
                    : 'Đã quá hạn nộp, không thể chỉnh sửa đơn nữa.'}
                </p>
              )}

              <FileUploadSection
                title="CV đã nộp"
                currentUrl={existing.submitted_cv_url}
                inputRef={cvInputRef}
                file={cvFile}
                onPick={editable ? setCvFile : undefined}
              />
              {!scholarship.is_no_essay && (
                <FileUploadSection
                  title="Bài luận đã nộp"
                  currentUrl={existing.submitted_essay_url}
                  inputRef={essayInputRef}
                  file={essayFile}
                  onPick={editable ? setEssayFile : undefined}
                />
              )}

              <CertificatesSection
                scholarship={scholarship}
                profileCertificates={profileCertificates}
                submitted={existing.certificates}
                certInputs={certInputs}
                setCertInputs={setCertInputs}
                editable={editable}
              />

              {editable && (
                <div className="flex flex-wrap items-center gap-3">
                  {(cvFile || essayFile || Object.values(certInputs).some((c) => c.score.trim())) && (
                    <Button loading={submitting} onClick={() => void handleReplaceFiles()}>
                      Cập nhật hồ sơ đã nộp
                    </Button>
                  )}
                  <Button variant="danger" loading={canceling} onClick={() => void handleCancel()}>
                    Huỷ ứng tuyển
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="mt-6 space-y-6">
              <div>
                <h2 className="mb-2 font-semibold text-brand-ink">Kiểm tra hồ sơ</h2>
                <ul className="space-y-1.5">
                  {checklist.map((item) => (
                    <li key={item.text} className="flex items-start gap-2 text-sm">
                      <span className={item.ok ? 'text-emerald-600' : 'text-amber-500'}>{item.ok ? '✓' : '!'}</span>
                      <span className="text-brand-ink-soft">{item.text}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <FileUploadSection
                title="CV"
                currentUrl={null}
                inputRef={cvInputRef}
                file={cvFile}
                onPick={setCvFile}
              />
              {!scholarship.is_no_essay && (
                <FileUploadSection
                  title="Bài luận cá nhân"
                  currentUrl={null}
                  inputRef={essayInputRef}
                  file={essayFile}
                  onPick={setEssayFile}
                />
              )}

              <CertificatesSection
                scholarship={scholarship}
                profileCertificates={profileCertificates}
                submitted={[]}
                certInputs={certInputs}
                setCertInputs={setCertInputs}
                editable
              />

              <Button className="w-full" loading={submitting} onClick={() => void handleSubmit()}>
                Xác nhận ứng tuyển
              </Button>
              <p className="text-xs text-brand-ink-soft">
                Nếu không chọn file mới, hồ sơ sẽ được ghi nhận trước — bạn có thể quay lại trang này để bổ sung CV/bài
                luận/chứng chỉ sau, miễn là còn hạn nộp.
              </p>
            </div>
          )}
        </div>
      </div>

      <SiteFooter />
    </div>
  )
}

function FileUploadSection({
  title,
  currentUrl,
  inputRef,
  file,
  onPick,
}: {
  title: string
  currentUrl: string | null
  inputRef: RefObject<HTMLInputElement | null>
  file: File | null
  onPick?: (file: File) => void
}) {
  return (
    <div className="rounded-xl border border-slate-200 p-4">
      <p className="mb-2 text-sm font-semibold text-brand-ink">{title}</p>
      {file ? (
        <p className="mb-2 text-xs text-brand-blue-600">Đã chọn file mới: {file.name}</p>
      ) : currentUrl ? (
        <a href={currentUrl} target="_blank" rel="noreferrer" className="mb-2 block text-xs text-brand-blue-600 hover:underline">
          Xem file đã nộp
        </a>
      ) : (
        <p className="mb-2 text-xs text-amber-500">Chưa có file — vui lòng tải lên.</p>
      )}
      {onPick && (
        <>
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.png,.jpg,.jpeg,.webp"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && onPick(e.target.files[0])}
          />
          <Button size="sm" variant="secondary" onClick={() => inputRef.current?.click()}>
            {currentUrl ? 'Tải file khác' : 'Tải lên'}
          </Button>
        </>
      )}
    </div>
  )
}

function CertificatesSection({
  scholarship,
  profileCertificates,
  submitted,
  certInputs,
  setCertInputs,
  editable,
}: {
  scholarship: Scholarship
  profileCertificates: CandidateCertificate[]
  submitted: Application['certificates']
  certInputs: Record<string, CertInput>
  setCertInputs: (updater: (prev: Record<string, CertInput>) => Record<string, CertInput>) => void
  editable: boolean
}) {
  if (scholarship.required_certificates.length === 0) return null

  return (
    <div className="rounded-xl border border-slate-200 p-4">
      <p className="mb-1 text-sm font-semibold text-brand-ink">Chứng chỉ yêu cầu</p>
      <p className="mb-3 text-xs text-brand-ink-soft">
        Nộp minh chứng riêng cho đơn này — không bắt buộc đủ mới nộp được, nhưng đối tác sẽ dựa vào đây để xét duyệt.
      </p>
      <div className="space-y-3">
        {scholarship.required_certificates.map((req) => {
          const already = submitted.find((c) => c.certificate_type === req.certificate_type)
          const inProfile = profileCertificates.find(
            (c) => c.certificate_type.toLowerCase() === req.certificate_type.toLowerCase(),
          )
          const input = certInputs[req.certificate_type] ?? { score: '', file: null }
          return (
            <div key={req.id} className="rounded-lg border border-slate-100 bg-slate-50 p-3">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <span className="text-sm font-medium text-brand-ink">{req.certificate_type}</span>
                {already ? (
                  <span className="text-xs text-emerald-600">
                    Đã nộp: {already.certificate_score}
                    {already.attachment_url && (
                      <>
                        {' · '}
                        <a href={already.attachment_url} target="_blank" rel="noreferrer" className="text-brand-blue-600 hover:underline">
                          Xem file
                        </a>
                      </>
                    )}
                  </span>
                ) : inProfile ? (
                  <span className="text-xs text-brand-ink-soft">Trong hồ sơ của bạn: {inProfile.certificate_score}</span>
                ) : (
                  <span className="text-xs text-amber-500">Chưa nộp</span>
                )}
              </div>
              {editable && (
                <div className="flex flex-wrap items-center gap-2">
                  <Input
                    className="w-28"
                    placeholder="Điểm số"
                    value={input.score}
                    onChange={(e) =>
                      setCertInputs((prev) => ({ ...prev, [req.certificate_type]: { ...input, score: e.target.value } }))
                    }
                  />
                  <label className="cursor-pointer text-xs font-semibold text-brand-blue-600 hover:underline">
                    {input.file ? `Đã chọn: ${input.file.name}` : 'Chọn file minh chứng'}
                    <input
                      type="file"
                      accept=".pdf,.png,.jpg,.jpeg,.webp"
                      className="hidden"
                      onChange={(e) =>
                        e.target.files?.[0] &&
                        setCertInputs((prev) => ({ ...prev, [req.certificate_type]: { ...input, file: e.target.files![0] } }))
                      }
                    />
                  </label>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function buildChecklist(scholarship: Scholarship, profile: CandidateProfile | null) {
  const items: { text: string; ok: boolean }[] = []

  if (scholarship.min_gpa != null) {
    const gpa = profile?.gpa ?? null
    items.push({
      ok: gpa != null && gpa >= scholarship.min_gpa,
      text:
        gpa != null
          ? `GPA của bạn (${gpa}) ${gpa >= scholarship.min_gpa ? 'đạt' : 'chưa đạt'} yêu cầu tối thiểu ${scholarship.min_gpa}.`
          : `Học bổng yêu cầu GPA tối thiểu ${scholarship.min_gpa} nhưng bạn chưa khai báo GPA trong hồ sơ.`,
    })
  }

  if (scholarship.majors.length > 0) {
    const codes = scholarship.majors.map((m) => m.code.toLowerCase())
    const matched = (profile?.target_majors ?? []).some((c) => codes.includes(c.toLowerCase()))
    items.push({
      ok: matched,
      text: matched
        ? 'Ngành mục tiêu của bạn khớp với học bổng này.'
        : `Học bổng dành cho ngành: ${scholarship.majors.map((m) => m.name).join(', ')}. Hãy cập nhật ngành mục tiêu trong hồ sơ nếu phù hợp.`,
    })
  }

  return items
}
