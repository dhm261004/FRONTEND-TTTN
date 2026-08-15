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
import { Modal } from '@/shared/components/ui/Modal'
import { StarRating } from '@/modules/mentors/components/StarRating'
import { useToast } from '@/shared/components/ui/ToastProvider'
import { ApiError } from '@/shared/api/types'
import { IconAward, IconCheckCircle, IconGraduationCap, IconPencil, IconPlusCircle, IconX } from '@/modules/mentor/components/icons'
import { VipBadge, isVipActive } from '@/shared/components/ui/VipBadge'
import type { MentorAchievement, MentorCertificate } from '@/modules/mentor/types'

const schema = z.object({
  full_name: z.string().trim().max(255).optional(),
  job_title: z.string().trim().max(255).optional(),
  bio: z.string().trim().optional(),
})

type FormValues = z.infer<typeof schema>

export function ProfileEditPage() {
  const { profile, setProfile } = useMentorProfile()
  const { notify } = useToast()

  const [editOpen, setEditOpen] = useState(false)
  const [certOpen, setCertOpen] = useState(false)
  const [achOpen, setAchOpen] = useState(false)

  const [certificates, setCertificates] = useState<MentorCertificate[]>([])
  const [achievements, setAchievements] = useState<MentorAchievement[]>([])

  useEffect(() => {
    if (profile) {
      setCertificates(profile.certificates)
      setAchievements(profile.achievements)
    }
  }, [profile])

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

  const handleDeleteAchievement = async (id: string) => {
    try {
      await mentorProfileApi.deleteAchievement(id)
      setAchievements((prev) => prev.filter((a) => a.id !== id))
    } catch (err) {
      notify(err instanceof ApiError ? err.message : 'Không thể xoá thành tích.', 'error')
    }
  }

  if (!profile) return null

  const title = profile.full_name || profile.job_title || 'Mentor'
  const subtitle = profile.full_name ? profile.job_title : null
  const activeServicesCount = profile.services?.filter((s) => s.is_active).length ?? 0

  return (
    <MentorLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-brand-ink">Hồ sơ của tôi</h1>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-start gap-5">
            <AvatarUpload url={profile.avatar_url} onUpload={handleUploadAvatar} alt="Ảnh đại diện" label="Đổi ảnh đại diện" />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl font-bold text-brand-ink">{title}</h2>
                {isVipActive(profile.vip_expires_at) && <VipBadge expiresAt={profile.vip_expires_at} />}
              </div>
              {subtitle && (
                <p className="mt-0.5 flex items-center gap-1.5 text-sm text-brand-ink-soft">
                  <IconGraduationCap className="size-4 shrink-0 text-brand-blue-500" />
                  {subtitle}
                </p>
              )}
              <div className="mt-3 flex flex-wrap items-center gap-5 text-sm">
                <span className="flex items-center gap-1.5">
                  <StarRating rating={profile.average_rating ? Math.round(profile.average_rating) : 0} />
                  <span className="font-semibold text-brand-ink">
                    {profile.average_rating != null ? profile.average_rating.toFixed(1) : '—'}
                  </span>
                </span>
                <span className="text-brand-ink-soft">{profile.reviews_count ?? 0} đánh giá</span>
                <span className="text-brand-ink-soft">{activeServicesCount} gói dịch vụ đang mở</span>
              </div>
            </div>
            <Button size="sm" variant="secondary" icon={<IconPencil className="size-4" />} onClick={() => setEditOpen(true)}>
              Sửa hồ sơ
            </Button>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-3 border-l-4 border-brand-blue-500 pl-3 text-lg font-bold text-brand-ink">Giới thiệu bản thân</h2>
          {profile.bio ? (
            <p className="whitespace-pre-line text-sm leading-relaxed text-brand-ink-soft">{profile.bio}</p>
          ) : (
            <p className="text-sm text-brand-ink-soft">
              Chưa có giới thiệu. Nhấn "Sửa hồ sơ" để chia sẻ kinh nghiệm của bạn với học viên.
            </p>
          )}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="border-l-4 border-brand-blue-500 pl-3 text-lg font-bold text-brand-ink">Thành tích</h2>
            <Button size="sm" variant="ghost" icon={<IconPlusCircle className="size-4" />} onClick={() => setAchOpen(true)}>
              Thêm
            </Button>
          </div>
          {achievements.length === 0 ? (
            <p className="text-sm text-brand-ink-soft">Chưa có thành tích nào.</p>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {achievements.map((a) => (
                <div key={a.id} className="group flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <IconAward className="mt-0.5 size-5 shrink-0 text-brand-yellow-500" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-brand-ink">{a.title}</p>
                    {a.description && <p className="text-xs text-brand-ink-soft">{a.description}</p>}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteAchievement(a.id)}
                    aria-label="Xoá thành tích"
                    className="shrink-0 rounded-full p-1 text-slate-400 opacity-0 hover:bg-red-50 hover:text-red-500 group-hover:opacity-100"
                  >
                    <IconX className="size-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="border-l-4 border-brand-blue-500 pl-3 text-lg font-bold text-brand-ink">Chứng nhận chuyên môn</h2>
            <Button size="sm" variant="ghost" icon={<IconPlusCircle className="size-4" />} onClick={() => setCertOpen(true)}>
              Thêm
            </Button>
          </div>
          {certificates.length === 0 ? (
            <p className="text-sm text-brand-ink-soft">Chưa có chứng chỉ nào.</p>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {certificates.map((c) => (
                <CertificateChip key={c.id} certificate={c} onDelete={handleDeleteCertificate} onUpload={handleUploadCertAttachment} />
              ))}
            </div>
          )}
        </div>
      </div>

      <EditProfileModal open={editOpen} onClose={() => setEditOpen(false)} />
      <AddCertificateModal open={certOpen} onClose={() => setCertOpen(false)} onCreated={(c) => setCertificates((prev) => [c, ...prev])} />
      <AddAchievementModal open={achOpen} onClose={() => setAchOpen(false)} onCreated={(a) => setAchievements((prev) => [a, ...prev])} />
    </MentorLayout>
  )
}

function EditProfileModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { profile, setProfile } = useMentorProfile()
  const { notify } = useToast()
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    values: profile ? { full_name: profile.full_name ?? '', job_title: profile.job_title ?? '', bio: profile.bio ?? '' } : undefined,
  })

  const onSubmit = async (values: FormValues) => {
    if (!profile) return
    setServerError(null)
    try {
      const updated = await mentorProfileApi.update({
        full_name: values.full_name || undefined,
        job_title: values.job_title || undefined,
        bio: values.bio || undefined,
      })
      setProfile({ ...profile, ...updated })
      notify('Đã lưu hồ sơ mentor.')
      onClose()
    } catch (err) {
      setServerError(err instanceof ApiError ? err.message : 'Không thể lưu hồ sơ. Vui lòng thử lại.')
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Sửa hồ sơ">
      <form className="flex flex-col gap-5" onSubmit={handleSubmit(onSubmit)}>
        <Field label="Họ và tên" hint="Hiển thị công khai trên hồ sơ mentor của bạn">
          <Input placeholder="Nhập họ và tên" {...register('full_name')} />
        </Field>
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
    </Modal>
  )
}

function AddCertificateModal({
  open,
  onClose,
  onCreated,
}: {
  open: boolean
  onClose: () => void
  onCreated: (certificate: MentorCertificate) => void
}) {
  const { notify } = useToast()
  const [form, setForm] = useState({ name: '', issued_by: '' })
  const [saving, setSaving] = useState(false)

  const handleSubmit = async () => {
    if (!form.name.trim()) return
    setSaving(true)
    try {
      const created = await mentorProfileApi.createCertificate({ name: form.name, issued_by: form.issued_by || undefined })
      onCreated(created)
      setForm({ name: '', issued_by: '' })
      onClose()
    } catch (err) {
      notify(err instanceof ApiError ? err.message : 'Không thể thêm chứng chỉ.', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Thêm chứng chỉ">
      <div className="flex flex-col gap-5">
        <Field label="Tên chứng chỉ">
          <Input
            placeholder="VD: TOEFL iBT, AWS Certified..."
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          />
        </Field>
        <Field label="Đơn vị cấp">
          <Input
            placeholder="VD: ETS, Amazon Web Services"
            value={form.issued_by}
            onChange={(e) => setForm((f) => ({ ...f, issued_by: e.target.value }))}
          />
        </Field>
        <Button loading={saving} onClick={() => void handleSubmit()}>
          Thêm chứng chỉ
        </Button>
      </div>
    </Modal>
  )
}

function AddAchievementModal({
  open,
  onClose,
  onCreated,
}: {
  open: boolean
  onClose: () => void
  onCreated: (achievement: MentorAchievement) => void
}) {
  const { notify } = useToast()
  const [form, setForm] = useState({ title: '', description: '' })
  const [saving, setSaving] = useState(false)

  const handleSubmit = async () => {
    if (!form.title.trim()) return
    setSaving(true)
    try {
      const created = await mentorProfileApi.createAchievement({ title: form.title, description: form.description || undefined })
      onCreated(created)
      setForm({ title: '', description: '' })
      onClose()
    } catch (err) {
      notify(err instanceof ApiError ? err.message : 'Không thể thêm thành tích.', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Thêm thành tích">
      <div className="flex flex-col gap-5">
        <Field label="Tiêu đề">
          <Input
            placeholder="VD: Giải nhất Olympic Tin học"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          />
        </Field>
        <Field label="Chú thích">
          <Input
            placeholder="VD: Cấp quốc gia, năm 2023"
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          />
        </Field>
        <Button loading={saving} onClick={() => void handleSubmit()}>
          Thêm thành tích
        </Button>
      </div>
    </Modal>
  )
}

function CertificateChip({
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
    <div className="group flex items-start gap-3 rounded-xl border border-brand-blue-100 bg-brand-blue-50 px-4 py-3">
      <IconCheckCircle className="mt-0.5 size-5 shrink-0 text-brand-blue-500" />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-brand-blue-700">
          {certificate.name}
          {certificate.issued_by ? ` — ${certificate.issued_by}` : ''}
        </p>
        {certificate.attachment_url ? (
          <a href={certificate.attachment_url} target="_blank" rel="noreferrer" className="text-xs text-brand-blue-600 underline decoration-dotted">
            Xem minh chứng
          </a>
        ) : (
          <button type="button" onClick={() => inputRef.current?.click()} className="text-xs text-brand-blue-600 underline decoration-dotted">
            Tải minh chứng
          </button>
        )}
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.png,.jpg,.jpeg,.webp"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && onUpload(certificate.id, e.target.files[0])}
        />
      </div>
      <button
        type="button"
        onClick={() => onDelete(certificate.id)}
        aria-label="Xoá chứng chỉ"
        className="shrink-0 rounded-full p-1 text-brand-blue-400 opacity-0 hover:bg-white hover:text-red-500 group-hover:opacity-100"
      >
        <IconX className="size-3.5" />
      </button>
    </div>
  )
}
