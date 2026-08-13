import { http } from '@/shared/api/http'
import type {
  CreateSessionPayload,
  MentoringSession,
  MentorPurchase,
  MentorReview,
  SubmitReviewPayload,
} from '@/modules/mentor/types'

export const mentorPurchasesApi = {
  purchase: (serviceId: string) => http.post<MentorPurchase>(`/mentor-services/${serviceId}/purchase`).then((r) => r.data),
  listMine: () => http.get<MentorPurchase[]>('/me/mentor-purchases').then((r) => r.data),
  getOne: (id: string) => http.get<MentorPurchase>(`/mentor-purchases/${id}`).then((r) => r.data),
  createSession: (purchaseId: string, payload: CreateSessionPayload) =>
    http.post<MentoringSession>(`/mentor-purchases/${purchaseId}/sessions`, payload).then((r) => r.data),
  submitReview: (purchaseId: string, payload: SubmitReviewPayload) =>
    http.post<MentorReview>(`/mentor-purchases/${purchaseId}/review`, payload).then((r) => r.data),
}
