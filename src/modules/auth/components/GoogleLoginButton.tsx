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

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return
    let cancelled = false

    loadGoogleIdentityScript()
      .then(() => {
        if (cancelled || !containerRef.current || !window.google) return
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: (response) => {
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
          },
        })
        window.google.accounts.id.renderButton(containerRef.current, {
          theme: 'outline',
          size: 'large',
          width: 336,
          text: 'continue_with',
          locale: 'vi',
        })
      })
      .catch(() => {
        if (!cancelled) setError('Không tải được Google Identity Services.')
      })

    return () => {
      cancelled = true
    }
  }, [loginWithGoogle, navigate, location])

  if (!GOOGLE_CLIENT_ID) return null

  return (
    <div className="flex flex-col items-center gap-2">
      <div ref={containerRef} />
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  )
}
