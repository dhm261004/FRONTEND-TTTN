import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/modules/auth/AuthContext'
import { getPostLoginRedirect } from '@/modules/auth/redirect'
import { GOOGLE_CLIENT_ID } from '@/shared/config/env'

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string
            callback: (response: { credential: string }) => void
          }) => void
          renderButton: (parent: HTMLElement, options: Record<string, unknown>) => void
        }
      }
    }
  }
}

const GOOGLE_LOGO_URL =
  'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/1280px-Google_%22G%22_logo.svg.png'

let scriptLoadPromise: Promise<void> | null = null
// google.accounts.id là singleton của cả trang (không tách theo instance React) — gọi initialize()
// lần thứ hai TRỞ ĐI trong cùng một lượt tải trang, dù từ một component instance hoàn toàn mới (vd.
// điều hướng từ trang Đăng ký sang Đăng nhập, mỗi trang tự mount GoogleLoginButton riêng), vẫn bị
// Google coi là "gọi nhiều lần" và cảnh báo. Guard ở cấp module để initialize() chỉ chạy đúng 1 lần
// cho toàn vòng đời trang, bất kể bao nhiêu component instance đã mount/unmount.
let initialized = false
// Con trỏ tới hàm xử lý credential của instance đang mounted — cập nhật lại mỗi lần render để
// callback global (chỉ đăng ký đúng 1 lần lúc initialize()) luôn gọi đúng vào instance hiện tại
// (Login hay Register) thay vì closure cũ của một instance đã unmount.
let activeCredentialHandler: ((response: { credential: string }) => void) | null = null

function loadGoogleIdentityScript(): Promise<void> {
  if (window.google?.accounts?.id) return Promise.resolve()
  if (!scriptLoadPromise) {
    scriptLoadPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script')
      script.src = 'https://accounts.google.com/gsi/client'
      script.async = true
      script.defer = true
      script.onload = () => resolve()
      script.onerror = () => reject(new Error('Không tải được Google Identity Services'))
      document.head.appendChild(script)
    })
  }
  return scriptLoadPromise
}

export function GoogleLoginButton() {
  const { loginWithGoogle } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const containerRef = useRef<HTMLDivElement>(null)
  const [error, setError] = useState<string | null>(null)

  activeCredentialHandler = (response) => {
    void (async () => {
      setError(null)
      try {
        const user = await loginWithGoogle(response.credential)
        const redirectTo = (location.state as { from?: string } | null)?.from ?? getPostLoginRedirect(user)
        navigate(redirectTo, { replace: true })
      } catch {
        setError('Đăng nhập bằng Google thất bại. Vui lòng thử lại.')
      }
    })()
  }

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return
    let cancelled = false

    loadGoogleIdentityScript()
      .then(() => {
        if (cancelled || !containerRef.current || !window.google) return
        if (!initialized) {
          window.google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: (response) => activeCredentialHandler?.(response),
          })
          initialized = true
        }
        window.google.accounts.id.renderButton(containerRef.current, {
          type: 'icon',
          theme: 'outline',
          size: 'large',
          shape: 'circle',
          locale: 'vi',
        })
      })
      .catch(() => {
        if (!cancelled) setError('Không tải được Google Identity Services.')
      })

    return () => {
      cancelled = true
    }
  }, [])

  if (!GOOGLE_CLIENT_ID) return null

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative h-10 w-10 overflow-hidden rounded-full border border-slate-200 shadow-sm">
        <img
          src={GOOGLE_LOGO_URL}
          alt="Google"
          className="absolute inset-0 h-full w-full object-contain p-2"
        />
        <div ref={containerRef} className="absolute inset-0 opacity-0" />
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  )
}
