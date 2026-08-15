import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { LoginLayout } from '@/modules/auth/components/LoginLayout'
import { GoogleLoginButton } from '@/modules/auth/components/GoogleLoginButton'
import { useAuth } from '@/modules/auth/AuthContext'
import { getPostLoginRedirect } from '@/modules/auth/redirect'
import { Field } from '@/shared/components/ui/Field'
import { Input } from '@/shared/components/ui/Input'
import { Button } from '@/shared/components/ui/Button'
import { ApiError } from '@/shared/api/types'

const schema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(1, 'Vui lòng nhập mật khẩu'),
})

type FormValues = z.infer<typeof schema>

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  const onSubmit = async (values: FormValues) => {
    setServerError(null)
    try {
      const user = await login(values)
      const redirectTo = (location.state as { from?: string } | null)?.from ?? getPostLoginRedirect(user)
      navigate(redirectTo, { replace: true })
    } catch (err) {
      if (err instanceof ApiError && err.status === 403) {
        setServerError('Email chưa được xác thực. Vui lòng kiểm tra hộp thư để lấy mã OTP.')
        navigate('/xac-thuc-otp', { state: { email: values.email } })
        return
      }
      if (err instanceof ApiError) {
        setServerError(err.message)
        return
      }
      setServerError('Không thể đăng nhập. Vui lòng thử lại.')
    }
  }

  return (
    <LoginLayout title="Chào mừng bạn đến với SKOLA" subtitle="Đăng nhập để tiếp tục">
      {/* Giảm gap giữa các field từ gap-5 xuống gap-3.5 */}
      <form className="flex flex-col gap-3.5" onSubmit={handleSubmit(onSubmit)}>
        <Field label="Email" required error={errors.email?.message}>
          <Input type="email" placeholder="Nhập email" {...register('email')} error={Boolean(errors.email)} />
        </Field>
        <Field label="Mật khẩu" required error={errors.password?.message}>
          <Input type="password" placeholder="Nhập mật khẩu" {...register('password')} error={Boolean(errors.password)} />
        </Field>

        {serverError && <p className="text-sm text-red-500">{serverError}</p>}

        <div className="flex items-center justify-end">
          <Link to="/quen-mat-khau" className="text-sm font-medium text-brand-blue-600">
            Quên mật khẩu?
          </Link>
        </div>

        <Button type="submit" className="w-full" loading={isSubmitting}>
          Đăng nhập
        </Button>
      </form>

      {/* Giảm margin đường phân cách từ my-6 xuống my-3.5 */}
      <div className="my-3.5 flex items-center gap-3">
        <div className="h-px flex-1 bg-slate-200" />
        <span className="text-xs font-medium text-brand-ink-soft">Hoặc đăng nhập bằng</span>
        <div className="h-px flex-1 bg-slate-200" />
      </div>

      <GoogleLoginButton />

      {/* Giảm margin đoạn dưới từ mt-6 xuống mt-3.5 */}
      <p className="mt-3.5 text-center text-sm text-brand-ink-soft">
        Bạn chưa có tài khoản?{' '}
        <Link to="/dang-ky" className="font-semibold text-brand-blue-600">
          Đăng ký ngay
        </Link>
      </p>
    </LoginLayout>
  )
}