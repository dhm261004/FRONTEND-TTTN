import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { AuthLayout } from '@/modules/auth/components/AuthLayout'
import { GoogleLoginButton } from '@/modules/auth/components/GoogleLoginButton'
import { authApi } from '@/modules/auth/api'
import { Field } from '@/shared/components/ui/Field'
import { Input } from '@/shared/components/ui/Input'
import { Select } from '@/shared/components/ui/Select'
import { Button } from '@/shared/components/ui/Button'
import { ApiError } from '@/shared/api/types'

const schema = z
  .object({
    role: z.enum(['candidate', 'partner', 'mentor']),
    email: z.string().email('Email không hợp lệ'),
    password: z
      .string()
      .min(8, 'Tối thiểu 8 ký tự')
      .regex(/[A-Za-z]/, 'Cần ít nhất 1 chữ cái')
      .regex(/[0-9]/, 'Cần ít nhất 1 chữ số'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Mật khẩu nhập lại không khớp',
    path: ['confirmPassword'],
  })

type FormValues = z.infer<typeof schema>

export function RegisterPage() {
  const navigate = useNavigate()
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { role: 'candidate' } })

  const onSubmit = async (values: FormValues) => {
    setServerError(null)
    try {
      const res = await authApi.register({ email: values.email, password: values.password, role: values.role })
      navigate('/xac-thuc-otp', { state: { email: values.email, devCode: res.verification_code } })
    } catch (err) {
      setServerError(err instanceof ApiError ? err.message : 'Không thể đăng ký. Vui lòng thử lại.')
    }
  }

  return (
    <AuthLayout title="Đăng ký tài khoản SKOLA" subtitle="Tạo tài khoản để bắt đầu hành trình cùng Skola">
      <form className="flex flex-col gap-5" onSubmit={handleSubmit(onSubmit)}>
        <Field label="Vui lòng chọn loại đối tượng" required error={errors.role?.message}>
          <Select {...register('role')} error={Boolean(errors.role)}>
            <option value="candidate">Sinh viên</option>
            <option value="partner">Nhà tài trợ</option>
            <option value="mentor">Mentor</option>
          </Select>
        </Field>
        <Field label="Email đăng nhập" required error={errors.email?.message}>
          <Input type="email" placeholder="Nhập email" {...register('email')} error={Boolean(errors.email)} />
        </Field>
        <Field label="Mật khẩu" required error={errors.password?.message} hint="Tối thiểu 8 ký tự, có chữ và số">
          <Input type="password" placeholder="Nhập mật khẩu" {...register('password')} error={Boolean(errors.password)} />
        </Field>
        <Field label="Xác nhận lại mật khẩu" required error={errors.confirmPassword?.message}>
          <Input
            type="password"
            placeholder="Nhập mật khẩu"
            {...register('confirmPassword')}
            error={Boolean(errors.confirmPassword)}
          />
        </Field>

        {serverError && <p className="text-sm text-red-500">{serverError}</p>}

        <Button type="submit" className="w-full" loading={isSubmitting}>
          Đăng ký
        </Button>
      </form>

      <div className="my-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-slate-200" />
        <span className="text-xs font-medium text-brand-ink-soft">Hoặc</span>
        <div className="h-px flex-1 bg-slate-200" />
      </div>

      <GoogleLoginButton />
      <p className="mt-2 text-center text-xs text-brand-ink-soft">Đăng ký bằng Google sẽ tạo tài khoản Sinh viên.</p>

      <p className="mt-6 text-center text-sm text-brand-ink-soft">
        Bạn đã có tài khoản?{' '}
        <Link to="/dang-nhap" className="font-semibold text-brand-blue-600">
          Đăng nhập
        </Link>
      </p>
    </AuthLayout>
  )
}
