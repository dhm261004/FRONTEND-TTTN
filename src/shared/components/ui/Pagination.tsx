import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/shared/lib/cn'

export function Pagination({ page, pages, onChange }: { page: number; pages: number; onChange: (page: number) => void }) {
  if (pages <= 1) return null

  const items = buildPageList(page, pages)

  return (
    <div className="flex items-center justify-center gap-2">
      <PageButton disabled={page <= 1} onClick={() => onChange(page - 1)} aria-label="Trang trước">
        ‹
      </PageButton>
      {items.map((item, i) =>
        item === '…' ? (
          <span key={`dots-${i}`} className="px-1 text-slate-400">
            …
          </span>
        ) : (
          <PageButton key={item} active={item === page} onClick={() => onChange(item)}>
            {item}
          </PageButton>
        ),
      )}
      <PageButton disabled={page >= pages} onClick={() => onChange(page + 1)} aria-label="Trang sau">
        ›
      </PageButton>
    </div>
  )
}

function PageButton({
  active,
  disabled,
  onClick,
  children,
  ...props
}: {
  active?: boolean
  disabled?: boolean
  onClick: () => void
  children: ReactNode
} & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'flex size-9 items-center justify-center rounded-lg border text-sm font-medium',
        active
          ? 'border-brand-blue-500 bg-brand-blue-500 text-white'
          : 'border-slate-200 bg-white text-brand-ink-soft hover:bg-slate-50 disabled:opacity-40',
      )}
      {...props}
    >
      {children}
    </button>
  )
}

function buildPageList(page: number, pages: number): (number | '…')[] {
  const items: (number | '…')[] = []
  const add = (n: number | '…') => items.push(n)

  add(1)
  if (page > 3) add('…')
  for (let p = Math.max(2, page - 1); p <= Math.min(pages - 1, page + 1); p++) add(p)
  if (page < pages - 2) add('…')
  if (pages > 1) add(pages)

  return items
}
