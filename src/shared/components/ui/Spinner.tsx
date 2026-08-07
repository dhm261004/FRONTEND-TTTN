import { cn } from '@/shared/lib/cn'

export function Spinner({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center justify-center py-10', className)}>
      <span className="size-8 animate-spin rounded-full border-4 border-brand-blue-200 border-t-brand-blue-500" />
    </div>
  )
}
