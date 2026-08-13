import { useState } from 'react'
import { cn } from '@/shared/lib/cn'

export interface CheckboxFilterOption {
  value: string
  label: string
  /** Chấm màu nhỏ cạnh nhãn — dùng khi lọc theo cột badge trạng thái để dễ đối chiếu màu. */
  dotClassName?: string
}

interface CheckboxFilterDropdownProps {
  label: string
  options: CheckboxFilterOption[]
  selected: string[]
  onChange: (selected: string[]) => void
  /** Áp lên phần tử bọc ngoài (vd. w-full để giãn đều theo lưới cùng Input/Select khác). */
  className?: string
}

/**
 * Bộ lọc tickbox nhiều lựa chọn cho các cột kiểu enum (trạng thái, loại...) — lọc ngay khi tick,
 * không cần nút "Áp dụng". Dùng khi API không hỗ trợ lọc theo nhiều giá trị cùng lúc thì tự lọc
 * ở phía client trên danh sách đã tải.
 */
export function CheckboxFilterDropdown({ label, options, selected, onChange, className }: CheckboxFilterDropdownProps) {
  const [open, setOpen] = useState(false)

  const toggle = (value: string) => {
    onChange(selected.includes(value) ? selected.filter((v) => v !== value) : [...selected, value])
  }

  return (
    <div className={cn('relative', className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'flex h-11 w-full items-center justify-between gap-1.5 rounded-xl border px-3.5 text-sm font-medium transition-colors',
          selected.length > 0
            ? 'border-brand-blue-500 bg-brand-blue-50 text-brand-blue-700'
            : 'border-slate-200 bg-white text-brand-ink-soft hover:bg-slate-50',
        )}
      >
        <span className="flex items-center gap-1.5">
          {label}
          {selected.length > 0 && (
            <span className="flex size-5 items-center justify-center rounded-full bg-brand-blue-500 text-[11px] font-bold text-white">
              {selected.length}
            </span>
          )}
        </span>
        <ChevronIcon className={cn('size-3.5 shrink-0 transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute left-0 z-20 mt-2 w-56 rounded-xl border border-slate-200 bg-white p-2 shadow-lg">
            <div className="max-h-64 space-y-0.5 overflow-y-auto">
              {options.map((opt) => (
                <label
                  key={opt.value}
                  className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm hover:bg-slate-50"
                >
                  <input
                    type="checkbox"
                    checked={selected.includes(opt.value)}
                    onChange={() => toggle(opt.value)}
                    className="size-4 shrink-0 rounded border-slate-300 text-brand-blue-500 focus:ring-2 focus:ring-brand-blue-400/40"
                  />
                  {opt.dotClassName && <span className={cn('size-2 shrink-0 rounded-full', opt.dotClassName)} />}
                  <span className="text-brand-ink">{opt.label}</span>
                </label>
              ))}
            </div>

            {selected.length > 0 && (
              <button
                type="button"
                onClick={() => onChange([])}
                className="mt-1 w-full rounded-lg px-2.5 py-1.5 text-left text-xs font-medium text-brand-ink-soft hover:bg-slate-50 hover:text-red-500"
              >
                Bỏ chọn tất cả
              </button>
            )}
          </div>
        </>
      )}
    </div>
  )
}

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
