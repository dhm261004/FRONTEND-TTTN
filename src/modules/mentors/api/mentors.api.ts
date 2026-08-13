import { http } from '@/shared/api/http'
import type {
  ListReviewsParams,
  MentorProfile,
  MentorProfileDetailed,
  MentorReviewWithCandidate,
  PaginatedResult,
} from '@/modules/mentor/types'

export const mentorsApi = {
  list: (params?: { q?: string; page?: number; limit?: number }) =>
    http.get<PaginatedResult<MentorProfile>>('/mentors', { params }).then((r) => r.data),
  get: (id: string) => http.get<MentorProfileDetailed>(`/mentors/${id}`).then((r) => r.data),
  listReviews: (id: string, params?: ListReviewsParams) =>
    http.get<PaginatedResult<MentorReviewWithCandidate>>(`/mentors/${id}/reviews`, { params }).then((r) => r.data),
}
