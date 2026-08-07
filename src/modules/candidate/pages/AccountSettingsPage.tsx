import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { CandidateLayout } from '@/modules/candidate/components/CandidateLayout'
import { useCandidateProfile } from '@/modules/candidate/CandidateProfileContext'
import { candidateProfileApi } from '@/modules/candidate/api/candidateProfile.api'
import { useAuth } from '@/modules/auth/AuthContext'
import { Field } from '@/shared/components/ui/Field'
import { Input } from '@/shared/components/ui/Input'
import { Button } from '@/shared/components/ui/Button'
import { AvatarUpload } from '@/shared/components/ui/AvatarUpload'
import { useToast } from '@/shared/components/ui/ToastProvider'
import { ApiError } from '@/shared/api/types'
import { dateInputToIso, toDateInputValue } from '@/shared/lib/format'
import type { UserRole } from '@/modules/auth/types'

const schema = z.object({
  full_name: z.string().trim().min(1, 'Vui lòng nhập họ tên').max(255),
  phone: z
    .string()
    .trim()
    .regex(/^[0-9+\-\s()]+$/, 'Số điện thoại không hợp lệ')
    .min(8, 'Số điện thoại quá ngắn')
    .max(20)
    .or(z.literal(''))
    .optional(),
  date_of_birth: z.string().optional(),
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
  const { profile, setProfile } = useCandidateProfile()
  const { notify } = useToast()
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    values: {
      full_name: profile?.full_name ?? '',
      phone: profile?.phone ?? '',
      date_of_birth: toDateInputValue(profile?.date_of_birth),
    },
  })

  const onSubmit = async (values: FormValues) => {
    setServerError(null)
    try {
      const updated = await candidateProfileApi.updateMe({
        full_name: values.full_name,
        phone: values.phone || null,
        date_of_birth: values.date_of_birth ? dateInputToIso(values.date_of_birth) : null,
      })
      setProfile(updated)
      notify('Đã lưu thông tin tài khoản.')
    } catch (err) {
      setServerError(err instanceof ApiError ? err.message : 'Không thể lưu thay đổi. Vui lòng thử lại.')
    }
  }

  const handleUploadAvatar = async (file: File) => {
    try {
      const updated = await candidateProfileApi.uploadAvatar(file)
      setProfile(updated)
      notify('Đã cập nhật ảnh đại diện.')
    } catch (err) {
      notify(err instanceof ApiError ? err.message : 'Không thể tải lên ảnh đại diện.', 'error')
    }
  }

  return (
    <CandidateLayout>
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <h1 className="mb-6 text-lg font-bold text-brand-ink">Thông tin tài khoản</h1>

          <div className="mb-6 flex items-center gap-5">
            <AvatarUpload url={profile?.avatar_url} onUpload={handleUploadAvatar} alt="Ảnh đại diện" label="Đổi ảnh đại diện" />
            <div>
              <p className="font-semibold text-brand-ink">{profile?.full_name || 'Ứng viên'}</p>
              <p className="text-xs text-brand-ink-soft">Ảnh PNG/JPEG/WEBP, tối đa 4MB.</p>
            </div>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Field label="Họ và tên" required error={errors.full_name?.message} className="sm:col-span-2">
                <Input placeholder="Nhập họ và tên" {...register('full_name')} error={Boolean(errors.full_name)} />
              </Field>
              <Field label="Số điện thoại" error={errors.phone?.message}>
                <Input type="tel" placeholder="Nhập số điện thoại" {...register('phone')} error={Boolean(errors.phone)} />
              </Field>
              <Field label="Ngày sinh" error={errors.date_of_birth?.message}>
                <Input type="date" {...register('date_of_birth')} error={Boolean(errors.date_of_birth)} />
              </Field>
            </div>

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
              <dd className="mt-0.5 font-medium text-brand-ink">
                {user?.is_email_verified ? 'Đã xác thực' : 'Chưa xác thực'}
              </dd>
            </div>
          </dl>
          <p className="mt-4 text-xs text-brand-ink-soft">
            Đổi email đăng nhập chưa được hệ thống hỗ trợ. Xem mục "Mật khẩu và bảo mật" để đổi mật khẩu.
          </p>
        </div>
      </div>
    </CandidateLayout>
  )
}
