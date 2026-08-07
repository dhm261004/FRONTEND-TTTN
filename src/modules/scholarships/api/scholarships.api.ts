import { http } from '@/shared/api/http'
import type { PaginatedResult } from '@/shared/api/types'
import type { Scholarship, ScholarshipListParams } from '@/modules/scholarships/types'

export const scholarshipsApi = {
  list: (params: ScholarshipListParams) =>
    http.get<PaginatedResult<Scholarship>>('/scholarships', { params }).then((r) => r.data),
  get: (id: string) => http.get<Scholarship>(`/scholarships/${id}`).then((r) => r.data),
  logView: (id: string) => http.post(`/scholarships/${id}/view`).catch(() => undefined),
}
