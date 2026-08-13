import { http } from '@/shared/api/http'
import type { PartnerProfile, PartnerStats, PartnerStatsParams } from '@/modules/partner/types'

export interface PartnerProfilePayload {
  company_name: string
  description?: string
  website_url?: string
  industry_sector?: string
  founding_year?: number
  company_size?: string
  headquarters_address?: string
  province_city?: string
  linkedin_url?: string
  facebook_url?: string
}

export const partnerProfileApi = {
  getMe: () => http.get<PartnerProfile>('/partners/me').then((r) => r.data),
  create: (payload: PartnerProfilePayload) => http.post<PartnerProfile>('/partners/me', payload).then((r) => r.data),
  update: (payload: Partial<PartnerProfilePayload>) =>
    http.patch<PartnerProfile>('/partners/me', payload).then((r) => r.data),
  uploadLogo: (file: File) => {
    const form = new FormData()
    form.append('file', file)
    return http.post<PartnerProfile>('/partners/me/logo', form).then((r) => r.data)
  },
  uploadCoverImage: (file: File) => {
    const form = new FormData()
    form.append('file', file)
    return http.post<PartnerProfile>('/partners/me/cover-image', form).then((r) => r.data)
  },
  getPublic: (id: string) => http.get<PartnerProfile>(`/partners/${id}`).then((r) => r.data),
  getStats: (params?: PartnerStatsParams) =>
    http.get<PartnerStats>('/partners/me/stats', { params }).then((r) => r.data),
  exportStats: (params?: PartnerStatsParams) =>
    http.get('/partners/me/stats/export', { params, responseType: 'blob' }).then((r) => r.data as Blob),
}
