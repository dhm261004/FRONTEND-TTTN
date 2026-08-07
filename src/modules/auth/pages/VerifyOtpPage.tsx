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

const schema = z.object({
  otp: z.string().regex(/^\d{6}$/, 'Mã OTP gồm 6 chữ số'),
})

type FormValues = z.infer<typeof schema>

export function VerifyOtpPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const state = location.state as { email?: string; devCode?: string } | null
  const email = state?.email ?? ''

  const [serverError, setServerError] = useState<string | null>(null)
  const [resendCooldown, setResendCooldown] = useState(0)
  const [resending, setResending] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { otp: state?.devCode ?? '' } })

  if (!email) {
    return (
      <AuthLayout title="Xác thực OTP">
        <p className="text-sm text-brand-ink-soft">
          Thiếu thông tin email cần xác thực. Vui lòng quay lại trang đăng ký hoặc đăng nhập.
        </p>
      </AuthLayout>
    )
  }

  const onSubmit = async (values: FormValues) => {
    setServerError(null)
    try {
      await authApi.verifyOtp({ email, otp: values.otp })
      navigate('/dang-nhap', { state: { verified: true } })
    } catch (err) {
      setServerError(err instanceof ApiError ? err.message : 'Xác thực thất bại. Vui lòng thử lại.')
    }
  }

  const handleResend = async () => {
    setResending(true)
    setServerError(null)
    try {
      const res = await authApi.resendOtp(email)
      if (res.verification_code) setValue('otp', res.verification_code)
      setResendCooldown(60)
      const timer = setInterval(() => {
        setResendCooldown((c) => {
          if (c <= 1) {
            clearInterval(timer)
            return 0
          }
          return c - 1
        })
      }, 1000)
    } catch (err) {
      setServerError(err instanceof ApiError ? err.message : 'Không thể gửi lại mã. Vui lòng thử lại sau.')
    } finally {
      setResending(false)
    }
  }

  return (
    <AuthLayout title="Xác thực email" subtitle={`Nhập mã OTP 6 số đã gửi tới ${email}`}>
      <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
        <Field label="Mã OTP" required error={errors.otp?.message}>
          <Input
            inputMode="numeric"
            maxLength={6}
            placeholder="123456"
            {...register('otp')}
            error={Boolean(errors.otp)}
          />
        </Field>

        {serverError && <p className="text-sm text-red-500">{serverError}</p>}

        <Button type="submit" className="w-full" loading={isSubmitting}>
          Xác thực
        </Button>
      </form>

      <button
        type="button"
        onClick={handleResend}
        disabled={resendCooldown > 0 || resending}
        className="mt-4 w-full text-center text-sm font-medium text-brand-blue-600 disabled:text-slate-400"
      >
        {resendCooldown > 0 ? `Gửi lại mã sau ${resendCooldown}s` : 'Gửi lại mã OTP'}
      </button>
    </AuthLayout>
  )
}
