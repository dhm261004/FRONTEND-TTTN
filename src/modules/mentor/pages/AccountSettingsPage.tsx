import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { MentorLayout } from '@/modules/mentor/components/MentorLayout'
import { useMentorProfile } from '@/modules/mentor/MentorProfileContext'
import { mentorProfileApi } from '@/modules/mentor/api/mentorProfile.api'
import { useAuth } from '@/modules/auth/AuthContext'
import { Field } from '@/shared/components/ui/Field'
import { Input } from '@/shared/components/ui/Input'
import { Button } from '@/shared/components/ui/Button'
import { AvatarUpload } from '@/shared/components/ui/AvatarUpload'
import { useToast } from '@/shared/components/ui/ToastProvider'
import { ApiError } from '@/shared/api/types'
import type { UserRole } from '@/modules/auth/types'

const schema = z.object({
  job_title: z.string().trim().max(255).optional(),
})

type FormValues = z.infer<typeof schema>

const ROLE_LABELS: Record<UserRole, string> = {
  candidate: 'Sinh viên',
  partner: 'Nhà tài trợ',
  mentor: 'Mentor',
  admin: 'Quản trị viên',
}

export function AccountSettingsPage() {
  const { user } = useAuth()
  const { profile, setProfile } = useMentorProfile()
  const { notify } = useToast()
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    values: { job_title: profile?.job_title ?? '' },
  })

  const onSubmit = async (values: FormValues) => {
    setServerError(null)
    try {
      const updated = await mentorProfileApi.update({ job_title: values.job_title || undefined })
      setProfile({ ...updated, certificates: profile?.certificates ?? [], achievements: profile?.achievements ?? [], services: profile?.services ?? [], average_rating: profile?.average_rating ?? null })
      notify('Đã lưu thông tin tài khoản.')
    } catch (err) {
      setServerError(err instanceof ApiError ? err.message : 'Không thể lưu thay đổi. Vui lòng thử lại.')
    }
  }

  const handleUploadAvatar = async (file: File) => {
    try {
      const updated = await mentorProfileApi.uploadAvatar(file)
      setProfile({ ...updated, certificates: profile?.certificates ?? [], achievements: profile?.achievements ?? [], services: profile?.services ?? [], average_rating: profile?.average_rating ?? null })
      notify('Đã cập nhật ảnh đại diện.')
    } catch (err) {
      notify(err instanceof ApiError ? err.message : 'Không thể tải lên ảnh đại diện.', 'error')
    }
  }

  return (
    <MentorLayout>
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <h1 className="mb-6 text-lg font-bold text-brand-ink">Thông tin tài khoản</h1>

          <div className="mb-6 flex items-center gap-5">
            <AvatarUpload url={profile?.avatar_url} onUpload={handleUploadAvatar} alt="Ảnh đại diện" label="Đổi ảnh đại diện" />
            <div>
              <p className="font-semibold text-brand-ink">{profile?.job_title || 'Mentor'}</p>
              <p className="text-xs text-brand-ink-soft">Ảnh PNG/JPEG/WEBP, tối đa 4MB.</p>
            </div>
          </div>

          <form className="flex flex-col gap-5" onSubmit={handleSubmit(onSubmit)}>
            <Field label="Chức danh" hint="Hiển thị công khai trên hồ sơ mentor của bạn">
              <Input placeholder="VD: Kỹ sư phần mềm tại Google" {...register('job_title')} />
            </Field>

            {serverError && <p className="text-sm text-red-500">{serverError}</p>}

            <div className="border-t border-slate-100 pt-5">
              <Button type="submit" loading={isSubmitting}>
                Lưu thay đổi
              </Button>
            </div>
          </form>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <h2 className="mb-4 text-lg font-bold text-brand-ink">Thông tin đăng nhập</h2>
          <dl className="space-y-4">
            <div>
              <dt className="text-xs text-brand-ink-soft">Email đăng nhập</dt>
              <dd className="mt-0.5 font-medium text-brand-ink">{user?.email}</dd>
            </div>
            <div>
              <dt className="text-xs text-brand-ink-soft">Vai trò</dt>
              <dd className="mt-0.5 font-medium text-brand-ink">{user ? ROLE_LABELS[user.role] : '—'}</dd>
            </div>
            <div>
              <dt className="text-xs text-brand-ink-soft">Trạng thái email</dt>
              <dd className="mt-0.5 font-medium text-brand-ink">{user?.is_email_verified ? 'Đã xác thực' : 'Chưa xác thực'}</dd>
            </div>
          </dl>
          <p className="mt-4 text-xs text-brand-ink-soft">
            Đổi email đăng nhập chưa được hệ thống hỗ trợ. Xem mục "Mật khẩu và bảo mật" để đổi mật khẩu.
          </p>
        </div>
      </div>
    </MentorLayout>
  )
}
