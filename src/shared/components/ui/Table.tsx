import type { ReactNode, TdHTMLAttributes, ThHTMLAttributes } from 'react'
import { cn } from '@/shared/lib/cn'
import { Spinner } from '@/shared/components/ui/Spinner'

type Align = 'left' | 'center' | 'right'

const alignTextClass: Record<Align, string> = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
}

const alignFlexClass: Record<Align, string> = {
  left: 'justify-start',
  center: 'justify-center',
  right: 'justify-end',
}

interface TableProps {
  children: ReactNode
  className?: string
  /** Hiện spinner thay cho nội dung bảng — dùng khi đang gọi API lần đầu. */
  loading?: boolean
  /** Hiện thay cho bảng khi danh sách rỗng, thường là <EmptyState />. */
  empty?: ReactNode
  /**
   * Bỏ khung card (viền/bo góc/shadow) — dùng khi bảng đã nằm sẵn trong một card khác (vd. có
   * tiêu đề/mô tả phía trên cùng card). Đổi cấu trúc thay vì truyền className để bỏ viền, vì
   * className chỉ nối thêm chứ không đảm bảo thắng được class mặc định trong CSS Tailwind sinh ra.
   */
  bare?: boolean
}

/**
 * Khung bảng dùng chung cho toàn bộ trang danh sách trong app: card bo góc + viền + shadow,
 * tự cuộn ngang trên màn hẹp, tự chuyển sang loading/empty khi cần — chỉ cần truyền
 * <TableHead>/<TableBody> như một bảng HTML thông thường.
 */
export function Table({ children, className, loading, empty, bare = false }: TableProps) {
  return (
    <div className={cn(!bare && 'overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm', className)}>
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Spinner />
        </div>
      ) : empty ? (
        empty
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">{children}</table>
        </div>
      )}
    </div>
  )
}

export function TableHead({ children }: { children: ReactNode }) {
  return <thead className="bg-brand-blue-50/60 text-brand-ink-soft">{children}</thead>
}

interface TableHeaderCellProps extends ThHTMLAttributes<HTMLTableCellElement> {
  align?: Align
  /** Cột có thể bấm để sắp xếp — tự vẽ mũi tên và trạng thái hover. */
  sortable?: boolean
  sortActive?: boolean
  sortOrder?: 'asc' | 'desc'
  onSort?: () => void
}

export function TableHeaderCell({
  children,
  align = 'left',
  sortable,
  sortActive,
  sortOrder = 'asc',
  onSort,
  className,
  ...props
}: TableHeaderCellProps) {
  return (
    <th
      className={cn(
        'group/th px-5 py-3.5 font-semibold text-brand-ink',
        alignTextClass[align],
        sortable && 'cursor-pointer select-none transition-colors hover:bg-brand-blue-100/40',
        className,
      )}
      onClick={sortable ? onSort : undefined}
      {...props}
    >
      <div className={cn('flex items-center gap-1', alignFlexClass[align])}>
        <span>{children}</span>
        {sortable && <SortIcon active={Boolean(sortActive)} order={sortOrder} />}
      </div>
    </th>
  )
}

function SortIcon({ active, order }: { active: boolean; order: 'asc' | 'desc' }) {
  if (!active) {
    return (
      <svg
        className="ml-1 size-3.5 shrink-0 text-slate-400 opacity-0 transition-opacity group-hover/th:opacity-100"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
      </svg>
    )
  }
  return (
    <svg className="ml-1 size-3.5 shrink-0 text-brand-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d={order === 'asc' ? 'M5 15l7-7 7 7' : 'M19 9l-7 7-7-7'} />
    </svg>
  )
}

// Màu chữ + whitespace-nowrap mặc định đặt ở <tbody> (kế thừa qua CSS inheritance, cả 2 đều là
// thuộc tính CSS được kế thừa) chứ không đặt trực tiếp trên từng <td> — nếu đặt ở TableCell thì
// mọi class riêng (màu chữ khác, whitespace-normal để xuống dòng) truyền qua className sẽ phải
// giành thắng thua với class mặc định theo thứ tự Tailwind sinh ra CSS (không đoán trước được),
// rất dễ vỡ. Đặt ở tbody thì override ở td/phần tử con luôn thắng vì đó là quy tắc kế thừa CSS,
// không phải so đặc hiệu giữa 2 utility class ngang hàng.
export function TableBody({ children }: { children: ReactNode }) {
  return <tbody className="divide-y divide-slate-100 whitespace-nowrap text-brand-ink-soft">{children}</tbody>
}

export function TableRow({ children, onClick, className }: { children: ReactNode; onClick?: () => void; className?: string }) {
  return (
    <tr onClick={onClick} className={cn('transition-colors hover:bg-slate-50/60', onClick && 'cursor-pointer', className)}>
      {children}
    </tr>
  )
}

interface TableCellProps extends TdHTMLAttributes<HTMLTableCellElement> {
  align?: Align
}

export function TableCell({ children, align = 'left', className, ...props }: TableCellProps) {
  return (
    <td className={cn('px-5 py-4 align-middle', alignTextClass[align], className)} {...props}>
      {children}
    </td>
  )
}
