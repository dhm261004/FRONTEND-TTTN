import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { SiteHeader } from '@/shared/components/layout/SiteHeader'
import { SiteFooter } from '@/shared/components/layout/SiteFooter'
import { Field } from '@/shared/components/ui/Field'
import { Input } from '@/shared/components/ui/Input'
import { Textarea } from '@/shared/components/ui/Textarea'
import { Button } from '@/shared/components/ui/Button'
import { useToast } from '@/shared/components/ui/ToastProvider'
import { useAuth } from '@/modules/auth/AuthContext'
import { useMentorProfile } from '@/modules/mentor/MentorProfileContext'
import { mentorProfileApi } from '@/modules/mentor/api/mentorProfile.api'
import { ApiError } from '@/shared/api/types'

const schema = z.object({
  full_name: z.string().trim().max(255).optional(),
  job_title: z.string().trim().max(255).optional(),
  bio: z.string().trim().min(1, 'Vui lòng giới thiệu ngắn về bản thân').optional(),
})

type FormValues = z.infer<typeof schema>

export function CreateMentorProfilePage() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const { setProfile } = useMentorProfile()
  const { notify } = useToast()
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  const onSubmit = async (values: FormValues) => {
    setServerError(null)
    try {
      const profile = await mentorProfileApi.create({
        full_name: values.full_name || undefined,
        job_title: values.job_title || undefined,
        bio: values.bio || undefined,
      })
      setProfile({ ...profile, average_rating: null, certificates: [], achievements: [], services: [] })
      notify('Đã tạo hồ sơ mentor.')
      navigate('/co-van', { replace: true })
    } catch (err) {
      setServerError(err instanceof ApiError ? err.message : 'Không thể tạo hồ sơ. Vui lòng thử lại.')
    }
  }

  return (
    <div className="flex min-h-svh flex-col bg-app-bg">
      <SiteHeader userLabel={user?.email} onLogout={logout} />
      <div className="mx-auto w-full max-w-2xl flex-1 px-6 py-12">
        <h1 className="mb-2 text-2xl font-bold text-brand-ink">Tạo hồ sơ mentor</h1>
        <p className="mb-6 text-sm text-brand-ink-soft">
          Vui lòng hoàn tất hồ sơ mentor trước khi đăng dịch vụ cố vấn và bắt đầu nhận học viên.
        </p>
        <form className="flex flex-col gap-5 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm" onSubmit={handleSubmit(onSubmit)}>
          <Field label="Họ và tên" hint="Hiển thị công khai trên hồ sơ mentor của bạn">
            <Input placeholder="Nhập họ và tên" {...register('full_name')} />
          </Field>
          <Field label="Chức danh" hint="VD: Kỹ sư phần mềm tại Google, Cựu du học sinh Mỹ...">
            <Input placeholder="Nhập chức danh" {...register('job_title')} />
          </Field>
          <Field label="Giới thiệu bản thân">
            <Textarea rows={5} placeholder="Chia sẻ kinh nghiệm, thế mạnh của bạn với học viên..." {...register('bio')} />
          </Field>

          {serverError && <p className="text-sm text-red-500">{serverError}</p>}

          <Button type="submit" loading={isSubmitting}>
            Tạo hồ sơ
          </Button>
        </form>
      </div>
      <SiteFooter />
    </div>
  )
}
