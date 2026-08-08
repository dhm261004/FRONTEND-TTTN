import { http } from '@/shared/api/http'
import type { MentoringSession, UpdateSessionPayload } from '@/modules/mentor/types'

export const mentorSessionsApi = {
  listMine: () => http.get<MentoringSession[]>('/mentoring-sessions/me').then((r) => r.data),
  update: (id: string, payload: UpdateSessionPayload) =>
    http.patch<MentoringSession>(`/mentoring-sessions/${id}`, payload).then((r) => r.data),
}
