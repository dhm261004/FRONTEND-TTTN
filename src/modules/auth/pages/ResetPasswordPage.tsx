import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { AuthLayout } from '@/modules/auth/components/AuthLayout'
import { authApi } from '@/modules/auth/api'
import { Field } from '@/shared/components/ui/Field'
import { Input } from '@/shared/components/ui/Input'
import { Button } from '@/shared/components/ui/Button'
import { ApiError } from '@/shared/api/types'

const schema = z
  .object({
    email: z.string().email('Email không hợp lệ'),
    otp: z.string().regex(/^\d{6}$/, 'Mã OTP gồm 6 chữ số'),
    newPassword: z
      .string()
      .min(8, 'Tối thiểu 8 ký tự')
      .regex(/[A-Za-z]/, 'Cần ít nhất 1 chữ cái')
      .regex(/[0-9]/, 'Cần ít nhất 1 chữ số'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Mật khẩu nhập lại không khớp',
    path: ['confirmPassword'],
  })

type FormValues = z.infer<typeof schema>

export function ResetPasswordPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const prefillEmail = (location.state as { email?: string } | null)?.email ?? ''
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { email: prefillEmail } })

  const onSubmit = async (values: FormValues) => {
    setServerError(null)
    try {
      await authApi.resetPassword({ email: values.email, otp: values.otp, new_password: values.newPassword })
      navigate('/dang-nhap', { state: { passwordReset: true } })
    } catch (err) {
      setServerError(err instanceof ApiError ? err.message : 'Không thể đặt lại mật khẩu. Vui lòng thử lại.')
    }
  }

  return (
    <AuthLayout title="Đặt lại mật khẩu" subtitle="Nhập mã OTP đã nhận được qua email và mật khẩu mới">
      <form className="flex flex-col gap-5" onSubmit={handleSubmit(onSubmit)}>
        <Field label="Email" required error={errors.email?.message}>
          <Input type="email" {...register('email')} error={Boolean(errors.email)} />
        </Field>
        <Field label="Mã OTP" required error={errors.otp?.message}>
          <Input inputMode="numeric" maxLength={6} placeholder="123456" {...register('otp')} error={Boolean(errors.otp)} />
        </Field>
        <Field label="Mật khẩu mới" required error={errors.newPassword?.message}>
          <Input type="password" {...register('newPassword')} error={Boolean(errors.newPassword)} />
        </Field>
        <Field label="Nhập lại mật khẩu mới" required error={errors.confirmPassword?.message}>
          <Input type="password" {...register('confirmPassword')} error={Boolean(errors.confirmPassword)} />
        </Field>

        {serverError && <p className="text-sm text-red-500">{serverError}</p>}

        <Button type="submit" className="w-full" loading={isSubmitting}>
          Đặt lại mật khẩu
        </Button>
      </form>
    </AuthLayout>
  )
}
