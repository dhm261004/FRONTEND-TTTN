import { formatDate } from '@/shared/lib/format'
import { cn } from '@/shared/lib/cn'

export function isVipActive(expiresAt: string | null | undefined): boolean {
  return !!expiresAt && new Date(expiresAt).getTime() > Date.now()
}

/** Huy hiệu Skola VIP — dùng ở nơi hiển thị avatar/logo của hồ sơ đã nâng cấp VIP còn hiệu lực. */
export function VipBadge({ expiresAt, className }: { expiresAt?: string | null; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full bg-brand-yellow-400 px-2.5 py-1 text-xs font-bold text-brand-ink',
        className,
      )}
    >
      ✨ VIP
      {expiresAt && <span className="font-medium">· HSD {formatDate(expiresAt)}</span>}
    </span>
  )
}
