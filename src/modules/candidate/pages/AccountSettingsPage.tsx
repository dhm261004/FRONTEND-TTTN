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
import { UnsupportedNotice } from '@/shared/components/ui/UnsupportedNotice'
import { useToast } from '@/shared/components/ui/ToastProvider'
import { ApiError } from '@/shared/api/types'

const schema = z.object({
  full_name: z.string().trim().min(1, 'Vui lòng nhập họ tên').max(255),
})

type FormValues = z.infer<typeof schema>

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
    values: { full_name: profile?.full_name ?? '' },
  })

  const onSubmit = async (values: FormValues) => {
    setServerError(null)
    try {
      const updated = await candidateProfileApi.updateMe({ full_name: values.full_name })
      setProfile(updated)
      notify('Đã lưu thông tin tài khoản.')
    } catch (err) {
      setServerError(err instanceof ApiError ? err.message : 'Không thể lưu thay đổi. Vui lòng thử lại.')
    }
  }

  return (
    <CandidateLayout>
      <div className="mx-auto max-w-2xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-6 flex items-center gap-4">
          <div className="size-16 shrink-0 rounded-full bg-slate-200" />
          <div>
            <p className="font-semibold text-brand-ink">Ảnh đại diện tài khoản</p>
            <p className="text-xs text-brand-ink-soft">Chưa được backend hỗ trợ lưu trữ.</p>
          </div>
        </div>

        <h1 className="mb-4 text-lg font-bold text-brand-ink">Thông tin tài khoản</h1>

        <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
          <Field label="Họ và tên" required error={errors.full_name?.message}>
            <Input placeholder="Nhập họ và tên" {...register('full_name')} error={Boolean(errors.full_name)} />
          </Field>

          {serverError && <p className="text-sm text-red-500">{serverError}</p>}

          <Button type="submit" loading={isSubmitting}>
            Lưu thay đổi
          </Button>
        </form>

        <dl className="mt-6 space-y-4 border-t border-slate-100 pt-6">
          <div>
            <dt className="text-xs text-brand-ink-soft">Email đăng nhập</dt>
            <dd className="mt-0.5 font-medium text-brand-ink">{user?.email}</dd>
          </div>
          <div>
            <dt className="text-xs text-brand-ink-soft">Vai trò</dt>
            <dd className="mt-0.5 font-medium text-brand-ink">Sinh viên</dd>
          </div>
          <div>
            <dt className="text-xs text-brand-ink-soft">Trạng thái email</dt>
            <dd className="mt-0.5 font-medium text-brand-ink">
              {user?.is_email_verified ? 'Đã xác thực' : 'Chưa xác thực'}
            </dd>
          </div>
        </dl>

        <div className="mt-6">
          <UnsupportedNotice>Số điện thoại và đổi email chưa được hệ thống hỗ trợ — bảng người dùng hiện chỉ lưu email, mật khẩu và vai trò. Xem mục "Mật khẩu và bảo mật" để đổi mật khẩu.</UnsupportedNotice>
        </div>
      </div>
    </CandidateLayout>
  )
}
