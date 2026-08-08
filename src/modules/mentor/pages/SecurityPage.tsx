import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { MentorLayout } from '@/modules/mentor/components/MentorLayout'
import { Field } from '@/shared/components/ui/Field'
import { Input } from '@/shared/components/ui/Input'
import { Button } from '@/shared/components/ui/Button'
import { useToast } from '@/shared/components/ui/ToastProvider'
import { useAuth } from '@/modules/auth/AuthContext'
import { authApi } from '@/modules/auth/api'
import { ApiError } from '@/shared/api/types'

const schema = z
  .object({
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

export function SecurityPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { notify } = useToast()
  const [otpSent, setOtpSent] = useState(false)
  const [sendingOtp, setSendingOtp] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  const handleSendOtp = async () => {
    if (!user) return
    setSendingOtp(true)
    setServerError(null)
    try {
      await authApi.forgotPassword(user.email)
      setOtpSent(true)
      notify('Đã gửi mã OTP tới email của bạn.')
    } catch {
      setServerError('Không thể gửi mã OTP. Vui lòng thử lại.')
    } finally {
      setSendingOtp(false)
    }
  }

  const onSubmit = async (values: FormValues) => {
    if (!user) return
    setServerError(null)
    try {
      await authApi.resetPassword({ email: user.email, otp: values.otp, new_password: values.newPassword })
      notify('Đổi mật khẩu thành công. Vui lòng đăng nhập lại.')
      await logout()
      navigate('/dang-nhap')
    } catch (err) {
      setServerError(err instanceof ApiError ? err.message : 'Không thể đổi mật khẩu. Vui lòng thử lại.')
    }
  }

  return (
    <MentorLayout>
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <h1 className="text-lg font-bold text-brand-ink">Mật khẩu và bảo mật</h1>
          <p className="mt-1 text-sm text-brand-ink-soft">
            Vì sự an toàn, Skola khuyến khích bạn sử dụng mật khẩu mạnh và xác thực qua email.
          </p>

          <div className="mt-6">
            {!otpSent ? (
              <Button onClick={handleSendOtp} loading={sendingOtp}>
                Gửi mã xác nhận đổi mật khẩu tới email
              </Button>
            ) : (
              <form className="flex flex-col gap-5" onSubmit={handleSubmit(onSubmit)}>
                <Field label="Mã OTP" required error={errors.otp?.message} hint={`Đã gửi tới ${user?.email}`}>
                  <Input inputMode="numeric" maxLength={6} placeholder="123456" {...register('otp')} error={Boolean(errors.otp)} />
                </Field>
                <Field label="Mật khẩu mới" required error={errors.newPassword?.message}>
                  <Input type="password" {...register('newPassword')} error={Boolean(errors.newPassword)} />
                </Field>
                <Field label="Nhập lại mật khẩu mới" required error={errors.confirmPassword?.message}>
                  <Input type="password" {...register('confirmPassword')} error={Boolean(errors.confirmPassword)} />
                </Field>

                {serverError && <p className="text-sm text-red-500">{serverError}</p>}

                <div className="flex gap-3">
                  <Button type="submit" loading={isSubmitting}>
                    Lưu thay đổi
                  </Button>
                  <Button type="button" variant="ghost" onClick={handleSendOtp} disabled={sendingOtp}>
                    Gửi lại mã
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </MentorLayout>
  )
}
