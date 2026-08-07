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
}

export const EMPTY_FILTERS: ScholarshipFilterValues = {
  q: '',
  major_id: '',
  degree: '',
  location_province_city: '',
  value_type: '',
}

function ComingSoonLabel() {
  return <span className="ml-1.5 rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-400">sắp có</span>
}

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
            <Input
              placeholder="VD: Đại học, Cao học..."
              value={values.degree}
              onChange={(e) => set('degree', e.target.value)}
            />
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
            <label className="mb-1 block text-xs font-medium text-brand-ink-soft">
              Hạn nộp
              <ComingSoonLabel />
            </label>
            <Select disabled>
              <option>Bất kỳ</option>
            </Select>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-3 text-xs font-bold uppercase tracking-wide text-brand-ink-soft">Bộ lọc nâng cao</h2>
        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-brand-ink-soft">Loại học bổng</label>
            <Input
              placeholder="VD: 100% Tuition..."
              value={values.value_type}
              onChange={(e) => set('value_type', e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-brand-ink-soft">
              Số tiền tối thiểu
              <ComingSoonLabel />
            </label>
            <Input disabled placeholder="Không giới hạn" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-brand-ink-soft">
              Yêu cầu ngôn ngữ
              <ComingSoonLabel />
            </label>
            <Select disabled>
              <option>Không yêu cầu</option>
            </Select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-brand-ink-soft">
              Tình trạng cư trú
              <ComingSoonLabel />
            </label>
            <Select disabled>
              <option>Không áp dụng</option>
            </Select>
          </div>
        </div>

        <div className="mt-4">
          <label className="mb-1 flex items-center text-xs font-medium text-brand-ink-soft">
            GPA tối thiểu
            <ComingSoonLabel />
          </label>
          <input type="range" disabled min={0} max={4} step={0.1} defaultValue={3} className="w-full accent-slate-300" />
          <div className="flex justify-between text-[10px] text-slate-400">
            <span>0.0</span>
            <span>4.0</span>
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
