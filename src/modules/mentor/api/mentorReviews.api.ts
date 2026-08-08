import { http } from '@/shared/api/http'
import type { ListReviewsParams, MentorProfileDetailed, MentorReviewWithCandidate, PaginatedResult } from '@/modules/mentor/types'

export const mentorReviewsApi = {
  getPublicProfile: (id: string) => http.get<MentorProfileDetailed>(`/mentors/${id}`).then((r) => r.data),
  listForMentor: (id: string, params?: ListReviewsParams) =>
    http.get<PaginatedResult<MentorReviewWithCandidate>>(`/mentors/${id}/reviews`, { params }).then((r) => r.data),
}
