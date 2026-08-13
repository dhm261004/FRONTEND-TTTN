import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { PublicHeader } from '@/modules/scholarships/components/PublicHeader'
import { SiteFooter } from '@/shared/components/layout/SiteFooter'
import { ScholarshipCard } from '@/modules/scholarships/components/ScholarshipCard'
import { ScholarshipFilters, EMPTY_FILTERS, type ScholarshipFilterValues } from '@/modules/scholarships/components/ScholarshipFilters'
import { Pagination } from '@/shared/components/ui/Pagination'
import { Spinner } from '@/shared/components/ui/Spinner'
import { EmptyState } from '@/shared/components/ui/EmptyState'
import { scholarshipsApi } from '@/modules/scholarships/api/scholarships.api'
import { majorsApi } from '@/modules/scholarships/api/majors.api'
import { interactionsApi } from '@/modules/scholarships/api/interactions.api'
import { recommendationsApi } from '@/modules/scholarships/api/recommendations.api'
import { useAuth } from '@/modules/auth/AuthContext'
import { useToast } from '@/shared/components/ui/ToastProvider'
import { ApiError } from '@/shared/api/types'
import type { Major, MatchResult, Scholarship } from '@/modules/scholarships/types'

const PAGE_SIZE = 6

export function ScholarshipListPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { notify } = useToast()
  const isCandidate = Boolean(user?.roles.includes('candidate'))

  // Cho phép trang Home điều hướng tới đây kèm bộ lọc đã chọn qua query string (?q=&major_id=&...).
  const [searchParams] = useSearchParams()
  const [filters, setFilters] = useState<ScholarshipFilterValues>(() => ({
    q: searchParams.get('q') ?? EMPTY_FILTERS.q,
    major_id: searchParams.get('major_id') ?? EMPTY_FILTERS.major_id,
    degree: searchParams.get('degree') ?? EMPTY_FILTERS.degree,
    location_province_city: searchParams.get('location_province_city') ?? EMPTY_FILTERS.location_province_city,
    value_type: searchParams.get('value_type') ?? EMPTY_FILTERS.value_type,
    gpa: searchParams.get('gpa') ?? EMPTY_FILTERS.gpa,
  }))
  const [debouncedFilters, setDebouncedFilters] = useState(filters)
  const [page, setPage] = useState(1)
  const [majors, setMajors] = useState<Major[]>([])
  const [items, setItems] = useState<Scholarship[]>([])
  const [pages, setPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [savedIds, setSavedIds] = useState<Record<string, string>>({})
  const [recommended, setRecommended] = useState<MatchResult[] | null>(null)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedFilters(filters), 350)
    return () => clearTimeout(timer)
  }, [filters])

  useEffect(() => {
    setPage(1)
  }, [debouncedFilters])

  useEffect(() => {
    void majorsApi.list().then(setMajors)
  }, [])

  useEffect(() => {
    if (!isCandidate) {
      setSavedIds({})
      setRecommended(null)
      return
    }

    void interactionsApi
      .listMine('saved')
      .then((list) => setSavedIds(Object.fromEntries(list.map((i) => [i.scholarship_id, i.id]))))
      .catch(() => setSavedIds({}))
      .then(() => recommendationsApi.listRecommended(6))
      .then(setRecommended)
      .catch(() => setRecommended(null))
  }, [isCandidate])

  useEffect(() => {
    setLoading(true)
    const params = {
      q: debouncedFilters.q || undefined,
      degree: debouncedFilters.degree || undefined,
      location_province_city: debouncedFilters.location_province_city || undefined,
      value_type: debouncedFilters.value_type || undefined,
      major_id: debouncedFilters.major_id ? Number(debouncedFilters.major_id) : undefined,
      gpa: debouncedFilters.gpa ? Number(debouncedFilters.gpa) : undefined,
      is_active: true,
      page,
      limit: PAGE_SIZE,
    }
    scholarshipsApi
      .list(params)
      .then((res) => {
        setItems(res.items)
        setPages(res.pagination.pages)
      })
      .finally(() => setLoading(false))
  }, [debouncedFilters, page])

  const toggleSave = async (scholarshipId: string) => {
    if (!isCandidate) {
      navigate('/dang-nhap', { state: { from: '/hoc-bong' } })
      return
    }
    const existingId = savedIds[scholarshipId]
    if (existingId) {
      setSavedIds((prev) => {
        const next = { ...prev }
        delete next[scholarshipId]
        return next
      })
      try {
        await interactionsApi.remove(existingId)
      } catch (err) {
        setSavedIds((prev) => ({ ...prev, [scholarshipId]: existingId }))
        notify(err instanceof ApiError ? err.message : 'Không thể lưu học bổng. Vui lòng thử lại.', 'error')
      }
    } else {
      const placeholderId = `pending-${scholarshipId}`
      setSavedIds((prev) => ({ ...prev, [scholarshipId]: placeholderId }))
      try {
        const interaction = await interactionsApi.create(scholarshipId, 'saved')
        setSavedIds((prev) => (prev[scholarshipId] === placeholderId ? { ...prev, [scholarshipId]: interaction.id } : prev))
      } catch (err) {
        setSavedIds((prev) => {
          if (prev[scholarshipId] !== placeholderId) return prev
          const next = { ...prev }
          delete next[scholarshipId]
          return next
        })
        notify(err instanceof ApiError ? err.message : 'Không thể lưu học bổng. Vui lòng thử lại.', 'error')
      }
    }
  }

  const recommendedById = useMemo(() => {
    const map = new Map<string, MatchResult>()
    for (const r of recommended ?? []) map.set(r.scholarship_id, r)
    return map
  }, [recommended])

  return (
    <div className="flex min-h-svh flex-col bg-app-bg">
      <PublicHeader active="hoc-bong" />

      <div className="mx-auto w-full max-w-[1440px] flex-1 px-6 py-8">
        <p className="mb-2 text-sm text-brand-ink-soft">
          <Link to="/hoc-bong">Trang chủ</Link> <span className="mx-1">›</span> Học bổng
        </p>
        <h1 className="mb-1 text-2xl font-bold text-brand-ink">Tất cả học bổng</h1>
        <p className="mb-6 text-sm text-brand-ink-soft">Dựa trên hồ sơ học vấn và các bộ lọc của bạn.</p>

        {/* Sidebar bộ lọc ở bên trái (lg:w-80), Danh sách học bổng xếp dọc/trải ngang bên phải */}
        <div className="flex flex-col gap-6 lg:flex-row">
          <div className="w-full lg:w-80 lg:flex-shrink-0">
            <ScholarshipFilters values={filters} onChange={setFilters} majors={majors} />
          </div>

          <div className="min-w-0 flex-1">
            {loading ? (
              <div className="flex justify-center py-20">
                <Spinner />
              </div>
            ) : items.length === 0 ? (
              <EmptyState title="Không tìm thấy học bổng phù hợp" description="Thử thay đổi từ khoá hoặc bộ lọc của bạn." />
            ) : (
              <>
                {/* Thay thế Grid 3 cột bằng danh sách 1 cột trải dài chiều ngang */}
                <div className="flex flex-col gap-4">
                  {items.map((s) => (
                    <ScholarshipCard
                      key={s.id}
                      scholarship={s}
                      saved={Boolean(savedIds[s.id])}
                      onToggleSave={() => void toggleSave(s.id)}
                      match={
                        recommendedById.has(s.id)
                          ? { score: recommendedById.get(s.id)!.score, label: recommendedById.get(s.id)!.label }
                          : undefined
                      }
                    />
                  ))}
                </div>
                <div className="mt-8 flex justify-center">
                  <Pagination page={page} pages={pages} onChange={setPage} />
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <SiteFooter />
    </div>
  )
}