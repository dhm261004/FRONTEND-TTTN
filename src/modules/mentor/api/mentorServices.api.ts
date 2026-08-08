import { http } from '@/shared/api/http'
import type { MentorService, MentorServicePayload, MentorServiceUpdatePayload } from '@/modules/mentor/types'

export const mentorServicesApi = {
  create: (payload: MentorServicePayload) => http.post<MentorService>('/mentors/me/services', payload).then((r) => r.data),
  update: (id: string, payload: MentorServiceUpdatePayload) =>
    http.patch<MentorService>(`/mentors/me/services/${id}`, payload).then((r) => r.data),
  delete: (id: string) => http.delete<{ deleted: boolean }>(`/mentors/me/services/${id}`).then((r) => r.data),
}
