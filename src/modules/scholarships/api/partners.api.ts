import { http } from '@/shared/api/http'
import type { PartnerProfile } from '@/modules/scholarships/types'

export const partnersApi = {
  getById: (id: string) => http.get<PartnerProfile>(`/partners/${id}`).then((r) => r.data),
}
