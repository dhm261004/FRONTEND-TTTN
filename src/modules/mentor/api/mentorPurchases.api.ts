import { http } from '@/shared/api/http'
import type { ListPurchasesParams, MentorServicePurchaseWithCandidate, PaginatedResult } from '@/modules/mentor/types'

export const mentorPurchasesApi = {
  listOwnAsMentor: (params?: ListPurchasesParams) =>
    http
      .get<PaginatedResult<MentorServicePurchaseWithCandidate>>('/mentors/me/purchases', { params })
      .then((r) => r.data),
}
