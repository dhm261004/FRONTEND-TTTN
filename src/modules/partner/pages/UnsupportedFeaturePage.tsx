import { PartnerLayout } from '@/modules/partner/components/PartnerLayout'
import { UnsupportedNotice } from '@/shared/components/ui/UnsupportedNotice'
import type { PartnerNavItem } from '@/modules/partner/components/nav'

export function UnsupportedFeaturePage({
  nav,
  title,
  description,
}: {
  nav: PartnerNavItem[]
  title: string
  description: string
}) {
  return (
    <PartnerLayout nav={nav}>
      <h1 className="mb-6 text-2xl font-bold text-brand-ink">{title}</h1>
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <UnsupportedNotice>{description}</UnsupportedNotice>
      </div>
    </PartnerLayout>
  )
}
