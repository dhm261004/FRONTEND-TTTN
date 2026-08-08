import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { MentorLayout } from '@/modules/mentor/components/MentorLayout'
import { useMentorProfile } from '@/modules/mentor/MentorProfileContext'
import { mentorProfileApi } from '@/modules/mentor/api/mentorProfile.api'
import { Field } from '@/shared/components/ui/Field'
import { Input } from '@/shared/components/ui/Input'
import { Textarea } from '@/shared/components/ui/Textarea'
import { Button } from '@/shared/components/ui/Button'
import { AvatarUpload } from '@/shared/components/ui/AvatarUpload'
import { useToast } from '@/shared/components/ui/ToastProvider'
import { ApiError } from '@/shared/api/types'
import type { MentorAchievement, MentorCertificate } from '@/modules/mentor/types'

const schema = z.object({
  job_title: z.string().trim().max(255).optional(),
  bio: z.string().trim().optional(),
})

type FormValues = z.infer<typeof schema>

export function ProfileEditPage() {
  const { profile, setProfile } = useMentorProfile()
  const { notify } = useToast()
  const [serverError, setServerError] = useState<string | null>(null)

  const [certificates, setCertificates] = useState<MentorCertificate[]>([])
  const [certForm, setCertForm] = useState({ name: '', issued_by: '' })
  const [savingCert, setSavingCert] = useState(false)

  const [achievements, setAchievements] = useState<MentorAchievement[]>([])
  const [achForm, setAchForm] = useState({ title: '', description: '' })
  const [savingAch, setSavingAch] = useState(false)

  useEffect(() => {
    if (profile) {
      setCertificates(profile.certificates)
      setAchievements(profile.achievements)
    }
  }, [profile])

  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    values: profile ? { job_title: profile.job_title ?? '', bio: profile.bio ?? '' } : undefined,
  })

  const onSubmit = async (values: FormValues) => {
    if (!profile) return
    setServerError(null)
    try {
      const updated = await mentorProfileApi.update({ job_title: values.job_title || undefined, bio: values.bio || undefined })
      setProfile({ ...profile, ...updated })
      notify('Đã lưu hồ sơ mentor.')
    } catch (err) {
      setServerError(err instanceof ApiError ? err.message : 'Không thể lưu hồ sơ. Vui lòng thử lại.')
    }
  }

  const handleUploadAvatar = async (file: File) => {
    if (!profile) return
    try {
      const updated = await mentorProfileApi.uploadAvatar(file)
      setProfile({ ...profile, ...updated })
      notify('Đã cập nhật ảnh đại diện.')
    } catch (err) {
      notify(err instanceof ApiError ? err.message : 'Không thể tải lên ảnh đại diện.', 'error')
    }
  }

  const handleAddCertificate = async () => {
    if (!certForm.name.trim()) return
    setSavingCert(true)
    try {
      const created = await mentorProfileApi.createCertificate({
        name: certForm.name,
        issued_by: certForm.issued_by || undefined,
      })
      setCertificates((prev) => [created, ...prev])
      setCertForm({ name: '', issued_by: '' })
    } catch (err) {
      notify(err instanceof ApiError ? err.message : 'Không thể thêm chứng chỉ.', 'error')
    } finally {
      setSavingCert(false)
    }
  }

  const handleDeleteCertificate = async (id: string) => {
    try {
      await mentorProfileApi.deleteCertificate(id)
      setCertificates((prev) => prev.filter((c) => c.id !== id))
    } catch (err) {
      notify(err instanceof ApiError ? err.message : 'Không thể xoá chứng chỉ.', 'error')
    }
  }

  const handleUploadCertAttachment = async (id: string, file: File) => {
    try {
      const updated = await mentorProfileApi.uploadCertificateAttachment(id, file)
      setCertificates((prev) => prev.map((c) => (c.id === id ? updated : c)))
      notify('Đã tải lên minh chứng chứng chỉ.')
    } catch (err) {
      notify(err instanceof ApiError ? err.message : 'Không thể tải lên file.', 'error')
    }
  }

  const handleAddAchievement = async () => {
    if (!achForm.title.trim()) return
    setSavingAch(true)
    try {
      const created = await mentorProfileApi.createAchievement({
        title: achForm.title,
        description: achForm.description || undefined,
      })
      setAchievements((prev) => [created, ...prev])
      setAchForm({ title: '', description: '' })
    } catch (err) {
      notify(err instanceof ApiError ? err.message : 'Không thể thêm thành tích.', 'error')
    } finally {
      setSavingAch(false)
    }
  }

  const handleDeleteAchievement = async (id: string) => {
    try {
      await mentorProfileApi.deleteAchievement(id)
      setAchievements((prev) => prev.filter((a) => a.id !== id))
    } catch (err) {
      notify(err instanceof ApiError ? err.message : 'Không thể xoá thành tích.', 'error')
    }
  }

  return (
    <MentorLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-brand-ink">Quản lý hồ sơ</h1>

        <form className="flex flex-col gap-5 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm" onSubmit={handleSubmit(onSubmit)}>
          <div className="flex items-center gap-5">
            <AvatarUpload url={profile?.avatar_url} onUpload={handleUploadAvatar} alt="Ảnh đại diện" label="Đổi ảnh đại diện" />
            <div>
              <p className="font-semibold text-brand-ink">{profile?.job_title || 'Mentor'}</p>
              <p className="text-xs text-brand-ink-soft">Ảnh PNG/JPEG/WEBP, tối đa 4MB.</p>
            </div>
          </div>

          <Field label="Chức danh">
            <Input placeholder="VD: Kỹ sư phần mềm tại Google" {...register('job_title')} />
          </Field>
          <Field label="Giới thiệu bản thân" hint="Hiển thị công khai trên hồ sơ mentor của bạn">
            <Textarea rows={5} placeholder="Chia sẻ kinh nghiệm, thế mạnh của bạn với học viên..." {...register('bio')} />
          </Field>

          {serverError && <p className="text-sm text-red-500">{serverError}</p>}

          <Button type="submit" loading={isSubmitting}>
            Lưu hồ sơ
          </Button>
        </form>

        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <h2 className="mb-5 font-bold text-brand-ink">Chứng chỉ</h2>
          <div className="space-y-3">
            {certificates.map((c) => (
              <CertificateRow key={c.id} certificate={c} onDelete={handleDeleteCertificate} onUpload={handleUploadCertAttachment} />
            ))}
            {certificates.length === 0 && <p className="text-sm text-brand-ink-soft">Chưa có chứng chỉ nào.</p>}
          </div>
          <div className="mt-6 rounded-xl border border-brand-blue-100 bg-brand-blue-50/40 p-5">
            <p className="mb-4 text-sm font-bold text-brand-blue-600">+ Thêm chứng chỉ mới</p>
            <div className="flex flex-col gap-5">
              <Field label="Tên chứng chỉ">
                <Input
                  placeholder="VD: TOEFL iBT, AWS Certified..."
                  value={certForm.name}
                  onChange={(e) => setCertForm((f) => ({ ...f, name: e.target.value }))}
                />
              </Field>
              <Field label="Đơn vị cấp">
                <Input
                  placeholder="VD: ETS, Amazon Web Services"
                  value={certForm.issued_by}
                  onChange={(e) => setCertForm((f) => ({ ...f, issued_by: e.target.value }))}
                />
              </Field>
            </div>
            <Button size="sm" className="mt-4" loading={savingCert} onClick={handleAddCertificate}>
              Thêm chứng chỉ
            </Button>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <h2 className="mb-5 font-bold text-brand-ink">Thành tích</h2>
          <div className="space-y-3">
            {achievements.map((a) => (
              <div key={a.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-brand-ink">{a.title}</p>
                  {a.description && <p className="text-xs text-brand-ink-soft">{a.description}</p>}
                </div>
                <Button size="sm" variant="danger" onClick={() => handleDeleteAchievement(a.id)}>
                  Xoá
                </Button>
              </div>
            ))}
            {achievements.length === 0 && <p className="text-sm text-brand-ink-soft">Chưa có thành tích nào.</p>}
          </div>
          <div className="mt-6 rounded-xl border border-brand-blue-100 bg-brand-blue-50/40 p-5">
            <p className="mb-4 text-sm font-bold text-brand-blue-600">+ Thêm thành tích mới</p>
            <div className="flex flex-col gap-5">
              <Field label="Tiêu đề">
                <Input
                  placeholder="VD: Giải nhất Olympic Tin học"
                  value={achForm.title}
                  onChange={(e) => setAchForm((f) => ({ ...f, title: e.target.value }))}
                />
              </Field>
              <Field label="Chú thích">
                <Input
                  placeholder="VD: Cấp quốc gia, năm 2023"
                  value={achForm.description}
                  onChange={(e) => setAchForm((f) => ({ ...f, description: e.target.value }))}
                />
              </Field>
            </div>
            <Button size="sm" className="mt-4" loading={savingAch} onClick={handleAddAchievement}>
              Thêm thành tích
            </Button>
          </div>
        </div>
      </div>
    </MentorLayout>
  )
}

function CertificateRow({
  certificate,
  onDelete,
  onUpload,
}: {
  certificate: MentorCertificate
  onDelete: (id: string) => void
  onUpload: (id: string, file: File) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
      <div>
        <p className="text-sm font-semibold text-brand-ink">
          {certificate.name}
          {certificate.issued_by ? ` — ${certificate.issued_by}` : ''}
        </p>
        {certificate.attachment_url ? (
          <a href={certificate.attachment_url} target="_blank" rel="noreferrer" className="text-xs text-brand-blue-600 hover:underline">
            Xem minh chứng
          </a>
        ) : (
          <p className="text-xs text-brand-ink-soft">Chưa có minh chứng.</p>
        )}
      </div>
      <div className="flex gap-2">
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.png,.jpg,.jpeg,.webp"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && onUpload(certificate.id, e.target.files[0])}
        />
        <Button size="sm" variant="secondary" onClick={() => inputRef.current?.click()}>
          Tải minh chứng
        </Button>
        <Button size="sm" variant="danger" onClick={() => onDelete(certificate.id)}>
          Xoá
        </Button>
      </div>
    </div>
  )
}
