import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { AuthLayout } from '@/modules/auth/components/AuthLayout'
import { authApi } from '@/modules/auth/api'
import { Field } from '@/shared/components/ui/Field'
import { Input } from '@/shared/components/ui/Input'
import { Button } from '@/shared/components/ui/Button'

const schema = z.object({
  email: z.string().email('Email không hợp lệ'),
})

type FormValues = z.infer<typeof schema>

export function ForgotPasswordPage() {
  const navigate = useNavigate()
  const [sent, setSent] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  const onSubmit = async (values: FormValues) => {
    await authApi.forgotPassword(values.email)
    setSent(true)
    setTimeout(() => navigate('/dat-lai-mat-khau', { state: { email: values.email } }), 800)
  }

  return (
    <AuthLayout title="Quên mật khẩu" subtitle="Nhập email để nhận mã OTP đặt lại mật khẩu">
      <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
        <Field label="Email" required error={errors.email?.message}>
          <Input type="email" placeholder="ban@congty.com" {...register('email')} error={Boolean(errors.email)} />
        </Field>

        {sent && <p className="text-sm text-emerald-600">Nếu email tồn tại, mã OTP đã được gửi.</p>}

        <Button type="submit" className="w-full" loading={isSubmitting}>
          Gửi mã OTP
        </Button>
      </form>
    </AuthLayout>
  )
}
