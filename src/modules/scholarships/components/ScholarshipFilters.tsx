import { useEffect, useState } from 'react'
import type { Major } from '@/modules/scholarships/types'
import { provincesApi, type Province } from '@/shared/api/provinces.api'
import { Input } from '@/shared/components/ui/Input'
import { Select } from '@/shared/components/ui/Select'

export interface ScholarshipFilterValues {
  q: string
  major_id: string
  degree: string
  location_province_city: string
  value_type: string
  gpa: string
}

export const EMPTY_FILTERS: ScholarshipFilterValues = {
  q: '',
  major_id: '',
  degree: '',
  location_province_city: '',
  value_type: '',
  gpa: '',
}

// Cùng bộ giá trị với DEGREE_OPTIONS ở partner/pages/ScholarshipFormPage.tsx — Scholarship.degree lưu
// đúng code này (không phải nhãn tiếng Việt tự do), so khớp chính xác ở tầng backend.
const DEGREE_OPTIONS = [
  { value: 'undergraduate', label: 'Đại học' },
  { value: 'postgraduate', label: 'Sau đại học' },
  { value: 'vocational', label: 'Cao đẳng / Nghề' },
  { value: 'other', label: 'Khác' },
]

// Cùng bộ giá trị với VALUE_TYPE_OPTIONS ở partner/pages/ScholarshipFormPage.tsx.
const VALUE_TYPE_OPTIONS = [
  { value: 'percentage', label: 'Theo phần trăm học phí (%)' },
  { value: 'fixed_amount', label: 'Số tiền cố định' },
]

export function ScholarshipFilters({
  values,
  onChange,
  majors,
}: {
  values: ScholarshipFilterValues
  onChange: (values: ScholarshipFilterValues) => void
  majors: Major[]
}) {
  const set = <K extends keyof ScholarshipFilterValues>(key: K, value: string) => onChange({ ...values, [key]: value })

  const [provinces, setProvinces] = useState<Province[]>([])
  useEffect(() => {
    void provincesApi.listProvinces().then(setProvinces)
  }, [])

  return (
    <aside className="w-full shrink-0 space-y-5 lg:w-[280px]">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-3 text-xs font-bold uppercase tracking-wide text-brand-ink-soft">Search</h2>
        <div className="relative">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            className="pl-9"
            placeholder="Từ khoá, tên học bổng..."
            value={values.q}
            onChange={(e) => set('q', e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-3 text-xs font-bold uppercase tracking-wide text-brand-ink-soft">Bộ lọc chính</h2>
        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-brand-ink-soft">Ngành học</label>
            <Select value={values.major_id} onChange={(e) => set('major_id', e.target.value)}>
              <option value="">Tất cả ngành</option>
              {majors.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-brand-ink-soft">Bậc học</label>
            <Select value={values.degree} onChange={(e) => set('degree', e.target.value)}>
              <option value="">Tất cả bậc học</option>
              {DEGREE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-brand-ink-soft">Khu vực</label>
            <Select value={values.location_province_city} onChange={(e) => set('location_province_city', e.target.value)}>
              <option value="">Tất cả khu vực</option>
              {provinces.map((p) => (
                <option key={p.code} value={p.name}>
                  {p.name}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-brand-ink-soft">Loại học bổng</label>
            <Select value={values.value_type} onChange={(e) => set('value_type', e.target.value)}>
              <option value="">Tất cả loại</option>
              {VALUE_TYPE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-brand-ink-soft">GPA của bạn</label>
            <Input
              type="number"
              inputMode="decimal"
              min={0}
              max={4}
              step={0.01}
              placeholder="VD: 3.2"
              value={values.gpa}
              onChange={(e) => set('gpa', e.target.value)}
            />
            <p className="mt-1 text-[11px] text-brand-ink-soft">Chỉ hiện học bổng bạn đủ điều kiện GPA để nộp.</p>
          </div>
        </div>
      </div>
    </aside>
  )
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" strokeLinecap="round" />
    </svg>
  )
}
