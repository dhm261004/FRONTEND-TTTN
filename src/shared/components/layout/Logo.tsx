import { cn } from '@/shared/lib/cn'

/** Xấp xỉ logo chữ "Skola" (chưa có file SVG gốc trong PNG thiết kế). */
export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn('text-2xl font-extrabold tracking-tight text-brand-ink', className)}>
      Sk<span className="text-brand-blue-500">o</span>la
    </span>
  )
}
