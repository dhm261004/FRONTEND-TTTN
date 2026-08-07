import { http } from '@/shared/api/http'
import type { MatchResult } from '@/modules/scholarships/types'

export const recommendationsApi = {
  getMatch: (scholarshipId: string) => http.get<MatchResult>(`/scholarships/${scholarshipId}/match`).then((r) => r.data),
  listRecommended: (limit = 6) =>
    http.get<MatchResult[]>('/recommendations/scholarships', { params: { limit } }).then((r) => r.data),
}
