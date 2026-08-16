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

  // Google chỉ nên initialize() một lần / lần mount (gọi lại nhiều lần bắn ra warning
  // "initialize() is called multiple times" — trước đây effect phụ thuộc cả navigate/location
  // nên re-run mỗi khi location đổi). Giữ logic xử lý credential trong ref để callback đăng ký
  // một lần vẫn luôn đọc đúng location/navigate mới nhất tại thời điểm người dùng bấm nút.
  const handleCredentialRef = useRef<(response: { credential: string }) => void>(() => {})
  handleCredentialRef.current = (response) => {
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
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: (response) => handleCredentialRef.current(response),
        })
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
    // eslint-disable-next-line react-hooks/exhaustive-deps -- cố ý chỉ chạy 1 lần/mount, xem comment ở handleCredentialRef
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
