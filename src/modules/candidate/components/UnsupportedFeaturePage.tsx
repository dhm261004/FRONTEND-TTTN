import { CandidateLayout } from '@/modules/candidate/components/CandidateLayout'
import { UnsupportedNotice } from '@/shared/components/ui/UnsupportedNotice'

export function UnsupportedFeaturePage({ title, description }: { title: string; description: string }) {
  return (
    <CandidateLayout>
      <h1 className="mb-6 text-2xl font-bold text-brand-ink">{title}</h1>
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <UnsupportedNotice>{description}</UnsupportedNotice>
      </div>
    </CandidateLayout>
  )
}
