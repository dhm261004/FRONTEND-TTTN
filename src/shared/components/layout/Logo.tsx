import { cn } from '@/shared/lib/cn'
import logoSrc from '@/assets/logo.png'

export function Logo({ className }: { className?: string }) {
  return <img src={logoSrc} alt="Skola" className={cn('h-7 w-auto', className)} />
}
