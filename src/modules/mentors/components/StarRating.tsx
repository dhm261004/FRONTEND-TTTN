import { IconStar } from '@/modules/mentor/components/icons'

export function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5 text-amber-400">
      {Array.from({ length: 5 }, (_, i) => (
        <IconStar key={i} className={i < rating ? 'fill-current' : 'fill-none text-slate-200'} />
      ))}
    </div>
  )
}
