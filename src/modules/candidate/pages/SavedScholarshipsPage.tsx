import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { CandidateLayout } from '@/modules/candidate/components/CandidateLayout'
import { ScholarshipCard } from '@/modules/scholarships/components/ScholarshipCard'
import { Spinner } from '@/shared/components/ui/Spinner'
import { EmptyState } from '@/shared/components/ui/EmptyState'
import { useToast } from '@/shared/components/ui/ToastProvider'
import { interactionsApi } from '@/modules/scholarships/api/interactions.api'
import { scholarshipsApi } from '@/modules/scholarships/api/scholarships.api'
import { ApiError } from '@/shared/api/types'
import type { Interaction, Scholarship } from '@/modules/scholarships/types'

export function SavedScholarshipsPage() {
  const { notify } = useToast()
  const [rows, setRows] = useState<{ interaction: Interaction; scholarship: Scholarship }[]>([])
  const [loading, setLoading] = useState(true)

  const load = () => {
    setLoading(true)
    void interactionsApi
      .listMine('saved')
      .then(async (interactions) => {
        const scholarships = await Promise.all(
          interactions.map((i) => scholarshipsApi.get(i.scholarship_id).catch(() => null)),
        )
        setRows(
          interactions
            .map((interaction, idx) => ({ interaction, scholarship: scholarships[idx] }))
            .filter((r): r is { interaction: Interaction; scholarship: Scholarship } => r.scholarship !== null),
        )
      })
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const handleUnsave = async (interactionId: string) => {
    try {
      await interactionsApi.remove(interactionId)
      setRows((prev) => prev.filter((r) => r.interaction.id !== interactionId))
    } catch (err) {
      notify(err instanceof ApiError ? err.message : 'Không thể bỏ lưu học bổng.', 'error')
    }
  }

  return (
    <CandidateLayout>
      <h1 className="mb-6 text-2xl font-bold text-brand-ink">Học bổng đã lưu</h1>

      {loading ? (
        <div className="flex justify-center py-20">
          <Spinner />
        </div>
      ) : rows.length === 0 ? (
        <EmptyState
          title="Bạn chưa lưu học bổng nào"
          description="Bấm biểu tượng bookmark trên thẻ học bổng để lưu lại xem sau."
          action={
            <Link to="/hoc-bong" className="text-sm font-semibold text-brand-blue-600">
              Xem học bổng
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {rows.map(({ interaction, scholarship }) => (
            <ScholarshipCard
              key={interaction.id}
              scholarship={scholarship}
              saved
              onToggleSave={() => void handleUnsave(interaction.id)}
            />
          ))}
        </div>
      )}
    </CandidateLayout>
  )
}
